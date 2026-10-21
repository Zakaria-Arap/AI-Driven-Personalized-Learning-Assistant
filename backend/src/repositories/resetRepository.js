const { ResetCode } = require('../models');
module.exports = {
  create: (data) => ResetCode.create(data),
  latestOpenForUser: (userId) =>
    ResetCode.findOne({ where: { userId, usedAt: null }, order: [['createdAt', 'DESC']] }),
  save: (row) => row.save(),
};
