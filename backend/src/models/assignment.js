module.exports = (sequelize, DT) =>
  sequelize.define('Assignment', {
    schoolId: { type: DT.INTEGER, allowNull: false },
    teacherId: { type: DT.INTEGER, allowNull: false },
    classLabel: { type: DT.STRING(20), allowNull: false },
    topicId: { type: DT.INTEGER, allowNull: false },
    dueAt: DT.DATE,
    note: DT.STRING(300),
  }, { tableName: 'assignments' });
