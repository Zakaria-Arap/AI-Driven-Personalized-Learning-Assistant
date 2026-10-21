const request = require('supertest');
const app = require('../../src/app');

test('health endpoint answers without a database', async () => {
  const res = await request(app).get('/api/health');
  expect(res.status).toBe(200);
  expect(res.body.ok).toBe(true);
});
test('protected routes refuse anonymous callers', async () => {
  for (const url of ['/api/learner/dashboard', '/api/dashboards/teacher', '/api/admin/users', '/api/auth/me']) {
    const res = await request(app).get(url);
    expect(res.status).toBe(401);
  }
});
test('login validates its input before touching the database', async () => {
  const res = await request(app).post('/api/auth/login').send({ userCode: '' });
  expect(res.status).toBe(400);
  expect(res.body.code).toBe('VALIDATION');
});
test('unknown routes return JSON 404', async () => {
  const res = await request(app).get('/api/nope');
  expect(res.status).toBe(404);
});
