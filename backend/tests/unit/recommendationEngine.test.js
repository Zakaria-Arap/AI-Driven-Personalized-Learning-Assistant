const { recommend } = require('../../src/services/recommendation/recommendationEngine');

const topics = [
  { id: 1, title: 'Indices', position: 0, prerequisiteIds: [] },
  { id: 2, title: 'Logarithms', position: 1, prerequisiteIds: [1] },
  { id: 3, title: 'Pythagoras', position: 2, prerequisiteIds: [] },
];
const now = new Date('2026-10-19T10:00:00Z');

test('new learner is sent to the first topic', () => {
  expect(recommend(topics, [], now)).toMatchObject({ type: 'new', topicId: 1 });
});
test('due review comes first', () => {
  const recs = [{ topicId: 3, score: 90, attempts: 6, nextReviewAt: '2026-10-18T10:00:00Z' }, { topicId: 1, score: 40, attempts: 3 }];
  expect(recommend(topics, recs, now)).toMatchObject({ type: 'review', topicId: 3 });
});
test('topic in progress is continued before opening a new one', () => {
  const recs = [{ topicId: 1, score: 60, attempts: 4, nextReviewAt: null }];
  expect(recommend(topics, recs, now)).toMatchObject({ type: 'continue', topicId: 1 });
});
test('a topic is locked until prerequisites are nearly there', () => {
  const recs = [{ topicId: 1, score: 85, attempts: 6, nextReviewAt: '2026-10-25T00:00:00Z' }, { topicId: 3, score: 85, attempts: 6, nextReviewAt: '2026-10-25T00:00:00Z' }];
  expect(recommend(topics, recs, now)).toMatchObject({ type: 'new', topicId: 2 });
});
