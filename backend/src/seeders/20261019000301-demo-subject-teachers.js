'use strict';
// LOCAL DEVELOPMENT ONLY. A teacher for every subject, pathways and subject choices for the demo learners,
// two learners in Grades 11 and 12, and practice history in their subjects. Safe to run again.
//   Maths teacher = TEACHER (teacher@1234)   Physics teacher = TCH-0231 (Chalk#2026)
//   other subject teachers: TCH-ENG, TCH-KIS, TCH-BIO, TCH-CHEM, TCH-CS, TCH-HIST, TCH-GEO, TCH-CRE, TCH-BUS  (teacher@1234)
const bcrypt = require('bcryptjs');

const TEACHERS = {
  ENG: ['TCH-ENG', 'Ms. Grace Wanjiku'], KIS: ['TCH-KIS', 'Mwalimu Hamisi Juma'], BIO: ['TCH-BIO', 'Dr. Lydia Moraa'], CHEM: ['TCH-CHEM', 'Mr. Peter Ouma'],
  CS: ['TCH-CS', 'Ms. Faith Njeri'], HIST: ['TCH-HIST', 'Mr. Samuel Kiprono'], GEO: ['TCH-GEO', 'Ms. Esther Akinyi'], CRE: ['TCH-CRE', 'Rev. Daniel Mutua'], BUS: ['TCH-BUS', 'Mr. Hassan Ali'],
};
const OWN = { MATH: 'TEACHER', PHY: 'TCH-0231' };
const CHOICES = { LEARNER: ['stem', ['BIO', 'CHEM', 'PHY']], 'BRM-10B-007': ['stem', ['BIO', 'PHY', 'CS']], 'ZAK-10B-021': ['social', ['HIST', 'GEO', 'BUS']], 'AMA-10B-014': ['social', ['CRE', 'GEO', 'BUS']], 'MAT-11A-003': ['stem', ['BIO', 'CHEM', 'CS']], 'KOC-12A-009': ['social', ['HIST', 'GEO', 'CRE']] };
const ACTIVE = { LEARNER: 0.72, 'BRM-10B-007': 0.8, 'ZAK-10B-021': 0.5, 'MAT-11A-003': 0.78, 'KOC-12A-009': 0.62 };

