const asyncHandler = require('../helpers/asyncHandler');
const { ok } = require('../helpers/respond');
const userView = require('../helpers/userView');
const authService = require('../services/auth/authService').default;
const googleVerifier = require('../services/auth/googleVerifier');
const policy = require('../services/auth/passwordPolicy');
const cfg = require('../config/auth');
const config = require('../config');

const meta = (req) => ({ userAgent: req.headers['user-agent'], ip: req.ip });
const cookieOpts = () => ({ httpOnly: true, sameSite: 'lax', secure: config.isProd, maxAge: 8 * 3600 * 1000 });
const setSession = (res, token) => res.cookie(cfg.cookieName, token, cookieOpts());

exports.login = asyncHandler(async (req, res) => {
  const { user, token, mustActivate } = await authService.login(req.body, meta(req));
  if (mustActivate) return ok(res, { mustActivate: true, user: userView(user) }); // no session until activated
  setSession(res, token);
  return ok(res, { user: userView(user) });
});
exports.activate = asyncHandler(async (req, res) => {
  const { user, token } = await authService.activate(req.body, meta(req));
  setSession(res, token);
  ok(res, { user: userView(user) });
});
exports.forgot = asyncHandler(async (req, res) => ok(res, await authService.forgot(req.body)));
exports.verifyCode = asyncHandler(async (req, res) => ok(res, await authService.verifyCode(req.body)));
exports.reset = asyncHandler(async (req, res) => ok(res, await authService.reset(req.body)));
exports.google = asyncHandler(async (req, res) => {
  const email = await googleVerifier.verifyIdToken(req.body.idToken);
  const { user, token } = await authService.googleLogin({ email }, meta(req));
  setSession(res, token);
  ok(res, { user: userView(user) });
});
exports.logout = asyncHandler(async (req, res) => {
  try {
    const token = req.cookies?.[cfg.cookieName];
    if (token) { const p = require('../services/auth/tokens').verifySession(token); if (p.sid) await require('../repositories/sessionRepository').revoke(p.sub, p.sid); }
  } catch { /* already expired */ }
  res.clearCookie(cfg.cookieName); ok(res);
});
exports.me = (req, res) => ok(res, { user: userView(req.user) });
exports.rules = (req, res) => ok(res, { rules: policy.rules.map(({ id, label }) => ({ id, label })) });
