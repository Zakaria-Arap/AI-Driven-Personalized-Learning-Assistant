const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/models');
const userRepo = require('../../src/repositories/userRepository');

describe('Profile preferences - announcementEmail', () => {
  let agent, user;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    user = await userRepo.create({
      schoolId: 1,
      userCode: 'TEST-001',
      role: 'learner',
      fullName: 'Test User',
      passwordHash: 'hash',
      mustChangePassword: false,
      language: 'en'
    });
  });

  beforeEach(() => {
    agent = request.agent(app);
  });

  test('save announcementEmail=false and read it back', async () => {
    agent.auth = { userId: user.id, role: user.role, schoolId: user.schoolId };
    
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
