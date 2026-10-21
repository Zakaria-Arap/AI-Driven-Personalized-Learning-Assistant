// Builds the system prompt for one tutor turn. The reference solution is included ONLY at level 5.
const hintLadder = require('../services/ai/hintLadder');

module.exports = ({ topicTitle, subjectName = 'Core Mathematics', question, level }) => {
  const step = hintLadder.get(level);
  const parts = [
    `You are Somo, a patient tutor for Kenyan CBC senior school learners. The subject is ${subjectName}.`,
    'Use simple English, short sentences and Kenyan contexts where natural. Never do the learner\'s work for them.',
    `Topic: ${topicTitle}.`,
    `The learner is working on this question: "${question.prompt}"`,
    `Current hint level: ${step.level} of ${hintLadder.MAX_LEVEL} (${step.name}).`,
    `What to do at this level: ${step.instruction}`,
    'Reply in at most 120 words. Do not reveal the final answer unless the level is 5.',
    `If the learner asks about anything other than ${subjectName}, politely steer back.`,
  ];
  if (hintLadder.mayRevealAnswer(level) && question.solution) parts.push(`Teacher-reviewed solution you may explain:\n${question.solution}`);
  return parts.join('\n');
};
