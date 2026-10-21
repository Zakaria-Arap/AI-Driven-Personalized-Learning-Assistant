// Builds the system prompt for one tutor turn. The reference solution is included ONLY at the final level.
const adaptiveLadder = require('../services/ai/adaptiveLadder');

module.exports = ({ topicTitle, topicOutcome, subjectName = 'Core Mathematics', question, level, maxLevel, masteryScore, masteryBand, latestAttempt, priorErrors, lang = 'en' }) => {
  const step = adaptiveLadder.get(level, maxLevel);
  const isKiswahili = lang === 'sw';
  
  const parts = [
    isKiswahili 
      ? `Wewe ni Somo, mwalimu mvumilivu wa wanafunzi wa shule ya upili ya CBC Kenya. Somo ni ${subjectName}.`
      : `You are Somo, a patient tutor for Kenyan CBC senior school learners. The subject is ${subjectName}.`,
    
    isKiswahili
      ? 'Tumia Kiingereza rahisi, sentensi fupi na mifano ya Kenya pale inafaa. Usifanyie mwanafunzi kazi yao.'
      : 'Use simple English, short sentences and Kenyan contexts where natural. Never do the learner\'s work for them.',
    
    `Topic: ${topicTitle}.`,
  ];
  
  if (topicOutcome) {
    parts.push(`Learning outcome: ${topicOutcome}`);
  }
  
  parts.push(`The learner is working on this question: "${question.prompt}"`);
  
  // Add mastery context if available
  if (typeof masteryScore === 'number') {
    parts.push(`Learner's current mastery in this topic: ${Math.round(masteryScore)}% (${masteryBand || 'learning'}).`);
  }
  
  // Add attempt context if available
  if (latestAttempt && latestAttempt.trim()) {
    parts.push(`Their latest working/attempt: "${latestAttempt}"`);
  }
  
  // Add error pattern context if available
  if (priorErrors && priorErrors.length > 0) {
    const errorTypes = [...new Set(priorErrors.map(e => e.error))].filter(Boolean);
    if (errorTypes.length > 0) {
      parts.push(`Common mistakes this learner has made on this topic: ${errorTypes.join(', ')}. Address these if relevant.`);
    }
  }
  
  parts.push(
    `Current hint level: ${step.level} of ${maxLevel} (${step.name}).`,
    `What to do at this level: ${step.instruction}`,
    isKiswahili
      ? 'Jibu kwa maneno 120 au chini.'
      : 'Reply in at most 120 words. Mention the actual numbers, concepts or steps from THIS question.',
  );
  
  // CRITICAL SAFETY: Answer and solution enter the prompt ONLY at the final level
  // Below the final level, the prompt contains NO answer or solution (answerGuard is the safety net)
  // At the final level for THIS session (which may be 2-5), we may reveal the answer
  if (level >= maxLevel && level >= adaptiveLadder.MAX_LEVEL) {
    // Only at absolute level 5 do we reveal the full answer
    if (question.solution) {
      parts.push(`Teacher-reviewed solution you may now explain:\n${question.solution}`);
      parts.push(`The correct answer is: ${question.answer}`);
    }
  } else if (level === maxLevel && maxLevel < adaptiveLadder.MAX_LEVEL) {
    // At early final levels (2, 3, 4), do NOT reveal answer - just the solution for context
    if (question.solution) {
      parts.push(`Reference solution (do NOT simply repeat this - use it to guide a worked example with DIFFERENT numbers):\n${question.solution}`);
    }
  }
  
  parts.push(
    isKiswahili
      ? `Ikiwa mwanafunzi anauliza kuhusu kitu kingine isipokuwa ${subjectName}, warudishe kwa upole kwenye swali.`
      : `If the learner asks about anything other than ${subjectName}, politely steer back to the question.`
  );
  
  return parts.join('\n');
};
