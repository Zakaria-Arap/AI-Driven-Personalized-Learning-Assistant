// A tiny in-browser stand-in for the Express API. Same routes and response shapes, data kept in localStorage.
// It reuses the real learning engines, so marking, mastery, streaks and badges behave exactly like the project.
import { seedState, DEFAULT_PREFS, SCHOOL_ID, PATHWAYS, MAX_ELECTIVES } from './seed.js';
import { applyAnswer, band } from '../../../backend/src/services/recommendation/masteryEngine.js';
import { recommend } from '../../../backend/src/services/recommendation/recommendationEngine.js';
import { isCorrect } from '../../../backend/src/services/assessment/marking.js';
import * as gami from '../../../backend/src/services/engagement/gamification.js';
import * as ladder from '../../../backend/src/services/ai/hintLadder.js';
import * as answerGuard from '../../../backend/src/services/ai/answerGuard.js';
import * as guardrails from '../../../backend/src/services/ai/guardrails.js';
import fallbackHint from '../../../backend/src/templates/fallbackHints.js';
import * as policy from '../../../backend/src/services/auth/passwordPolicy.js';

const KEY = 'somo.prototype.v2';
const DAY = 86400000;
export class HttpError extends Error { constructor(status, code, message, details) { super(message); this.status = status; this.body = { ok: false, code, message, details }; } }
const bad = (m, code = 'BAD_REQUEST', d) => new HttpError(400, code, m, d);
const denied = (m = 'You do not have access to that.') => new HttpError(403, 'FORBIDDEN', m);
const missing = (m = 'Not found') => new HttpError(404, 'NOT_FOUND', m);

let S;
const load = () => { try { const raw = localStorage.getItem(KEY); S = raw ? JSON.parse(raw) : null; } catch { S = null; } if (!S || S.v !== 2) S = seedState(); };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* storage full or blocked: keep working in memory */ } };
export const resetDemo = () => { S = seedState(); save(); };
load();

const id = (k) => S.nextIds[k]++;
const byId = (list, i) => list.find((x) => x.id === Number(i));
const userView = (u) => ({
  id: u.id, userCode: u.userCode, role: u.role, fullName: u.fullName, preferredName: u.preferredName, displayName: u.preferredName || u.fullName, email: u.email, phone: u.phone, bio: u.bio,
  avatarUrl: u.avatarUrl, language: u.language, grade: u.grade, classLabel: u.classLabel, pathway: u.pathway || null, prefs: { ...DEFAULT_PREFS, ...u.prefs, notify: { ...DEFAULT_PREFS.notify, ...((u.prefs || {}).notify || {}) } }, mustActivate: !!u.mustChangePassword,
});
const log = (action, actorId, meta) => { S.audit.unshift({ id: id('audit'), action, actorId: actorId || null, at: Date.now(), meta: meta || null }); S.audit = S.audit.slice(0, 400); };
const me = () => { const u = S.sessionUser && byId(S.users, S.sessionUser.userId); if (!u || !u.active) throw new HttpError(401, 'UNAUTHENTICATED', 'Please sign in.'); return u; };
const need = (u, ...roles) => { if (!roles.includes(u.role)) throw denied(); };
const avg = (xs) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);
const notify = (userIds, { type, title, body, link }) => {
  const key = { announcement: 'announcements', assignment: 'assignments', badge: 'badges' }[type];
  userIds.forEach((uid) => { const u = byId(S.users, uid); if (u && (!key || userView(u).prefs.notify[key])) S.notifications.unshift({ id: id('note'), userId: uid, type, title, body: body || null, link: link || null, readAt: null, createdAt: Date.now() }); });
};
const temp = () => `Tmp-${Math.random().toString(36).slice(2, 6)}${Math.floor(1000 + Math.random() * 9000)}!`;

// ---- learning helpers (same maths as the backend services) ----
const mastery = (uid) => S.mastery[uid] || (S.mastery[uid] = {});
const records = (uid) => Object.entries(mastery(uid)).map(([topicId, r]) => ({ topicId: Number(topicId), ...r }));
const attemptsOf = (uid, days = 400) => S.attempts.filter((a) => a.learnerId === uid && a.createdAt >= Date.now() - days * DAY);
const gradeOf = (u) => u.grade || 10;
const courseByCode = (code) => S.courses.find((c) => c.code === code);
const teacherName = (c) => (c.teacherId ? byId(S.users, c.teacherId)?.fullName || null : null);
const courseView = (c) => ({ id: c.id, code: c.code, name: c.name, pathway: c.pathway, teacher: c.teacherId ? { id: c.teacherId, name: teacherName(c) } : null });
const chosenIds = (uid) => new Set(S.enrol[uid] || []);
const takes = (c, l) => c.pathway === 'compulsory' || (c.pathway === l.pathway && chosenIds(l.id).has(c.id));
const coursesOfLearner = (l) => S.courses.filter((c) => takes(c, l));
const topicsOf = (code, grade) => S.topics.filter((t) => t.courseCode === code && t.grade === grade);
const learnersOfCourse = (c, grade, classLabel) => S.users.filter((l) => l.role === 'learner' && l.active && gradeOf(l) === grade && (!classLabel || l.classLabel === classLabel) && takes(c, l));
const topicIn = (t) => ({ code: t.courseCode, name: t.subjectName, grade: t.grade });
function assertLearnerTopic(l, t) {
  if (t.grade !== gradeOf(l)) throw denied('That topic is not in your grade.');
  if (!coursesOfLearner(l).some((c) => c.code === t.courseCode)) throw denied('You are not enrolled in that subject.');
}

