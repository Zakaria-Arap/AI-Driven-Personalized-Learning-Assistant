// Adaptive hint ladder: chooses the right number of levels for each session based on difficulty and learner strength.
const hintLadder = require('./hintLadder');

/**
 * Pure function: returns max levels (2-5) for this session.
 * @param {Object} opts
 * @param {number} opts.difficulty - Question difficulty 1-5 (1=easy, 5=hard). Default: 3.
 * @param {number} opts.masteryScore - Learner's current score in this topic, 0-100. Default: 0.
 * @param {number} opts.priorMistakesOnTopic - Count of wrong answers on this topic. Default: 0.
 * @returns {number} Max levels between 2 and 5.
 */
function levelsFor({ difficulty = 3, masteryScore = 0, priorMistakesOnTopic = 0 }) {
  // Strong learner + easy question -> shorter ladder (2-3 levels)
  // Struggling learner or hard question -> full ladder (4-5 levels)
  
  const isStrong = masteryScore >= 70;
  const isEasy = difficulty <= 2;
  const isHard = difficulty >= 4;
  const hasStruggles = priorMistakesOnTopic >= 3 || masteryScore < 40;

  // Strong + easy: just 2 levels
  if (isStrong && isEasy) return 2;
  
  // Strong + medium: 3 levels
  if (isStrong && difficulty === 3) return 3;
  
  // Hard question always gets full support
  if (isHard) return 5;
  
  // Struggling learners get more support
  if (hasStruggles) return 5;
  
  // Medium learner + medium question: 4 levels
  if (masteryScore >= 50 && difficulty === 3) return 4;
  
  // Default: full ladder for most cases
  return 4;
}

/**
 * Returns level configuration for a given level number.
 * Extends hintLadder.get with adaptive behavior.
 */
function get(level, maxLevel = hintLadder.MAX_LEVEL) {
  const base = hintLadder.get(level);
  
  // Adjust the instruction for the final level based on maxLevel
  if (level === maxLevel && level < hintLadder.MAX_LEVEL) {
    // Early final level: worked example only
    return {
      ...base,
      name: maxLevel === 4 ? 'Worked example' : base.name,
      instruction: 'Work through a DIFFERENT, similar example with different numbers step by step, then ask the learner to try theirs. Do not give the answer to their specific question.'
    };
  }
  
  return base;
}

module.exports = {
  levelsFor,
  get,
  // Re-export from hintLadder for backwards compatibility
  LEVELS: hintLadder.LEVELS,
  MAX_LEVEL: hintLadder.MAX_LEVEL,
  next: hintLadder.next,
  mayRevealAnswer: hintLadder.mayRevealAnswer,
};
