const cfg = require('../../config/learning');
const { band, BANDS } = require('./masteryEngine');

/**
 * Rule-based next step (D3 section 5). Pure function.
 * topics:  [{ id, title, position, prerequisiteIds: [] }]  in curriculum order
 * records: [{ topicId, score, attempts, nextReviewAt }]
 * Order of rules: 1) due reviews  2) topic in progress  3) next new topic whose prerequisites are nearly there.
 */
function recommend(topics, records, now = new Date()) {
  const byTopic = new Map(records.map((r) => [r.topicId, r]));
  const bandOf = (id) => { const r = byTopic.get(id); return r ? band(r.score, r.attempts) : BANDS.NOT_STARTED; };
  const ready = (t) => t.prerequisiteIds.every((pid) => (byTopic.get(pid)?.score ?? 0) >= cfg.nearlyThereFrom);

  const due = records
    .filter((r) => r.nextReviewAt && new Date(r.nextReviewAt) <= now)
    .sort((a, b) => new Date(a.nextReviewAt) - new Date(b.nextReviewAt));
  if (due.length) {
    const t = topics.find((x) => x.id === due[0].topicId);
    if (t) return { type: 'review', topicId: t.id, title: t.title, reason: 'Quick review so it stays fresh.' };
  }

  const inProgress = topics
    .filter((t) => [BANDS.LEARNING, BANDS.NEARLY].includes(bandOf(t.id)))
    .sort((a, b) => (byTopic.get(b.id).score - byTopic.get(a.id).score));
  if (inProgress.length) {
    const t = inProgress[0];
    return { type: 'continue', topicId: t.id, title: t.title, reason: `You are at ${Math.round(byTopic.get(t.id).score)}%. Aim for ${cfg.masteryTarget}%.` };
  }

  const fresh = topics.find((t) => bandOf(t.id) === BANDS.NOT_STARTED && ready(t));
  if (fresh) return { type: 'new', topicId: fresh.id, title: fresh.title, reason: 'Next topic in your Grade 10 path.' };

  // Everything started is mastered and nothing new is unlocked: suggest the weakest prerequisite.
  const weakest = [...records].sort((a, b) => a.score - b.score)[0];
  if (weakest) {
    const t = topics.find((x) => x.id === weakest.topicId);
    if (t) return { type: 'review', topicId: t.id, title: t.title, reason: 'Strengthen this before moving on.' };
  }
  return null;
}

module.exports = { recommend };
