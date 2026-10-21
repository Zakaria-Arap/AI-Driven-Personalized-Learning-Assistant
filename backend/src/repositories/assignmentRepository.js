const { Assignment, Topic, Strand, Subject } = require('../models');
const withSubject = [{ model: Topic, include: [{ model: Strand, include: [Subject] }] }];
module.exports = {
  create: (d) => Assignment.create(d),
  find: (id) => Assignment.findByPk(id),
  forTeacher: (teacherId) => Assignment.findAll({ where: { teacherId }, include: withSubject, order: [['dueAt', 'ASC']], limit: 100 }),
  forClass: (schoolId, classLabel) => Assignment.findAll({ where: { schoolId, classLabel }, include: withSubject, order: [['dueAt', 'ASC']], limit: 100 }),
  destroy: (a) => a.destroy(),
};
