const request = require('supertest');
const app = require('../../src/app');
const bcrypt = require('bcryptjs');
const { sequelize, School, User } = require('../../src/models');

describe('Profile preferences - announcementEmail', () => {
  let school, learner;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    school = await School.create({ name: 'Test School', code: 'TST', subdomain: 'test', timezone: 'UTC' });
    learner = await User.create({
      schoolId: school.id,
      userCode: 'LRN-001',
      role: 'learner',
      fullName: 'Test Learner',
      passwordHash: await bcrypt.hash('Test1234!', 10),
      mustChangePassword: false,
      language: 'en',
      grade: 10
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('save announcementEmail=false and read it back', async () => {
    const agent = request.agent(app);
    
    const loginRes = await agent
      .post('/auth/login')
      .send({ userCode: learner.userCode, password: 'Test1234!' });
    
    expect(loginRes.status).toBe(200);
    
    const saveRes = await agent
      .patch('/profile')
      .send({ prefs: { notify: { announcementEmail: false, announcements: true } } });
    
    expect(saveRes.status).toBe(200);
    expect(saveRes.body.ok).toBe(true);
    
    const getRes = await agent.get('/auth/me');
    expect(getRes.status).toBe(200);
    expect(getRes.body.user.prefs.notify.announcementEmail).toBe(false);
    expect(getRes.body.user.prefs.notify.announcements).toBe(true);
  });
});
