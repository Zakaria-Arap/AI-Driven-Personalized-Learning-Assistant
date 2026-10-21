'use strict';
// Subject teachers and learner enrolment: courses (one per subject per school), enrolments, subjects.course_code, users.pathway.
// Idempotent, safe to run on a database that already has data.
module.exports = {
  async up() {
    const db = require('../models');
    const { DataTypes } = db.Sequelize;
    const qi = db.sequelize.getQueryInterface();
    const sub = await qi.describeTable('subjects');
    if (!sub.course_code) await qi.addColumn('subjects', 'course_code', { type: DataTypes.STRING(10) });
    const usr = await qi.describeTable('users');
    if (!usr.pathway) await qi.addColumn('users', 'pathway', { type: DataTypes.STRING(12) });
    await db.Course.sync();
    await db.Enrolment.sync();
    await db.sequelize.query("UPDATE subjects SET course_code = 'MATH' WHERE code LIKE 'MATH%' AND course_code IS NULL");
  },
  async down() {
    const db = require('../models');
    const qi = db.sequelize.getQueryInterface();
    await qi.dropTable('enrolments');
    await qi.dropTable('courses');
    await qi.removeColumn('users', 'pathway');
    await qi.removeColumn('subjects', 'course_code');
  },
};
