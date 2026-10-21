const userRepo = require('../../repositories/userRepository');
const masteryRepo = require('../../repositories/masteryRepository');
const parentRepo = require('../../repositories/parentLinkRepository');
const tutorRepo = require('../../repositories/tutorRepository');
const learnerService = require('../learner/learnerService');
const subjects = require('../subjects/subjectService');
const audit = require('../audit/auditService');
const { band } = require('../recommendation/masteryEngine');
const { addDays } = require('../../utils/time');
const { forbidden, notFound } = require('../../utils/errors');

const avg = (xs) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);
const subjectCodeOf = (course, grade) => `${course.code}${grade}`;

// Rows for the learners of one subject and grade. Scores are only for this subject's topics.
async function subjectRows(learners, topics) {
  const ids = new Set(topics.map((t) => t.id));
  const records = learners.length ? (await masteryRepo.forLearners(learners.map((l) => l.id))).map((r) => r.get({ plain: true })).filter((r) => ids.has(r.topicId)) : [];
  return learners.map((l) => {
    const mine = records.filter((r) => r.learnerId === l.id);
    const total = mine.reduce((s, r) => s + r.score, 0);
    return {
      learnerId: l.id, name: l.fullName, classLabel: l.classLabel, grade: l.grade,
      scores: Object.fromEntries(mine.map((r) => [r.topicId, Math.round(r.score)])),
      overall: topics.length ? Math.round(total / topics.length) : 0,
      mastered: mine.filter((r) => band(r.score, r.attempts) === 'mastered').length,
      started: mine.length,
      needsSupport: mine.length > 0 && avg(mine.map((r) => r.score)) < 40,
    };
  });
}

// Teacher: only the subject(s) they teach. They see the learners enrolled in that subject, one grade at a time.
// Flagged tutor chats are limited to their own subjects (safeguarding).
exports.teacher = async (teacher, { subject, grade, classLabel } = {}) => {
  const courses = await subjects.coursesOfTeacher(teacher);
  if (!courses.length) return { courses: [], subject: null, grade: null, grades: [], classes: [], classLabel: 'All', topics: [], learners: [], classAverage: 0, flagged: [] };
  const course = courses.find((c) => c.code === subject) || courses[0];
  const index = await subjects.topicIndex();

  const byGrade = {};
  for (const g of [10, 11, 12]) byGrade[g] = (await subjects.learnersOfCourse(course, g)).length;
  const g = [10, 11, 12].includes(Number(grade)) ? Number(grade) : [10, 11, 12].find((x) => byGrade[x] > 0) || 10;

  const inGrade = await subjects.learnersOfCourse(course, g);
  const classes = [...new Set(inGrade.map((l) => l.classLabel).filter(Boolean))].sort();
  const label = classLabel && classes.includes(classLabel) ? classLabel : undefined;
  const learners = label ? inGrade.filter((l) => l.classLabel === label) : inGrade;
  const topics = [...index.values()].filter((t) => t.subjectCode === subjectCodeOf(course, g));
  const rows = await subjectRows(learners, topics);

  const myTopicIds = [...index.values()].filter((t) => courses.some((c) => c.code === t.courseCode)).map((t) => t.id);
  const flagged = await tutorRepo.flaggedForTopics(myTopicIds);
  const names = new Map((flagged.length ? await userRepo.findManyByIds([...new Set(flagged.map((x) => x.learnerId))]) : []).map((u) => [u.id, u.fullName]));
  return {
    courses: courses.map((c) => ({ code: c.code, name: c.name })),
    subject: { code: course.code, name: course.name },
    grade: g,
    grades: [10, 11, 12].map((x) => ({ grade: x, learners: byGrade[x] })),
    classes,
    classLabel: label || 'All',
    topics: topics.map((t) => ({ id: t.id, title: t.title })),
    learners: rows,
    classAverage: avg(rows.map((r) => r.overall)),
    flagged: flagged.map((x) => ({ sessionId: x.id, learnerId: x.learnerId, learnerName: names.get(x.learnerId), reason: x.flagReason, at: x.updatedAt, subject: index.get(x.topicId)?.subjectName })),
  };
};

// Parent: summary only. Tutor chat text is never included here (see requireConsent for the separate chat route).
exports.parentChildren = async (parent) => {
  const links = await parentRepo.childrenOf(parent.id);
  return links.map((l) => ({ learnerId: l.learnerId, name: l.learner.fullName, classLabel: l.learner.classLabel, grade: l.learner.grade, canViewTutorChats: l.canViewTutorChats }));
};

