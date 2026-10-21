const ai = require('../../config/ai');
const hintLadder = require('./hintLadder');

// Offline provider so the whole app can be demoed and tested with no key and no cost.
async function mockComplete({ level, question }) {
  const sol = (question.solution || '').split('\n').filter(Boolean); // used only at level 5
  switch (level) {
    case 1: return 'What is the question asking you to find? Write down what you know and what you need.';
    case 2: return 'Think about which rule or formula links the quantities in this problem. What does it say in general?';
    case 3: return 'Write down the rule or formula you need, then substitute the numbers from the question for the first step only. What do you get?';
    case 4: return 'Think of a simpler, everyday example that works the same way as this question. Work that one out first, then apply the same idea to your own numbers.';
    default: return sol.length ? `Full solution:\n${sol.join('\n')}\nCan you explain each step back to me?` : 'Let us solve it step by step. Tell me where you get stuck.';
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

exports.complete = async ({ system, history, level, question }) => {
  void hintLadder;
  return ai.provider === 'anthropic' ? anthropicComplete({ system, history }) : mockComplete({ level, question });
};
