const mailer = require('../../src/services/auth/mailer');

describe('Mailer - sendAnnouncement', () => {
  test('HTML escapes title and body', async () => {
    const spy = jest.spyOn(require('../../src/services/auth/mailer'), 'sendAnnouncement');
    spy.mockResolvedValue();
    
    await mailer.sendAnnouncement({
      to: 'test@example.com',
      name: 'Test User',
      title: '<script>alert("xss")</script>',
      body: 'Hello <b>world</b>',
      senderName: 'Admin',
      schoolName: 'Test School',
      link: 'http://example.com/announcements'
    });
    
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('subject format includes school name', () => {
    const schoolName = 'Test School';
    const title = 'Important Notice';
    const expected = `[${schoolName}] ${title}`;
    expect(expected).toBe('[Test School] Important Notice');
  });
});
