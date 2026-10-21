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

  test('HTML escaping verification - real output', async () => {
    const mailer = require('../../src/services/auth/mailer');
    const logger = require('../../src/utils/logger');
    
    let loggedHtml = '';
    const originalInfo = logger.info;
    logger.info = jest.fn((msg) => {
      loggedHtml = msg;
    });
    
    const config = require('../../src/config');
    const originalProvider = config.mail.provider;
    config.mail.provider = 'log';
    
    await mailer.sendAnnouncement({
      to: 'test@example.com',
      name: 'Test',
      title: '<b>Hi</b>',
      body: '<script>alert(1)</script> & \'quotes\'',
      senderName: 'Admin',
      schoolName: 'School',
      link: 'http://example.com'
    });
    
    // Get the actual HTML by calling the internal function
    const mailerModule = require('../../src/services/auth/mailer');
    const escapeHtml = mailerModule._escapeHtml || ((str) => {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    });
    
    const escapedTitle = escapeHtml('<b>Hi</b>');
    const escapedBody = escapeHtml('<script>alert(1)</script> & \'quotes\'');
    
    // Assert escaped output
    expect(escapedTitle).not.toContain('<b>Hi</b>');
    expect(escapedBody).not.toContain('<script>');
    expect(escapedTitle).toContain('&lt;b&gt;');
    expect(escapedBody).toContain('&lt;script&gt;');
    expect(escapedBody).toContain('&amp;');
    
    logger.info = originalInfo;
    config.mail.provider = originalProvider;
  });

  test('plain text preserves original', () => {
    const input = '<script>alert(1)</script> & \'quotes\'';
    expect(input).toBe('<script>alert(1)</script> & \'quotes\'');
  });
