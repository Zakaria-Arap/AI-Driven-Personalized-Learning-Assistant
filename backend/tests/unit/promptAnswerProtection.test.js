// CRITICAL SAFETY TEST: The answer must NEVER appear in the system prompt below the final level
const buildPrompt = require('../../src/templates/tutorPrompt');
const adaptiveLadder = require('../../src/services/ai/adaptiveLadder');
const { isRealLeak } = require('./helpers/leak');

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
          
          // Use the same leak detection logic as the hint tests
          if (isRealLeak(prompt, question.answer)) {
            // Find where the leak is for better error message
            const answerPos = promptLower.indexOf(answerLower);
            throw new Error(
              `Answer "${question.answer}" leaked in prompt at level ${level}/${maxLevel}\n` +
              `Question: ${question.prompt}\n` +
              `Prompt excerpt: ...${prompt.slice(Math.max(0, answerPos - 50), answerPos + answerLower.length + 50)}...`
            );
          }

          // The solution TEXT must NOT appear in the prompt (but the word "solution" in instructions is OK)
          if (question.solution) {
            const solutionText = question.solution.toLowerCase();
            if (promptLower.includes(solutionText)) {
              throw new Error(
                `Solution text leaked in prompt at level ${level}/${maxLevel}\n` +
                `Question: ${question.prompt}\n` +
                `Solution: ${question.solution}`
              );
            }
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
      
      // At final level, answer SHOULD appear as a real leak (meaningful occurrence)
      // Use leak detection to verify it's there in a real way
      expect(isRealLeak(prompt, question.answer)).toBe(true);
      
      // At final level, solution TEXT SHOULD appear
      if (question.solution) {
        const solutionText = question.solution.toLowerCase();
        expect(promptLower).toContain(solutionText);
      }
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
    
    // Level 1 prompt should NOT contain answer (use proper leak detection)
    expect(isRealLeak(prompt1, '5')).toBe(false);
    
    const solutionText = question.solution.toLowerCase();
    expect(prompt1.toLowerCase()).not.toContain(solutionText);
  });
});