exports.parentChildSummary = async (parent, learnerId, subject, now = new Date()) => {
  const learner = await userRepo.findById(learnerId);
  if (!learner) throw notFound('Learner not found');
  const dash = await learnerService.dashboard(learner, subject, now);
  const attempts = await masteryRepo.attemptsSince(learnerId, addDays(now, -14));
  const weekAgo = addDays(now, -7);
  const week = attempts.filter((a) => new Date(a.createdAt) >= weekAgo);
  const days = new Set(week.map((a) => new Date(a.createdAt).toDateString()));
  const gamification = require('../engagement/gamification');
  const activity = gamification.activity(attempts.map((a) => a.get({ plain: true })), now, 14);
  await audit.record('PARENT_VIEWED_SUMMARY', { actorId: parent.id, targetType: 'user', targetId: learnerId });
  return {
    subject: dash.subject,
    subjects: dash.subjects.map(({ code, name, teacher, overall, mastered, totalTopics, started }) => ({ code, name, teacher, overall, mastered, totalTopics, started })),
    overall: avg(dash.subjects.map((s) => s.overall)),
    target: dash.target, mastered: dash.mastered, totalTopics: dash.totalTopics,
    subjectOverall: dash.overall,
    weekly: { questionsAnswered: week.length, correct: week.filter((a) => a.correct).length, daysActive: days.size },
    activity,
    next: dash.next,
    topicMap: dash.topicMap.map(({ title, band: b, score }) => ({ title, band: b, score })),
  };
};

exports.parentChats = async (parent, learnerId) => {
  const sessions = await tutorRepo.sessionsForLearner(learnerId);
  const index = await subjects.topicIndex();
  await audit.record('PARENT_VIEWED_CHATS', { actorId: parent.id, targetType: 'user', targetId: learnerId });
  return sessions.map((s) => ({ sessionId: s.id, topicId: s.topicId, subject: index.get(s.topicId)?.subjectName, createdAt: s.createdAt }));
};

// Principal: aggregated only (by class and by subject). No individual learner names.
exports.principal = async (principal, { subject, grade } = {}) => {
  const [courses, index, all] = await Promise.all([subjects.catalogue(principal.schoolId), subjects.topicIndex(), userRepo.listBySchool(principal.schoolId, 'learner')]);
  const learners = all.filter((l) => l.active);
  const chosen = await subjects.chosenMap(learners.map((l) => l.id));
  const records = learners.length ? (await masteryRepo.forLearners(learners.map((l) => l.id))).map((r) => r.get({ plain: true })) : [];
  const recsBy = new Map();
  for (const r of records) { if (!recsBy.has(r.learnerId)) recsBy.set(r.learnerId, []); recsBy.get(r.learnerId).push(r); }

  // One learner's average across all the subjects they study (each subject counts equally).
  const subjectOverall = (l, course) => {
    const topics = [...index.values()].filter((t) => t.subjectCode === subjectCodeOf(course, l.grade || 10));
    if (!topics.length) return null;
    const ids = new Set(topics.map((t) => t.id));
    const sum = (recsBy.get(l.id) || []).filter((r) => ids.has(r.topicId)).reduce((s, r) => s + r.score, 0);
    return Math.round(sum / topics.length);
  };
  const learnerCourses = (l) => courses.filter((c) => subjects.learnerTakes(c, l, chosen.get(l.id)));
  const overall = new Map(learners.map((l) => [l.id, avg(learnerCourses(l).map((c) => subjectOverall(l, c)).filter((v) => v !== null))]));

  const classes = [...new Set(learners.map((l) => l.classLabel).filter(Boolean))].sort();
  const out = classes.map((c) => {
    const ls = learners.filter((l) => l.classLabel === c);
    const needSupport = ls.filter((l) => (recsBy.get(l.id) || []).length > 0 && overall.get(l.id) < 25).length;
    return { classLabel: c, learners: ls.length, average: avg(ls.map((l) => overall.get(l.id))), needSupport };
  });

  const perSubject = courses.map((c) => {
    const takers = learners.filter((l) => subjects.learnerTakes(c, l, chosen.get(l.id)));
    const scores = takers.map((l) => subjectOverall(l, c)).filter((v) => v !== null);
    return { code: c.code, name: c.name, pathway: c.pathway, teacher: c.teacher ? c.teacher.fullName : null, learners: takers.length, average: avg(scores) };
  });

  const course = courses.find((c) => c.code === subject) || courses.find((c) => c.code === 'MATH') || courses[0];
  const g = [10, 11, 12].includes(Number(grade)) ? Number(grade) : 10;
  const topics = course ? [...index.values()].filter((t) => t.subjectCode === subjectCodeOf(course, g)) : [];
  const takers = course ? learners.filter((l) => (l.grade || 10) === g && subjects.learnerTakes(course, l, chosen.get(l.id))) : [];
  const takerIds = new Set(takers.map((l) => l.id));
  const coverage = topics.map((t) => {
    const forTopic = records.filter((r) => r.topicId === t.id && takerIds.has(r.learnerId));
    return { topicId: t.id, title: t.title, learnersStarted: forTopic.length, average: avg(forTopic.map((r) => r.score)) };
  });
  return { schoolAverage: avg(out.map((c) => c.average)), classes: out, subjects: perSubject, coverage: { subject: course ? { code: course.code, name: course.name } : null, grade: g, learners: takers.length, topics: coverage } };
};

exports.assertCanViewLearner = (viewer, learner) => {
  if (!learner || learner.schoolId !== viewer.schoolId) throw forbidden();
};
