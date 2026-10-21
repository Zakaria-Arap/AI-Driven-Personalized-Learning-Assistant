// Pure diagnosis helper: analyzes wrong answers and provides specific feedback WITHOUT revealing the correct answer.
const { toNumber } = require('../assessment/marking');

/**
 * Pure function: diagnoses a learner's attempt.
 * @param {Object} question - The question object with { answer, type, commonMistakes? }
 * @param {string} attemptText - What the learner wrote
 * @param {string} provider - 'mock' or 'anthropic'
 * @returns {Object} { verdict: 'correct'|'close'|'wrong', error: string, nudge: string, tag?: string }
 */
function diagnose(question, attemptText, provider = 'mock') {
  if (!attemptText || !attemptText.trim()) {
    return { verdict: 'wrong', error: 'no attempt', nudge: 'Start by writing down what you know from the question.', tag: 'blank' };
  }

  const attempt = attemptText.trim();
  const correctAnswer = String(question.answer).trim();
  
  // Check if correct
  if (attempt.toLowerCase() === correctAnswer.toLowerCase()) {
    return { verdict: 'correct', error: 'none', nudge: 'That looks right! Check your working and then submit.' };
  }

  // For numeric questions, try detailed numeric analysis
  if (question.type === 'numeric') {
    const userNum = toNumber(attempt);
    const correctNum = toNumber(correctAnswer);
    
    if (!Number.isNaN(userNum) && !Number.isNaN(correctNum)) {
      const diff = Math.abs(userNum - correctNum);
      const ratio = correctNum !== 0 ? userNum / correctNum : 0;
      
      // Very close (within 1%)
      if (diff / Math.max(Math.abs(correctNum), 0.01) < 0.01) {
        return { verdict: 'close', error: 'rounding', nudge: 'You are very close. Check your rounding and units.', tag: 'rounding' };
      }
      
      // Sign error
      if (Math.abs(userNum + correctNum) < 0.001) {
        return { verdict: 'wrong', error: 'sign error', nudge: 'Check the sign. Is this value positive or negative?', tag: 'sign_error' };
      }
      
      // Factor of 10 off
      if (Math.abs(ratio - 10) < 0.1 || Math.abs(ratio - 0.1) < 0.01) {
        return { verdict: 'wrong', error: 'power of ten', nudge: 'Check your decimal point or units conversion.', tag: 'decimal_error' };
      }
      
      // Factor of 2 off (common with doubling/halving mistakes)
      if (Math.abs(ratio - 2) < 0.1 || Math.abs(ratio - 0.5) < 0.05) {
        return { verdict: 'wrong', error: 'factor of 2', nudge: 'Double-check any doubling or halving steps.', tag: 'factor_error' };
      }
      
      // Squared/root error
      if (Math.abs(userNum - correctNum * correctNum) < 0.1 || Math.abs(userNum * userNum - correctNum) < 0.1) {
        return { verdict: 'wrong', error: 'squaring error', nudge: 'Did you square or take the square root in the right place?', tag: 'power_error' };
      }
      
      // Reciprocal error
      if (correctNum !== 0 && Math.abs(userNum - 1/correctNum) < 0.01) {
        return { verdict: 'wrong', error: 'reciprocal', nudge: 'Check if you need to divide rather than multiply, or vice versa.', tag: 'reciprocal_error' };
      }
    }
  }

  // Check for common mistakes if provided
  if (question.commonMistakes && Array.isArray(question.commonMistakes)) {
    for (const mistake of question.commonMistakes) {
      if (mistake.answer && attempt.toLowerCase() === String(mistake.answer).toLowerCase()) {
        return {
          verdict: 'wrong',
          error: mistake.reason || 'common error',
          nudge: mistake.hint || 'Look at that step again carefully.',
          tag: mistake.tag || 'common_mistake'
        };
      }
    }
  }

  // Default: unknown error
  return {
    verdict: 'wrong',
    error: 'needs review',
    nudge: 'Not quite. Walk through each step and check your working.',
    tag: 'unknown'
  };
}

/**
 * Async wrapper that could call an AI provider for more sophisticated diagnosis.
 * For mock mode, uses rule-based logic. For anthropic, could enhance with LLM analysis.
 */
async function diagnoseAsync(question, attemptText, provider = 'mock') {
  // For now, just use the pure function
  // In future, could call LLM for deeper analysis
  return diagnose(question, attemptText, provider);
}

module.exports = {
  diagnose,
  diagnoseAsync,
};
