const { Subject, Strand, Topic, Question } = require('../models');
const { Op } = require('sequelize');
void Op;
module.exports = {
  subjectByCode: (code) => Subject.findOne({ where: { code } }),
  topicsForSubject: (subjectId) =>
    Topic.findAll({
      include: [{ model: Strand, where: { subjectId }, required: true }, { model: Topic, as: 'Prerequisites' }],
      order: [[Strand, 'position', 'ASC'], ['position', 'ASC']],
    }),
  topicById: (id) => Topic.findByPk(id, { include: [{ model: Strand, include: [Subject] }] }),
  // Every topic with the course and grade it belongs to (used for titles, ownership checks and analytics).
  allTopics: () => Topic.findAll({ include: [{ model: Strand, required: true, include: [{ model: Subject, required: true }] }, { model: Topic, as: 'Prerequisites' }], order: [[Strand, 'subjectId', 'ASC'], [Strand, 'position', 'ASC'], ['position', 'ASC']] }),
  subjectsForCourse: (courseCode) => Subject.findAll({ where: { courseCode }, order: [['grade', 'ASC']] }),
  questionById: (id) => Question.findByPk(id),
  questionsForTopic: (topicId, { limit = 20, onlyReviewed = false } = {}) =>
    Question.findAll({ where: { topicId, ...(onlyReviewed ? { reviewed: true } : {}) }, limit }),
};
