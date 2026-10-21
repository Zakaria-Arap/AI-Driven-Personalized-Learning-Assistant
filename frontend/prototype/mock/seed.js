// Seed data for the standalone prototype. Mirrors the real demo seeders so both show the same school.
import catalogue from '../../../backend/src/seeders/data/courses/index.js';
import { applyAnswer } from '../../../backend/src/services/recommendation/masteryEngine.js';

export const SCHOOL_ID = 1;
export const DEFAULT_PREFS = { theme: 'system', fontScale: 100, reducedMotion: false, density: 'comfortable', dailyGoal: 5, notify: { announcements: true, assignments: true, badges: true, announcementEmail: true } };
const DAY = 86400000;

export const PATHWAYS = { stem: 'STEM', social: 'Social Sciences' };
export const MAX_ELECTIVES = 3;

// Every course, every grade. Subject code = course code + grade (PHY11). Same order as the real importer.
export function buildCurriculum() {
  const topics = []; const questions = []; let qid = 1; let tid = 1;
  for (const c of catalogue) {
    for (const [grade, strands] of Object.entries(c.grades)) {
      const idByKey = {};
      strands.forEach((st) => st.topics.forEach((t) => { idByKey[t.key] = tid++; }));
      let id = tid - Object.keys(idByKey).length;
      strands.forEach((st) => st.topics.forEach((t) => {
        topics.push({ id, key: t.key, title: t.title, outcome: t.outcome, strand: st.name, position: id, prerequisiteIds: (t.prereq || []).map((k) => idByKey[k]).filter(Boolean), subjectCode: `${c.code}${grade}`, courseCode: c.code, subjectName: c.name, grade: Number(grade) });
        t.questions.forEach((q) => questions.push({ id: qid++, topicId: id, ...q }));
        id++;
      }));
    }
  }
  return { topics, questions };
}

const U = (id, userCode, role, fullName, extra = {}) => ({ id, userCode, role, fullName, email: null, preferredName: null, phone: null, bio: null, avatarUrl: null, language: 'en', grade: role === 'learner' ? 10 : null, classLabel: null, pathway: null, prefs: DEFAULT_PREFS, active: true, mustChangePassword: false, failedAttempts: 0, lockedUntil: null, lastLoginAt: null, ...extra });

// Subject teachers and their course codes (same as the real demo seeders).
const SUBJECT_TEACHERS = [['ENG', 'TCH-ENG', 'Ms. Grace Wanjiku'], ['KIS', 'TCH-KIS', 'Mwalimu Hamisi Juma'], ['BIO', 'TCH-BIO', 'Dr. Lydia Moraa'], ['CHEM', 'TCH-CHEM', 'Mr. Peter Ouma'], ['CS', 'TCH-CS', 'Ms. Faith Njeri'], ['HIST', 'TCH-HIST', 'Mr. Samuel Kiprono'], ['GEO', 'TCH-GEO', 'Ms. Esther Akinyi'], ['CRE', 'TCH-CRE', 'Rev. Daniel Mutua'], ['BUS', 'TCH-BUS', 'Mr. Hassan Ali']];
// learner id -> [pathway, elective course codes]
const CHOICES = { 8: ['stem', ['BIO', 'CHEM', 'PHY']], 6: ['stem', ['BIO', 'PHY', 'CS']], 7: ['social', ['HIST', 'GEO', 'BUS']], 5: ['social', ['CRE', 'GEO', 'BUS']], 13: ['stem', ['BIO', 'CHEM', 'CS']], 14: ['social', ['HIST', 'GEO', 'CRE']] };

