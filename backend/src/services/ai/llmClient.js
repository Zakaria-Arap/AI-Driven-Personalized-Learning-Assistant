const ai = require('../../config/ai');
const adaptiveLadder = require('./adaptiveLadder');

// Offline provider so the whole app can be demoed and tested with no key and no cost.
// This version builds question-specific hints by analyzing the prompt and solution.
async function mockComplete({ level, maxLevel, question, topicTitle, masteryBand, latestAttempt, lang }) {
  const prompt = question.prompt || '';
  const sol = (question.solution || '').split('\n').filter(Boolean);
  const isKiswahili = lang === 'sw';
  
  // Extract numbers from the question
  const numbers = prompt.match(/\d+(?:\.\d+)?/g) || [];
  
  // Extract key terms (simple: words longer than 4 chars, capitalized or after certain words)
  const keyTermMatch = prompt.match(/(?:find|calculate|determine|solve for|what is)\s+(?:the\s+)?(\w+(?:\s+\w+)?)/i);
  const keyTerm = keyTermMatch ? keyTermMatch[1] : 'the answer';
  
  // Get concept hint from topic title (extract main concept word)
  const conceptWords = (topicTitle || '').split(/\s+/).filter(w => w.length > 4 && w[0] === w[0].toUpperCase());
  const concept = conceptWords[0] || 'the concept';
  
  // Build contextual hints
  switch (level) {
    case 1:
      if (isKiswahili) return `Swali linauliza nini? Andika unachojua na unachotaka kupata.${numbers.length ? ` Una namba: ${numbers.join(', ')}.` : ''}`;
      return `What is the question asking you to find${keyTerm !== 'the answer' ? ` about ${keyTerm}` : ''}? Write down what you know${numbers.length ? ` (you have: ${numbers.slice(0, 3).join(', ')}${numbers.length > 3 ? '...' : ''})` : ''} and what you need.`;
      
    case 2:
      if (isKiswahili) return `Fikiria sheria au fomula inayohusiana na ${concept}. Inasema nini kwa ujumla?`;
      return `Think about the ${concept} concept. Which rule or formula connects ${numbers.length >= 2 ? 'these quantities' : 'the values in this problem'}? Write it in general form first.`;
      
    case 3:
      if (sol.length > 0) {
        const firstStep = sol[0];
        if (isKiswahili) return `Hatua ya kwanza: ${firstStep.slice(0, 60)}... Jaribu kuendelea.`;
        return `Start with: ${firstStep.slice(0, 80)}${firstStep.length > 80 ? '...' : ''}. What comes next?`;
      }
      if (isKiswahili) return 'Andika fomula unayohitaji, kisha weka namba kutoka kwa swali kwa hatua ya kwanza tu.';
      return `Write the formula you need, then substitute${numbers.length ? ` the values (like ${numbers[0]})` : ' the numbers from the question'} for the first step only. What do you get?`;
      
    case 4: {
      // Generate a similar example with different numbers
      const modifiedNumbers = numbers.map(n => {
        const num = parseFloat(n);
        return !Number.isNaN(num) ? Math.round(num * 0.8) : n; // Scale down by 20%
      });
      
      if (sol.length > 1) {
        // Use the solution structure
        const exampleSol = sol.slice(0, Math.min(3, sol.length)).map((line, i) => {
          let modified = line;
          numbers.forEach((orig, j) => {
            if (modifiedNumbers[j]) {
              modified = modified.replace(new RegExp(orig, 'g'), modifiedNumbers[j]);
            }
          });
          return modified;
        }).join('. ');
        
        if (isKiswahili) return `Hebu mfano unaofanana: ${exampleSol} Sasa jaribu kwa namba zako.`;
        return `Here's a similar example: ${exampleSol}. Now apply the same steps to your problem.`;
      }
      
      if (isKiswahili) return 'Fikiria mfano rahisi zaidi unaofanya kazi sawa na swali hili. Ufanye huo kwanza, kisha tumia wazo hilo kwa namba zako.';
      return `Think of a simpler example${concept !== 'the concept' ? ` about ${concept}` : ''} with easier numbers${modifiedNumbers.length ? ` (like ${modifiedNumbers.slice(0, 2).join(', ')})` : ''}. Work that out first, then apply the same method to your problem.`;
    }
      
    default:
      // Final level
      if (level >= maxLevel && sol.length > 0) {
        if (isKiswahili) return `Suluhisho kamili:\n${sol.join('\n')}\nJe, unaweza kueleza kila hatua kwa maneno yako?`;
        return `Full solution:\n${sol.join('\n')}\n\nCan you explain each step back to me in your own words?`;
      }
      
      // Fallback if no solution available
      if (isKiswahili) return 'Hebu tutatue hatua kwa hatua. Niambie unaposhindwa wapi.';
      return `Let's solve it step by step${latestAttempt ? '. I can see your working' : ''}. ${masteryBand === 'learning' || masteryBand === 'not_started' ? 'Start with the concept you know.' : 'Show me your first step.'}`;
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
