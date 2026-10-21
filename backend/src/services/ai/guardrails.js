// Content rules for tutor input. Matching is deliberately simple and reviewed by teachers through flagged chats.
const DISTRESS = /\b(kill myself|suicide|want to die|hurt myself|self[- ]harm|abuse[sd]?|beat(s|ing)? me)\b/i;
const OFF_TOPIC = /\b(girlfriend|boyfriend|betting|porn|hack (a|the)|cheat on (the )?exam)\b/i;

exports.inspect = (text) => {
  if (DISTRESS.test(text)) return { flag: true, reason: 'wellbeing', reply: 'I am glad you told me. Please talk to a teacher or the school counsellor today. I have let your teacher know you may want support.' };
  if (OFF_TOPIC.test(text)) return { flag: true, reason: 'off_topic', reply: 'I can only help with your maths here. Let us go back to the question.' };
  return { flag: false };
};
