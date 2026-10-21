const repo = require('../../repositories/assignmentRepository');
const userRepo = require('../../repositories/userRepository');
const curriculum = require('../../repositories/curriculumRepository');
const masteryRepo = require('../../repositories/masteryRepository');
const notifications = require('./notificationService');
const audit = require('../audit/auditService');
const learning = require('../../config/learning');
const subjects = require('../subjects/subjectService');
const { badRequest, forbidden, notFound } = require('../../utils/errors');

const subj = (a) => { const sub = a.Topic?.Strand?.Subject; return sub ? { code: sub.courseCode, name: sub.name, grade: sub.grade } : null; };
const fmt = (a, extra = {}) => ({ id: a.id, classLabel: a.classLabel, topicId: a.topicId, topicTitle: a.Topic?.title, subject: subj(a), dueAt: a.dueAt, note: a.note, ...extra });

exports.create = async (teacher, { classLabel, topicId, dueAt, note }) => {
  const topic = await curriculum.topicById(topicId);
  if (!topic) throw notFound('Topic not found');
  if (dueAt && new Date(dueAt) < new Date(Date.now() - 86400000)) throw badRequest('Due date is in the past.', 'BAD_DUE');
  const subject = await subjects.assertTeacherTopic(teacher, topic);
  const course = (await subjects.coursesOfTeacher(teacher)).find((c) => c.code === subject.courseCode);
  const a = await repo.create({ schoolId: teacher.schoolId, teacherId: teacher.id, classLabel, topicId, dueAt: dueAt || null, note: note || null });
  // Only learners of this class who study this subject in this grade are told.
  const ids = (await subjects.learnersOfCourse(course, subject.grade, classLabel)).map((l) => l.id);
  await notifications.notifyMany(ids, { type: 'assignment', title: `New task: ${topic.title}`, body: note || (dueAt ? `Due ${new Date(dueAt).toDateString()}` : 'Practise this topic'), link: `/learner/practice/${topicId}` });
  await audit.record('ASSIGNMENT_CREATED', { actorId: teacher.id, targetType: 'assignment', targetId: a.id, meta: { classLabel, topicId } });
  return fmt({ ...a.get({ plain: true }), Topic: topic.get ? topic : topic });
};

exports.listForTeacher = async (teacher) => (await repo.forTeacher(teacher.id)).map((a) => fmt(a));

// Learners see their class tasks with their own progress on each.
exports.listForLearner = async (learner) => {
  if (!learner.classLabel) return [];
  const mine = new Set((await subjects.coursesOfLearner(learner)).map((c) => c.code));
  const rows = (await repo.forClass(learner.schoolId, learner.classLabel)).filter((a) => {
    const sub = a.Topic?.Strand?.Subject;
    return sub && mine.has(sub.courseCode) && sub.grade === (learner.grade || 10);
  });
  const mastery = await masteryRepo.forLearner(learner.id);
  return rows.map((a) => {
    const m = mastery.find((x) => x.topicId === a.topicId);
    const score = m ? Math.round(m.score) : 0;
    return fmt(a, { score, done: score >= learning.masteryTarget, overdue: !!a.dueAt && new Date(a.dueAt) < new Date() && score < learning.masteryTarget });
  });
};

exports.remove = async (teacher, id) => {
  const a = await repo.find(id);
  if (!a || a.teacherId !== teacher.id) throw forbidden();
  await repo.destroy(a);
  return { done: true };
};
