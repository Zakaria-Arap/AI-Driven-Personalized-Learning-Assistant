module.exports = (sequelize, DT) =>
  sequelize.define('Strand', {
    subjectId: { type: DT.INTEGER, allowNull: false },
    name: { type: DT.STRING(120), allowNull: false },
    position: { type: DT.INTEGER, defaultValue: 0 },
  }, { tableName: 'strands' });
