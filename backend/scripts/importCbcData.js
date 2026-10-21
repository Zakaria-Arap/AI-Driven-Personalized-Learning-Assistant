// Usage: node scripts/importCbcData.js [path/to/curriculum.json]
// Default file: src/seeders/data/mathGrade10.json. Same JSON format for any subject and grade; the course code is taken
// from subject.courseCode, or from subject.code without its grade digits (MATH10 -> MATH).
// To load the whole catalogue (all subjects, Grades 10-12) use: npm run courses:import
const path = require('path');
const models = require('../src/models');
const importCurriculum = require('../src/utils/curriculumImport');

(async () => {
  const file = path.resolve(process.argv[2] || path.join(__dirname, '../src/seeders/data/mathGrade10.json'));
  const data = require(file);
  if (!data.subject.courseCode) data.subject.courseCode = String(data.subject.code).replace(/\d+$/, '');
  const result = await importCurriculum(models, data);
  console.log(`Imported ${result.topics} topics into ${result.subject.name} (Grade ${result.subject.grade}).`);
  await models.sequelize.close();
})().catch((e) => { console.error(e.message); process.exit(1); });
