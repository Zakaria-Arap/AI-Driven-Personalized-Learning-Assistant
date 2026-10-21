// Learning engine constants (D3 section 5).
module.exports = {
  masteryTarget: 80,              // percent, a topic counts as Mastered at or above this
  nearlyThereFrom: 50,
  reviewIntervalsDays: [1, 3, 7, 21],
  practiceBatchSize: 5,
  recentWeight: 0.35,             // weight of the newest answer in the running score
};