module.exports = {
  async up() {
    if (process.env.NODE_ENV === 'production') throw new Error('demo-subject-teachers seeder must not run in production');
    const m = require('../models');
    const { School, User, Course, Enrolment, Topic, Strand, Subject, Question, Attempt, Mastery, Assignment } = m;
    const { applyAnswer } = require('../services/recommendation/masteryEngine');
    const school = await School.findOne({ where: { code: 'DEMO' } });
    if (!school) return;

    // teachers
    for (const [code, [userCode, name]] of Object.entries(TEACHERS)) {
      const [u] = await User.findOrCreate({ where: { userCode }, defaults: { schoolId: school.id, role: 'teacher', fullName: name, passwordHash: await bcrypt.hash('teacher@1234', 10), mustChangePassword: false } });
      await Course.update({ teacherId: u.id }, { where: { schoolId: school.id, code } });
    }
    for (const [code, userCode] of Object.entries(OWN)) {
      const u = await User.findOne({ where: { userCode } });
      if (u) await Course.update({ teacherId: u.id }, { where: { schoolId: school.id, code } });
    }

    // two more learners so Grades 11 and 12 have someone in them
    const extra = [['MAT-11A-003', 'Mercy Atieno', 11, '11A'], ['KOC-12A-009', 'Kevin Ochieng', 12, '12A']];
    for (const [userCode, fullName, grade, classLabel] of extra) {
      await User.findOrCreate({ where: { userCode }, defaults: { schoolId: school.id, role: 'learner', fullName, grade, classLabel, passwordHash: await bcrypt.hash('Learn#2026', 10), mustChangePassword: false } });
    }

    // pathways and subject choices
    const courses = await Course.findAll({ where: { schoolId: school.id } });
    const byCode = new Map(courses.map((c) => [c.code, c]));
    for (const [userCode, [pathway, codes]] of Object.entries(CHOICES)) {
      const u = await User.findOne({ where: { userCode } });
      if (!u) continue;
      await u.update({ pathway });
      if ((await Enrolment.count({ where: { learnerId: u.id } })) === 0) await Enrolment.bulkCreate(codes.map((c) => ({ learnerId: u.id, courseId: byCode.get(c).id })));
    }

    // practice history in their subjects (deterministic)
    let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
    const DAY = 86400000;
    for (const [userCode, skill] of Object.entries(ACTIVE)) {
      const u = await User.findOne({ where: { userCode } });
      if (!u) continue;
      const wanted = ['ENG', 'KIS', 'MATH', ...(CHOICES[userCode] ? CHOICES[userCode][1] : [])];
      const subjects = await Subject.findAll({ where: { courseCode: wanted, grade: u.grade } });
      const topics = await Topic.findAll({ include: [{ model: Strand, required: true, where: { subjectId: subjects.map((s) => s.id) } }], order: [['id', 'ASC']] });
      // MATH10 history already exists for the original learners; only add for topics with no attempts yet
      const done = new Set((await Attempt.findAll({ where: { learnerId: u.id }, attributes: ['topicId'], group: ['topic_id'] })).map((a) => a.topicId));
      const fresh = topics.filter((t) => !done.has(t.id));
      if (!fresh.length) continue;
      const questions = await Question.findAll({ where: { topicId: fresh.map((t) => t.id) }, order: [['id', 'ASC']] });
      const rows = [];
      for (let d = 26; d >= 0; d--) {
        if (d > 2 && rnd() < 0.3) continue;
        const n = 3 + Math.floor(rnd() * 5);
        for (let i = 0; i < n; i++) {
          const q = questions[Math.floor(rnd() * Math.min(questions.length, 6 + (26 - d) * 2))];
          const correct = rnd() < skill;
          const at = new Date(Date.now() - d * DAY - Math.floor(rnd() * 5) * 3600000); at.setHours(8 + Math.floor(rnd() * 10));
          rows.push({ learnerId: u.id, questionId: q.id, topicId: q.topicId, response: correct ? q.answer : 'x', correct, hintsUsed: correct && rnd() < 0.25 ? 1 : 0, createdAt: at, updatedAt: at });
        }
      }
      rows.sort((a, b) => a.createdAt - b.createdAt);
      await Attempt.bulkCreate(rows);
      const state = new Map();
      for (const r of rows) {
        const { band, ...next } = applyAnswer(state.get(r.topicId), { correct: r.correct, hintsUsed: r.hintsUsed }, r.createdAt);
        state.set(r.topicId, next);
      }
      for (const [topicId, next] of state) {
        await Mastery.destroy({ where: { learnerId: u.id, topicId } });
        await Mastery.create({ learnerId: u.id, topicId, ...next });
      }
    }

    // The original demo task was a maths task set by Mr Kamau, who now teaches Physics: it belongs to the maths teacher.
    const kamau = await User.findOne({ where: { userCode: 'TCH-0231' } });
    const mathsTeacher = await User.findOne({ where: { userCode: 'TEACHER' } });
    if (kamau && mathsTeacher) {
      const mathSubjects = await Subject.findAll({ where: { courseCode: 'MATH' } });
      const mathTopics = await Topic.findAll({ include: [{ model: Strand, required: true, where: { subjectId: mathSubjects.map((x) => x.id) } }] });
      await Assignment.update({ teacherId: mathsTeacher.id }, { where: { teacherId: kamau.id, topicId: mathTopics.map((t) => t.id) } });
    }
    // one task from the physics teacher
    const forces = await Topic.findOne({ where: { title: "Forces and Newton's laws" } });
    if (kamau && forces && (await Assignment.count({ where: { teacherId: kamau.id } })) === 0) {
      await Assignment.create({ schoolId: school.id, teacherId: kamau.id, classLabel: '10B', topicId: forces.id, dueAt: new Date(Date.now() + 7 * DAY), note: 'Practise F = ma before the next lesson.' });
    }
  },
  async down() {
    const { sequelize } = require('../models');
    const qi = sequelize.getQueryInterface();
    await qi.bulkDelete('enrolments', null, {});
  },
};
