const { UserBadge } = require('../models');
module.exports = {
  forUser: (userId) => UserBadge.findAll({ where: { userId } }),
  award: (userId, badgeKey) => UserBadge.findOrCreate({ where: { userId, badgeKey } }),
};
