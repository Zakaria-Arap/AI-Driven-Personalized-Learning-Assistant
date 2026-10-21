module.exports = (sequelize, DT) =>
  sequelize.define('UserSession', {
    userId: { type: DT.INTEGER, allowNull: false },
    userAgent: DT.STRING(255),
    ip: DT.STRING(60),
    lastSeenAt: DT.DATE,
    revokedAt: DT.DATE,
  }, { tableName: 'user_sessions' });
