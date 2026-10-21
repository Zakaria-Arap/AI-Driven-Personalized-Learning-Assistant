const curriculum = require('../../repositories/curriculumRepository');
const masteryRepo = require('../../repositories/masteryRepository');
const { isCorrect } = require('./marking');
const { applyAnswer } = require('../recommendation/masteryEngine');
const subjects = require('../subjects/subjectService');
const { notFound } = require('../../utils/errors');
const learning = require('../../config/learning');

// Questions are sent WITHOUT the answer or solution.
const publicQuestion = (q) => ({ id: q.id, topicId: q.topicId, prompt: q.prompt, type: q.type, options: q.options, difficulty: q.difficulty });

exports.practiceSet = async (learner, topicId) => {
  const topic = await curriculum.topicById(topicId);
  if (!topic) throw notFound('Topic not found');
  const subject = await subjects.assertLearnerTopic(learner, topic);
  const qs = await curriculum.questionsForTopic(topicId, { limit: learning.practiceBatchSize * 2 });
  const shuffled = qs.sort(() => Math.random() - 0.5).slice(0, learning.practiceBatchSize);
  return { topic: { id: topic.id, title: topic.title, outcome: topic.outcome, subject: { code: subject.courseCode, name: subject.name } }, questions: shuffled.map(publicQuestion) };
};

exports.submitAnswer = async (learner, { questionId, response, hintsUsed = 0 }, now = new Date()) => {
  const learnerId = learner.id;
  const q = await curriculum.questionById(questionId);
  if (!q) throw notFound('Question not found');
  await subjects.assertLearnerTopic(learner, await curriculum.topicById(q.topicId));
  const correct = isCorrect(q, response);
  await masteryRepo.recordAttempt({ learnerId, questionId: q.id, topicId: q.topicId, response: String(response ?? ''), correct, hintsUsed });
  const prev = await masteryRepo.find(learnerId, q.topicId);
  const next = applyAnswer(prev && prev.get ? prev.get({ plain: true }) : prev, { correct, hintsUsed }, now);
  const { band, ...row } = next;
  await masteryRepo.upsert(learnerId, q.topicId, row);
  return {
    correct,
    band,
    score: next.score,
    // The worked solution is shown only after the learner has answered.
    solution: q.solution || null,
    correctAnswer: correct ? undefined : q.answer,
  };
};
