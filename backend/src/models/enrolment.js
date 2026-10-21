// A learner's chosen (elective) subject. Compulsory subjects are implied for every learner, so they have no row.
module.exports = (sequelize, DT) =>
  sequelize.define('Enrolment', {
    learnerId: { type: DT.INTEGER, allowNull: false },
    courseId: { type: DT.INTEGER, allowNull: false },
  }, { tableName: 'enrolments', indexes: [{ unique: true, fields: ['learner_id', 'course_id'] }] });
