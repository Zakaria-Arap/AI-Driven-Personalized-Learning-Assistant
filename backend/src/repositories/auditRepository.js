const { AuditLog } = require('../models');
module.exports = {
  create: (data) => AuditLog.create(data),
  search: async ({ action, q, page = 1, pageSize = 25 }) => {
    const { Op } = require('sequelize');
    const { User } = require('../models');
    const where = {};
    if (action) where.action = action;
    const include = [{ model: User, as: 'actor', attributes: ['userCode', 'fullName', 'role'], required: false }];
    if (q) where[Op.or] = [{ action: { [Op.like]: `%${q}%` } }, { '$actor.user_code$': { [Op.like]: `%${q}%` } }, { '$actor.full_name$': { [Op.like]: `%${q}%` } }];
    const { rows, count } = await AuditLog.findAndCountAll({ where, include, order: [['createdAt', 'DESC']], limit: pageSize, offset: (page - 1) * pageSize, subQuery: false });
    return { rows, total: count };
  },
  recent: (limit = 100) => AuditLog.findAll({ order: [['createdAt', 'DESC']], limit }),
};
