// Never send hashes or lock counters to the browser.
const DEFAULT_PREFS = { theme: 'system', fontScale: 100, reducedMotion: false, density: 'comfortable', dailyGoal: 5, notify: { announcements: true, assignments: true, badges: true, announcementEmail: true } };
const mergePrefs = (p) => ({ ...DEFAULT_PREFS, ...(p || {}), notify: { ...DEFAULT_PREFS.notify, ...((p || {}).notify || {}) } });

module.exports = (u) => ({
  id: u.id,
  userCode: u.userCode,
  role: u.role,
  fullName: u.fullName,
  preferredName: u.preferredName || null,
  displayName: u.preferredName || u.fullName,
  email: u.email,
  phone: u.phone || null,
  bio: u.bio || null,
  avatarUrl: u.avatarPath || null,
  language: u.language || 'en',
  grade: u.grade,
  classLabel: u.classLabel || null,
  pathway: u.pathway || null,
  prefs: mergePrefs(u.prefs),
  mustActivate: !!u.mustChangePassword,
});
module.exports.DEFAULT_PREFS = DEFAULT_PREFS;
module.exports.mergePrefs = mergePrefs;
