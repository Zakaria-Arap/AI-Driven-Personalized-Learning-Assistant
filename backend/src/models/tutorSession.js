module.exports = (sequelize, DT) =>
  sequelize.define('TutorSession', {
    learnerId: { type: DT.INTEGER, allowNull: false },
    topicId: DT.INTEGER,
    questionId: DT.INTEGER,
    hintLevel: { type: DT.INTEGER, allowNull: false, defaultValue: 0 },  // server-held, 0-5
    flagged: { type: DT.BOOLEAN, allowNull: false, defaultValue: false },
    flagReason: DT.STRING(255),
  }, { tableName: 'tutor_sessions' });