// One learner's subjects for their grade, with progress in each (mirrors learnerService.subjectsFor).
function subjectsFor(l) {
  const recs = records(l.id);
  return coursesOfLearner(l).map((course) => {
    const topics = topicsOf(course.code, gradeOf(l)); const ids = new Set(topics.map((t) => t.id)); const mine = recs.filter((r) => ids.has(r.topicId));
    const by = new Map(mine.map((r) => [r.topicId, r]));
    const map = topics.map((t) => { const r = by.get(t.id); return { topicId: t.id, title: t.title, strand: t.strand, score: r ? Math.round(r.score) : 0, band: band(r?.score ?? 0, r?.attempts ?? 0) }; });
    return { course, topics, map, summary: { code: course.code, name: course.name, pathway: course.pathway, teacher: teacherName(course), overall: topics.length ? Math.round(map.reduce((s2, m2) => s2 + m2.score, 0) / topics.length) : 0, mastered: map.filter((m2) => m2.band === 'mastered').length, started: map.filter((m2) => m2.band !== 'not_started').length, totalTopics: topics.length, next: topics.length ? recommend(topics, mine, new Date()) : null } };
  });
}
function learnerDash(l, code) {
  const all = subjectsFor(l);
  const pick = code ? all.find((x) => x.course.code === code) : all.find((x) => x.course.code === 'MATH') || all[0];
  if (!pick) throw missing('You are not enrolled in that subject.');
  const sm = pick.summary;
  return { subject: { code: sm.code, name: sm.name, grade: gradeOf(l), teacher: sm.teacher }, target: 80, overall: sm.overall, mastered: sm.mastered, started: sm.started, totalTopics: sm.totalTopics, next: sm.next, topicMap: pick.map, subjects: all.map((x) => x.summary), needsPathway: !l.pathway };
}
function pathwayOptions(l) {
  const chosen = chosenIds(l.id);
  return { pathway: l.pathway || null, maxElectives: MAX_ELECTIVES, pathways: Object.entries(PATHWAYS).map(([key, name]) => ({ key, name, electives: S.courses.filter((c) => c.pathway === key).map(courseView) })), compulsory: S.courses.filter((c) => c.pathway === 'compulsory').map(courseView), chosen: S.courses.filter((c) => chosen.has(c.id) && c.pathway === l.pathway).map((c) => c.code) };
}
function choosePathway(actor, l, body) {
  if (!PATHWAYS[body.pathway]) throw bad('Pick STEM or Social Sciences.', 'BAD_PATHWAY');
  const codes = [...new Set(body.courseCodes || [])];
  if (codes.length < 1 || codes.length > MAX_ELECTIVES) throw bad(`Choose between 1 and ${MAX_ELECTIVES} subjects.`, 'BAD_CHOICE');
  const picked = codes.map((cd) => S.courses.find((c) => c.code === cd && c.pathway === body.pathway));
  if (picked.some((c) => !c)) throw bad('One of those subjects is not in that pathway.', 'BAD_CHOICE');
  l.pathway = body.pathway; S.enrol[l.id] = picked.map((c) => c.id);
  log('SUBJECTS_CHOSEN', actor.id, { pathway: body.pathway, courseCodes: codes });
  if (actor.id !== l.id) notify([l.id], { type: 'system', title: 'Your subjects were updated', body: `${PATHWAYS[body.pathway]}: ${picked.map((c) => c.name).join(', ')}`, link: '/learner/subjects' });
  return pathwayOptions(l);
}
function insights(u) {
  const attempts = attemptsOf(u.id); const m = records(u.id);
  const g = gami.compute(attempts, m, new Date());
  const awarded = new Set(S.badges[u.id] || []);
  const todayKey = gami.dayKey(new Date());
  return {
    streak: g.streak, bestStreak: g.bestStreak, xp: g.xp, level: g.level, levelProgress: g.levelProgress, nextLevelXp: g.nextLevelXp,
    dailyGoal: userView(u).prefs.dailyGoal, todayCount: attempts.filter((a) => gami.dayKey(a.createdAt) === todayKey).length,
    badges: g.badges.map((b) => ({ ...b, earned: b.earned || awarded.has(b.key) })), activity: gami.activity(attempts, new Date(), 84),
    accuracy: attempts.length ? Math.round((g.correct / attempts.length) * 100) : null,
    totals: { attempts: g.attempts, correct: g.correct, mastered: g.mastered, topicsStarted: g.topicsStarted },
    reviews: m.filter((r) => r.nextReviewAt && byId(S.topics, r.topicId)).map((r) => ({ topicId: r.topicId, title: byId(S.topics, r.topicId).title, subject: byId(S.topics, r.topicId).subjectName, due: r.nextReviewAt, step: r.reviewStep })).sort((a, b) => a.due - b.due),
  };
}
function awardNew(u) {
  const g = gami.compute(attemptsOf(u.id), records(u.id), new Date());
  const have = new Set(S.badges[u.id] || []); const fresh = [];
  g.badges.forEach((b) => { if (b.earned && !have.has(b.key)) { have.add(b.key); fresh.push(b); } });
  S.badges[u.id] = [...have];
  fresh.forEach((b) => notify([u.id], { type: 'badge', title: `Badge earned: ${b.title}`, body: b.desc, link: '/learner/achievements' }));
  return fresh.map(({ key, title, desc }) => ({ key, title, desc }));
}
function subjectRows(learners, topics) {
  const ids = new Set(topics.map((t) => t.id));
  return learners.map((l) => {
    const mine = records(l.id).filter((r) => ids.has(r.topicId));
    return { learnerId: l.id, name: l.fullName, classLabel: l.classLabel, grade: l.grade, scores: Object.fromEntries(mine.map((r) => [r.topicId, Math.round(r.score)])), overall: topics.length ? Math.round(mine.reduce((s2, r) => s2 + r.score, 0) / topics.length) : 0,
      mastered: mine.filter((r) => band(r.score, r.attempts) === 'mastered').length, started: mine.length, needsSupport: mine.length > 0 && avg(mine.map((r) => r.score)) < 40 };
  });
}
const authorName = (a) => { const u = byId(S.users, a.authorId); return { author: u?.fullName, authorRole: u?.role }; };

