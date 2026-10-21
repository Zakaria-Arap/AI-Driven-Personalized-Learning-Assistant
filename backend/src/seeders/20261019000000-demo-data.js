'use strict';
// Demo school, five demo accounts (same as the prototype), Grade 10 Core Mathematics, and a little progress data.
const bcrypt = require('bcryptjs');
const importCurriculum = require('../utils/curriculumImport');
const data = require('./data/mathGrade10.json');

module.exports = {
  async up() {
    const models = require('../models');
    const { School, User, ParentLink, Topic, Mastery } = models;
    const hash = (p) => bcrypt.hash(p, 10);

    const [school] = await School.findOrCreate({ where: { code: 'DEMO' }, defaults: { name: 'Demo Senior School', county: 'Kisii' } });
    const mk = async (userCode, role, fullName, pw, extra = {}) =>
      (await User.findOrCreate({
        where: { userCode },
        defaults: { schoolId: school.id, role, fullName, passwordHash: await hash(pw), mustChangePassword: false, ...extra },
      }))[0];

    const amani = await mk('AMA-10B-014', 'learner', 'Amani Otieno', 'Welcome-2026', { grade: 10, classLabel: '10B', mustChangePassword: true, email: 'amani@demo.somo.ke' });
    const brian = await mk('BRM-10B-007', 'learner', 'Brian Mwangi', 'Welcome-2026', { grade: 10, classLabel: '10B', mustChangePassword: true });
    const zawadi = await mk('ZAK-10B-021', 'learner', 'Zawadi Kerubo', 'Welcome-2026', { grade: 10, classLabel: '10B', mustChangePassword: true });
    await mk('TCH-0231', 'teacher', 'Mr. J. Kamau', 'Chalk#2026', { email: 'kamau@demo.somo.ke', classLabel: '10B' });
    const parent = await mk('PAR-0872', 'parent', 'J. Otieno', 'Family#2026', { email: 'otieno.parent@demo.somo.ke' });
    await mk('PRN-0001', 'principal', 'Mrs. W. Njoroge', 'Lead#2026', { email: 'njoroge@demo.somo.ke' });
    await mk('ADM-0001', 'admin', 'Mr. B. Achieng', 'Office#2026', { email: 'achieng@demo.somo.ke' });

    await ParentLink.findOrCreate({ where: { parentId: parent.id, learnerId: amani.id }, defaults: { canViewTutorChats: false, verifiedBySchoolAt: new Date() } });

    await importCurriculum(models, data);

    // A little progress so teacher/principal screens are not empty (Amani starts fresh on purpose).
    const topics = await Topic.findAll({ order: [['id', 'ASC']] });
    const give = async (user, scores) => {
      for (let i = 0; i < scores.length && i < topics.length; i++) {
        await Mastery.findOrCreate({ where: { learnerId: user.id, topicId: topics[i].id }, defaults: { score: scores[i], attempts: 6, correct: Math.round(scores[i] / 20), reviewStep: 0, lastPracticedAt: new Date() } });
      }
    };
    await give(brian, [86, 72, 55, 30]);
    await give(zawadi, [45, 20]);
  },
  async down() {
    const { sequelize } = require('../models');
    const qi = sequelize.getQueryInterface();
    for (const t of ['mastery', 'parent_links', 'topic_prerequisites', 'questions', 'topics', 'strands', 'subjects', 'users', 'schools']) {
      await qi.bulkDelete(t, null, {});
    }
  },
};
