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
  
  // Extract units (cm, km, hours, degrees, etc.)
  const units = prompt.match(/\b(cm|km|m|kg|g|hours?|minutes?|seconds?|degrees?|°|liters?|KES|%|years?)\b/gi) || [];
  const uniqueUnits = [...new Set(units.map(u => u.toLowerCase()))];
  
  // Extract what is being asked for
  const askMatch = prompt.match(/find|calculate|determine|solve for|what is|evaluate|work out/i);
  const whatAskedMatch = prompt.match(/(?:find|calculate|determine|what is|evaluate|work out)\s+(?:the\s+)?(\w+(?:\s+\w+){0,3})/i);
  const whatAsked = whatAskedMatch ? whatAskedMatch[1] : 'the answer';
  
  // Get concept from topic title (main noun/concept)
  const conceptWords = (topicTitle || '').split(/\s+/).filter(w => w.length > 3);
  const concept = conceptWords[0] || 'this topic';
  
  // Build question-specific hints
  switch (level) {
    case 1: {
      // MUST name what is given and what is asked, using actual quantities/units
      const givenParts = [];
      if (safeNumbers.length > 0) {
        givenParts.push(`${safeNumbers.slice(0, 3).join(', ')}`);
      }
      if (uniqueUnits.length > 0) {
        givenParts.push(`in ${uniqueUnits.slice(0, 2).join(' and ')}`);
      }
      
      const givenText = givenParts.length > 0 
        ? `You are given: ${givenParts.join(' ')}.` 
        : 'Look at the information given in the problem.';
      
      const unitHint = uniqueUnits.length > 0 
        ? ` In what unit should your answer be?` 
        : '';
      
      if (isKiswahili) {
        return `${givenText} Una kupata nini${uniqueUnits.length ? ` (kitengo: ${uniqueUnits[0]})` : ''}? Andika unachojua na unachotaka kupata.`;
      }
      return `${givenText} What are you being asked to find about ${whatAsked}?${unitHint} Write down what you know and what you need.`;
    }
      
    case 2: {
      // MUST name the concept from topic and ask learner to recall its rule
      const formulaHint = question.type === 'numeric' && (
        prompt.toLowerCase().includes('area') || 
        prompt.toLowerCase().includes('speed') ||
        prompt.toLowerCase().includes('interest') ||
        prompt.toLowerCase().includes('volume')
      );
      
      if (isKiswahili) {
        return `Dhana hii inahusiana na ${concept}. Je, una kumbuka sheria au fomula ya ${concept}? Iandike kwa maneno au alama za hisabati.`;
      }
      
      if (formulaHint) {
        return `This problem is about ${concept}. What is the ${concept} formula? Write it down before substituting any numbers.`;
      }
      return `Think about ${concept}. What rule or principle from ${concept} connects the information in this problem? State it in your own words.`;
    }
      
    case 3: {
      // For multiple choice: may eliminate ONE wrong option only if ladder has >= 4 levels
      if (question.type === 'choice' && maxLevel >= 4) {
        // Extract options from the prompt
        const optionMatches = prompt.match(/[A-E][\.\)]\s+[^\n]+/g);
        if (optionMatches && optionMatches.length >= 3) {
          // Find which option is correct
          const correctOptionMatch = answer.match(/^([A-E])[\.\)]/);
          if (correctOptionMatch) {
            const correctLetter = correctOptionMatch[1];
            // Pick a wrong option to eliminate (not the correct one)
            const wrongOptions = optionMatches.filter(opt => !opt.startsWith(correctLetter));
            if (wrongOptions.length > 0) {
              const eliminateOption = wrongOptions[0].match(/^([A-E])/)[1];
              if (isKiswahili) return `Chaguo ${eliminateOption} sio sahihi. Fikiria kuhusu chaguo zilizosalia. Ni ipi inakubaliana zaidi na dhana ya ${concept}?`;
              return `You can eliminate option ${eliminateOption} - it is not correct. Think about the remaining options. Which one best matches the ${concept} concept?`;
            }
          }
        }
      }
      
      // For numeric, or if we cannot eliminate an option safely, use first solution step
      if (sol.length > 0) {
        const firstLine = sol[0];
        const answerLower = answer.toLowerCase();
        const lineLower = firstLine.toLowerCase();
        
        // Text match
        let containsAnswer = lineLower.includes(answerLower);
        
        // For choice questions, check if any part of the answer appears
        if (question.type === 'choice') {
          const optionText = answer.replace(/^[A-E][\.\)]\s*/, '');
          containsAnswer = optionText.length > 3 && lineLower.includes(optionText.toLowerCase());
        }
        
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
      
      // Fallback for choice questions
      if (question.type === 'choice') {
        if (isKiswahili) return `Fikiria kila chaguo kwa makini. Ni lipi linafaa zaidi na dhana ya ${concept}?`;
        return `Think through each option carefully. Which one best fits with what you know about ${concept}?`;
      }
      
      if (isKiswahili) return 'Andika fomula unayohitaji, kisha weka namba kutoka kwa swali kwa hatua ya kwanza tu. Nionyeshe hesabu hiyo.';
      return `Write down the formula, then substitute the values from the question for the first step. Show me that calculation.`;
    }
      
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
