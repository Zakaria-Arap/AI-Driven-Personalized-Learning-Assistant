const { UserSession } = require('../models');
const { Op } = require('sequelize');
module.exports = {
  create: (data) => UserSession.create(data),
  find: (id) => UserSession.findByPk(id),
  touch: (s) => s.update({ lastSeenAt: new Date() }),
  listActive: (userId) => UserSession.findAll({ where: { userId, revokedAt: null }, order: [['lastSeenAt', 'DESC']] }),
  revoke: (userId, id) => UserSession.update({ revokedAt: new Date() }, { where: { id, userId, revokedAt: null } }),
  revokeOthers: (userId, keepId) => UserSession.update({ revokedAt: new Date() }, { where: { userId, revokedAt: null, id: { [Op.ne]: keepId } } }),
  revokeAll: (userId) => UserSession.update({ revokedAt: new Date() }, { where: { userId, revokedAt: null } }),
};
