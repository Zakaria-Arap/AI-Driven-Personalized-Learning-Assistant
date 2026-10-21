// Who studies which subject, and who teaches it.
//  - Compulsory subjects (English, Kiswahili, Core Mathematics) are taken by every learner.
//  - Electives belong to a pathway (STEM or Social Sciences). A learner picks one pathway and up to 3 of its electives.
//  - Every subject (a Course) has one teacher. A teacher sees only the learners of their own subjects.
//  - Curriculum is stored per grade: subject code = `${course code}${grade}` (e.g. PHY11).
const courseRepo = require('../../repositories/courseRepository');
const userRepo = require('../../repositories/userRepository');
const curriculum = require('../../repositories/curriculumRepository');
const notifications = require('../engagement/notificationService');
const audit = require('../audit/auditService');
const { badRequest, notFound, forbidden } = require('../../utils/errors');

const MAX_ELECTIVES = 3;
const PATHWAYS = { stem: 'STEM', social: 'Social Sciences' };
const gradeOf = (learner) => learner.grade || 10;

const courseView = (c) => ({ id: c.id, code: c.code, name: c.name, pathway: c.pathway, teacher: c.teacher ? { id: c.teacher.id, name: c.teacher.fullName } : null });
exports.courseView = courseView;
exports.PATHWAYS = PATHWAYS;
exports.MAX_ELECTIVES = MAX_ELECTIVES;
exports.subjectCode = (courseCode, grade) => `${courseCode}${grade}`;

exports.catalogue = (schoolId) => courseRepo.forSchool(schoolId);

// The courses one learner studies: compulsory + chosen electives of their pathway.
exports.coursesOfLearner = async (learner, courses) => {
  const all = courses || (await courseRepo.forSchool(learner.schoolId));
  const chosen = new Set(await courseRepo.enrolmentCourseIds(learner.id));
  return all.filter((c) => c.pathway === 'compulsory' || (c.pathway === learner.pathway && chosen.has(c.id)));
};

// For many learners at once: Map(learnerId -> Set(courseId)) of the electives each has chosen.
exports.chosenMap = async (learnerIds) => {
  const map = new Map(learnerIds.map((id) => [id, new Set()]));
  for (const e of await courseRepo.allEnrolments(learnerIds)) map.get(e.learnerId)?.add(e.courseId);
  return map;
};

exports.learnerTakes = (course, learner, chosen) => course.pathway === 'compulsory' || (course.pathway === learner.pathway && chosen.has(course.id));

// Learners (of this school) who study `course` in `grade`, optionally within one class.
exports.learnersOfCourse = async (course, grade, classLabel) => {
  const pool = await userRepo.learnersForGrade(course.schoolId, grade, classLabel);
  if (course.pathway === 'compulsory') return pool;
  const chosen = await exports.chosenMap(pool.map((l) => l.id));
  return pool.filter((l) => exports.learnerTakes(course, l, chosen.get(l.id)));
};

// Checks a topic belongs to a subject this learner studies, in their grade.
exports.assertLearnerTopic = async (learner, topic) => {
  const subject = topic.Strand && topic.Strand.Subject;
  if (!subject || !subject.courseCode) throw notFound('Topic not found');
  if (subject.grade !== gradeOf(learner)) throw forbidden('That topic is not in your grade.', 'WRONG_GRADE');
  const mine = await exports.coursesOfLearner(learner);
  if (!mine.some((c) => c.code === subject.courseCode)) throw forbidden('You are not enrolled in that subject.', 'NOT_ENROLLED');
  return subject;
};

// Which courses a teacher owns, and a check that a topic belongs to one of them.
exports.coursesOfTeacher = (teacher) => courseRepo.forTeacher(teacher.id);
exports.assertTeacherTopic = async (teacher, topic) => {
  const subject = topic.Strand && topic.Strand.Subject;
  const mine = await exports.coursesOfTeacher(teacher);
  if (!subject || !mine.some((c) => c.code === subject.courseCode)) throw forbidden('You can set tasks only in the subject you teach.', 'NOT_YOUR_SUBJECT');
  return subject;
};

