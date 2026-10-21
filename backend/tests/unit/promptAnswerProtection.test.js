// CRITICAL SAFETY TEST: The answer and solution must NEVER appear in the system prompt below the final level
// Tests every ladder length (2, 3, 4, 5) and every level against ALL 408 questions
const buildPrompt = require('../../src/templates/tutorPrompt');
const adaptiveLadder = require('../../src/services/ai/adaptiveLadder');
const { isRealLeak } = require('./helpers/leak');
const courses = require('../../src/seeders/data/courses/index');

describe('Prompt Answer Protection', () => {
  let allQuestions = [];

  beforeAll(() => {
    // Load ALL 408 questions from seeder data
    courses.forEach(course => {
      [10, 11, 12].forEach(grade => {
        const strands = course.grades[grade] || [];
        strands.forEach(strand => {
          (strand.topics || []).forEach(topic => {
            (topic.questions || []).forEach(q => {
              allQuestions.push({
                courseCode: course.code,
                courseName: course.name,
                grade,
                topicSlug: topic.slug,
                topicTitle: topic.title,
                prompt: q.prompt,
                answer: String(q.answer),
                solution: q.solution || '',
                type: q.type || 'numeric',
                difficulty: q.difficulty || 3
              });
            });
          });
        });
      });
    });

    console.log(`\n📚 Loaded ${allQuestions.length} questions for prompt protection test`);
  });

  test('answer and solution NEVER appear in prompt below final level - ALL 408 QUESTIONS', () => {
    let totalPromptsChecked = 0;
    const leaks = [];

    for (const q of allQuestions) {
      // Test EVERY ladder length (2, 3, 4, 5)
      for (let maxLevel = 2; maxLevel <= 5; maxLevel++) {
        // Test EVERY level below the final
        for (let level = 1; level < maxLevel; level++) {
          const prompt = buildPrompt({
            topicTitle: q.topicTitle,
            subjectName: q.courseName,
            question: { prompt: q.prompt, answer: q.answer, solution: q.solution, type: q.type },
            level,
            maxLevel,
            masteryScore: 50,
            masteryBand: 'learning',
            lang: 'en'
          });

          totalPromptsChecked++;

          const promptLower = prompt.toLowerCase();
          const answerLower = q.answer.toLowerCase();

          // Remove the question text AND topic title from the prompt for leak detection
          // Both may contain the answer as context (e.g., topic "Constitution 2010", answer "2010")
          const questionText = q.prompt.toLowerCase();
          const topicText = q.topicTitle.toLowerCase();
          let promptWithoutQuestion = promptLower.replace(questionText, '').replace(topicText, '');

          // Check if answer leaks using proper detection (excluding the question text)
          // For very short common words (< 6 chars), only flag if they appear in answer-revealing context
          const isShortCommonWord = q.answer.length < 6 && /^[a-z]+$/i.test(q.answer);
          let leaked = false;
          
          if (isShortCommonWord) {
            // For short words, only check if they appear in answer-revealing phrases
            const answerRevealPatterns = [
              `the correct answer is: ${q.answer.toLowerCase()}`,
              `the answer is ${q.answer.toLowerCase()}`,
              `final answer: ${q.answer.toLowerCase()}`
            ];
            leaked = answerRevealPatterns.some(pattern => promptWithoutQuestion.includes(pattern));
          } else {
            // For longer answers or numbers, use normal leak detection
            leaked = isRealLeak(promptWithoutQuestion, q.answer);
          }
          
          if (leaked) {
            leaks.push({
              course: q.courseName,
              question: q.prompt.slice(0, 60),
              answer: q.answer,
              level,
              maxLevel,
              type: 'answer_leak',
              excerpt: prompt.slice(Math.max(0, promptLower.indexOf(answerLower) - 50), promptLower.indexOf(answerLower) + answerLower.length + 50)
            });
          }

          // Check if solution TEXT leaks (not just the word "solution")
          if (q.solution && q.solution.length > 10) {
            const solutionText = q.solution.toLowerCase();
            if (promptLower.includes(solutionText)) {
              leaks.push({
                course: q.courseName,
                question: q.prompt.slice(0, 60),
                answer: q.answer,
                level,
                maxLevel,
                type: 'solution_leak',
                excerpt: `Solution text appeared in prompt`
              });
            }
          }
        }
      }
    }

    console.log(`\n✅ Checked ${totalPromptsChecked} prompts across ${allQuestions.length} questions`);
    console.log(`   Formula: ${allQuestions.length} questions × (1+2+3+4 non-final levels) = ${allQuestions.length} × 10 = ${allQuestions.length * 10} prompts`);
    console.log(`   Ladder lengths: 2, 3, 4, 5`);
    console.log(`   Levels per ladder: 1 to (maxLevel-1)\n`);

    if (leaks.length > 0) {
      console.error(`\n❌ ${leaks.length} PROMPT LEAKS DETECTED:\n`);
      leaks.slice(0, 10).forEach((leak, i) => {
        console.error(`${i + 1}. [${leak.course}] ${leak.question}...`);
        console.error(`   Answer: "${leak.answer}" at level ${leak.level}/${leak.maxLevel}`);
        console.error(`   Type: ${leak.type}`);
        console.error(`   ${leak.excerpt}`);
        console.error('');
      });
      if (leaks.length > 10) {
        console.error(`   ... and ${leaks.length - 10} more leaks\n`);
      }
    }

    expect(leaks.length).toBe(0);
  });

  test('answer and solution DO appear at the final level', () => {
    const sampleQuestions = allQuestions.slice(0, 10);

    for (const q of sampleQuestions) {
      for (let maxLevel = 2; maxLevel <= 5; maxLevel++) {
        const prompt = buildPrompt({
          topicTitle: q.topicTitle,
          subjectName: q.courseName,
          question: { prompt: q.prompt, answer: q.answer, solution: q.solution, type: q.type },
          level: maxLevel, // AT the final level
          maxLevel,
          masteryScore: 50,
          masteryBand: 'learning',
          lang: 'en'
        });

        const promptLower = prompt.toLowerCase();
        const answerLower = q.answer.toLowerCase();

        // At final level, answer text SHOULD appear (check for "The correct answer is: X")
        expect(promptLower).toContain('the correct answer is:');
        expect(promptLower).toContain(answerLower);

        // At final level, solution TEXT SHOULD appear (if solution exists)
        if (q.solution && q.solution.length > 10) {
          const solutionText = q.solution.toLowerCase();
          expect(promptLower).toContain('teacher-reviewed solution');
          expect(promptLower).toContain(solutionText);
        }
      }
    }
  });
});
