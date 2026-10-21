const { Notification } = require('../models');
const { Op } = require('sequelize');
module.exports = {
  create: (d) => Notification.create(d),
  bulk: (rows) => (rows.length ? Notification.bulkCreate(rows) : []),
  latest: (userId, limit = 30) => Notification.findAll({ where: { userId }, order: [['createdAt', 'DESC']], limit }),
  unreadCount: (userId) => Notification.count({ where: { userId, readAt: null } }),
  markRead: (userId, id) => Notification.update({ readAt: new Date() }, { where: { userId, id, readAt: null } }),
  markAll: (userId) => Notification.update({ readAt: new Date() }, { where: { userId, readAt: null } }),
  removeOld: (days = 90) => Notification.destroy({ where: { createdAt: { [Op.lt]: new Date(Date.now() - days * 86400000) } } }),
};
