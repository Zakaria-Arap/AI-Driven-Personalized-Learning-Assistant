// Loads the course catalogue (src/seeders/data/courses) into the database: curriculum for every grade, and one course row
// per subject for the given school. Safe to run twice: existing subjects, topics and courses are kept.
const importCurriculum = require('./curriculumImport');

module.exports = async function importCourses(models, catalogue, schoolId) {
  const { Course } = models;
  let topics = 0;
  for (const c of catalogue) {
    for (const [grade, strands] of Object.entries(c.grades)) {
      const r = await importCurriculum(models, { subject: { code: `${c.code}${grade}`, name: c.name, grade: Number(grade), courseCode: c.code }, strands });
      topics += r.topics;
      if (!r.subject.courseCode) await r.subject.update({ courseCode: c.code });
    }
  }
  let position = 0;
  for (const c of catalogue) {
    if (schoolId) await Course.findOrCreate({ where: { schoolId, code: c.code }, defaults: { name: c.name, pathway: c.pathway, position: position++ } });
  }
  return { courses: catalogue.length, topics };
};
