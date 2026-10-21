const masteryRepo = require('../../repositories/masteryRepository');
const { band } = require('../recommendation/masteryEngine');
const { recommend } = require('../recommendation/recommendationEngine');
const subjects = require('../subjects/subjectService');
const learning = require('../../config/learning');
const { notFound } = require('../../utils/errors');

const grade = (l) => l.grade || 10;

function summarise(course, topics, records, now) {
  const byTopic = new Map(records.map((r) => [r.topicId, r]));
  const map = topics.map((t) => {
    const r = byTopic.get(t.id);
    return { topicId: t.id, title: t.title, strand: t.strand, score: r ? Math.round(r.score) : 0, band: band(r?.score ?? 0, r?.attempts ?? 0) };
  });
  return {
    map,
    summary: {
      code: course.code, name: course.name, pathway: course.pathway, teacher: course.teacher ? course.teacher.fullName : null,
      overall: topics.length ? Math.round(map.reduce((s, m) => s + m.score, 0) / topics.length) : 0,
      mastered: map.filter((m) => m.band === 'mastered').length,
      started: map.filter((m) => m.band !== 'not_started').length,
      totalTopics: topics.length,
      next: topics.length ? recommend(topics, records, now) : null,
    },
  };
}

// Everything one learner studies this year (their grade), with progress in each subject.
exports.subjectsFor = async (learner, now = new Date()) => {
  const [courses, index, rows] = await Promise.all([subjects.coursesOfLearner(learner), subjects.topicIndex(), masteryRepo.forLearner(learner.id)]);
  const records = rows.map((r) => r.get({ plain: true }));
  const out = [];
  for (const course of courses) {
    const topics = [...index.values()].filter((t) => t.courseCode === course.code && t.grade === grade(learner));
    const mine = records.filter((r) => topics.some((t) => t.id === r.topicId));
    const { map, summary } = summarise(course, topics, mine, now);
    out.push({ course, topics, map, summary });
  }
  return out;
};

exports.subjectList = async (learner, now) => (await exports.subjectsFor(learner, now)).map((s) => s.summary);

// One subject's dashboard. Without a subject it opens the first one (Core Mathematics comes first).
exports.dashboard = async (learner, courseCode, now = new Date()) => {
  const all = await exports.subjectsFor(learner, now);
  const pick = courseCode ? all.find((s) => s.course.code === courseCode) : all.find((s) => s.course.code === 'MATH') || all[0];
  if (!pick) throw notFound('You are not enrolled in that subject.');
  const { summary, map } = pick;
  return {
    subject: { code: summary.code, name: summary.name, grade: grade(learner), teacher: summary.teacher },
    target: learning.masteryTarget,
    overall: summary.overall,
    mastered: summary.mastered,
    started: summary.started,
    totalTopics: summary.totalTopics,
    next: summary.next,
    topicMap: map,
    subjects: all.map((s) => s.summary),
    needsPathway: !learner.pathway,
  };
};