export function seedState(now = Date.now()) {
  const { topics, questions } = buildCurriculum();
  const users = [
    U(1, 'ADM-0001', 'admin', 'School Office', { password: 'Office#2026', email: 'office@demo.somo.ke' }),
    U(2, 'PRN-0001', 'principal', 'Mrs. A. Njeri', { password: 'Lead#2026', email: 'principal@demo.somo.ke' }),
    U(3, 'TCH-0231', 'teacher', 'Mr. J. Kamau', { password: 'Chalk#2026', email: 'kamau@demo.somo.ke', classLabel: '10B' }),
    U(4, 'PAR-0872', 'parent', 'J. Otieno', { password: 'Family#2026', email: 'otieno.parent@demo.somo.ke' }),
    U(5, 'AMA-10B-014', 'learner', 'Amani Otieno', { password: 'Welcome-2026', mustChangePassword: true, classLabel: '10B', email: 'amani@demo.somo.ke' }),
    U(6, 'BRM-10B-007', 'learner', 'Brian Mwangi', { password: 'Welcome-2026', mustChangePassword: true, classLabel: '10B' }),
    U(7, 'ZAK-10B-021', 'learner', 'Zawadi Kerubo', { password: 'Welcome-2026', mustChangePassword: true, classLabel: '10B' }),
    U(8, 'LEARNER', 'learner', 'Dev Learner', { password: 'learner@1234', classLabel: '10B' }),
    U(9, 'TEACHER', 'teacher', 'Dev Teacher', { password: 'teacher@1234', classLabel: '10B' }),
    U(10, 'PARENT', 'parent', 'Dev Parent', { password: 'parent@1234' }),
    U(11, 'PRINCIPAL', 'principal', 'Dev Principal', { password: 'principal@1234' }),
    U(12, 'ADMIN', 'admin', 'Dev Admin', { password: 'admin@1234' }),
    U(13, 'MAT-11A-003', 'learner', 'Mercy Atieno', { password: 'Learn#2026', grade: 11, classLabel: '11A' }),
    U(14, 'KOC-12A-009', 'learner', 'Kevin Ochieng', { password: 'Learn#2026', grade: 12, classLabel: '12A' }),
    ...SUBJECT_TEACHERS.map(([, code, name], i) => U(15 + i, code, 'teacher', name, { password: 'teacher@1234' })),
  ];
  for (const [uid, [pathway]] of Object.entries(CHOICES)) users.find((x) => x.id === Number(uid)).pathway = pathway;

  // one course per subject, each with its own teacher
  const teacherId = { MATH: 9, PHY: 3, ...Object.fromEntries(SUBJECT_TEACHERS.map(([c], i) => [c, 15 + i])) };
  const courses = catalogue.map((c, i) => ({ id: i + 1, code: c.code, name: c.name, pathway: c.pathway, teacherId: teacherId[c.code] || null, position: i }));
  const courseId = (code) => courses.find((c) => c.code === code).id;
  const enrol = Object.fromEntries(Object.entries(CHOICES).map(([uid, [, codes]]) => [uid, codes.map(courseId)]));

  // deterministic history: maths first (same recipe as the real demo seeder), then the other subjects each learner takes
  let seed = 42; const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const attempts = []; const mastery = {}; let aid = 1;
  const grow = (uid, pool, cfg, wide) => {
    if (!pool.length) return;
    const qs = questions.filter((q) => pool.includes(q.topicId));
    const rows = [];
    for (let d = cfg.days; d >= 0; d--) {
      if (d > 3 && rnd() < 0.28) continue;
      const n = 2 + Math.floor(rnd() * 5);
      for (let i = 0; i < n; i++) {
        const q = qs[Math.floor(rnd() * Math.min(qs.length, wide ? 6 + (cfg.days - d) * 2 : 3 + Math.floor((cfg.days - d) / 6) * 3))];
        const correct = rnd() < cfg.skill;
        const at = new Date(now - d * DAY - Math.floor(rnd() * 6) * 3600000); at.setHours(9 + Math.floor(rnd() * 9));
        rows.push({ id: aid++, learnerId: Number(uid), questionId: q.id, topicId: q.topicId, correct, hintsUsed: correct && rnd() < 0.3 ? 1 : 0, createdAt: at.getTime() });
      }
    }
    rows.sort((a, b) => a.createdAt - b.createdAt);
    mastery[uid] = mastery[uid] || {};
    for (const r of rows) {
      const { band, ...next } = applyAnswer(mastery[uid][r.topicId], { correct: r.correct, hintsUsed: r.hintsUsed }, new Date(r.createdAt));
      mastery[uid][r.topicId] = { ...next, lastPracticedAt: r.createdAt, nextReviewAt: next.nextReviewAt ? new Date(next.nextReviewAt).getTime() : null };
    }
    attempts.push(...rows);
  };
  const topicsOf = (codes, grade) => topics.filter((t) => codes.includes(t.courseCode) && t.grade === grade).map((t) => t.id);
  const profiles = { 8: { days: 38, skill: 0.72 }, 6: { days: 44, skill: 0.8 }, 7: { days: 18, skill: 0.5 }, 13: { days: 26, skill: 0.78 }, 14: { days: 26, skill: 0.62 } };
  for (const [uid, cfg] of Object.entries(profiles)) {
    const u = users.find((x) => x.id === Number(uid));
    grow(uid, topicsOf(['MATH'], u.grade), cfg);                                        // maths history
    grow(uid, topicsOf(['ENG', 'KIS', ...(CHOICES[uid] ? CHOICES[uid][1] : [])], u.grade), { ...cfg, days: Math.min(cfg.days, 26) }, true); // the rest of their subjects
  }

  const badges = { 8: ['first_step', 'sharp_10', 'streak_3'], 6: ['first_step', 'sharp_10', 'streak_3'], 7: ['first_step'] };
  const n = (id, userId, type, title, body, link, mins) => ({ id, userId, type, title, body, link, readAt: null, createdAt: now - mins * 60000 });
  const quad = topics.find((t) => t.title === 'Quadratic expressions').id;
  const forces = topics.find((t) => t.title === "Forces and Newton's laws").id;
  return {
    v: 2, sessionUser: null, nextIds: { user: 100, link: 10, ann: 10, asg: 10, note: 100, audit: 100, sess: 10, tsess: 1, att: aid },
    topics, questions, users, courses, enrol, attempts, mastery, badges,
    settings: { name: 'Demo Senior School', tagline: 'Learn at your own pace', logoUrl: null, primaryColor: '#17463A', accentColor: '#F2B23A', defaultMode: 'light', radius: 'soft', fontStyle: 'classic', footerText: 'Demo Senior School, Kisii County', supportEmail: 'support@demo.somo.ke', googleClientId: '' },
    links: [{ id: 1, parentId: 4, learnerId: 5, canViewTutorChats: false }, { id: 2, parentId: 10, learnerId: 8, canViewTutorChats: false }],
    announcements: [
      { id: 1, authorId: 2, audience: 'all', pinned: true, title: 'Welcome to Somo', body: 'Somo is now live for every core subject in Grades 10 to 12. Practise a little every day. Your tutor gives hints, not answers.', createdAt: now - 6 * DAY },
      { id: 2, authorId: 9, audience: 'learner', pinned: false, title: 'Quadratics test on Friday', body: 'Revise Quadratic expressions and equations. Use the tutor hints before you ask me.', createdAt: now - 2 * DAY },
    ],
    assignments: [
      { id: 1, teacherId: 9, classLabel: '10B', topicId: quad, dueAt: now + 5 * DAY, note: 'Reach 80% before the Friday test.' },
      { id: 2, teacherId: 3, classLabel: '10B', topicId: forces, dueAt: now + 7 * DAY, note: 'Practise F = ma before the next lesson.' },
    ],
    notifications: [8, 5, 6].flatMap((uid, i) => [n(1 + i * 2, uid, 'announcement', 'Welcome to Somo', 'Practise a little every day.', '/announcements', 600), n(2 + i * 2, uid, 'assignment', 'New task: Quadratic expressions', 'Reach 80% before the Friday test.', `/learner/practice/${quad}`, 120)]),
    audit: [], tutorSessions: [], tutorMessages: [], sessions: [],
  };
}
