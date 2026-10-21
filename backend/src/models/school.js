module.exports = (sequelize, DT) =>
  sequelize.define('School', {
    name: { type: DT.STRING(160), allowNull: false },
    code: { type: DT.STRING(20), allowNull: false, unique: true },
    county: DT.STRING(80),
  }, { tableName: 'schools' });
