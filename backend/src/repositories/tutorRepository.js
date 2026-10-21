const { TutorSession, TutorMessage } = require('../models');
const { Op } = require('sequelize');
module.exports = {
  createSession: (data) => TutorSession.create(data),
  findSession: (id) => TutorSession.findByPk(id),
  saveSession: (s) => s.save(),
  addMessage: (data) => TutorMessage.create(data),
  messages: (sessionId) => TutorMessage.findAll({ where: { sessionId }, order: [['createdAt', 'ASC']] }),
  sessionsForLearner: (learnerId) => TutorSession.findAll({ where: { learnerId }, order: [['createdAt', 'DESC']], limit: 50 }),
  flaggedForLearners: (learnerIds) => TutorSession.findAll({ where: { flagged: true, learnerId: { [Op.in]: learnerIds } }, order: [['updatedAt', 'DESC']] }),
  flaggedForTopics: (topicIds) => (topicIds.length ? TutorSession.findAll({ where: { flagged: true, topicId: { [Op.in]: topicIds } }, order: [['updatedAt', 'DESC']] }) : []),
  countLearnerMessagesSince: async (learnerId, since) => {
    const sessions = await TutorSession.findAll({ where: { learnerId }, attributes: ['id'] });
    if (!sessions.length) return 0;
    return TutorMessage.count({ where: { role: 'learner', sessionId: { [Op.in]: sessions.map((s) => s.id) }, createdAt: { [Op.gte]: since } } });
  },
};
