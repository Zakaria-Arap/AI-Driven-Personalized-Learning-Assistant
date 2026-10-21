'use strict';
// All core senior-school subjects, Grades 10 to 12 (starter question banks, reviewed = false), and one course per subject for the demo school.
const importCourses = require('../utils/courseImport');
const catalogue = require('./data/courses');

module.exports = {
  async up() {
    const models = require('../models');
    const school = await models.School.findOne({ where: { code: 'DEMO' } });
    await importCourses(models, catalogue, school && school.id);
  },
  async down() {
    const { sequelize } = require('../models');
    const qi = sequelize.getQueryInterface();
    await qi.bulkDelete('enrolments', null, {});
    await qi.bulkDelete('courses', null, {});
  },
};
