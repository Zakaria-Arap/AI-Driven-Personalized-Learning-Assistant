module.exports = (sequelize, DT) =>
  sequelize.define('Mastery', {
    learnerId: { type: DT.INTEGER, allowNull: false },
    topicId: { type: DT.INTEGER, allowNull: false },
    score: { type: DT.FLOAT, allowNull: false, defaultValue: 0 },     // 0-100
    attempts: { type: DT.INTEGER, allowNull: false, defaultValue: 0 },
    correct: { type: DT.INTEGER, allowNull: false, defaultValue: 0 },
    reviewStep: { type: DT.INTEGER, allowNull: false, defaultValue: 0 },
    lastPracticedAt: DT.DATE,
    nextReviewAt: DT.DATE,
  }, { tableName: 'mastery', indexes: [{ unique: true, fields: ['learner_id', 'topic_id'] }] });
