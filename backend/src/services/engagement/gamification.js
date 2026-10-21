// Streaks, XP, levels and badges. Pure functions: attempts and mastery rows in, numbers out.
const BADGES = [
  { key: 'first_step', title: 'First step', desc: 'Answer your first question', test: (s) => s.attempts >= 1 },
  { key: 'sharp_10', title: 'Sharp mind', desc: 'Get 10 answers right', test: (s) => s.correct >= 10 },
  { key: 'fifty_club', title: 'Fifty club', desc: 'Answer 50 questions', test: (s) => s.attempts >= 50 },
  { key: 'streak_3', title: 'On a roll', desc: 'Practise 3 days in a row', test: (s) => s.bestStreak >= 3 },
  { key: 'streak_7', title: 'Week warrior', desc: 'Practise 7 days in a row', test: (s) => s.bestStreak >= 7 },
  { key: 'independent', title: 'Independent', desc: 'Get 5 right without any hint', test: (s) => s.noHintCorrect >= 5 },
  { key: 'explorer', title: 'Explorer', desc: 'Start 3 different topics', test: (s) => s.topicsStarted >= 3 },
  { key: 'topic_master', title: 'Topic master', desc: 'Master your first topic', test: (s) => s.mastered >= 1 },
  { key: 'all_rounder', title: 'All-rounder', desc: 'Master 5 topics', test: (s) => s.mastered >= 5 },
];

const dayKey = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
const shift = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

function streaks(days, now) {
  const set = new Set(days);
  // current streak counts today, or yesterday if the learner has not practised yet today
  let cur = 0;
  let cursor = set.has(dayKey(now)) ? now : shift(now, -1);
  while (set.has(dayKey(cursor))) { cur++; cursor = shift(cursor, -1); }
  const sorted = [...set].sort();
  let best = 0, run = 0, prev = null;
  for (const k of sorted) {
    const d = new Date(k + 'T12:00:00');
    run = prev && Math.round((d - prev) / 86400000) === 1 ? run + 1 : 1;
    best = Math.max(best, run); prev = d;
  }
  return { current: cur, best };
}

const levelFor = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;

exports.compute = (attempts, mastery, now = new Date(), target = 80) => {
  const days = attempts.map((a) => dayKey(a.createdAt));
  const st = streaks(days, now);
  const correct = attempts.filter((a) => a.correct).length;
  const mastered = mastery.filter((m) => m.score >= target).length;
  const stats = {
    attempts: attempts.length, correct,
    noHintCorrect: attempts.filter((a) => a.correct && !a.hintsUsed).length,
    topicsStarted: mastery.filter((m) => m.attempts > 0).length,
    mastered, streak: st.current, bestStreak: st.best,
  };
  const xp = correct * 10 + (attempts.length - correct) * 2 + mastered * 50;
  const level = levelFor(xp);
  const floor = 100 * (level - 1) ** 2, ceil = 100 * level ** 2;
  return {
    ...stats, xp, level,
    levelProgress: Math.round(((xp - floor) / (ceil - floor)) * 100),
    nextLevelXp: ceil,
    badges: BADGES.map(({ key, title, desc, test }) => ({ key, title, desc, earned: test(stats) })),
  };
};

// Activity series for charts: one entry per day for the last `n` days.
exports.activity = (attempts, now = new Date(), n = 84) => {
  const map = new Map();
  for (const a of attempts) { const k = dayKey(a.createdAt); const e = map.get(k) || { count: 0, correct: 0 }; e.count++; if (a.correct) e.correct++; map.set(k, e); }
  return Array.from({ length: n }, (_, i) => { const d = shift(now, -(n - 1 - i)); const k = dayKey(d); const e = map.get(k) || { count: 0, correct: 0 }; return { date: k, ...e }; });
};

exports.BADGES = BADGES;
exports.dayKey = dayKey;
exports.levelFor = levelFor;
