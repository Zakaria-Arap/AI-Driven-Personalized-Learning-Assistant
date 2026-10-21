const masteryRepo = require('../../repositories/masteryRepository');
const badgeRepo = require('../../repositories/badgeRepository');
const subjects = require('../subjects/subjectService');
const gamification = require('../engagement/gamification');
const notifications = require('../engagement/notificationService');
const userView = require('../../helpers/userView');
const { addDays } = require('../../utils/time');

const loadAttempts = async (learnerId, days, now) => (await masteryRepo.attemptsSince(learnerId, addDays(now, -days))).map((a) => a.get({ plain: true }));

exports.get = async (user, now = new Date()) => {
  const attempts = await loadAttempts(user.id, 400, now);
  const mastery = (await masteryRepo.forLearner(user.id)).map((m) => m.get({ plain: true }));
  const g = gamification.compute(attempts, mastery, now);
  const index = await subjects.topicIndex();
  const reviews = mastery.filter((m) => m.nextReviewAt && index.has(m.topicId))
    .map((m) => ({ topicId: m.topicId, title: index.get(m.topicId).title, subject: index.get(m.topicId).subjectName, due: m.nextReviewAt, step: m.reviewStep }))
    .sort((a, b) => new Date(a.due) - new Date(b.due));
  const today = gamification.dayKey(now);
  const todayCount = attempts.filter((a) => gamification.dayKey(a.createdAt) === today).length;
  const awarded = new Set((await badgeRepo.forUser(user.id)).map((b) => b.badgeKey));
  return {
    streak: g.streak, bestStreak: g.bestStreak, xp: g.xp, level: g.level, levelProgress: g.levelProgress, nextLevelXp: g.nextLevelXp,
    dailyGoal: userView.mergePrefs(user.prefs).dailyGoal, todayCount,
    badges: g.badges.map((b) => ({ ...b, earned: b.earned || awarded.has(b.key) })),
    activity: gamification.activity(attempts, now, 84),
    accuracy: attempts.length ? Math.round((g.correct / attempts.length) * 100) : null,
    totals: { attempts: g.attempts, correct: g.correct, mastered: g.mastered, topicsStarted: g.topicsStarted },
    reviews,
  };
};

// Called after each answer: stores newly earned badges and notifies the learner.
exports.awardNew = async (user, now = new Date()) => {
  const attempts = await loadAttempts(user.id, 400, now);
  const mastery = (await masteryRepo.forLearner(user.id)).map((m) => m.get({ plain: true }));
  const g = gamification.compute(attempts, mastery, now);
  const have = new Set((await badgeRepo.forUser(user.id)).map((b) => b.badgeKey));
  const fresh = [];
  for (const b of g.badges) {
    if (b.earned && !have.has(b.key)) {
      const [, created] = await badgeRepo.award(user.id, b.key);
      if (created) fresh.push(b);
    }
  }
  for (const b of fresh) await notifications.notifyOne(user.id, { type: 'badge', title: `Badge earned: ${b.title}`, body: b.desc, link: '/learner/achievements' });
  return fresh.map(({ key, title, desc }) => ({ key, title, desc }));
};
