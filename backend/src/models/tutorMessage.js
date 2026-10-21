module.exports = (sequelize, DT) =>
  sequelize.define('TutorMessage', {
    sessionId: { type: DT.INTEGER, allowNull: false },
    role: { type: DT.ENUM('learner', 'tutor'), allowNull: false },
    content: { type: DT.TEXT, allowNull: false },
    hintLevel: DT.INTEGER,
    blocked: { type: DT.BOOLEAN, defaultValue: false },  // true when the answer filter replaced the reply
  }, { tableName: 'tutor_messages' });
