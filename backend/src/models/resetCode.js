module.exports = (sequelize, DT) =>
  sequelize.define('ResetCode', {
    userId: { type: DT.INTEGER, allowNull: false },
    codeHash: { type: DT.STRING(100), allowNull: false },
    expiresAt: { type: DT.DATE, allowNull: false },
    usedAt: DT.DATE,
    tries: { type: DT.INTEGER, allowNull: false, defaultValue: 0 },
    verifiedAt: DT.DATE,
  }, { tableName: 'reset_codes' });
