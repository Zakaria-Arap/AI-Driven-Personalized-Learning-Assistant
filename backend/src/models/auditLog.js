module.exports = (sequelize, DT) =>
  sequelize.define('AuditLog', {
    actorId: DT.INTEGER,
    action: { type: DT.STRING(60), allowNull: false },   // e.g. ACCOUNT_ISSUED, LOGIN_FAILED, PARENT_VIEWED_CHATS
    targetType: DT.STRING(40),
    targetId: DT.INTEGER,
    meta: DT.JSON,
  }, { tableName: 'audit_logs', updatedAt: false });
