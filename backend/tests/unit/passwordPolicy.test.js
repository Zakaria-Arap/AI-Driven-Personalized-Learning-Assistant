const p = require('../../src/services/auth/passwordPolicy');
test('policy matches the four rules', () => {
  expect(p.isValid('Abcdef1-')).toBe(true);
  expect(p.isValid('abcdef1-')).toBe(false);
  expect(p.isValid('Abcdefg-')).toBe(false);
  expect(p.isValid('Abcdefg1')).toBe(false);
  expect(p.isValid('Ab1-')).toBe(false);
  expect(p.failedRules('abc')).toHaveLength(4);
});
