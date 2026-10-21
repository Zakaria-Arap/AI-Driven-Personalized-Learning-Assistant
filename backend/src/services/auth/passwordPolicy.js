// The 4 rules shown on the Reset and Activate screens.
const rules = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'number', label: 'One number', test: (p) => /[0-9]/.test(p) },
  { id: 'symbol', label: 'One symbol (for example - # !)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];
exports.rules = rules;
exports.check = (password = '') => rules.map((r) => ({ id: r.id, label: r.label, ok: r.test(password) }));
exports.isValid = (password = '') => rules.every((r) => r.test(password));
exports.failedRules = (password = '') => exports.check(password).filter((r) => !r.ok).map((r) => r.label);
