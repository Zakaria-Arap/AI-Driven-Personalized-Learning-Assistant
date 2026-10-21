// Usage: npm run courses:import [SCHOOL_CODE]   (default DEMO)
// Loads every subject for Grades 10-12 from src/seeders/data/courses and creates one course per subject for the school.
// Safe to run again: nothing is duplicated, and existing teacher assignments are kept.
const models = require('../src/models');
const importCourses = require('../src/utils/courseImport');
const catalogue = require('../src/seeders/data/courses');

(async () => {
  const school = await models.School.findOne({ where: { code: process.argv[2] || 'DEMO' } });
  if (!school) throw new Error('School not found');
  const r = await importCourses(models, catalogue, school.id);
  console.log(`Loaded ${r.courses} subjects (${r.topics} topics) for ${school.name}. Assign teachers in the admin Subjects page.`);
  await models.sequelize.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
