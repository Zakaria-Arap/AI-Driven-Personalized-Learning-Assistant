const guard = require('../../src/services/ai/answerGuard');
const ladder = require('../../src/services/ai/hintLadder');
const guardrails = require('../../src/services/ai/guardrails');

test('answer in a low-level reply is blocked and replaced', () => {
  const r = guard.check({ reply: 'The answer is 128.', answer: '128', level: 2, fallback: 'safe' });
  expect(r).toEqual({ ok: false, reply: 'safe', blocked: true });
});
test('a longer number containing the answer is not a leak', () => {
  expect(guard.containsAnswer('You get 1280 in total', '128')).toBe(false);
});
test('equivalent number forms are caught', () => {
  expect(guard.containsAnswer('so it is 1/2', '0.5')).toBe(true);
});
test('level 5 may show the answer', () => {
  expect(guard.check({ reply: 'x = 4', answer: '4', level: 5, fallback: 'safe' }).blocked).toBe(false);
});
test('ladder climbs one level at a time and stops at 5', () => {
  let l = 0; const seen = [];
  for (let i = 0; i < 7; i++) { l = ladder.next(l); seen.push(l); }
  expect(seen).toEqual([1, 2, 3, 4, 5, 5, 5]);
  expect(ladder.mayRevealAnswer(4)).toBe(false);
  expect(ladder.mayRevealAnswer(5)).toBe(true);
});
test('wellbeing messages are flagged for a teacher', () => {
  expect(guardrails.inspect('I want to die').flag).toBe(true);
  expect(guardrails.inspect('how do I factorise x^2+5x+6').flag).toBe(false);
});
