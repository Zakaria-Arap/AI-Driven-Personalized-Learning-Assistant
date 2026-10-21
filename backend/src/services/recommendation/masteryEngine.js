const cfg = require('../../config/learning');
const { addDays } = require('../../utils/time');

const BANDS = { NOT_STARTED: 'not_started', LEARNING: 'learning', NEARLY: 'nearly_there', MASTERED: 'mastered' };

function band(score, attempts) {
  if (!attempts) return BANDS.NOT_STARTED;
  if (score >= cfg.masteryTarget) return BANDS.MASTERED;
  if (score >= cfg.nearlyThereFrom) return BANDS.NEARLY;
  return BANDS.LEARNING;
}

// Value of one answer: correct answers earn less when the learner leaned on hints.
function outcomeValue(correct, hintsUsed = 0) {
  if (!correct) return 0;
  return Math.max(40, 100 - 15 * hintsUsed);
}

/**
 * Pure function: previous record in, next record out.
 * prev: { score, attempts, correct, reviewStep }
 */
function applyAnswer(prev, { correct, hintsUsed = 0 }, now = new Date()) {
  const p = { score: 0, attempts: 0, correct: 0, reviewStep: 0, ...(prev || {}) };
  const w = cfg.recentWeight;
  const score = Math.round((p.score + w * (outcomeValue(correct, hintsUsed) - p.score)) * 10) / 10;
  const attempts = p.attempts + 1;
  const right = p.correct + (correct ? 1 : 0);
  const nowBand = band(score, attempts);

  let reviewStep = p.reviewStep;
  let nextReviewAt = null;
  if (nowBand === BANDS.MASTERED) {
    reviewStep = correct ? Math.min(p.reviewStep + (band(p.score, p.attempts) === BANDS.MASTERED ? 1 : 0), cfg.reviewIntervalsDays.length - 1) : 0;
    nextReviewAt = addDays(now, cfg.reviewIntervalsDays[reviewStep]);
  } else {
    reviewStep = 0;
  }
  return { score, attempts, correct: right, reviewStep, lastPracticedAt: now, nextReviewAt, band: nowBand };
}

module.exports = { BANDS, band, outcomeValue, applyAnswer };
