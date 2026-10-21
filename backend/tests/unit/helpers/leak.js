/**
 * Leak detection helper - distinguishes REAL leaks from FALSE POSITIVES
 * 
 * REAL LEAK: The answer appears as a standalone value in the hint text
 * FALSE POSITIVE: The answer appears in metadata labels or as part of question context
 */

const { toNumber } = require('../../../src/services/assessment/marking');

/**
 * Check if a hint contains the answer as a REAL LEAK
 * @param {string} hint - The hint text to check
 * @param {string} answer - The correct answer
 * @param {Object} options - Detection options
 * @param {string[]} options.ignorePatterns - Regex patterns to exclude from detection (e.g., "level 5")
 * @returns {boolean} - True if answer is leaked
 */
function isRealLeak(hint, answer, options = {}) {
  const { ignorePatterns = [] } = options;
  const a = String(answer).trim();
  if (!a) return false;

  const hintLower = hint.toLowerCase();
  const answerLower = a.toLowerCase();

  // Step 1: Remove ignored patterns from consideration
  let cleanHint = hint;
  const defaultIgnorePatterns = [
    /level\s+\d+/gi,           // "level 5", "level 3"
    /\d+\s+of\s+\d+/gi,         // "1 of 4", "2 of 5"
    /grade\s+\d+/gi,           // "grade 10"
    /step\s+\d+/gi,            // "step 1", "step 2"
    /\d+\s+levels?/gi,         // "5 levels"
  ];
  
  [...defaultIgnorePatterns, ...ignorePatterns].forEach(pattern => {
    cleanHint = cleanHint.replace(pattern, '');
  });

  // Step 2: Check for NUMERIC answers with token boundaries
  const numericAnswer = toNumber(a);
  if (!Number.isNaN(numericAnswer)) {
    // Extract all numbers from the cleaned hint
    const numbers = cleanHint.match(/-?\d+(?:\.\d+)?(?:\s*\/\s*\d+)?/g) || [];
    
    for (const numStr of numbers) {
      const numValue = toNumber(numStr);
      if (Math.abs(numValue - numericAnswer) < 1e-9) {
        // Found a matching number - now check if it's in a meaningful context
        // by verifying it's surrounded by word boundaries
        const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const numPattern = new RegExp(`\\b${escapeRe(numStr)}\\b`, 'i');
        
        if (numPattern.test(cleanHint)) {
          return true; // REAL LEAK: numeric answer found as standalone token
        }
      }
    }
    return false;
  }

  // Step 3: Check for TEXT answers with word boundaries
  // Must be at least 2 characters to avoid single-letter false positives
  if (a.length >= 2) {
    // Use word boundary matching for multi-character text answers
    const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const wordPattern = new RegExp(`\\b${escapeRe(answerLower)}\\b`, 'i');
    
    if (wordPattern.test(cleanHint.toLowerCase())) {
      return true; // REAL LEAK: text answer found as complete word
    }
  }

  // Step 4: Check for single-character answers (more strict)
  if (a.length === 1) {
    // Only match if surrounded by non-alphanumeric characters
    const singleCharPattern = new RegExp(`[^\\w]${escapeRe(answerLower)}[^\\w]`, 'i');
    if (singleCharPattern.test(' ' + cleanHint.toLowerCase() + ' ')) {
      return true; // REAL LEAK: single-char answer in clear context
    }
  }

  return false; // NO LEAK detected
}

/**
 * Check if a multiple-choice hint leaks the correct option
 * @param {string} hint - The hint text
 * @param {string} answer - Full answer like "A. Correct text" or "A) Correct text"
 * @returns {boolean} - True if correct option text is revealed
 */
function isChoiceLeak(hint, answer) {
  // Extract option letter and text from answers like "A. Some text" or "A) Some text"
  const optionMatch = answer.match(/^([A-E])[\.\)]\s*(.+)$/);
  if (!optionMatch) return false;

  const [, letter, optionText] = optionMatch;
  const hintLower = hint.toLowerCase();
  const textLower = optionText.toLowerCase().trim();

  // Only check if option text is substantial (> 3 chars)
  if (textLower.length <= 3) return false;

  // Check if the option text appears in the hint
  if (hintLower.includes(textLower)) {
    return true; // REAL LEAK: correct option text revealed
  }

  return false; // NO LEAK
}

module.exports = {
  isRealLeak,
  isChoiceLeak
};
