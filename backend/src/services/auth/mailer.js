// Delivery of reset codes and announcements.
const logger = require('../../utils/logger');
const config = require('../../config');

let transporter = null;

// Initialize nodemailer transport if SMTP configured
if (config.mail.provider === 'smtp') {
  transporter = require('nodemailer').createTransport({
    host: config.mail.smtp.host,
    port: config.mail.smtp.port,
    secure: config.mail.smtp.port === 465,
    auth: {
      user: config.mail.smtp.user,
      pass: config.mail.smtp.pass,
    },
  });
}

const escapeHtml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};
exports._escapeHtml = escapeHtml;

exports.sendCode = async ({ to, code, name }) => {
  logger.info(`[DEV MAIL] reset code for ${name} <${to}>: ${code}`);
};

exports.sendAnnouncement = async ({ to, name, title, body, senderName, schoolName, link }) => {
  const escapedTitle = escapeHtml(title);
  const escapedBody = escapeHtml(body);
  const escapedSender = escapeHtml(senderName);
  const escapedSchool = escapeHtml(schoolName);
  
  const subject = `[${schoolName}] ${title}`;
  const text = `${title}\n\nFrom: ${senderName}\n\n${body}\n\nView: ${link}`;
  const html = `
    <h2>${escapedTitle}</h2>
    <p><strong>From:</strong> ${escapedSender}</p>
    <p>${escapedBody.replace(/\n/g, '<br>')}</p>
    <p><a href="${link}">View announcement</a></p>
  `;

  if (config.mail.provider === 'log') {
    logger.info(`[MAIL] announcement to ${name} <${to}>: ${subject}`);
    return;
  }

  if (transporter) {
    await transporter.sendMail({
      from: config.mail.from,
      to,
      subject,
      text,
      html,
    });
  }
};
