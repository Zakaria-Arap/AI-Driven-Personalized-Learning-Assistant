// Five-level hint ladder. The level lives on the server (tutor_sessions.hint_level); the browser can only ask for "next hint".
const LEVELS = [
  { level: 1, name: 'Nudge', instruction: 'Ask one guiding question that helps the learner notice what the problem is asking. Do not mention any method or number from the solution.' },
  { level: 2, name: 'Concept', instruction: 'Remind the learner of the concept or formula that applies, in general terms, without applying it to this problem.' },
  { level: 3, name: 'First step', instruction: 'Show only the first step of the method on this problem. Stop there and ask the learner to continue.' },
  { level: 4, name: 'Worked example', instruction: 'Work through a DIFFERENT, similar example with different numbers, then ask the learner to try theirs.' },
  { level: 5, name: 'Full solution', instruction: 'Explain the full step-by-step solution, then ask the learner to explain it back in their own words.' },
];
const MAX = LEVELS.length;

exports.LEVELS = LEVELS;
exports.MAX_LEVEL = MAX;
exports.next = (current) => Math.min((current || 0) + 1, MAX);
exports.get = (level) => LEVELS[Math.min(Math.max(level, 1), MAX) - 1];
exports.mayRevealAnswer = (level) => level >= MAX;
