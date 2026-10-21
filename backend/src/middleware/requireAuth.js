const authCfg = require('../config/auth');
const { verifySession } = require('../services/auth/tokens');
const { unauthorized } = require('../utils/errors');
const userRepo = require('../repositories/userRepository');
const sessionRepo = require('../repositories/sessionRepository');

// Verifies our own signed session cookie, then loads the live user and the live session row,
// so disabling an account or signing a device out takes effect immediately.
module.exports = async (req, res, next) => {
  try {
    const token = req.cookies?.[authCfg.cookieName] || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) throw unauthorized();
    let payload;
    try { payload = verifySession(token); } catch { throw unauthorized('Session expired, please sign in again', 'SESSION_EXPIRED'); }
    const user = await userRepo.findById(payload.sub);
    if (!user || !user.active) throw unauthorized('Account not available', 'ACCOUNT_OFF');
    if (user.mustChangePassword) throw unauthorized('Activate your account first', 'MUST_ACTIVATE');
    const session = payload.sid ? await sessionRepo.find(payload.sid) : null;
    if (!session || session.revokedAt || session.userId !== user.id) throw unauthorized('You were signed out. Please sign in again.', 'SESSION_REVOKED');
    if (!session.lastSeenAt || Date.now() - new Date(session.lastSeenAt).getTime() > 60000) await sessionRepo.touch(session);
    req.user = user;
    req.sessionId = session.id;
    next();
  } catch (e) { next(e); }
};
