module.exports = (sequelize, DT) =>
  sequelize.define('Attempt', {
    learnerId: { type: DT.INTEGER, allowNull: false },
    questionId: { type: DT.INTEGER, allowNull: false },
    topicId: { type: DT.INTEGER, allowNull: false },
    response: DT.STRING(255),
    correct: { type: DT.BOOLEAN, allowNull: false },
    hintsUsed: { type: DT.INTEGER, defaultValue: 0 },
  }, { tableName: 'attempts' });
