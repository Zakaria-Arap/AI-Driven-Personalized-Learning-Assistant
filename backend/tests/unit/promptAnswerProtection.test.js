// CRITICAL SAFETY TEST: The answer must NEVER appear in the system prompt below the final level
const buildPrompt = require('../../src/templates/tutorPrompt');
const adaptiveLadder = require('../../src/services/ai/adaptiveLadder');

describe('Prompt Answer Protection', () => {
  const sampleQuestions = [
    { prompt: 'What is 2 + 2?', answer: '4', solution: '2 + 2 = 4', type: 'numeric' },
    { prompt: 'Solve x + 5 = 12', answer: '7', solution: 'x = 12 - 5\nx = 7', type: 'numeric' },
    { prompt: 'What is the capital of Kenya?', answer: 'Nairobi', solution: 'The capital is Nairobi.', type: 'choice' },
    { prompt: 'Calculate 15% of 200', answer: '30', solution: '15/100 × 200 = 30', type: 'numeric' },
  ];

  test('answer never appears in prompt below the final level', () => {
    for (const question of sampleQuestions) {
      for (let maxLevel = 2; maxLevel <= 5; maxLevel++) {
        for (let level = 1; level < maxLevel; level++) {
          const prompt = buildPrompt({
            topicTitle: 'Test Topic',
            topicOutcome: 'Test outcome',
            subjectName: 'Mathematics',
            question,
            level,
            maxLevel,
            masteryScore: 50,
            masteryBand: 'learning',
            lang: 'en'
          });

          const promptLower = prompt.toLowerCase();
          const answerLower = String(question.answer).toLowerCase();
          
          // For single-digit answers, be more careful - check for word boundaries
          if (answerLower.length === 1 && /^\d$/.test(answerLower)) {
            // Check if answer appears as a standalone number, not as part of "level 4" or similar
            const regex = new RegExp(`\\b${answerLower}\\b(?!\\s*(level|of|\\d))`, 'i');
            if (regex.test(prompt)) {
              throw new Error(
                `Answer "${question.answer}" leaked in prompt at level ${level}/${maxLevel}\n` +
                `Question: ${question.prompt}\n` +
                `Prompt excerpt: ...${prompt.slice(Math.max(0, prompt.toLowerCase().indexOf(answerLower) - 50), prompt.toLowerCase().indexOf(answerLower) + answerLower.length + 50)}...`
              );
            }
          } else {
            // For longer answers, simple contains check
            if (promptLower.includes(answerLower)) {
              throw new Error(
                `Answer "${question.answer}" leaked in prompt at level ${level}/${maxLevel}\n` +
                `Question: ${question.prompt}\n` +
                `Prompt excerpt: ...${prompt.slice(Math.max(0, promptLower.indexOf(answerLower) - 50), promptLower.indexOf(answerLower) + answerLower.length + 50)}...`
              );
            }
          }

          // The solution must NOT appear in the prompt
          if (question.solution && promptLower.includes('solution')) {
            throw new Error(
              `Solution leaked in prompt at level ${level}/${maxLevel}\n` +
              `Question: ${question.prompt}`
            );
          }
        }
      }
    }
  });

  test('answer and solution DO appear in prompt at the final level', () => {
    const question = sampleQuestions[0];
    
    for (let maxLevel = 2; maxLevel <= 5; maxLevel++) {
      const prompt = buildPrompt({
        topicTitle: 'Test Topic',
        subjectName: 'Mathematics',
        question,
        level: maxLevel,
        maxLevel,
        masteryScore: 50,
        masteryBand: 'learning',
        lang: 'en'
      });

      const promptLower = prompt.toLowerCase();
      const answerLower = question.answer.toLowerCase();
      
      // At final level, answer SHOULD appear (but be smart about single digits)
      if (answerLower.length === 1 && /^\d$/.test(answerLower)) {
        const regex = new RegExp(`\\b${answerLower}\\b`, 'i');
        expect(regex.test(prompt)).toBe(true);
      } else {
        expect(promptLower).toContain(answerLower);
      }
      
      // At final level, solution SHOULD appear
      expect(promptLower).toContain('solution');
    }
  });

  test('adaptive ladder scenarios preserve answer protection', () => {
    const question = { prompt: 'Solve 3x = 15', answer: '5', solution: '3x = 15\nx = 5', type: 'numeric' };
    
    // Strong learner, easy question -> 2 levels
    const maxLevel2 = adaptiveLadder.levelsFor({ difficulty: 1, masteryScore: 80, priorMistakesOnTopic: 0 });
    expect(maxLevel2).toBe(2);
    
    // Level 1 prompt should NOT contain answer
    const prompt1 = buildPrompt({
      topicTitle: 'Equations',
      subjectName: 'Mathematics',
      question,
      level: 1,
      maxLevel: maxLevel2,
      masteryScore: 80,
      masteryBand: 'mastered',
      lang: 'en'
    });
    expect(prompt1.toLowerCase()).not.toContain('5');
    expect(prompt1.toLowerCase()).not.toContain(question.solution.toLowerCase());
  });
});
