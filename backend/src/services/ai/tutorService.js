const ai = require('../../config/ai');
const tutorRepo = require('../../repositories/tutorRepository');
const curriculum = require('../../repositories/curriculumRepository');
const hintLadder = require('./hintLadder');
const answerGuard = require('./answerGuard');
const guardrails = require('./guardrails');
const llm = require('./llmClient');
const buildPrompt = require('../../templates/tutorPrompt');
const fallbackHint = require('../../templates/fallbackHints');
const audit = require('../audit/auditService');
const { startOfDay } = require('../../utils/time');
const subjects = require('../subjects/subjectService');
const courseRepo = require('../../repositories/courseRepository');
const userRepo = require('../../repositories/userRepository');
const { notFound, forbidden, AppError } = require('../../utils/errors');

exports.startSession = async (learner, questionId) => {
  const learnerId = learner.id;
  const q = await curriculum.questionById(questionId);
  if (!q) throw notFound('Question not found');
  await subjects.assertLearnerTopic(learner, await curriculum.topicById(q.topicId));
  const session = await tutorRepo.createSession({ learnerId, topicId: q.topicId, questionId: q.id, hintLevel: 0 });
  return { sessionId: session.id, maxLevel: hintLadder.MAX_LEVEL };
};

/**
 * One learner message in, one tutor reply out.
 * Every message from the learner counts as asking for the next hint, so the ladder climbs one level at a time.
 */
exports.sendMessage = async (learnerId, sessionId, text, { askForNextHint = true } = {}) => {
  const session = await tutorRepo.findSession(sessionId);
  if (!session || session.learnerId !== learnerId) throw notFound('Tutor session not found');

  const used = await tutorRepo.countLearnerMessagesSince(learnerId, startOfDay());
  if (used >= ai.dailyMessageLimit) throw new AppError(429, 'DAILY_LIMIT', 'You have used today\'s tutor messages. Try the practice questions, and come back tomorrow.');

  await tutorRepo.addMessage({ sessionId, role: 'learner', content: text });

  const check = guardrails.inspect(text);
  if (check.flag) {
    session.flagged = true;
    session.flagReason = check.reason;
    await tutorRepo.saveSession(session);
    try {
      const learner = await userRepo.findById(learnerId);
      // The teacher of the subject being studied is told. If that subject has no teacher yet, every teacher is told (safeguarding must not go unseen).
      const topic = await curriculum.topicById(session.topicId);
      const course = topic && topic.Strand && topic.Strand.Subject ? await courseRepo.byCode(learner.schoolId, topic.Strand.Subject.courseCode) : null;
      const teachers = course && course.teacherId ? [course.teacherId] : await userRepo.idsByRole(learner.schoolId, 'teacher');
      await require('../engagement/notificationService').notifyMany(teachers, { type: 'flag', title: 'A tutor chat was flagged', body: `${learner.fullName}${course ? ` (${course.name})` : ''}: ${check.reason}`, link: '/teacher/flagged' });
    } catch (e) { require('../../utils/logger').warn('flag notify failed', { message: e.message }); }
    await audit.record('TUTOR_FLAGGED', { actorId: learnerId, targetType: 'tutor_session', targetId: session.id, meta: { reason: check.reason } });
    await tutorRepo.addMessage({ sessionId, role: 'tutor', content: check.reply, blocked: true });
    return { reply: check.reply, level: session.hintLevel, flagged: true };
  }

  const q = await curriculum.questionById(session.questionId);
  const topic = await curriculum.topicById(session.topicId);
  if (askForNextHint) session.hintLevel = hintLadder.next(session.hintLevel);
  const level = Math.max(session.hintLevel, 1);

  const history = await tutorRepo.messages(sessionId);
  const system = buildPrompt({ topicTitle: topic.title, subjectName: topic.Strand && topic.Strand.Subject ? topic.Strand.Subject.name : 'this subject', question: q, level });
  const raw = await llm.complete({ system, history, level, question: q });

  const guarded = answerGuard.check({ reply: raw, answer: q.answer, level, fallback: fallbackHint(level) });
  if (guarded.blocked) {
    session.flagReason = 'answer_filter_triggered';
    await audit.record('ANSWER_FILTER', { actorId: learnerId, targetType: 'tutor_session', targetId: session.id, meta: { level } });
  }
  await tutorRepo.saveSession(session);
  await tutorRepo.addMessage({ sessionId, role: 'tutor', content: guarded.reply, hintLevel: level, blocked: guarded.blocked });
  return { reply: guarded.reply, level, maxLevel: hintLadder.MAX_LEVEL, flagged: false };
};

exports.transcript = async (requester, sessionId) => {
  const session = await tutorRepo.findSession(sessionId);
  if (!session) throw notFound('Tutor session not found');
  if (requester.role === 'learner' && session.learnerId !== requester.id) throw forbidden();
  // Teachers may open only flagged chats (safeguarding). Everyone else is refused here.
  if (requester.role === 'teacher' && !session.flagged) throw forbidden('Teachers can open flagged chats only', 'NOT_FLAGGED');
  if (requester.role === 'teacher') {
    const topic = await curriculum.topicById(session.topicId);
    const mine = await subjects.coursesOfTeacher(requester);
    const code = topic && topic.Strand && topic.Strand.Subject ? topic.Strand.Subject.courseCode : null;
    if (!mine.some((c) => c.code === code)) throw forbidden('This chat belongs to another subject', 'NOT_YOUR_SUBJECT');
  }
  if (!['learner', 'teacher'].includes(requester.role)) throw forbidden();
  return { session, messages: await tutorRepo.messages(sessionId) };
};
