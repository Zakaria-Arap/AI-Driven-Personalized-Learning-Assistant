// CRITICAL TEST: the answer must NEVER appear in hints before the final level
// Tests against ALL 408+ seeded questions from the real curriculum data
const llm = require('../../src/services/ai/llmClient');
const answerGuard = require('../../src/services/ai/answerGuard');
const adaptiveLadder = require('../../src/services/ai/adaptiveLadder');
const courses = require('../../src/seeders/data/courses/index');
const { isRealLeak, isChoiceLeak } = require('./helpers/leak');

describe('Answer Leak Protection - ALL REAL QUESTIONS', () => {
  let allQuestions = [];

  beforeAll(() => {
    // Load ALL questions from every course, every grade, every topic
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
                strandTitle: strand.title,
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

    console.log(`\n📚 Loaded ${allQuestions.length} questions from seeder data`);
    
    // MUST have at least 400 questions
    if (allQuestions.length < 400) {
      throw new Error(`INSUFFICIENT TEST DATA: Only ${allQuestions.length} questions loaded. Expected at least 400.`);
    }
  });

  test('mock hints never contain the answer before the final level - ALL REAL QUESTIONS', async () => {
    let totalHintsChecked = 0;
    const leaks = [];

    for (const q of allQuestions) {
      // Test EVERY ladder length (2, 3, 4, 5) for EVERY question
      for (let maxLevel = 2; maxLevel <= 5; maxLevel++) {
        // Test EVERY level below the final
        for (let level = 1; level < maxLevel; level++) {
          const hint = await llm.complete({
            level,
            maxLevel,
            question: { id: 1, prompt: q.prompt, answer: q.answer, solution: q.solution, type: q.type },
            topicTitle: q.topicTitle,
            masteryBand: 'learning',
            latestAttempt: null,
            lang: 'en'
          });

          totalHintsChecked++;

          // Check if the answer appears in the hint using REAL LEAK detection
          const leaked = isRealLeak(hint, q.answer);
          
          if (leaked) {
            leaks.push({
              course: q.courseName,
              grade: q.grade,
              topic: q.topicTitle,
              prompt: q.prompt.slice(0, 80),
              answer: q.answer,
              level,
              maxLevel,
              hint: hint.slice(0, 120),
              config: `maxLevel=${maxLevel}`,
              fullHint: hint // Keep full hint for analysis
            });
          }

          // For multiple choice, check that correct option text doesn't appear
          if (q.type === 'choice' && q.answer) {
            const choiceLeak = isChoiceLeak(hint, q.answer);
            
            if (choiceLeak) {
              leaks.push({
                course: q.courseName,
                grade: q.grade,
                topic: q.topicTitle,
                prompt: q.prompt.slice(0, 80),
                answer: q.answer,
                level,
                maxLevel,
                hint: hint.slice(0, 120),
                config: `CHOICE LEAK: correct option text appeared`,
                type: 'choice',
                fullHint: hint
              });
            }
          }
        }
      }
    }

    console.log(`\n✅ Checked ${totalHintsChecked} hints across ${allQuestions.length} questions`);
    console.log(`   Formula: ${allQuestions.length} questions × (1+2+3+4 non-final levels) = ${allQuestions.length} × 10 = ${allQuestions.length * 10} total hints`);
    console.log(`   Actual count: ${totalHintsChecked} hints`);
    console.log(`   Ladder lengths: 2, 3, 4, 5`);
    console.log(`   Levels per ladder: 1 to (maxLevel-1)\n`);
    console.log(`   Previous count was 3,264 = 408 × 8 because it tested only 3 learner profiles`);
    console.log(`   (strong/struggling/medium) instead of all ladder lengths\n`);

    if (leaks.length > 0) {
      console.error(`\n❌ ${leaks.length} ANSWER LEAKS DETECTED:\n`);
      leaks.slice(0, 10).forEach((leak, i) => {
        console.error(`${i + 1}. [${leak.course} G${leak.grade}] ${leak.topic}`);
        console.error(`   Q: ${leak.prompt}...`);
        console.error(`   Answer: "${leak.answer}"`);
        console.error(`   Leaked at level ${leak.level}/${leak.maxLevel} (${leak.config})`);
        console.error(`   Hint: "${leak.hint}..."`);
        console.error('');
      });
      if (leaks.length > 10) {
        console.error(`   ... and ${leaks.length - 10} more leaks\n`);
      }
    }

    expect(leaks.length).toBe(0);
  });

  test('answer guard blocks answer at all levels below final', () => {
    const testCases = [
      { answer: '42', level: 1, maxLevel: 5, reply: 'The answer is 42' },
      { answer: '100', level: 2, maxLevel: 5, reply: 'You should get 100' },
      { answer: '0.5', level: 3, maxLevel: 4, reply: 'The result is 0.5 or 1/2' },
      { answer: '-10', level: 2, maxLevel: 3, reply: 'Final value: -10' },
    ];

    testCases.forEach(({ answer, level, maxLevel, reply }) => {
      const result = answerGuard.check({ reply, answer, level, maxLevel, fallback: 'blocked' });
      expect(result.blocked).toBe(true);
      expect(result.reply).toBe('blocked');
    });
  });

  test('answer guard allows answer at final level', () => {
    const testCases = [
      { answer: '42', level: 5, maxLevel: 5, reply: 'The final answer is 42' },
      { answer: '100', level: 3, maxLevel: 3, reply: 'The answer is 100' },
      { answer: '7', level: 2, maxLevel: 2, reply: 'The result is 7' },
    ];

    testCases.forEach(({ answer, level, maxLevel, reply }) => {
      const result = answerGuard.check({ reply, answer, level, maxLevel, fallback: 'blocked' });
      expect(result.ok).toBe(true);
      expect(result.blocked).toBe(false);
      expect(result.reply).toBe(reply);
    });
  });

  test('sufficient question coverage across subjects', () => {
    const byCourse = {};
    allQuestions.forEach(q => {
      byCourse[q.courseCode] = (byCourse[q.courseCode] || 0) + 1;
    });

    console.log('\n📊 Questions per course:');
    Object.entries(byCourse).sort((a, b) => b[1] - a[1]).forEach(([code, count]) => {
      console.log(`   ${code}: ${count}`);
    });

    // Ensure we have questions from core subjects
    expect(byCourse['MATH']).toBeGreaterThan(0);
    expect(byCourse['BIO']).toBeGreaterThan(0);
    expect(byCourse['PHY']).toBeGreaterThan(0);
    expect(byCourse['ENG']).toBeGreaterThan(0);
  });
});
