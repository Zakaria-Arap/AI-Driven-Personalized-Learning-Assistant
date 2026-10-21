module.exports = (sequelize, DT) =>
  sequelize.define('Subject', {
    name: { type: DT.STRING(120), allowNull: false },
    code: { type: DT.STRING(20), allowNull: false, unique: true },
    grade: { type: DT.INTEGER, allowNull: false },
    courseCode: DT.STRING(10),                    // ties this grade's curriculum to a course, e.g. BIO
  }, { tableName: 'subjects' });
