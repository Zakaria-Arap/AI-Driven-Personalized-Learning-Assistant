const { isCorrect } = require('../../src/services/assessment/marking');

test('numeric answers accept fractions and decimals', () => {
  const q = { type: 'numeric', answer: '0.75', tolerance: 0.001 };
  expect(isCorrect(q, '3/4')).toBe(true);
  expect(isCorrect(q, ' 0.75 ')).toBe(true);
  expect(isCorrect(q, '0.7')).toBe(false);
});
test('junk and empty responses are wrong, not errors', () => {
  const q = { type: 'numeric', answer: '5', tolerance: 0 };
  expect(isCorrect(q, 'abc')).toBe(false);
  expect(isCorrect(q, '')).toBe(false);
  expect(isCorrect(q, null)).toBe(false);
});
test('choice answers ignore case and spaces', () => {
  expect(isCorrect({ type: 'choice', answer: 'B' }, ' b ')).toBe(true);
});
