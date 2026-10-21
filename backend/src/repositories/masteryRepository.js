const { Mastery, Attempt } = require('../models');
const { Op } = require('sequelize');
module.exports = {
  forLearner: (learnerId) => Mastery.findAll({ where: { learnerId } }),
  forLearners: (learnerIds) => Mastery.findAll({ where: { learnerId: { [Op.in]: learnerIds } } }),
  find: (learnerId, topicId) => Mastery.findOne({ where: { learnerId, topicId } }),
  upsert: async (learnerId, topicId, patch) => {
    const row = await Mastery.findOne({ where: { learnerId, topicId } });
    return row ? row.update(patch) : Mastery.create({ learnerId, topicId, ...patch });
  },
  recordAttempt: (data) => Attempt.create(data),
  attemptsSince: (learnerId, since) => Attempt.findAll({ where: { learnerId, createdAt: { [Op.gte]: since } } }),
};
