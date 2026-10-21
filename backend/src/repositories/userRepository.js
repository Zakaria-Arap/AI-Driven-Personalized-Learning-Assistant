const { User } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  findById: (id) => User.findByPk(id),
  findByCode: (userCode) => User.findOne({ where: { userCode: String(userCode).trim().toUpperCase() } }),
  findByEmail: (email) => User.findOne({ where: { email: String(email).trim().toLowerCase() } }),
  create: (data) => User.create(data),
  save: (user) => user.save(),
  update: (user, patch) => user.update(patch),
  listBySchool: (schoolId, role) => User.findAll({ where: { schoolId, ...(role ? { role } : {}) }, order: [['fullName', 'ASC']] }),
  listLearnersByClass: (schoolId, classLabel) =>
    User.findAll({ where: { schoolId, role: 'learner', ...(classLabel ? { classLabel } : {}) }, order: [['fullName', 'ASC']] }),
  learnersForGrade: (schoolId, grade, classLabel) =>
    User.findAll({ where: { schoolId, role: 'learner', active: true, grade, ...(classLabel ? { classLabel } : {}) }, order: [['fullName', 'ASC']] }),
  search: async ({ schoolId, q, role, page = 1, pageSize = 15 }) => {
    const where = { schoolId, ...(role ? { role } : {}) };
    if (q) where[Op.or] = [{ fullName: { [Op.like]: `%${q}%` } }, { userCode: { [Op.like]: `%${q}%` } }, { email: { [Op.like]: `%${q}%` } }];
    const { rows, count } = await User.findAndCountAll({ where, order: [['role', 'ASC'], ['fullName', 'ASC']], limit: pageSize, offset: (page - 1) * pageSize });
    return { rows, total: count };
  },
  idsByRole: async (schoolId, role) => (await User.findAll({ where: { schoolId, role }, attributes: ['id'] })).map((u) => u.id),
  idsInClass: async (schoolId, classLabel) => (await User.findAll({ where: { schoolId, role: 'learner', classLabel }, attributes: ['id'] })).map((u) => u.id),
  findManyByIds: (ids) => User.findAll({ where: { id: { [Op.in]: ids } } }),
};
