const ai = require('../../config/ai');
const adaptiveLadder = require('./adaptiveLadder');

// Offline provider so the whole app can be demoed and tested with no key and no cost.
// This version builds question-specific hints WITHOUT revealing the answer before the final level.
async function mockComplete({ level, maxLevel, question, topicTitle, masteryBand, latestAttempt, lang }) {
  const prompt = question.prompt || '';
  const sol = (question.solution || '').split('\n').filter(Boolean);
  const isKiswahili = lang === 'sw';
  const answer = String(question.answer || '').trim();
  
  // Extract numbers from the question (exclude the answer to prevent leaks)
  const allNumbers = prompt.match(/\d+(?:\.\d+)?/g) || [];
  const safeNumbers = allNumbers.filter(n => n !== answer && !answer.includes(n));
  
  // Extract key term
  const keyTermMatch = prompt.match(/(?:find|calculate|determine|solve for|what is)\s+(?:the\s+)?(\w+(?:\s+\w+)?)/i);
  const keyTerm = keyTermMatch ? keyTermMatch[1] : 'the value';
  
  // Get concept from topic title
  const conceptWords = (topicTitle || '').split(/\s+/).filter(w => w.length > 4);
  const concept = conceptWords[0] || 'this';
  
  // Build safe hints
  switch (level) {
    case 1:
      if (isKiswahili) return `Swali linauliza nini? Andika unachojua na unachotaka kupata.`;
      return `What is the question asking you to find? Write down what you know from the problem and what you need to find.`;
      
    case 2:
      if (isKiswahili) return `Fikiria sheria au fomula inayohusiana na ${concept}. Inasema nini kwa ujumla?`;
      return `Think about the ${concept} concept. Which rule or formula applies to this type of problem? Write the general formula first.`;
      
    case 3:
      // Only use solution line if it does NOT contain the answer (check both text and numeric equivalents)
      if (sol.length > 0) {
        const firstLine = sol[0];
        const answerLower = answer.toLowerCase();
        const lineLower = firstLine.toLowerCase();
        
        // Text match
        let containsAnswer = lineLower.includes(answerLower);
        
        // Check numeric equivalents (e.g., 0.5 vs 1/2)
        if (!containsAnswer && question.type === 'numeric') {
          const { toNumber } = require('../assessment/marking');
          const answerNum = toNumber(answer);
          if (!Number.isNaN(answerNum)) {
            // Extract all fractions and decimals from the line
            const possibleNums = firstLine.match(/\d+(?:\.\d+)?(?:\s*\/\s*\d+)?/g) || [];
            containsAnswer = possibleNums.some(n => Math.abs(toNumber(n) - answerNum) < 0.001);
          }
        }
        
        if (!containsAnswer) {
          if (isKiswahili) return `Hatua ya kwanza: ${firstLine.slice(0, 70)}... Jaribu kuendelea.`;
          return `The first step is: ${firstLine.slice(0, 90)}${firstLine.length > 90 ? '...' : ''}. What comes next?`;
        }
      }
      if (isKiswahili) return 'Andika fomula unayohitaji, kisha weka namba kutoka kwa swali kwa hatua ya kwanza tu.';
      return `Write down the formula, then substitute the values from the question for the first step. Show me that calculation.`;
      
    case 4: {
      // Worked example with DIFFERENT numbers - NEVER use the answer
      if (safeNumbers.length >= 2) {
        const ex1 = Math.round(parseFloat(safeNumbers[0]) * 0.6);
        const ex2 = Math.round(parseFloat(safeNumbers[1]) * 0.6);
        
        // Double-check: don't use these numbers if they match the answer
        if (String(ex1) !== answer && String(ex2) !== answer && 
            !answer.includes(String(ex1)) && !answer.includes(String(ex2))) {
          if (isKiswahili) return `Fikiria mfano rahisi: ikiwa thamani zilikuwa ${ex1} na ${ex2}, ungetumia njia ile ile. Jaribu mfano huo, kisha tumia hatua sawa kwa tatizo lako.`;
          return `Try a simpler version first: if the values were ${ex1} and ${ex2}, you would follow the same method. Work that example through, then apply those same steps to your actual problem.`;
        }
      }
      if (isKiswahili) return 'Fikiria mfano rahisi zaidi wa aina hii ya tatizo. Tatua hilo kwanza, kisha tumia njia ile ile.';
      return `Think of a simpler example of this type of problem. Solve that one first, then apply the same approach to yours.`;
    }
      
    default:
      // Final level - NOW we can reveal the full solution
      if (level >= maxLevel && sol.length > 0) {
        if (isKiswahili) return `Suluhisho kamili:\n${sol.join('\n')}\nJe, unaweza kueleza kila hatua kwa maneno yako?`;
        return `Full solution:\n${sol.join('\n')}\n\nCan you explain each step back to me in your own words?`;
      }
      
      // Fallback
      if (isKiswahili) return 'Hebu tutatue hatua kwa hatua. Niambie unaposhindwa wapi.';
      return `Let's work through it step by step. Where are you getting stuck?`;
  }
}

async function anthropicComplete({ system, history }) {
  if (!ai.apiKey || !ai.model) throw new Error('ANTHROPIC_API_KEY and AI_MODEL must be set for AI_PROVIDER=anthropic');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': ai.apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: ai.model,
      max_tokens: ai.maxTokens,
      system,
      messages: history.map((m) => ({ role: m.role === 'learner' ? 'user' : 'assistant', content: m.content })),
    }),
  });
  if (!res.ok) throw new Error(`AI provider error ${res.status}`);
  const data = await res.json();
  return (data.content || []).map((c) => c.text || '').join('').trim();
}

exports.complete = async ({ system, history, level, maxLevel, question, topicTitle, masteryBand, latestAttempt, lang }) => {
  return ai.provider === 'anthropic' 
    ? anthropicComplete({ system, history }) 
    : mockComplete({ level, maxLevel, question, topicTitle, masteryBand, latestAttempt, lang });
};
