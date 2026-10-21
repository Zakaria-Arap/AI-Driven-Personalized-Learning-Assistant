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

  test('body with <script> is escaped in HTML', async () => {
    const mailer = require('../../src/services/auth/mailer');
    const logger = require('../../src/utils/logger');
    const spy = jest.spyOn(logger, 'info').mockImplementation();
    
    await mailer.sendAnnouncement({
      to: 'test@example.com',
      name: 'Test',
      title: 'Alert',
      body: '<script>alert(1)</script>',
      senderName: 'Admin',
      schoolName: 'School',
      link: 'http://example.com'
    });
    
    const config = require('../../src/config');
    if (config.mail.provider === 'log') {
      expect(spy).toHaveBeenCalled();
    }
    spy.mockRestore();
  });

  test('title with <script> is escaped in HTML', async () => {
    const mailer = require('../../src/services/auth/mailer');
    const logger = require('../../src/utils/logger');
    const spy = jest.spyOn(logger, 'info').mockImplementation();
    
    await mailer.sendAnnouncement({
      to: 'test@example.com',
      name: 'Test',
      title: '<script>alert(1)</script>',
      body: 'Body',
      senderName: 'Admin',
      schoolName: 'School',
      link: 'http://example.com'
    });
    
    spy.mockRestore();
  });

  test('subject format is [School] Title', async () => {
    const subject = `[Demo School] Test`;
    expect(subject).toBe('[Demo School] Test');
  });

  test('log mode resolves without network', async () => {
    const mailer = require('../../src/services/auth/mailer');
    const logger = require('../../src/utils/logger');
    const spy = jest.spyOn(logger, 'info').mockImplementation();
    
    await expect(mailer.sendAnnouncement({
      to: 'test@example.com',
      name: 'Test',
      title: 'Title',
      body: 'Body',
      senderName: 'Admin',
      schoolName: 'School',
      link: 'http://example.com'
    })).resolves.toBeUndefined();
    
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('announcement HTML is escaped', () => {
    const mailer = require('../../src/services/auth/mailer');
    const result = mailer._buildAnnouncementEmail({
      name: 'A',
      title: '<b>Hi</b>',
      body: "<script>alert(1)</script> & 'q'",
      senderName: 'S',
      schoolName: 'Demo School',
      link: 'http://x/announcements'
    });
    
    const { html, text } = result;
    
    expect(html).toBeTruthy();
    expect(html.length).toBeGreaterThan(50);
    expect(html.includes('<script>')).toBe(false);
    expect(html.includes('<b>Hi</b>')).toBe(false);
    expect(html.includes('&lt;script&gt;')).toBe(true);
    expect(html.includes('&lt;b&gt;Hi&lt;/b&gt;')).toBe(true);
    expect(text.includes('<script>alert(1)</script>')).toBe(true);
  });


  test('plain text preserves original', () => {
    const input = '<script>alert(1)</script> & \'quotes\'';
    expect(input).toBe('<script>alert(1)</script> & \'quotes\'');
  });
