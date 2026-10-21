// Critical test: the answer must NEVER appear in hints before the final level
const llm = require('../../src/services/ai/llmClient');
const answerGuard = require('../../src/services/ai/answerGuard');
const { Question } = require('../../src/models');

describe('Answer Leak Protection', () => {
  let questions = [];

  beforeAll(async () => {
    // Try to load seeded questions; if DB not available, use sample questions
    try {
      questions = await Question.findAll({ limit: 50 });
      if (!questions.length) {
        console.log('No seeded questions found, using samples');
        questions = getSampleQuestions();
      }
    } catch (e) {
      console.log('DB not available, using sample questions');
      questions = getSampleQuestions();
    }
  });

  test('mock hints never contain the answer before the final level', async () => {
    const maxLevel = 5;
    let leakCount = 0;
    const leaks = [];

    for (const q of questions) {
      const questionData = {
        id: q.id,
        prompt: q.prompt,
        answer: q.answer,
        solution: q.solution,
        type: q.type
      };

      for (let level = 1; level < maxLevel; level++) {
        const hint = await llm.complete({
          level,
          maxLevel,
          question: questionData,
          topicTitle: 'Test Topic',
          masteryBand: 'learning',
          latestAttempt: null,
          lang: 'en'
        });

        // Check if the answer appears in the hint
        const containsAnswer = answerGuard.containsAnswer(hint, q.answer);
        
        if (containsAnswer) {
          leakCount++;
          leaks.push({
            questionId: q.id,
            prompt: q.prompt.slice(0, 60),
            answer: q.answer,
            level,
            hint: hint.slice(0, 100)
          });
        }
      }
    }

    if (leaks.length > 0) {
      console.error('Answer leaks detected:');
      leaks.forEach(leak => {
        console.error(`Q${leak.questionId} (${leak.prompt}...) answer="${leak.answer}" leaked at level ${leak.level}: "${leak.hint}..."`);
      });
    }

    expect(leakCount).toBe(0);
  });

  test('answer guard blocks answer at levels 1-4', () => {
    const testCases = [
      { answer: '42', level: 1, reply: 'The answer is 42' },
      { answer: '100', level: 2, reply: 'You should get 100' },
      { answer: '0.5', level: 3, reply: 'The result is 0.5 or 1/2' },
      { answer: '-10', level: 4, reply: 'Final value: -10' },
    ];

    testCases.forEach(({ answer, level, reply }) => {
      const result = answerGuard.check({ reply, answer, level, fallback: 'blocked' });
      expect(result.blocked).toBe(true);
      expect(result.reply).toBe('blocked');
    });
  });

  test('answer guard allows answer at level 5', () => {
    const result = answerGuard.check({
      reply: 'The final answer is 42',
      answer: '42',
      level: 5,
      fallback: 'blocked'
    });
    expect(result.blocked).toBe(false);
    expect(result.reply).toContain('42');
  });
});

function getSampleQuestions() {
  return [
    {
      id: 1,
      prompt: 'Calculate the area of a rectangle with length 12 cm and width 8 cm.',
      answer: '96',
      type: 'numeric',
      solution: 'Area = length × width\nArea = 12 × 8\nArea = 96 cm²'
    },
    {
      id: 2,
      prompt: 'Solve for x: 2x + 5 = 17',
      answer: '6',
      type: 'numeric',
      solution: '2x + 5 = 17\n2x = 17 - 5\n2x = 12\nx = 6'
    },
    {
      id: 3,
      prompt: 'What is 15% of 200?',
      answer: '30',
      type: 'numeric',
      solution: '15% of 200 = (15/100) × 200\n= 0.15 × 200\n= 30'
    },
    {
      id: 4,
      prompt: 'If a car travels 180 km in 3 hours, what is its average speed in km/h?',
      answer: '60',
      type: 'numeric',
      solution: 'Speed = Distance / Time\nSpeed = 180 / 3\nSpeed = 60 km/h'
    },
    {
      id: 5,
      prompt: 'What is the square root of 144?',
      answer: '12',
      type: 'numeric',
      solution: '√144 = 12\nBecause 12 × 12 = 144'
    }
  ];
}
