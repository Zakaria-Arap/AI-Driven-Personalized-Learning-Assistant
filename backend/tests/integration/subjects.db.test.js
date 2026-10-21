// Needs the seeded development database (npm run db:migrate && npm run db:seed). Skips itself when it is not reachable.
const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/models');

let up = false;
beforeAll(async () => { try { await sequelize.authenticate(); up = (await sequelize.query("SHOW TABLES LIKE 'courses'"))[0].length > 0; } catch { up = false; } });
afterAll(async () => { try { await sequelize.close(); } catch { /* ignore */ } });

async function as(userCode, password) {
  const a = request.agent(app);
  const r = await a.post('/api/auth/login').send({ userCode, password });
  if (r.status !== 200) throw new Error(`login ${userCode} failed: ${r.status} ${JSON.stringify(r.body)}`);
  return a;
}
const guard = (fn) => async () => { if (!up) return; await fn(); };
const body = (r) => r.body.data || r.body;

test('a learner sees only the subjects of their pathway', guard(async () => {
  const a = await as('LEARNER', 'learner@1234');
  const r = await a.get('/api/learner/subjects');
  const codes = body(r).subjects.map((s) => s.code);
  expect(codes).toEqual(expect.arrayContaining(['ENG', 'KIS', 'MATH', 'BIO', 'CHEM', 'PHY']));
  expect(codes).not.toContain('HIST');
  expect(body(r).subjects.every((s) => s.teacher)).toBe(true);
}));

test('learners cannot open another pathway\'s subject, topics or questions', guard(async () => {
  const a = await as('LEARNER', 'learner@1234');
  expect((await a.get('/api/learner/dashboard?subject=HIST')).status).toBe(404);
  const [[t]] = await sequelize.query("SELECT t.id FROM topics t JOIN strands s ON s.id=t.strand_id JOIN subjects u ON u.id=s.subject_id WHERE u.code='HIST10' LIMIT 1");
  expect((await a.get(`/api/learner/practice/${t.id}`)).status).toBe(403);
  const [[q]] = await sequelize.query(`SELECT id FROM questions WHERE topic_id=${t.id} LIMIT 1`);
  expect((await a.post('/api/learner/answers').send({ questionId: q.id, response: 'x' })).status).toBe(403);
  expect((await a.post('/api/tutor/sessions').send({ questionId: q.id })).status).toBe(403);
}));

test('multiple-choice questions are served without the answer and marked on the answer text', guard(async () => {
  const a = await as('LEARNER', 'learner@1234');
  const [[t]] = await sequelize.query("SELECT t.id FROM topics t JOIN strands s ON s.id=t.strand_id JOIN subjects u ON u.id=s.subject_id WHERE u.code='BIO10' LIMIT 1");
  const set = body(await a.get(`/api/learner/practice/${t.id}`));
  expect(set.topic.subject.code).toBe('BIO');
  const q = set.questions[0];
  expect(q.type).toBe('choice');
  expect(Array.isArray(q.options)).toBe(true);
  expect(q.answer).toBeUndefined();
  const [[row]] = await sequelize.query(`SELECT answer FROM questions WHERE id=${q.id}`);
  const res = body(await a.post('/api/learner/answers').send({ questionId: q.id, response: row.answer }));
  expect(res.correct).toBe(true);
}));

test('a subject teacher sees only the learners enrolled in their subject', guard(async () => {
  const phy = body(await (await as('TCH-0231', 'Chalk#2026')).get('/api/dashboards/teacher?subject=PHY&grade=10'));
  const names = phy.learners.map((l) => l.name);
  expect(phy.subject.code).toBe('PHY');
  expect(names).toContain('Brian Mwangi'); // BRM-10B-007 takes Physics
  expect(names).not.toContain('Zawadi Kamau'); // ZAK-10B-021 is on the social pathway
  const bio = body(await (await as('TCH-BIO', 'teacher@1234')).get('/api/dashboards/teacher?subject=PHY'));
  expect(bio.subject.code).toBe('BIO'); // asking for someone else's subject falls back to their own
  expect(bio.courses.map((c) => c.code)).toEqual(['BIO']);
}));

test('a teacher can set tasks only in their own subject', guard(async () => {
  const a = await as('TCH-BIO', 'teacher@1234');
  const [[t]] = await sequelize.query("SELECT t.id FROM topics t JOIN strands s ON s.id=t.strand_id JOIN subjects u ON u.id=s.subject_id WHERE u.code='PHY10' LIMIT 1");
  const r = await a.post('/api/assignments').send({ classLabel: '10B', topicId: t.id });
  expect(r.status).toBe(403);
}));

test('choosing subjects checks the pathway and the limit of three', guard(async () => {
  const a = await as('KOC-12A-009', 'Learn#2026');
  expect((await a.put('/api/learner/subjects/choice').send({ pathway: 'social', courseCodes: ['PHY'] })).status).toBe(400);
  expect((await a.put('/api/learner/subjects/choice').send({ pathway: 'social', courseCodes: ['CRE', 'GEO', 'BUS', 'HIST'] })).status).toBe(400);
  expect((await a.put('/api/learner/subjects/choice').send({ pathway: 'social', courseCodes: ['HIST', 'GEO', 'CRE'] })).status).toBe(200);
}));

test('admin lists subjects with their teachers and can reassign one', guard(async () => {
  const a = await as('ADMIN', 'admin@1234');
  const list = body(await a.get('/api/admin/courses')).courses;
  expect(list).toHaveLength(11);
  expect(list.every((c) => c.teacher)).toBe(true);
  const hist = list.find((c) => c.code === 'HIST');
  const same = await a.patch(`/api/admin/courses/${hist.id}/teacher`).send({ teacherId: hist.teacher.id });
  expect(same.status).toBe(200);
  expect((await a.patch(`/api/admin/courses/${hist.id}/teacher`).send({ teacherId: 999999 })).status).toBe(400);
}));
