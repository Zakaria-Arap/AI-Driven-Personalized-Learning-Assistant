const asyncHandler = require('../helpers/asyncHandler');
const { ok } = require('../helpers/respond');
const tutor = require('../services/ai/tutorService');
const hintLadder = require('../services/ai/hintLadder');

exports.start = asyncHandler(async (req, res) => ok(res, await tutor.startSession(req.user, req.body.questionId), 201));
exports.send = asyncHandler(async (req, res) => ok(res, await tutor.sendMessage(req.user.id, req.params.id, req.body.text)));
exports.transcript = asyncHandler(async (req, res) => {
  const { session, messages } = await tutor.transcript(req.user, req.params.id);
  ok(res, { sessionId: session.id, flagged: session.flagged, messages: messages.map((m) => ({ role: m.role, content: m.content, hintLevel: m.hintLevel, at: m.createdAt })) });
});
exports.ladder = (req, res) => ok(res, { levels: hintLadder.LEVELS.map(({ level, name }) => ({ level, name })) });
