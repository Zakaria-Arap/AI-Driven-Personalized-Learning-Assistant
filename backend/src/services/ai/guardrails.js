// Content rules for tutor input. Matching is deliberately simple and reviewed by teachers through flagged chats.
const DISTRESS = /\b(kill myself|suicide|want to die|hurt myself|self[- ]harm|abuse[sd]?|beat(s|ing)? me|kujiua|kujitia|ninauma|kuniumiza)\b/i;
const OFF_TOPIC = /\b(girlfriend|boyfriend|dating|mchumba|betting|kamari|porn|ngono|hack (a|the)|cheat on (the )?exam|ujanja|kupiga chizi)\b/i;
const ANSWER_PLEA = /\b(just (give|tell) me (the )?answer|what is (the )?answer|niambie jibu|nipe jibu|ignore (your|previous) (instructions?|rules))\b/i;
const PERSONAL_INFO = /\b(your (phone|number|email|address|where do you live)|wapi unaishi|namba yako|simu yako)\b/i;

exports.inspect = (text) => {
  // Wellbeing concerns - highest priority
  if (DISTRESS.test(text)) {
    return { 
      flag: true, 
      reason: 'wellbeing', 
      reply: 'I am glad you told me. Please talk to a teacher or the school counsellor today. I have let your teacher know you may want support.' 
    };
  }
  
  // Personal information requests
  if (PERSONAL_INFO.test(text)) {
    return {
      flag: false,
      reason: 'personal_info',
      reply: 'I am here to help you with your learning. Let's focus on the question.'
    };
  }
  
  // Direct answer pleas
  if (ANSWER_PLEA.test(text)) {
    return {
      flag: false,
      reason: 'answer_plea',
      reply: 'I can't just give you the answer - that wouldn't help you learn! Let's work through it together. What do you understand so far?'
    };
  }
  
  // Off-topic content
  if (OFF_TOPIC.test(text)) {
    return { 
      flag: true, 
      reason: 'off_topic', 
      reply: 'I can only help with your schoolwork here. Let us go back to the question.' 
    };
  }
  
  return { flag: false };
};

