// Marks a learner response against a question row. Accepts "3/4", "0.75", " 0.75 ".
function toNumber(s) {
  const t = String(s).trim().replace(/,/g, '');
  const frac = t.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
  if (frac) return Number(frac[2]) === 0 ? NaN : Number(frac[1]) / Number(frac[2]);
  return t === '' ? NaN : Number(t);
}

exports.isCorrect = (question, response) => {
  if (response === undefined || response === null) return false;
  if (question.type === 'choice') return String(response).trim().toLowerCase() === String(question.answer).trim().toLowerCase();
  const got = toNumber(response);
  const want = toNumber(question.answer);
  if (Number.isNaN(got) || Number.isNaN(want)) return false;
  return Math.abs(got - want) <= (question.tolerance || 0) + 1e-9;
};
exports.toNumber = toNumber;
