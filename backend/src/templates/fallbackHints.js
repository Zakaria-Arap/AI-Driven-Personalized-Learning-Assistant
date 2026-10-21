// Used when the answer filter blocks a reply that gave away the answer too early.
module.exports = (level) =>
  level <= 2
    ? 'Let us slow down. Tell me what you already know from the question, and what you need to find.'
    : 'Good effort. Write the first step yourself, even if you are unsure, and I will check it with you.';
