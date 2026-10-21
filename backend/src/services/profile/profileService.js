const bcrypt = require('bcryptjs');
const userRepo = require('../../repositories/userRepository');
const sessionRepo = require('../../repositories/sessionRepository');
const audit = require('../audit/auditService');
const images = require('../../utils/imageUpload');
const policy = require('../auth/passwordPolicy');
const cfg = require('../../config/auth');
const userView = require('../../helpers/userView');
const { badRequest, unauthorized } = require('../../utils/errors');

const LANGS = ['en', 'sw'];
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

exports.cleanPrefs = (current, patch = {}) => {
  const base = userView.mergePrefs(current);
  const out = { ...base, notify: { ...base.notify } };
  if (patch.theme !== undefined) { if (!['system', 'light', 'dark'].includes(patch.theme)) throw badRequest('Invalid theme'); out.theme = patch.theme; }
  if (patch.fontScale !== undefined) out.fontScale = clamp(Math.round(Number.isFinite(Number(patch.fontScale)) ? Number(patch.fontScale) : 100), 90, 130);
  if (patch.reducedMotion !== undefined) out.reducedMotion = !!patch.reducedMotion;
  if (patch.density !== undefined) { if (!['comfortable', 'compact'].includes(patch.density)) throw badRequest('Invalid density'); out.density = patch.density; }
  if (patch.dailyGoal !== undefined) out.dailyGoal = clamp(Math.round(Number.isFinite(Number(patch.dailyGoal)) ? Number(patch.dailyGoal) : 5), 1, 50);
  if (patch.notify) for (const k of ['announcements', 'assignments', 'badges']) if (patch.notify[k] !== undefined) out.notify[k] = !!patch.notify[k];
  return out;
};

exports.update = async (user, patch) => {
  const upd = {};
  if (patch.preferredName !== undefined) upd.preferredName = String(patch.preferredName).trim().slice(0, 80) || null;
  if (patch.phone !== undefined) {
    const ph = String(patch.phone).trim();
    if (ph && !/^[+0-9 ()-]{7,30}$/.test(ph)) throw badRequest('Phone number looks wrong.', 'BAD_PHONE');
    upd.phone = ph || null;
  }
  if (patch.bio !== undefined) upd.bio = String(patch.bio).trim().slice(0, 280) || null;
  if (patch.language !== undefined) { if (!LANGS.includes(patch.language)) throw badRequest('Unsupported language'); upd.language = patch.language; }
  if (patch.email !== undefined) {
    const e = String(patch.email).trim().toLowerCase();
    if (e) {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw badRequest('Email is not valid.', 'BAD_EMAIL');
      const other = await userRepo.findByEmail(e);
      if (other && other.id !== user.id) throw badRequest('That email belongs to another account.', 'EMAIL_TAKEN');
    }
    if ((e || null) !== (user.email || null)) await audit.record('EMAIL_CHANGED', { actorId: user.id });
    upd.email = e || null;
  }
  if (patch.prefs !== undefined) upd.prefs = exports.cleanPrefs(user.prefs, patch.prefs);
  await userRepo.update(user, upd);
  return userView(user);
};

exports.setAvatar = async (user, dataUrl) => {
  const path = images.save(`avatar-${user.id}`, dataUrl, 300 * 1024);
  const old = user.avatarPath;
  await userRepo.update(user, { avatarPath: path });
  images.remove(old);
  return userView(user);
};
exports.removeAvatar = async (user) => { images.remove(user.avatarPath); await userRepo.update(user, { avatarPath: null }); return userView(user); };

exports.changePassword = async (user, sessionId, { currentPassword, newPassword }) => {
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) throw unauthorized('Current password is not correct.', 'BAD_CREDENTIALS');
  if (!policy.isValid(newPassword)) throw badRequest('Password does not meet the rules.', 'WEAK_PASSWORD', policy.failedRules(newPassword));
  if (await bcrypt.compare(newPassword, user.passwordHash)) throw badRequest('Choose a different password from your current one.', 'SAME_PASSWORD');
  await userRepo.update(user, { passwordHash: await bcrypt.hash(newPassword, cfg.bcryptRounds) });
  await sessionRepo.revokeOthers(user.id, sessionId);
  await audit.record('PASSWORD_CHANGED', { actorId: user.id });
  return { done: true };
};

exports.sessions = async (user, currentId) =>
  (await sessionRepo.listActive(user.id)).map((s) => ({ id: s.id, device: describeAgent(s.userAgent), ip: s.ip, lastSeenAt: s.lastSeenAt, createdAt: s.createdAt, current: s.id === currentId }));
exports.revokeSession = async (user, id) => { await sessionRepo.revoke(user.id, id); return { done: true }; };
exports.revokeOthers = async (user, currentId) => { await sessionRepo.revokeOthers(user.id, currentId); return { done: true }; };

function describeAgent(ua = '') {
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Unknown device';
  return `${browser} on ${os}`;
}
exports.describeAgent = describeAgent;
