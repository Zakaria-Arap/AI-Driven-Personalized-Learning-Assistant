const guard = require('../../src/services/ai/answerGuard');

describe('Answer Guard Adaptive Ladder', () => {
  test('blocks answer below session final for all ladder lengths', () => {
    [2, 3, 4, 5].forEach(maxLevel => {
      for (let level = 1; level < maxLevel; level++) {
        const r = guard.check({ reply: 'The answer is 42', answer: '42', level, maxLevel, fallback: 'safe' });
        expect(r.blocked).toBe(true);
        expect(r.reply).toBe('safe');
      }
    });
  });

  test('allows answer at session final for all ladder lengths', () => {
    [2, 3, 4, 5].forEach(maxLevel => {
      const r = guard.check({ reply: 'The answer is 42', answer: '42', level: maxLevel, maxLevel, fallback: 'safe' });
      expect(r.blocked).toBe(false);
      expect(r.reply).toContain('42');
    });
  });
});
