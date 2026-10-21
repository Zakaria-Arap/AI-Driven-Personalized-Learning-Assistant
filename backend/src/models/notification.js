module.exports = (sequelize, DT) =>
  sequelize.define('Notification', {
    userId: { type: DT.INTEGER, allowNull: false },
    type: { type: DT.STRING(30), allowNull: false },     // announcement, assignment, badge, flag, system
    title: { type: DT.STRING(160), allowNull: false },
    body: DT.STRING(400),
    link: DT.STRING(120),
    readAt: DT.DATE,
  }, { tableName: 'notifications', indexes: [{ fields: ['user_id', 'read_at'] }] });
