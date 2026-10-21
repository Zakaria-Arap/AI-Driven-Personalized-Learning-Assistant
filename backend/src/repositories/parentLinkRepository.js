const { ParentLink, User } = require('../models');
module.exports = {
  findLink: (parentId, learnerId) => ParentLink.findOne({ where: { parentId, learnerId } }),
  childrenOf: (parentId) => ParentLink.findAll({ where: { parentId }, include: [{ model: User, as: 'learner' }] }),
  findById: (id) => ParentLink.findByPk(id),
  listForSchool: (schoolId) => ParentLink.findAll({ include: [{ model: User, as: 'parent', where: { schoolId } }, { model: User, as: 'learner' }], order: [['id', 'DESC']] }),
  destroy: (l) => l.destroy(),
  update: (l, patch) => l.update(patch),
  create: (data) => ParentLink.create(data),
};
