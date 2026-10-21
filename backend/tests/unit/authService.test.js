const bcrypt = require('bcryptjs');
const createAuthService = require('../../src/services/auth/authService');

function setup(overrides = {}) {
  const user = {
    id: 1, userCode: 'AMA-10B-014', role: 'learner', fullName: 'Amani', email: 'a@x.ke', active: true,
    passwordHash: bcrypt.hashSync('Welcome-2026', 4), mustChangePassword: true, failedAttempts: 0, lockedUntil: null, ...overrides,
  };
  const sent = [];
  const rows = [];
  const clock = { t: new Date('2026-10-19T10:00:00Z') };
  const svc = createAuthService({
    users: { findByCode: async (c) => (c.toUpperCase() === user.userCode ? user : null), findByEmail: async (e) => (e === user.email ? user : null), findById: async (id) => (id === 1 ? user : null), save: async () => {} },
    resets: { create: async (d) => { const r = { ...d, tries: 0, usedAt: null }; rows.push(r); return r; }, latestOpenForUser: async () => rows[rows.length - 1] || null, save: async () => {} },
    audit: { record: async () => {} },
    mailer: { sendCode: async (m) => sent.push(m) },
    now: () => clock.t,
  });
  return { svc, user, sent, clock };
}

test('wrong password gives a generic error, warns from attempt 3, locks at 5', async () => {
  const { svc } = setup();
  const errs = [];
  for (let i = 0; i < 5; i++) errs.push(await svc.login({ userCode: 'AMA-10B-014', password: 'nope' }).catch((e) => e));
  expect(errs[0].code).toBe('BAD_CREDENTIALS');
  expect(errs[0].details).toBeUndefined();
  expect(errs[2].details.attemptsLeft).toBe(2);
  expect(errs[4].code).toBe('ACCOUNT_LOCKED');
  await expect(svc.login({ userCode: 'AMA-10B-014', password: 'Welcome-2026' })).rejects.toMatchObject({ code: 'ACCOUNT_LOCKED' });
});
test('lock expires after 15 minutes', async () => {
  const { svc, clock } = setup();
  for (let i = 0; i < 5; i++) await svc.login({ userCode: 'AMA-10B-014', password: 'nope' }).catch(() => {});
  clock.t = new Date(clock.t.getTime() + 16 * 60000);
  const r = await svc.login({ userCode: 'AMA-10B-014', password: 'Welcome-2026' });
  expect(r.mustActivate).toBe(true);
});
test('unknown ID looks the same as a wrong password', async () => {
  const { svc } = setup();
  await expect(svc.login({ userCode: 'ZZZ', password: 'x' })).rejects.toMatchObject({ code: 'BAD_CREDENTIALS', message: 'School ID or password is not correct.' });
});
test('first login must be activated with a strong password and policy consent', async () => {
  const { svc } = setup();
  await expect(svc.activate({ userCode: 'AMA-10B-014', tempPassword: 'Welcome-2026', newPassword: 'Strong#Pass1', acceptPolicy: false })).rejects.toMatchObject({ code: 'POLICY_REQUIRED' });
  await expect(svc.activate({ userCode: 'AMA-10B-014', tempPassword: 'Welcome-2026', newPassword: 'weak', acceptPolicy: true })).rejects.toMatchObject({ code: 'WEAK_PASSWORD' });
  const ok = await svc.activate({ userCode: 'AMA-10B-014', tempPassword: 'Welcome-2026', newPassword: 'Strong#Pass1', acceptPolicy: true });
  expect(ok.token).toBeTruthy();
  const again = await svc.login({ userCode: 'AMA-10B-014', password: 'Strong#Pass1' });
  expect(again.mustActivate).toBe(false);
});
test('forgot -> verify code -> reset works and a wrong code is rejected', async () => {
  const { svc, sent } = setup({ mustChangePassword: false });
  expect(await svc.forgot({ userCode: 'NOPE' })).toEqual({ sent: true });   // same answer for unknown IDs
  expect(sent).toHaveLength(0);
  await svc.forgot({ userCode: 'AMA-10B-014' });
  expect(sent[0].code).toMatch(/^\d{6}$/);
  await expect(svc.verifyCode({ userCode: 'AMA-10B-014', code: '000000' })).rejects.toMatchObject({ code: 'BAD_CODE' });
  const { resetToken } = await svc.verifyCode({ userCode: 'AMA-10B-014', code: sent[0].code });
  await expect(svc.reset({ resetToken, newPassword: 'weak' })).rejects.toMatchObject({ code: 'WEAK_PASSWORD' });
  await svc.reset({ resetToken, newPassword: 'Fresh#Pass9' });
  expect((await svc.login({ userCode: 'AMA-10B-014', password: 'Fresh#Pass9' })).token).toBeTruthy();
});
test('google sign-in only for registered emails', async () => {
  const { svc } = setup({ mustChangePassword: false });
  expect((await svc.googleLogin({ email: 'a@x.ke' })).token).toBeTruthy();
  await expect(svc.googleLogin({ email: 'stranger@gmail.com' })).rejects.toMatchObject({ code: 'NOT_REGISTERED' });
});
