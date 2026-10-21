module.exports = (sequelize, DT) =>
  sequelize.define('ParentLink', {
    parentId: { type: DT.INTEGER, allowNull: false },
    learnerId: { type: DT.INTEGER, allowNull: false },
    canViewTutorChats: { type: DT.BOOLEAN, allowNull: false, defaultValue: false }, // privacy default: off
    verifiedBySchoolAt: DT.DATE,
  }, { tableName: 'parent_links', indexes: [{ unique: true, fields: ['parent_id', 'learner_id'] }] });
