const { Course, Enrolment, User } = require('../models');
const { Op } = require('sequelize');
const teacherInclude = { model: User, as: 'teacher', attributes: ['id', 'fullName', 'userCode'] };
module.exports = {
  forSchool: (schoolId) => Course.findAll({ where: { schoolId }, include: [teacherInclude], order: [['position', 'ASC'], ['id', 'ASC']] }),
  byId: (id) => Course.findByPk(id, { include: [teacherInclude] }),
  byCode: (schoolId, code) => Course.findOne({ where: { schoolId, code }, include: [teacherInclude] }),
  forTeacher: (teacherId) => Course.findAll({ where: { teacherId }, include: [teacherInclude], order: [['position', 'ASC']] }),
  enrolmentCourseIds: async (learnerId) => (await Enrolment.findAll({ where: { learnerId } })).map((e) => e.courseId),
  enrolledLearnerIds: async (courseId) => (await Enrolment.findAll({ where: { courseId } })).map((e) => e.learnerId),
  allEnrolments: async (learnerIds) => (learnerIds.length ? Enrolment.findAll({ where: { learnerId: { [Op.in]: learnerIds } } }) : []),
  setEnrolments: async (learnerId, courseIds) => {
    await Enrolment.destroy({ where: { learnerId } });
    if (courseIds.length) await Enrolment.bulkCreate(courseIds.map((courseId) => ({ learnerId, courseId })));
  },
  setTeacher: (course, teacherId) => course.update({ teacherId }),
};
