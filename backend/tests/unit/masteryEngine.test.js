const { applyAnswer, band, outcomeValue } = require('../../src/services/recommendation/masteryEngine');

test('band thresholds', () => {
  expect(band(0, 0)).toBe('not_started');
  expect(band(30, 2)).toBe('learning');
  expect(band(50, 2)).toBe('nearly_there');
  expect(band(80, 5)).toBe('mastered');
});
test('hints reduce credit but never below 40', () => {
  expect(outcomeValue(true, 0)).toBe(100);
  expect(outcomeValue(true, 2)).toBe(70);
  expect(outcomeValue(true, 5)).toBe(40);
  expect(outcomeValue(false, 0)).toBe(0);
});
test('four correct answers in a row reach mastery and schedule a 1-day review', () => {
  let rec = null;
  const now = new Date('2026-10-19T08:00:00Z');
  for (let i = 0; i < 4; i++) rec = applyAnswer(rec, { correct: true }, now);
  expect(rec.band).toBe('mastered');
  expect(rec.nextReviewAt.toISOString()).toBe('2026-10-20T08:00:00.000Z');
});
test('a wrong answer lowers the score', () => {
  const a = applyAnswer({ score: 60, attempts: 3, correct: 2, reviewStep: 0 }, { correct: false });
  expect(a.score).toBeLessThan(60);
});
test('review interval grows 1 -> 3 -> 7 -> 21 days while mastered', () => {
  let rec = { score: 90, attempts: 8, correct: 8, reviewStep: 0 };
  const now = new Date('2026-10-19T00:00:00Z');
  const days = [];
  for (let i = 0; i < 5; i++) {
    const r = applyAnswer(rec, { correct: true }, now);
    days.push(Math.round((r.nextReviewAt - now) / 86400000));
    rec = r;
  }
  expect(days).toEqual([3, 7, 21, 21, 21]);
});
