'use strict';
// Demo branding, 8 weeks of practice history for the demo learners, announcements, a class task and notifications.
// Safe to run again: it skips anything that already exists. LOCAL DEVELOPMENT ONLY.
module.exports = {
  async up() {
    if (process.env.NODE_ENV === 'production') throw new Error('demo-activity seeder must not run in production');
    const m = require('../models');
    const { School, SchoolSetting, User, Question, Attempt, Mastery, Topic, Announcement, Assignment, Notification, UserBadge } = m;
    const school = await School.findOne({ where: { code: 'DEMO' } });
    if (!school) return;

    await SchoolSetting.findOrCreate({ where: { schoolId: school.id }, defaults: { name: 'Demo Senior School', tagline: 'Learn maths at your own pace', footerText: 'Demo Senior School, Kisii County', supportEmail: 'support@demo.somo.ke' } });

    // deterministic pseudo-random so every install shows the same demo
    let seed = 42; const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
    const questions = await Question.findAll({ order: [['id', 'ASC']] });
    const topics = await Topic.findAll({ order: [['id', 'ASC']] });
    const profiles = { LEARNER: { days: 38, skill: 0.72 }, 'BRM-10B-007': { days: 44, skill: 0.8 }, 'ZAK-10B-021': { days: 18, skill: 0.5 } };

    for (const [code, cfg] of Object.entries(profiles)) {
      const u = await User.findOne({ where: { userCode: code } });
      if (!u || (await Attempt.count({ where: { learnerId: u.id } })) > 0) continue;
      const rows = []; const per = new Map();
      for (let d = cfg.days; d >= 0; d--) {
        if (d > 3 && rnd() < 0.28) continue;                       // some rest days
        const n = 2 + Math.floor(rnd() * 5);
        for (let i = 0; i < n; i++) {
          const q = questions[Math.floor(rnd() * Math.min(questions.length, 3 + Math.floor((cfg.days - d) / 6) * 3))];
          const correct = rnd() < cfg.skill;
          const at = new Date(Date.now() - d * 86400000 - Math.floor(rnd() * 6) * 3600000); at.setHours(9 + Math.floor(rnd() * 9));
          rows.push({ learnerId: u.id, questionId: q.id, topicId: q.topicId, response: correct ? q.answer : '0', correct, hintsUsed: correct && rnd() < 0.3 ? 1 : 0, createdAt: at, updatedAt: at });
          const e = per.get(q.topicId) || { attempts: 0, correct: 0 }; e.attempts++; if (correct) e.correct++; per.set(q.topicId, e);
        }
      }
      await Attempt.bulkCreate(rows);
      for (const t of topics) {
        const e = per.get(t.id); if (!e) continue;
        const score = Math.min(96, Math.round((e.correct / e.attempts) * 100 * Math.min(1, e.attempts / 8)));
        await Mastery.destroy({ where: { learnerId: u.id, topicId: t.id } });
        await Mastery.create({ learnerId: u.id, topicId: t.id, score, attempts: e.attempts, correct: e.correct, reviewStep: score >= 80 ? 1 : 0, lastPracticedAt: new Date(), nextReviewAt: score >= 80 ? new Date(Date.now() + (1 + Math.floor(rnd() * 8)) * 86400000) : null });
      }
      for (const key of ['first_step', 'sharp_10', 'streak_3']) await UserBadge.findOrCreate({ where: { userId: u.id, badgeKey: key } });
    }

    const principal = await User.findOne({ where: { userCode: 'PRINCIPAL' } }) || await User.findOne({ where: { userCode: 'PRN-0001' } });
    const teacher = await User.findOne({ where: { userCode: 'TEACHER' } }) || await User.findOne({ where: { userCode: 'TCH-0231' } });
    if (principal && (await Announcement.count({ where: { schoolId: school.id } })) === 0) {
      await Announcement.create({ schoolId: school.id, authorId: principal.id, audience: 'all', pinned: true, title: 'Welcome to Somo', body: 'Somo is now live for Grade 10 Core Mathematics. Practise a little every day. Even 10 minutes builds a streak and helps you master each topic.' });
      if (teacher) await Announcement.create({ schoolId: school.id, authorId: teacher.id, audience: 'learner', title: 'Quadratics test on Friday', body: 'Revise Quadratic expressions and equations. Use the tutor hints before asking me.' });
    }
    if (teacher && (await Assignment.count({ where: { schoolId: school.id } })) === 0) {
      await Assignment.create({ schoolId: school.id, teacherId: teacher.id, classLabel: '10B', topicId: topics[2].id, dueAt: new Date(Date.now() + 5 * 86400000), note: 'Reach 80% before the Friday test.' });
    }
    for (const code of ['LEARNER', 'AMA-10B-014', 'BRM-10B-007']) {
      const u = await User.findOne({ where: { userCode: code } });
      if (u && (await Notification.count({ where: { userId: u.id } })) === 0) {
        await Notification.bulkCreate([
          { userId: u.id, type: 'announcement', title: 'Welcome to Somo', body: 'Practise a little every day.', link: '/announcements' },
          { userId: u.id, type: 'assignment', title: 'New task: Quadratic expressions', body: 'Reach 80% before the Friday test.', link: '/learner/practice/3' },
        ]);
      }
    }
  },
  async down() {
    const { sequelize } = require('../models');
    const qi = sequelize.getQueryInterface();
    for (const t of ['notifications', 'assignments', 'announcements', 'user_badges', 'attempts', 'school_settings']) await qi.bulkDelete(t, null, {});
  },
};
