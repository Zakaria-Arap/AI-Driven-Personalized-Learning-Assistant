module.exports = (sequelize, DT) =>
  sequelize.define('Topic', {
    strandId: { type: DT.INTEGER, allowNull: false },
    title: { type: DT.STRING(160), allowNull: false },
    outcome: DT.TEXT,           // CBC specific learning outcome
    position: { type: DT.INTEGER, defaultValue: 0 },
  }, { tableName: 'topics' });
