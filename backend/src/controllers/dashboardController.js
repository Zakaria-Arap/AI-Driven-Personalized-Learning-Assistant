const asyncHandler = require('../helpers/asyncHandler');
const { ok } = require('../helpers/respond');
const dash = require('../services/dashboard/dashboardService');

exports.teacher = asyncHandler(async (req, res) => ok(res, await dash.teacher(req.user, req.query)));
exports.principal = asyncHandler(async (req, res) => ok(res, await dash.principal(req.user, req.query)));
exports.parentChildren = asyncHandler(async (req, res) => ok(res, { children: await dash.parentChildren(req.user) }));
exports.parentSummary = asyncHandler(async (req, res) => ok(res, await dash.parentChildSummary(req.user, req.params.learnerId, req.query.subject)));
exports.parentChats = asyncHandler(async (req, res) => ok(res, { sessions: await dash.parentChats(req.user, req.params.learnerId) }));
