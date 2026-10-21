const asyncHandler = require('../helpers/asyncHandler');
const { ok } = require('../helpers/respond');
const userView = require('../helpers/userView');
const accounts = require('../services/admin/accountService');
const audit = require('../services/audit/auditService');

exports.issue = asyncHandler(async (req, res) => {
  const { user, tempPassword } = await accounts.issueAccount(req.user, req.body);
  ok(res, { user: userView(user), tempPassword, note: 'Shown once. Give it to the person; they must change it at first sign-in.' }, 201);
});
exports.list = asyncHandler(async (req, res) => ok(res, { users: (await accounts.list(req.user, req.query.role)).map((u) => ({ ...userView(u), active: u.active, classLabel: u.classLabel })) }));
exports.setActive = asyncHandler(async (req, res) => ok(res, { user: userView(await accounts.setActive(req.user, req.params.id, req.body.active)) }));
exports.resetPassword = asyncHandler(async (req, res) => {
  const { user, tempPassword } = await accounts.resetToTemporary(req.user, req.params.id);
  ok(res, { user: userView(user), tempPassword });
});
exports.link = asyncHandler(async (req, res) => ok(res, { link: await accounts.linkParent(req.user, req.body) }, 201));
exports.audit = asyncHandler(async (req, res) => ok(res, { entries: await audit.recent(100) }));

const accountsX = require('../services/admin/accountService');
const auditRepo = require('../repositories/auditRepository');
exports.search = asyncHandler(async (req, res) => {
  const { rows, total } = await accountsX.search(req.user, req.query);
  ok(res, { total, page: req.query.page, pageSize: req.query.pageSize, users: rows.map((u) => ({ ...userView(u), active: u.active, lockedUntil: u.lockedUntil, lastLoginAt: u.lastLoginAt })) });
});
exports.edit = asyncHandler(async (req, res) => ok(res, { user: userView(await accountsX.updateUser(req.user, req.params.id, req.body)) }));
exports.bulk = asyncHandler(async (req, res) => ok(res, { results: await accountsX.bulkIssue(req.user, req.body.rows) }, 201));
exports.links = asyncHandler(async (req, res) => ok(res, { links: await accountsX.listLinks(req.user) }));
exports.setConsent = asyncHandler(async (req, res) => { await accountsX.setConsent(req.user, req.params.id, req.body.canViewTutorChats); ok(res); });
exports.removeLink = asyncHandler(async (req, res) => ok(res, await accountsX.removeLink(req.user, req.params.id)));
exports.auditSearch = asyncHandler(async (req, res) => {
  const { rows, total } = await auditRepo.search(req.query);
  ok(res, { total, page: req.query.page, pageSize: req.query.pageSize, entries: rows.map((r) => ({ id: r.id, action: r.action, at: r.createdAt, actor: r.actor ? { name: r.actor.fullName, userCode: r.actor.userCode, role: r.actor.role } : null, meta: r.meta })) });
});

const subjectSvc = require('../services/subjects/subjectService');
const userRepoA = require('../repositories/userRepository');
const { notFound: nf } = require('../utils/errors');
const learnerOf = async (admin, id) => {
  const u = await userRepoA.findById(id);
  if (!u || u.role !== 'learner' || u.schoolId !== admin.schoolId) throw nf('Learner not found');
  return u;
};
exports.courses = asyncHandler(async (req, res) => ok(res, { courses: await subjectSvc.adminCourses(req.user) }));
exports.setTeacher = asyncHandler(async (req, res) => ok(res, { course: await subjectSvc.assignTeacher(req.user, req.params.id, req.body.teacherId) }));
exports.learnerSubjects = asyncHandler(async (req, res) => ok(res, await subjectSvc.options(await learnerOf(req.user, req.params.id))));
exports.setLearnerSubjects = asyncHandler(async (req, res) => ok(res, await subjectSvc.choose(req.user, await learnerOf(req.user, req.params.id), req.body)));
