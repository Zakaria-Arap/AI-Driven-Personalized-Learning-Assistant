// Server-side answer protection. A prompt alone cannot guarantee this, so every reply is checked before it is stored or shown.
const { toNumber } = require('../assessment/marking');

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Does the reply contain the final answer as a standalone token (not as part of a longer number)?
function containsAnswer(reply, answer) {
  const a = String(answer).trim();
  if (!a) return false;
  const re = new RegExp(`(^|[^\\w.])${escapeRe(a)}($|[^\\w])`, 'i');
  if (re.test(reply)) return true;
  const n = toNumber(a);
  if (!Number.isNaN(n)) {
    const nums = reply.match(/-?\d+(?:\.\d+)?(?:\s*\/\s*\d+)?/g) || [];
    return nums.some((x) => Math.abs(toNumber(x) - n) < 1e-9);
  }
  return false;
}

/**
 * Returns { ok, reply, blocked }.
 * Below the session's final level, a reply that contains the answer is replaced by a safe fallback.
 * @param {number} level - Current hint level
 * @param {number} maxLevel - Session's maximum level (from adaptiveLadder)
 */
exports.check = ({ reply, answer, level, maxLevel, fallback }) => {
  const finalLevel = maxLevel || require('./hintLadder').MAX_LEVEL;
  if (level >= finalLevel) return { ok: true, reply, blocked: false };
  if (containsAnswer(reply, answer)) return { ok: false, reply: fallback, blocked: true };
  return { ok: true, reply, blocked: false };
};
exports.containsAnswer = containsAnswer;
