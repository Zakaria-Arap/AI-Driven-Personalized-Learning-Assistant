const rateLimit = require('express-rate-limit');
// Limits are per IP. A whole school can share one IP, so they are generous; per-account lockout is the real brute-force defence.
const mk = (windowMin, max, message) =>
  rateLimit({
    windowMs: windowMin * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, code: 'RATE_LIMITED', message },
  });
module.exports = {
  authLimiter: mk(15, 300, 'Too many attempts. Wait a few minutes and try again.'),
  tutorLimiter: mk(1, 20, 'Slow down a little - the tutor needs a moment.'),
  apiLimiter: mk(1, 1500, 'Too many requests.'),
};
