// One row per subject a school teaches (for example Biology). Each course has its own teacher.
module.exports = (sequelize, DT) =>
  sequelize.define('Course', {
    schoolId: { type: DT.INTEGER, allowNull: false },
    code: { type: DT.STRING(10), allowNull: false },                       // ENG, KIS, MATH, BIO ...
    name: { type: DT.STRING(120), allowNull: false },
    pathway: { type: DT.ENUM('compulsory', 'stem', 'social', 'arts'), allowNull: false },
    teacherId: DT.INTEGER,                                                 // the subject teacher
    position: { type: DT.INTEGER, defaultValue: 0 },
  }, { tableName: 'courses', indexes: [{ unique: true, fields: ['school_id', 'code'] }] });
