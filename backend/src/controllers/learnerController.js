const asyncHandler = require('../helpers/asyncHandler');
const { ok } = require('../helpers/respond');
const learnerService = require('../services/learner/learnerService');
const assessment = require('../services/assessment/assessmentService');

exports.dashboard = asyncHandler(async (req, res) => ok(res, await learnerService.dashboard(req.user, req.query.subject)));
exports.practice = asyncHandler(async (req, res) => ok(res, await assessment.practiceSet(req.user, req.params.topicId)));
exports.answer = asyncHandler(async (req, res) => {
  const result = await assessment.submitAnswer(req.user, req.body);
  let newBadges = [];
  try { newBadges = await require('../services/learner/insightsService').awardNew(req.user); } catch (e) { require('../utils/logger').warn('badge check failed', { message: e.message }); }
  ok(res, { ...result, newBadges });
});

const subjects = require('../services/subjects/subjectService');
exports.subjects = asyncHandler(async (req, res) => ok(res, { subjects: await learnerService.subjectList(req.user), needsPathway: !req.user.pathway }));
exports.options = asyncHandler(async (req, res) => ok(res, await subjects.options(req.user)));
exports.choose = asyncHandler(async (req, res) => ok(res, await subjects.choose(req.user, req.user, req.body)));
