module.exports = (sequelize, DT) =>
  sequelize.define('UserBadge', {
    userId: { type: DT.INTEGER, allowNull: false },
    badgeKey: { type: DT.STRING(40), allowNull: false },
    awardedAt: { type: DT.DATE, allowNull: false, defaultValue: DT.NOW },
  }, { tableName: 'user_badges', timestamps: false, indexes: [{ unique: true, fields: ['user_id', 'badge_key'] }] });
