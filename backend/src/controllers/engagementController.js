const asyncHandler = require('../helpers/asyncHandler');
const { ok } = require('../helpers/respond');
const userView = require('../helpers/userView');
const settings = require('../services/settings/settingsService');
const profile = require('../services/profile/profileService');
const notifications = require('../services/engagement/notificationService');
const announcements = require('../services/engagement/announcementService');
const assignments = require('../services/engagement/assignmentService');
const insights = require('../services/learner/insightsService');

// settings
exports.publicSettings = asyncHandler(async (req, res) => ok(res, { settings: await settings.getPublic(req.query.school) }));
exports.getSettings = asyncHandler(async (req, res) => ok(res, { settings: await settings.get(req.user.schoolId) }));
exports.updateSettings = asyncHandler(async (req, res) => ok(res, { settings: await settings.update(req.user, req.body) }));
exports.setLogo = asyncHandler(async (req, res) => ok(res, { settings: await settings.setLogo(req.user, req.body.image) }));
exports.removeLogo = asyncHandler(async (req, res) => ok(res, { settings: await settings.removeLogo(req.user) }));

// profile
exports.updateProfile = asyncHandler(async (req, res) => ok(res, { user: await profile.update(req.user, req.body) }));
exports.setAvatar = asyncHandler(async (req, res) => ok(res, { user: await profile.setAvatar(req.user, req.body.image) }));
exports.removeAvatar = asyncHandler(async (req, res) => ok(res, { user: await profile.removeAvatar(req.user) }));
exports.changePassword = asyncHandler(async (req, res) => ok(res, await profile.changePassword(req.user, req.sessionId, req.body)));
exports.sessions = asyncHandler(async (req, res) => ok(res, { sessions: await profile.sessions(req.user, req.sessionId) }));
exports.revokeSession = asyncHandler(async (req, res) => ok(res, await profile.revokeSession(req.user, req.params.id)));
exports.revokeOthers = asyncHandler(async (req, res) => ok(res, await profile.revokeOthers(req.user, req.sessionId)));

// notifications
exports.notifications = asyncHandler(async (req, res) => ok(res, await notifications.list(req.user)));
exports.readNotification = asyncHandler(async (req, res) => { await notifications.markRead(req.user, req.params.id); ok(res); });
exports.readAll = asyncHandler(async (req, res) => { await notifications.markAll(req.user); ok(res); });

// announcements
exports.announcements = asyncHandler(async (req, res) => ok(res, { items: await announcements.list(req.user) }));
exports.postAnnouncement = asyncHandler(async (req, res) => { const a = await announcements.create(req.user, req.body); ok(res, { id: a.id }, 201); });
exports.deleteAnnouncement = asyncHandler(async (req, res) => ok(res, await announcements.remove(req.user, req.params.id)));
exports.pinAnnouncement = asyncHandler(async (req, res) => ok(res, await announcements.togglePin(req.user, req.params.id)));

// assignments
exports.assignments = asyncHandler(async (req, res) => ok(res, { items: req.user.role === 'teacher' ? await assignments.listForTeacher(req.user) : await assignments.listForLearner(req.user) }));
exports.createAssignment = asyncHandler(async (req, res) => ok(res, { item: await assignments.create(req.user, req.body) }, 201));
exports.deleteAssignment = asyncHandler(async (req, res) => ok(res, await assignments.remove(req.user, req.params.id)));

// learner insights
exports.insights = asyncHandler(async (req, res) => ok(res, await insights.get(req.user)));
void userView;