// Map(topicId -> { courseCode, courseName, grade, title }) for the whole curriculum.
exports.topicIndex = async () => {
  const rows = await curriculum.allTopics();
  return new Map(rows.map((t) => [t.id, { id: t.id, title: t.title, strand: t.Strand.name, position: t.position, prerequisiteIds: (t.Prerequisites || []).map((p) => p.id), subjectCode: t.Strand.Subject.code, courseCode: t.Strand.Subject.courseCode, subjectName: t.Strand.Subject.name, grade: t.Strand.Subject.grade }]));
};

/* ---- choosing a pathway and electives (the learner, or an admin on their behalf) ---- */

exports.options = async (learner) => {
  const courses = await courseRepo.forSchool(learner.schoolId);
  const chosen = new Set(await courseRepo.enrolmentCourseIds(learner.id));
  return {
    pathway: learner.pathway || null,
    maxElectives: MAX_ELECTIVES,
    pathways: Object.entries(PATHWAYS).map(([key, name]) => ({ key, name, electives: courses.filter((c) => c.pathway === key).map(courseView) })),
    compulsory: courses.filter((c) => c.pathway === 'compulsory').map(courseView),
    chosen: courses.filter((c) => chosen.has(c.id) && c.pathway === learner.pathway).map((c) => c.code),
  };
};

exports.choose = async (actor, learner, { pathway, courseCodes }) => {
  if (!PATHWAYS[pathway]) throw badRequest('Pick STEM or Social Sciences.', 'BAD_PATHWAY');
  const codes = [...new Set(courseCodes)];
  if (codes.length < 1 || codes.length > MAX_ELECTIVES) throw badRequest(`Choose between 1 and ${MAX_ELECTIVES} subjects.`, 'BAD_CHOICE');
  const courses = await courseRepo.forSchool(learner.schoolId);
  const picked = codes.map((code) => courses.find((c) => c.code === code && c.pathway === pathway));
  if (picked.some((c) => !c)) throw badRequest('One of those subjects is not in that pathway.', 'BAD_CHOICE');
  await userRepo.update(learner, { pathway });
  await courseRepo.setEnrolments(learner.id, picked.map((c) => c.id));
  await audit.record('SUBJECTS_CHOSEN', { actorId: actor.id, targetType: 'user', targetId: learner.id, meta: { pathway, courseCodes: codes } });
  if (actor.id !== learner.id) await notifications.notifyOne(learner.id, { type: 'system', title: 'Your subjects were updated', body: `${PATHWAYS[pathway]}: ${picked.map((c) => c.name).join(', ')}`, link: '/learner/subjects' });
  return exports.options(learner);
};

/* ---- admin: who teaches what ---- */

exports.adminCourses = async (admin) => {
  const courses = await courseRepo.forSchool(admin.schoolId);
  const learners = await userRepo.listBySchool(admin.schoolId, 'learner');
  const chosen = await exports.chosenMap(learners.map((l) => l.id));
  return courses.map((c) => {
    const grades = {};
    for (const l of learners) if (l.active && exports.learnerTakes(c, l, chosen.get(l.id))) grades[gradeOf(l)] = (grades[gradeOf(l)] || 0) + 1;
    return { ...courseView(c), learners: Object.values(grades).reduce((a, b) => a + b, 0), byGrade: grades };
  });
};

exports.assignTeacher = async (admin, courseId, teacherId) => {
  const course = await courseRepo.byId(courseId);
  if (!course || course.schoolId !== admin.schoolId) throw notFound('Subject not found');
  let teacher = null;
  if (teacherId !== null) {
    teacher = await userRepo.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher' || teacher.schoolId !== admin.schoolId) throw badRequest('Pick a teacher account from this school.', 'BAD_TEACHER');
  }
  await courseRepo.setTeacher(course, teacher ? teacher.id : null);
  await audit.record('SUBJECT_TEACHER_SET', { actorId: admin.id, targetType: 'course', targetId: course.id, meta: { course: course.code, teacherId: teacher ? teacher.id : null } });
  if (teacher) await notifications.notifyOne(teacher.id, { type: 'system', title: `You now teach ${course.name}`, body: 'Learners enrolled in this subject will appear on your dashboard.', link: '/teacher' });
  return courseView(await courseRepo.byId(course.id));
};