// ---- the route table ----
export function handle(method, rawPath, body = {}) {
  const [path, query = ''] = rawPath.split('?'); const q = Object.fromEntries(new URLSearchParams(query));
  const m = (re) => { const r = path.match(re); return r ? r.slice(1) : null; };
  const is = (verb, re) => method === verb && m(re);
  let p;

  // public
  if (is('GET', /^\/settings\/public$/)) return { ok: true, settings: S.settings };
  if (is('POST', /^\/auth\/login$/)) {
    const code = String(body.userCode || '').trim().toUpperCase(); const u = S.users.find((x) => x.userCode === code);
    const GENERIC = 'School ID or password is not correct.';
    if (!u || !u.active) { log('LOGIN_FAILED', null, { userCode: code }); throw new HttpError(401, 'BAD_CREDENTIALS', GENERIC); }
    if (u.lockedUntil && u.lockedUntil > Date.now()) throw new HttpError(423, 'LOCKED', `Too many wrong attempts. Try again in ${Math.ceil((u.lockedUntil - Date.now()) / 60000)} minute(s), or ask the school office.`);
    if (u.password !== body.password) {
      u.failedAttempts += 1; const left = 5 - u.failedAttempts;
      if (left <= 0) { u.lockedUntil = Date.now() + 15 * 60000; u.failedAttempts = 0; log('ACCOUNT_LOCKED', u.id); save(); throw new HttpError(423, 'LOCKED', 'Account locked for 15 minutes.'); }
      log('LOGIN_FAILED', u.id); save();
      throw new HttpError(401, 'BAD_CREDENTIALS', u.failedAttempts >= 3 ? `${GENERIC} ${left} attempt(s) left before the account locks.` : GENERIC, u.failedAttempts >= 3 ? { attemptsLeft: left } : undefined);
    }
    u.failedAttempts = 0; u.lockedUntil = null; u.lastLoginAt = Date.now(); log('LOGIN_OK', u.id);
    if (u.mustChangePassword) { save(); return { ok: true, mustActivate: true, user: userView(u) }; }
    const sid = id('sess'); S.sessions.push({ id: sid, userId: u.id, device: 'Chrome on this demo', createdAt: Date.now(), lastSeenAt: Date.now() }); S.sessionUser = { userId: u.id, sid }; save();
    return { ok: true, user: userView(u) };
  }
  if (is('POST', /^\/auth\/activate$/)) {
    const u = S.users.find((x) => x.userCode === String(body.userCode || '').toUpperCase());
    if (!body.acceptPolicy) throw bad('You must accept the data policy to continue.', 'POLICY_REQUIRED');
    if (!u || !u.mustChangePassword) throw new HttpError(401, 'CANNOT_ACTIVATE', 'This account cannot be activated.');
    if (u.password !== body.tempPassword) throw new HttpError(401, 'BAD_CREDENTIALS', 'School ID or password is not correct.');
    if (!policy.isValid(body.newPassword)) throw bad('Password does not meet the rules.', 'WEAK_PASSWORD', policy.failedRules(body.newPassword));
    u.password = body.newPassword; u.mustChangePassword = false; log('ACCOUNT_ACTIVATED', u.id);
    const sid = id('sess'); S.sessions.push({ id: sid, userId: u.id, device: 'Chrome on this demo', createdAt: Date.now(), lastSeenAt: Date.now() }); S.sessionUser = { userId: u.id, sid }; save();
    return { ok: true, user: userView(u) };
  }
  if (is('POST', /^\/auth\/forgot$/)) { window.dispatchEvent(new CustomEvent('somo-demo-code', { detail: '482917' })); return { ok: true, sent: true }; }
  if (is('POST', /^\/auth\/verify-code$/)) { if (body.code !== '482917') throw bad('That code is not correct or has expired.', 'BAD_CODE'); return { ok: true, resetToken: `demo-${String(body.userCode).toUpperCase()}` }; }
  if (is('POST', /^\/auth\/reset$/)) {
    const u = S.users.find((x) => `demo-${x.userCode}` === body.resetToken); if (!u) throw bad('Reset link expired. Start again.', 'RESET_EXPIRED');
    if (!policy.isValid(body.newPassword)) throw bad('Password does not meet the rules.', 'WEAK_PASSWORD', policy.failedRules(body.newPassword));
    u.password = body.newPassword; u.failedAttempts = 0; u.lockedUntil = null; log('PASSWORD_RESET', u.id); save(); return { ok: true, done: true };
  }
  if (is('POST', /^\/auth\/google$/)) throw new HttpError(401, 'NOT_REGISTERED', 'This Google account is not registered with your school.');
  if (is('POST', /^\/auth\/logout$/)) { if (S.sessionUser) S.sessions = S.sessions.filter((s) => s.id !== S.sessionUser.sid); S.sessionUser = null; save(); return { ok: true }; }

  // everything below needs a session
  const u = me();
  const dirty = () => save();
  if (is('GET', /^\/auth\/me$/)) return { ok: true, user: userView(u) };
  if (is('GET', /^\/settings$/)) return { ok: true, settings: S.settings };
  if (is('PUT', /^\/settings$/)) {
    need(u, 'admin', 'principal');
    const hex = /^#[0-9a-f]{6}$/i; if (body.primaryColor && !hex.test(body.primaryColor)) throw bad('Colours must look like #17463A.');
    Object.assign(S.settings, Object.fromEntries(Object.entries(body).filter(([k]) => k in S.settings && k !== 'logoUrl' && k !== 'googleClientId')));
    log('SETTINGS_UPDATED', u.id); dirty(); return { ok: true, settings: S.settings };
  }
  if (is('PUT', /^\/settings\/logo$/)) { need(u, 'admin', 'principal'); S.settings.logoUrl = body.image; log('LOGO_CHANGED', u.id); dirty(); return { ok: true, settings: S.settings }; }
  if (is('DELETE', /^\/settings\/logo$/)) { need(u, 'admin', 'principal'); S.settings.logoUrl = null; dirty(); return { ok: true, settings: S.settings }; }

  // profile
  if (is('PATCH', /^\/profile$/)) {
    ['preferredName', 'phone', 'bio', 'language'].forEach((k) => { if (body[k] !== undefined) u[k] = String(body[k]).trim() || (k === 'language' ? 'en' : null); });
    if (body.email !== undefined) { const e = String(body.email).trim().toLowerCase() || null; if (e && S.users.some((x) => x.id !== u.id && x.email === e)) throw bad('That email is already registered.', 'EMAIL_TAKEN'); u.email = e; }
    if (body.prefs) u.prefs = { ...u.prefs, ...body.prefs, notify: { ...(u.prefs.notify || {}), ...(body.prefs.notify || {}) } };
    dirty(); return { ok: true, user: userView(u) };
  }
  if (is('PUT', /^\/profile\/avatar$/)) { u.avatarUrl = body.image; dirty(); return { ok: true, user: userView(u) }; }
  if (is('DELETE', /^\/profile\/avatar$/)) { u.avatarUrl = null; dirty(); return { ok: true, user: userView(u) }; }
  if (is('POST', /^\/profile\/password$/)) {
    if (body.currentPassword !== u.password) throw new HttpError(401, 'BAD_CREDENTIALS', 'Your current password is not correct.');
    if (!policy.isValid(body.newPassword)) throw bad('Password does not meet the rules.', 'WEAK_PASSWORD', policy.failedRules(body.newPassword));
    u.password = body.newPassword; S.sessions = S.sessions.filter((s) => s.userId !== u.id || s.id === S.sessionUser.sid); log('PASSWORD_CHANGED', u.id); dirty(); return { ok: true, done: true };
  }
  if (is('GET', /^\/profile\/sessions$/)) {
    const mine = S.sessions.filter((s) => s.userId === u.id);
    if (mine.length < 2) { S.sessions.push({ id: id('sess'), userId: u.id, device: 'Safari on iPhone (example)', createdAt: Date.now() - 3 * 3600000, lastSeenAt: Date.now() - 2 * 3600000 }); dirty(); }
    return { ok: true, sessions: S.sessions.filter((s) => s.userId === u.id).map((s) => ({ id: s.id, device: s.device, ip: '127.0.0.1', lastSeenAt: s.lastSeenAt, createdAt: s.createdAt, current: s.id === S.sessionUser.sid })) };
  }
  if (is('POST', /^\/profile\/sessions\/revoke-others$/)) { S.sessions = S.sessions.filter((s) => s.userId !== u.id || s.id === S.sessionUser.sid); dirty(); return { ok: true, done: true }; }
  if ((p = is('DELETE', /^\/profile\/sessions\/(\d+)$/))) { S.sessions = S.sessions.filter((s) => s.id !== Number(p[0]) || s.userId !== u.id); dirty(); return { ok: true, done: true }; }

  // notifications
  if (is('GET', /^\/notifications$/)) { const mine = S.notifications.filter((n) => n.userId === u.id).sort((a, b) => b.createdAt - a.createdAt); return { ok: true, unread: mine.filter((n) => !n.readAt).length, items: mine.slice(0, 40).map((n) => ({ id: n.id, type: n.type, title: n.title, body: n.body, link: n.link, read: !!n.readAt, at: n.createdAt })) }; }
  if (is('POST', /^\/notifications\/read-all$/)) { S.notifications.forEach((n) => { if (n.userId === u.id) n.readAt = Date.now(); }); dirty(); return { ok: true }; }
  if ((p = is('POST', /^\/notifications\/(\d+)\/read$/))) { const n = byId(S.notifications, p[0]); if (n && n.userId === u.id) n.readAt = Date.now(); dirty(); return { ok: true }; }

  // announcements
  if (is('GET', /^\/announcements$/)) {
    const rows = S.announcements.filter((a) => ['admin', 'principal'].includes(u.role) || a.audience === 'all' || a.audience === u.role || a.authorId === u.id).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt);
    return { ok: true, items: rows.map((a) => ({ id: a.id, title: a.title, body: a.body, audience: a.audience, pinned: a.pinned, at: a.createdAt, ...authorName(a), mine: a.authorId === u.id })) };
  }
  if (is('POST', /^\/announcements$/)) {
    need(u, 'teacher', 'principal', 'admin');
    const allowed = u.role === 'teacher' ? ['learner', 'parent'] : ['all', 'learner', 'teacher', 'parent'];
    if (!allowed.includes(body.audience)) throw denied('You cannot post to that audience.');
    if (body.pinned && u.role === 'teacher') throw denied('Only the principal or admin can pin.');
    const a = { id: id('ann'), authorId: u.id, audience: body.audience, pinned: !!body.pinned, title: body.title, body: body.body, createdAt: Date.now() }; S.announcements.push(a);
    const roles = body.audience === 'all' ? ['learner', 'teacher', 'parent', 'principal', 'admin'] : [body.audience];
    notify(S.users.filter((x) => roles.includes(x.role) && x.id !== u.id).map((x) => x.id), { type: 'announcement', title: a.title, body: a.body.slice(0, 120), link: '/announcements' });
    log('ANNOUNCEMENT_POSTED', u.id, { audience: a.audience }); dirty(); return { ok: true, id: a.id };
  }
  if ((p = is('DELETE', /^\/announcements\/(\d+)$/))) { const a = byId(S.announcements, p[0]); if (!a) throw missing(); if (a.authorId !== u.id && !['admin', 'principal'].includes(u.role)) throw denied(); S.announcements = S.announcements.filter((x) => x !== a); dirty(); return { ok: true, done: true }; }
  if ((p = is('POST', /^\/announcements\/(\d+)\/pin$/))) { need(u, 'principal', 'admin'); const a = byId(S.announcements, p[0]); if (!a) throw missing(); a.pinned = !a.pinned; dirty(); return { ok: true, pinned: a.pinned }; }

  // assignments
  const asgView = (a, extra = {}) => { const t = byId(S.topics, a.topicId); return { id: a.id, classLabel: a.classLabel, topicId: a.topicId, topicTitle: t?.title, subject: t ? topicIn(t) : null, dueAt: a.dueAt, note: a.note, ...extra }; };
  if (is('GET', /^\/assignments$/)) {
    if (u.role === 'teacher') return { ok: true, items: S.assignments.filter((a) => a.teacherId === u.id).map((a) => asgView(a)) };
    const mineCodes = new Set(coursesOfLearner(u).map((c) => c.code));
    const mine = S.assignments.filter((a) => { const t = byId(S.topics, a.topicId); return a.classLabel === u.classLabel && t && mineCodes.has(t.courseCode) && t.grade === gradeOf(u); });
    return { ok: true, items: mine.map((a) => { const score = Math.round(mastery(u.id)[a.topicId]?.score || 0); return asgView(a, { score, done: score >= 80, overdue: !!a.dueAt && a.dueAt < Date.now() && score < 80 }); }) };
  }
  if (is('POST', /^\/assignments$/)) {
    need(u, 'teacher'); const topic = byId(S.topics, body.topicId); if (!topic) throw missing('Topic not found');
    const myCourse = S.courses.find((c) => c.teacherId === u.id && c.code === topic.courseCode); if (!myCourse) throw denied('You can set tasks only in the subject you teach.');
    const dueAt = body.dueAt ? new Date(body.dueAt).getTime() : null; if (dueAt && dueAt < Date.now() - DAY) throw bad('Due date is in the past.', 'BAD_DUE');
    const a = { id: id('asg'), teacherId: u.id, classLabel: body.classLabel, topicId: topic.id, dueAt, note: body.note || null }; S.assignments.push(a);
    notify(learnersOfCourse(myCourse, topic.grade, a.classLabel).map((x) => x.id), { type: 'assignment', title: `New task: ${topic.title}`, body: a.note || 'Practise this topic', link: `/learner/practice/${topic.id}` });
    log('ASSIGNMENT_CREATED', u.id); dirty(); return { ok: true, item: asgView(a) };
  }
  if ((p = is('DELETE', /^\/assignments\/(\d+)$/))) { need(u, 'teacher'); const own = byId(S.assignments, p[0]); if (!own || own.teacherId !== u.id) throw denied(); S.assignments = S.assignments.filter((a) => a.id !== Number(p[0])); dirty(); return { ok: true, done: true }; }

  // learner
  if (is('GET', /^\/learner\/dashboard$/)) { need(u, 'learner'); return { ok: true, ...learnerDash(u, q.subject) }; }
  if (is('GET', /^\/learner\/subjects$/)) { need(u, 'learner'); return { ok: true, subjects: subjectsFor(u).map((x) => x.summary), needsPathway: !u.pathway }; }
  if (is('GET', /^\/learner\/subjects\/options$/)) { need(u, 'learner'); return { ok: true, ...pathwayOptions(u) }; }
  if (is('PUT', /^\/learner\/subjects\/choice$/)) { need(u, 'learner'); const r = choosePathway(u, u, body); dirty(); return { ok: true, ...r }; }
  if (is('GET', /^\/learner\/insights$/)) { need(u, 'learner'); return { ok: true, ...insights(u) }; }
  if ((p = is('GET', /^\/learner\/practice\/(\d+)$/))) {
    need(u, 'learner'); const t = byId(S.topics, p[0]); if (!t) throw missing('Topic not found'); assertLearnerTopic(u, t);
    const qs = S.questions.filter((x) => x.topicId === t.id).sort(() => Math.random() - 0.5).slice(0, 5);
    return { ok: true, topic: { id: t.id, title: t.title, outcome: t.outcome, subject: { code: t.courseCode, name: t.subjectName } }, questions: qs.map(({ id: qid, topicId, prompt, type, options, difficulty }) => ({ id: qid, topicId, prompt, type, options, difficulty })) };
  }
  if (is('POST', /^\/learner\/answers$/)) {
    need(u, 'learner'); const qn = byId(S.questions, body.questionId); if (!qn) throw missing('Question not found'); assertLearnerTopic(u, byId(S.topics, qn.topicId));
    const correct = isCorrect(qn, body.response); const hintsUsed = body.hintsUsed || 0;
    S.attempts.push({ id: id('att'), learnerId: u.id, questionId: qn.id, topicId: qn.topicId, correct, hintsUsed, createdAt: Date.now() });
    const { band: b, ...next } = applyAnswer(mastery(u.id)[qn.topicId], { correct, hintsUsed }, new Date());
    mastery(u.id)[qn.topicId] = { ...next, lastPracticedAt: Date.now(), nextReviewAt: next.nextReviewAt ? new Date(next.nextReviewAt).getTime() : null };
    const newBadges = awardNew(u); dirty();
    return { ok: true, correct, band: b, score: next.score, solution: qn.solution || null, correctAnswer: correct ? undefined : qn.answer, newBadges };
  }

  // tutor (offline provider, same ladder and answer filter as the server)
  if (is('POST', /^\/tutor\/sessions$/)) { need(u, 'learner'); const qn = byId(S.questions, body.questionId); if (!qn) throw missing('Question not found'); assertLearnerTopic(u, byId(S.topics, qn.topicId)); const s = { id: id('tsess'), learnerId: u.id, topicId: qn.topicId, questionId: qn.id, hintLevel: 0, flagged: false, flagReason: null, updatedAt: Date.now() }; S.tutorSessions.push(s); dirty(); return { ok: true, sessionId: s.id, maxLevel: ladder.MAX_LEVEL }; }
  if ((p = is('POST', /^\/tutor\/sessions\/(\d+)\/messages$/))) {
    need(u, 'learner'); const s = byId(S.tutorSessions, p[0]); if (!s || s.learnerId !== u.id) throw missing('Tutor session not found');
    const add = (role, content, extra) => S.tutorMessages.push({ sessionId: s.id, role, content, createdAt: Date.now(), ...extra });
    add('learner', body.text);
    const chk = guardrails.inspect(body.text);
    if (chk.flag) { s.flagged = true; s.flagReason = chk.reason; s.updatedAt = Date.now(); add('tutor', chk.reply, { blocked: true }); const ft = byId(S.topics, s.topicId); const fc = ft && courseByCode(ft.courseCode); notify(fc && fc.teacherId ? [fc.teacherId] : S.users.filter((x) => x.role === 'teacher').map((x) => x.id), { type: 'flag', title: 'A tutor chat was flagged', body: `${u.fullName}${fc ? ` (${fc.name})` : ''}: ${chk.reason}`, link: '/teacher/flagged' }); log('TUTOR_FLAGGED', u.id, { reason: chk.reason }); dirty(); return { ok: true, reply: chk.reply, level: s.hintLevel, flagged: true }; }
    const qn = byId(S.questions, s.questionId); s.hintLevel = ladder.next(s.hintLevel); const level = Math.max(s.hintLevel, 1);
    const sol = (qn.solution || '').split('\n').filter(Boolean);
    const raw = ['', 'What is the question asking you to find? Write down what you know and what you need.', 'Think about which rule or formula links the quantities in this problem. What does it say in general?', 'Write down the rule or formula you need, then substitute the numbers from the question for the first step only. What do you get?', 'Think of a simpler, everyday example that works the same way as this question. Work that one out first, then apply the same idea to your own numbers.', `Full solution:\n${sol.join('\n')}\nCan you explain each step back to me?`][level];
    const g = answerGuard.check({ reply: raw, answer: qn.answer, level, fallback: fallbackHint(level) });
    s.updatedAt = Date.now(); add('tutor', g.reply, { hintLevel: level, blocked: g.blocked }); dirty();
    return { ok: true, reply: g.reply, level, maxLevel: ladder.MAX_LEVEL, flagged: false };
  }
  if ((p = is('GET', /^\/tutor\/sessions\/(\d+)$/))) {
    need(u, 'learner', 'teacher'); const s = byId(S.tutorSessions, p[0]); if (!s) throw missing('Tutor session not found');
    if (u.role === 'teacher' && !s.flagged) throw denied('Teachers can open flagged chats only');
    if (u.role === 'teacher') { const tt = byId(S.topics, s.topicId); if (!S.courses.some((c) => c.teacherId === u.id && tt && c.code === tt.courseCode)) throw denied('This chat belongs to another subject'); }
    return { ok: true, sessionId: s.id, flagged: s.flagged, messages: S.tutorMessages.filter((x) => x.sessionId === s.id).map((x) => ({ role: x.role, content: x.content, hintLevel: x.hintLevel, at: x.createdAt })) };
  }

  // dashboards
  if (is('GET', /^\/dashboards\/teacher$/)) {
    need(u, 'teacher'); const courses = S.courses.filter((c) => c.teacherId === u.id);
    if (!courses.length) return { ok: true, courses: [], subject: null, grade: null, grades: [], classes: [], classLabel: 'All', topics: [], learners: [], classAverage: 0, flagged: [] };
    const course = courses.find((c) => c.code === q.subject) || courses[0];
    const byGrade = {}; [10, 11, 12].forEach((g) => { byGrade[g] = learnersOfCourse(course, g).length; });
    const g = [10, 11, 12].includes(Number(q.grade)) ? Number(q.grade) : [10, 11, 12].find((x) => byGrade[x] > 0) || 10;
    const inGrade = learnersOfCourse(course, g); const classes = [...new Set(inGrade.map((l) => l.classLabel).filter(Boolean))].sort();
    const label = q.classLabel && classes.includes(q.classLabel) ? q.classLabel : undefined; const learners = label ? inGrade.filter((l) => l.classLabel === label) : inGrade;
    const topics = topicsOf(course.code, g); const rows = subjectRows(learners, topics);
    const mineCodes = new Set(courses.map((c) => c.code));
    const flagged = S.tutorSessions.filter((s2) => { const t = byId(S.topics, s2.topicId); return s2.flagged && t && mineCodes.has(t.courseCode); });
    return { ok: true, courses: courses.map((c) => ({ code: c.code, name: c.name })), subject: { code: course.code, name: course.name }, grade: g, grades: [10, 11, 12].map((x) => ({ grade: x, learners: byGrade[x] })), classes, classLabel: label || 'All', topics: topics.map((t) => ({ id: t.id, title: t.title })), learners: rows, classAverage: avg(rows.map((r) => r.overall)), flagged: flagged.map((s2) => ({ sessionId: s2.id, learnerId: s2.learnerId, learnerName: byId(S.users, s2.learnerId)?.fullName, reason: s2.flagReason, at: s2.updatedAt, subject: byId(S.topics, s2.topicId)?.subjectName })) };
  }
  if (is('GET', /^\/dashboards\/principal$/)) {
    need(u, 'principal'); const learners = S.users.filter((x) => x.role === 'learner' && x.active);
    const subjOverall = (l, c) => { const topics = topicsOf(c.code, gradeOf(l)); if (!topics.length) return null; const ids = new Set(topics.map((t) => t.id)); return Math.round(records(l.id).filter((r) => ids.has(r.topicId)).reduce((s2, r) => s2 + r.score, 0) / topics.length); };
    const overall = new Map(learners.map((l) => [l.id, avg(coursesOfLearner(l).map((c) => subjOverall(l, c)).filter((v) => v !== null))]));
    const labels = [...new Set(learners.map((x) => x.classLabel).filter(Boolean))].sort();
    const classes = labels.map((c) => { const ls = learners.filter((l) => l.classLabel === c); return { classLabel: c, learners: ls.length, average: avg(ls.map((l) => overall.get(l.id))), needSupport: ls.filter((l) => records(l.id).length > 0 && overall.get(l.id) < 25).length }; });
    const perSubject = S.courses.map((c) => { const takers = learners.filter((l) => takes(c, l)); return { code: c.code, name: c.name, pathway: c.pathway, teacher: teacherName(c), learners: takers.length, average: avg(takers.map((l) => subjOverall(l, c)).filter((v) => v !== null)) }; });
    const course = courseByCode(q.subject) || courseByCode('MATH'); const g = [10, 11, 12].includes(Number(q.grade)) ? Number(q.grade) : 10;
    const takers = learners.filter((l) => gradeOf(l) === g && takes(course, l)); const tk = new Set(takers.map((l) => l.id));
    const cov = topicsOf(course.code, g).map((t) => { const f = S.users.filter((l) => tk.has(l.id)).map((l) => mastery(l.id)[t.id]).filter(Boolean); return { topicId: t.id, title: t.title, learnersStarted: f.length, average: avg(f.map((r) => r.score)) }; });
    return { ok: true, schoolAverage: avg(classes.map((c) => c.average)), classes, subjects: perSubject, coverage: { subject: { code: course.code, name: course.name }, grade: g, learners: takers.length, topics: cov } };
  }
  if (is('GET', /^\/dashboards\/parent\/children$/)) { need(u, 'parent'); return { ok: true, children: S.links.filter((l) => l.parentId === u.id).map((l) => { const c = byId(S.users, l.learnerId); return { learnerId: c.id, name: c.fullName, classLabel: c.classLabel, grade: c.grade, canViewTutorChats: l.canViewTutorChats }; }) }; }
  if ((p = is('GET', /^\/dashboards\/parent\/children\/(\d+)\/summary$/))) {
    need(u, 'parent'); const lid = Number(p[0]); if (!S.links.some((l) => l.parentId === u.id && l.learnerId === lid)) throw denied('That learner is not linked to your account.');
    const dash = learnerDash(byId(S.users, lid), q.subject); const att = attemptsOf(lid, 14); const week = att.filter((a) => a.createdAt >= Date.now() - 7 * DAY);
    log('PARENT_VIEWED_SUMMARY', u.id); dirty();
    return { ok: true, subject: dash.subject, subjects: dash.subjects.map(({ code, name, teacher, overall, mastered, totalTopics, started }) => ({ code, name, teacher, overall, mastered, totalTopics, started })), overall: avg(dash.subjects.map((x) => x.overall)), target: dash.target, mastered: dash.mastered, totalTopics: dash.totalTopics, subjectOverall: dash.overall, weekly: { questionsAnswered: week.length, correct: week.filter((a) => a.correct).length, daysActive: new Set(week.map((a) => new Date(a.createdAt).toDateString())).size }, activity: gami.activity(att, new Date(), 14), next: dash.next, topicMap: dash.topicMap.map(({ title, band: b, score }) => ({ title, band: b, score })) };
  }

  // admin
  if (path.startsWith('/admin')) {
    need(u, 'admin');
    const row = (x) => ({ ...userView(x), active: x.active, lockedUntil: x.lockedUntil, lastLoginAt: x.lastLoginAt });
    const prefix = { teacher: 'TCH', parent: 'PAR', principal: 'PRN', admin: 'ADM' };
    const issue = (inp) => {
      if (!inp.fullName || inp.fullName.trim().length < 3) throw bad('fullName: String must contain at least 3 character(s)');
      if (!['learner', 'teacher', 'parent', 'principal', 'admin'].includes(inp.role)) throw bad('role: Invalid enum value');
      if (inp.email && S.users.some((x) => x.email === inp.email.toLowerCase())) throw bad('That email is already registered.', 'EMAIL_TAKEN');
      const seq = S.users.filter((x) => x.role === inp.role).length + 1;
      const code = (inp.userCode || (inp.role === 'learner' ? `${inp.fullName.split(/\s+/).map((w) => w[0]).join('').slice(0, 3).toUpperCase().padEnd(3, 'X')}-${inp.classLabel || '10A'}-${String(seq).padStart(3, '0')}` : `${prefix[inp.role]}-${String(seq).padStart(4, '0')}`)).toUpperCase();
      if (S.users.some((x) => x.userCode === code)) throw bad('That school ID already exists.', 'CODE_TAKEN');
      const pw = temp();
      const nu = { id: id('user'), userCode: code, role: inp.role, fullName: inp.fullName.trim(), email: inp.email ? inp.email.toLowerCase() : null, preferredName: null, phone: null, bio: null, avatarUrl: null, language: 'en', grade: inp.role === 'learner' ? inp.grade || 10 : null, classLabel: inp.classLabel || null, pathway: null, prefs: DEFAULT_PREFS, active: true, mustChangePassword: true, failedAttempts: 0, lockedUntil: null, lastLoginAt: null, password: pw };
      S.users.push(nu); log('ACCOUNT_ISSUED', u.id, { role: nu.role }); if (nu.role === 'learner' && inp.pathway && inp.courseCodes?.length) choosePathway(u, nu, { pathway: inp.pathway, courseCodes: inp.courseCodes }); return { user: nu, tempPassword: pw };
    };
    if (is('GET', /^\/admin\/courses$/)) {
      const ls = S.users.filter((x) => x.role === 'learner' && x.active);
      return { ok: true, courses: S.courses.map((c) => { const byGrade = {}; ls.filter((l) => takes(c, l)).forEach((l) => { byGrade[gradeOf(l)] = (byGrade[gradeOf(l)] || 0) + 1; }); return { ...courseView(c), learners: Object.values(byGrade).reduce((a, b2) => a + b2, 0), byGrade }; }) };
    }
    if ((p = is('PATCH', /^\/admin\/courses\/(\d+)\/teacher$/))) {
      const c = byId(S.courses, p[0]); if (!c) throw missing('Subject not found');
      if (body.teacherId === null) c.teacherId = null; else { const t = byId(S.users, body.teacherId); if (!t || t.role !== 'teacher') throw bad('Pick a teacher account from this school.', 'BAD_TEACHER'); c.teacherId = t.id; notify([t.id], { type: 'system', title: `You now teach ${c.name}`, body: 'Learners enrolled in this subject will appear on your dashboard.', link: '/teacher' }); }
      log('SUBJECT_TEACHER_SET', u.id, { course: c.code, teacherId: c.teacherId }); dirty(); return { ok: true, course: courseView(c) };
    }
    if ((p = is('GET', /^\/admin\/learners\/(\d+)\/subjects$/))) { const l = byId(S.users, p[0]); if (!l || l.role !== 'learner') throw missing('Learner not found'); return { ok: true, ...pathwayOptions(l) }; }
    if ((p = is('PUT', /^\/admin\/learners\/(\d+)\/subjects$/))) { const l = byId(S.users, p[0]); if (!l || l.role !== 'learner') throw missing('Learner not found'); const r = choosePathway(u, l, body); dirty(); return { ok: true, ...r }; }
    if (is('GET', /^\/admin\/users\/all$/)) return { ok: true, users: S.users.filter((x) => !q.role || x.role === q.role).map((x) => ({ ...userView(x), active: x.active })) };
    if (is('GET', /^\/admin\/users$/)) {
      const page = Number(q.page || 1), size = Number(q.pageSize || 15); const term = (q.q || '').toLowerCase();
      const all = S.users.filter((x) => (!q.role || x.role === q.role) && (!term || [x.fullName, x.userCode, x.email || ''].some((f) => f.toLowerCase().includes(term))));
      return { ok: true, total: all.length, page, pageSize: size, users: all.slice((page - 1) * size, page * size).map(row) };
    }
    if (is('POST', /^\/admin\/users$/)) { const r = issue(body); dirty(); return { ok: true, user: userView(r.user), tempPassword: r.tempPassword, note: 'Shown once.' }; }
    if (is('POST', /^\/admin\/users\/bulk$/)) {
      const results = (body.rows || []).map((raw) => { try { const r = issue(raw); return { ok: true, fullName: r.user.fullName, role: r.user.role, userCode: r.user.userCode, tempPassword: r.tempPassword }; } catch (e) { return { ok: false, fullName: raw.fullName, role: raw.role, error: e.message }; } });
      log('ACCOUNTS_BULK_ISSUED', u.id, { count: results.filter((r) => r.ok).length }); dirty(); return { ok: true, results };
    }
    if ((p = is('PATCH', /^\/admin\/users\/(\d+)$/))) {
      const t = byId(S.users, p[0]); if (!t) throw missing('Account not found');
      if (body.fullName !== undefined) t.fullName = body.fullName.trim(); if (body.classLabel !== undefined) t.classLabel = body.classLabel.trim() || null;
      if (body.email !== undefined) { const e = body.email.trim().toLowerCase() || null; if (e && S.users.some((x) => x.id !== t.id && x.email === e)) throw bad('That email is already registered.', 'EMAIL_TAKEN'); t.email = e; }
      log('ACCOUNT_EDITED', u.id); dirty(); return { ok: true, user: userView(t) };
    }
    if ((p = is('PATCH', /^\/admin\/users\/(\d+)\/active$/))) { const t = byId(S.users, p[0]); if (!t) throw missing('Account not found'); t.active = !!body.active; log(t.active ? 'ACCOUNT_ENABLED' : 'ACCOUNT_DISABLED', u.id); dirty(); return { ok: true, user: userView(t) }; }
    if ((p = is('POST', /^\/admin\/users\/(\d+)\/reset-password$/))) { const t = byId(S.users, p[0]); if (!t) throw missing('Account not found'); t.password = temp(); t.mustChangePassword = true; t.failedAttempts = 0; t.lockedUntil = null; log('TEMP_PASSWORD_ISSUED', u.id); dirty(); return { ok: true, user: userView(t), tempPassword: t.password }; }
    if (is('GET', /^\/admin\/parent-links$/)) return { ok: true, links: S.links.map((l) => { const a = byId(S.users, l.parentId), c = byId(S.users, l.learnerId); return { id: l.id, parent: { id: a.id, name: a.fullName, userCode: a.userCode }, learner: { id: c.id, name: c.fullName, userCode: c.userCode, classLabel: c.classLabel }, canViewTutorChats: l.canViewTutorChats, verifiedBySchoolAt: Date.now() }; }) };
    if (is('POST', /^\/admin\/parent-links$/)) {
      const a = byId(S.users, body.parentId), c = byId(S.users, body.learnerId); if (!a || a.role !== 'parent' || !c || c.role !== 'learner') throw bad('Pick one parent and one learner.');
      if (S.links.some((l) => l.parentId === a.id && l.learnerId === c.id)) throw bad('Already linked.');
      const l = { id: id('link'), parentId: a.id, learnerId: c.id, canViewTutorChats: false }; S.links.push(l); log('PARENT_LINKED', u.id); dirty(); return { ok: true, link: l };
    }
    if ((p = is('PATCH', /^\/admin\/parent-links\/(\d+)\/consent$/))) { const l = byId(S.links, p[0]); if (!l) throw missing('Link not found'); l.canViewTutorChats = !!body.canViewTutorChats; log(l.canViewTutorChats ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED', u.id); dirty(); return { ok: true }; }
    if ((p = is('DELETE', /^\/admin\/parent-links\/(\d+)$/))) { S.links = S.links.filter((l) => l.id !== Number(p[0])); log('PARENT_UNLINKED', u.id); dirty(); return { ok: true, done: true }; }
    if (is('GET', /^\/admin\/audit$/)) {
      const page = Number(q.page || 1), size = Number(q.pageSize || 25); const term = (q.q || '').toLowerCase();
      const all = S.audit.filter((e) => (!q.action || e.action.includes(q.action)) && (!term || (byId(S.users, e.actorId)?.fullName || '').toLowerCase().includes(term) || (byId(S.users, e.actorId)?.userCode || '').toLowerCase().includes(term)));
      return { ok: true, total: all.length, page, pageSize: size, entries: all.slice((page - 1) * size, page * size).map((e) => { const a = byId(S.users, e.actorId); return { id: e.id, action: e.action, at: e.at, actor: a ? { name: a.fullName, userCode: a.userCode, role: a.role } : null, meta: e.meta }; }) };
    }
  }
  throw missing(`The prototype has no route for ${method} ${path}`);
}
void SCHOOL_ID;
