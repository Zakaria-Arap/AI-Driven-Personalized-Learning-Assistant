// School-issued authentication rules (see D3 section 3).
module.exports = {
  bcryptRounds: 10,
  maxFailedAttempts: 5,       // lock after this many wrong passwords
  warnFromAttempt: 3,         // start telling the user how many tries remain
  lockMinutes: 15,
  resetCodeLength: 6,
  resetCodeTtlMinutes: 10,
  resetCodeMaxTries: 5,
  cookieName: 'somo_session',
  roles: ['learner', 'teacher', 'parent', 'principal', 'admin'],
};
