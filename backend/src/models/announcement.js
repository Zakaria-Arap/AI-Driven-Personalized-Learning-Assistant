module.exports = (sequelize, DT) =>
  sequelize.define('Announcement', {
    schoolId: { type: DT.INTEGER, allowNull: false },
    authorId: { type: DT.INTEGER, allowNull: false },
    audience: { type: DT.ENUM('all', 'learner', 'teacher', 'parent'), allowNull: false, defaultValue: 'all' },
    title: { type: DT.STRING(160), allowNull: false },
    body: { type: DT.TEXT, allowNull: false },
    pinned: { type: DT.BOOLEAN, allowNull: false, defaultValue: false },
  }, { tableName: 'announcements' });
