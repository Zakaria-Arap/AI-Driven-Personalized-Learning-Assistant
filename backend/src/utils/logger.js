const log = (level, msg, meta) => {
  const line = { t: new Date().toISOString(), level, msg, ...(meta || {}) };
  (level === 'error' ? console.error : console.log)(JSON.stringify(line));
};
module.exports = {
  info: (m, x) => log('info', m, x),
  warn: (m, x) => log('warn', m, x),
  error: (m, x) => log('error', m, x),
};
