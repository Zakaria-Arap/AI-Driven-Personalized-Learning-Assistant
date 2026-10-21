const bcrypt = require('bcryptjs');
const cfg = require('../../config/auth');
const policy = require('./passwordPolicy');
const tokens = require('./tokens');
const { numericCode } = require('../../utils/codes');
const { addMinutes } = require('../../utils/time');
const { unauthorized, badRequest, locked } = require('../../utils/errors');

/**
 * Factory so tests can inject fake repositories. Production wiring is at the bottom.
 * deps: { users, resets, audit, mailer, now }
 */
function createAuthService({ users, resets, audit, mailer, sessions = { create: async () => ({ id: 0 }) }, now = () => new Date() }) {
  const startSession = async (user, meta = {}) => tokens.signSession(user, (await sessions.create({ userId: user.id, userAgent: (meta.userAgent || '').slice(0, 250), ip: meta.ip, lastSeenAt: now() })).id);
  const GENERIC = 'School ID or password is not correct.';

  async function login({ userCode, password }, meta) {
    const user = await users.findByCode(userCode);
    if (!user || !user.active) {
      await audit.record('LOGIN_FAILED', { meta: { userCode, reason: 'unknown_or_off' } });
      throw unauthorized(GENERIC, 'BAD_CREDENTIALS');
    }
    const t = now();
    if (user.lockedUntil && user.lockedUntil > t) {
      const minutes = Math.ceil((user.lockedUntil - t) / 60000);
      throw locked(`Too many wrong attempts. Try again in ${minutes} minute(s), or ask the school office.`, { minutes });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      user.failedAttempts += 1;
      const left = cfg.maxFailedAttempts - user.failedAttempts;
      if (left <= 0) {
        user.lockedUntil = addMinutes(t, cfg.lockMinutes);
        user.failedAttempts = 0;
        await users.save(user);
        await audit.record('ACCOUNT_LOCKED', { actorId: user.id, targetType: 'user', targetId: user.id });
        throw locked(`Account locked for ${cfg.lockMinutes} minutes.`, { minutes: cfg.lockMinutes });
      }
      await users.save(user);
      await audit.record('LOGIN_FAILED', { actorId: user.id, meta: { reason: 'bad_password' } });
      const warn = user.failedAttempts >= cfg.warnFromAttempt;
      throw unauthorized(warn ? `${GENERIC} ${left} attempt(s) left before the account locks.` : GENERIC, 'BAD_CREDENTIALS', warn ? { attemptsLeft: left } : undefined);
    }
    user.failedAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = t;
    await users.save(user);
    await audit.record('LOGIN_OK', { actorId: user.id });
    return { user, token: user.mustChangePassword ? null : await startSession(user, meta), mustActivate: !!user.mustChangePassword };
  }

  // First login: new password + data policy acceptance.
  async function activate({ userCode, tempPassword, newPassword, acceptPolicy }, meta) {
    if (!acceptPolicy) throw badRequest('You must accept the data policy to continue.', 'POLICY_REQUIRED');
    const user = await users.findByCode(userCode);
    if (!user || !user.active || !user.mustChangePassword) throw unauthorized('This account cannot be activated.', 'CANNOT_ACTIVATE');
    if (!(await bcrypt.compare(tempPassword, user.passwordHash))) throw unauthorized(GENERIC, 'BAD_CREDENTIALS');
    if (!policy.isValid(newPassword)) throw badRequest('Password does not meet the rules.', 'WEAK_PASSWORD', policy.failedRules(newPassword));
    user.passwordHash = await bcrypt.hash(newPassword, cfg.bcryptRounds);
    user.mustChangePassword = false;
    user.policyAcceptedAt = now();
    user.failedAttempts = 0;
    await users.save(user);
    await audit.record('ACCOUNT_ACTIVATED', { actorId: user.id });
    return { user, token: await startSession(user, meta) };
  }

  // Always answers the same way so the form cannot be used to discover which IDs exist.
  async function forgot({ userCode }) {
    const user = await users.findByCode(userCode);
    if (user && user.active && user.email) {
      const code = numericCode(cfg.resetCodeLength);
      await resets.create({ userId: user.id, codeHash: await bcrypt.hash(code, 8), expiresAt: addMinutes(now(), cfg.resetCodeTtlMinutes) });
      await mailer.sendCode({ to: user.email, code, name: user.fullName });
      await audit.record('RESET_REQUESTED', { actorId: user.id });
    }
    return { sent: true };
  }

  async function verifyCode({ userCode, code }) {
    const user = await users.findByCode(userCode);
    const bad = () => badRequest('That code is not correct or has expired.', 'BAD_CODE');
    if (!user) throw bad();
    const row = await resets.latestOpenForUser(user.id);
    if (!row || row.expiresAt < now() || row.tries >= cfg.resetCodeMaxTries) throw bad();
    if (!(await bcrypt.compare(code, row.codeHash))) {
      row.tries += 1;
      await resets.save(row);
      throw bad();
    }
    row.verifiedAt = now();
    await resets.save(row);
    return { resetToken: tokens.signReset(user.id) };
  }

  async function reset({ resetToken, newPassword }) {
    let payload;
    try { payload = tokens.verifyReset(resetToken); } catch { throw badRequest('Reset link expired. Start again.', 'RESET_EXPIRED'); }
    const user = await users.findById(payload.sub);
    if (!user) throw badRequest('Reset link expired. Start again.', 'RESET_EXPIRED');
    const row = await resets.latestOpenForUser(user.id);
    if (!row || !row.verifiedAt) throw badRequest('Verify your code first.', 'CODE_NOT_VERIFIED');
    if (!policy.isValid(newPassword)) throw badRequest('Password does not meet the rules.', 'WEAK_PASSWORD', policy.failedRules(newPassword));
    user.passwordHash = await bcrypt.hash(newPassword, cfg.bcryptRounds);
    user.failedAttempts = 0;
    user.lockedUntil = null;
    row.usedAt = now();
    await users.save(user);
    await resets.save(row);
    await audit.record('PASSWORD_RESET', { actorId: user.id });
    return { done: true };
  }

  // Google sign-in is allowed only for emails the school already registered.
  async function googleLogin({ email }, meta) {
    const user = email ? await users.findByEmail(email) : null;
    if (!user || !user.active) {
      await audit.record('GOOGLE_REJECTED', { meta: { email } });
      throw unauthorized('This Google account is not registered with your school.', 'NOT_REGISTERED');
    }
    if (user.mustChangePassword) throw unauthorized('Activate your account with your school ID first.', 'MUST_ACTIVATE');
    user.lastLoginAt = now();
    await users.save(user);
    await audit.record('LOGIN_OK', { actorId: user.id, meta: { via: 'google' } });
    return { user, token: await startSession(user, meta) };
  }

  return { login, activate, forgot, verifyCode, reset, googleLogin };
}

module.exports = createAuthService;
module.exports.default = createAuthService({
  users: require('../../repositories/userRepository'),
  resets: require('../../repositories/resetRepository'),
  audit: require('../audit/auditService'),
  mailer: require('./mailer'),
  sessions: require('../../repositories/sessionRepository'),
});
