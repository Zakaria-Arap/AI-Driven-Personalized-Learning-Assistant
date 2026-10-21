const llm = require('./src/services/ai/llmClient');
const courses = require('./src/seeders/data/courses/index');

const subjects = { MATH: 'Core Mathematics', PHY: 'Physics', BIO: 'Biology', HIST: 'History and Citizenship', ENG: 'English' };
const samples = {};

courses.forEach(c => {
  if (subjects[c.code]) {
    const g = c.grades[10] || c.grades[11] || c.grades[12];
    if (g && g[0] && g[0].topics && g[0].topics[0] && g[0].topics[0].questions && g[0].questions[0]) {
      const t = g[0].topics[0];
      const q = t.questions[0];
      samples[c.code] = { subject: subjects[c.code], topic: t.title, q: q.prompt, a: q.answer, sol: q.solution, type: q.type || 'numeric' };
    }
  }
});

const choices = [];
courses.forEach(c => {
  [10,11,12].forEach(g => {
    (c.grades[g] || []).forEach(s => {
      (s.topics || []).forEach(t => {
        (t.questions || []).forEach(q => {
          if (q.type === 'choice' && choices.length < 3 && !choices.some(x => x.code === c.code)) {
            choices.push({ code: c.code, name: c.name, topic: t.title, q: q.prompt, a: q.answer, sol: q.solution });
          }
        });
      });
    });
  });
});

(async () => {
  console.log('A. FIVE REAL QUESTIONS (5-level ladder, levels 1-4):\n');
  for (const code of Object.keys(subjects)) {
    const s = samples[code];
    if (!s) continue;
    console.log(s.subject + ': ' + s.topic);
    console.log('Q: ' + s.q);
    for (let lv = 1; lv <= 4; lv++) {
      const h = await llm.complete({ level: lv, maxLevel: 5, question: { prompt: s.q, answer: s.a, solution: s.sol, type: s.type }, topicTitle: s.topic, masteryBand: 'learning', lang: 'en' });
      console.log('L' + lv + ': ' + h.slice(0, 90) + (h.length > 90 ? '...' : ''));
    }
    console.log('');
  }
  
  console.log('\nB. THREE MULTIPLE CHOICE QUESTIONS:\n');
  for (const ch of choices) {
    console.log(ch.name + ': ' + ch.topic);
    console.log('Q: ' + ch.q);
    for (let lv = 1; lv <= 4; lv++) {
      const h = await llm.complete({ level: lv, maxLevel: 5, question: { prompt: ch.q, answer: ch.a, solution: ch.sol, type: 'choice' }, topicTitle: ch.topic, masteryBand: 'learning', lang: 'en' });
      const marker = lv === 3 && h.toLowerCase().includes('eliminate') ? ' [ELIMINATES ONE WRONG]' : '';
      console.log('L' + lv + ': ' + h.slice(0, 90) + (h.length > 90 ? '...' : '') + marker);
    }
    console.log('');
  }
})();
