const ladder = require('../../src/services/ai/adaptiveLadder');

describe('Adaptive Ladder', () => {
  test('strong learner + easy question gets 2-3 levels', () => {
    expect(ladder.levelsFor({ difficulty: 1, masteryScore: 80, priorMistakesOnTopic: 0 })).toBe(2);
    expect(ladder.levelsFor({ difficulty: 2, masteryScore: 75, priorMistakesOnTopic: 0 })).toBe(2);
    expect(ladder.levelsFor({ difficulty: 3, masteryScore: 80, priorMistakesOnTopic: 0 })).toBe(3);
  });

  test('hard question always gets full 5 levels', () => {
    expect(ladder.levelsFor({ difficulty: 4, masteryScore: 90, priorMistakesOnTopic: 0 })).toBe(5);
    expect(ladder.levelsFor({ difficulty: 5, masteryScore: 100, priorMistakesOnTopic: 0 })).toBe(5);
  });

  test('struggling learner gets full support (5 levels)', () => {
    expect(ladder.levelsFor({ difficulty: 2, masteryScore: 30, priorMistakesOnTopic: 0 })).toBe(5);
    expect(ladder.levelsFor({ difficulty: 3, masteryScore: 50, priorMistakesOnTopic: 5 })).toBe(5);
  });

  test('medium learner + medium question gets 4 levels', () => {
    expect(ladder.levelsFor({ difficulty: 3, masteryScore: 60, priorMistakesOnTopic: 1 })).toBe(4);
  });

  test('defaults work (medium difficulty, no mastery, no mistakes)', () => {
    const levels = ladder.levelsFor({});
    expect(levels).toBeGreaterThanOrEqual(2);
    expect(levels).toBeLessThanOrEqual(5);
  });

  test('backwards compatible with hintLadder exports', () => {
    expect(ladder.MAX_LEVEL).toBe(5);
    expect(ladder.LEVELS).toHaveLength(5);
    expect(ladder.next(0)).toBe(1);
    expect(ladder.next(4)).toBe(5);
    expect(ladder.next(5)).toBe(5);
    expect(ladder.mayRevealAnswer(4)).toBe(false);
    expect(ladder.mayRevealAnswer(5)).toBe(true);
  });

  test('get() returns level config', () => {
    const step1 = ladder.get(1);
    expect(step1.level).toBe(1);
    expect(step1.name).toBe('Nudge');
    
    const step5 = ladder.get(5);
    expect(step5.level).toBe(5);
    expect(step5.name).toBe('Full solution');
  });

  test('get() adjusts final level instruction for shortened ladders', () => {
    const step4max4 = ladder.get(4, 4);
    expect(step4max4.instruction).toContain('DIFFERENT, similar example');
    expect(step4max4.instruction).toContain('Do not give the answer');
  });
});
