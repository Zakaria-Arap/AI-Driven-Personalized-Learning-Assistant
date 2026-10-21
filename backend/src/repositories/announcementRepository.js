const { Announcement, User } = require('../models');
const { Op } = require('sequelize');
module.exports = {
  create: (d) => Announcement.create(d),
  find: (id) => Announcement.findByPk(id),
  forAudience: (schoolId, role, userId) =>
    Announcement.findAll({
      where: role === 'admin' || role === 'principal' ? { schoolId } : { schoolId, [Op.or]: [{ audience: { [Op.in]: ['all', role] } }, { authorId: userId }] },
      include: [{ model: User, as: 'author', attributes: ['fullName', 'role'] }],
      order: [['pinned', 'DESC'], ['createdAt', 'DESC']], limit: 50,
    }),
  authoredBy: (schoolId, authorId) => Announcement.findAll({ where: { schoolId, authorId }, order: [['createdAt', 'DESC']], limit: 50 }),
  destroy: (a) => a.destroy(),
  update: (a, patch) => a.update(patch),
};
