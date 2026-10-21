const jwt = require('jsonwebtoken');
const config = require('../../config');

exports.signSession = (user, sid) => jwt.sign({ sub: user.id, role: user.role, sid }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
exports.verifySession = (token) => jwt.verify(token, config.jwt.secret);
// Short-lived token proving the reset code was verified.
exports.signReset = (userId) => jwt.sign({ sub: userId, purpose: 'reset' }, config.jwt.secret, { expiresIn: '10m' });
exports.verifyReset = (token) => {
  const p = jwt.verify(token, config.jwt.secret);
  if (p.purpose !== 'reset') throw new Error('wrong token purpose');
  return p;
};
