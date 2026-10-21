// Helpers for writing question banks compactly. Every question is saved with reviewed = false:
// the subject teacher reviews and extends the bank before it is used for real marks.
const num = (prompt, answer, solution, tolerance = 0, difficulty = 1) => ({ prompt, answer: String(answer), solution, type: 'numeric', tolerance, difficulty });
// Multiple choice. The right answer is slotted at a position that depends on the text, so it is not always first.
const mc = (prompt, answer, wrong, solution, difficulty = 1) => {
  const options = [...wrong];
  options.splice((prompt.length + answer.length) % (wrong.length + 1), 0, answer);
  return { prompt, answer, solution, type: 'choice', options, tolerance: 0, difficulty };
};
const topic = (key, title, outcome, prereq, questions) => ({ key, title, outcome, prereq: prereq || [], questions });
const strand = (name, topics) => ({ name, topics });
module.exports = { num, mc, topic, strand };
