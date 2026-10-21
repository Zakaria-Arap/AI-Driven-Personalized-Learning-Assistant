const router = require('express').Router();
const c = require('../controllers/dashboardController');
const v = require('../validators/learning.validators');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const requireConsent = require('../middleware/requireConsent');

router.use(requireAuth);
router.get('/teacher', requireRole('teacher'), validate({ query: v.subjectGradeQuery }), c.teacher);
router.get('/principal', requireRole('principal'), validate({ query: v.subjectGradeQuery }), c.principal);
router.get('/parent/children', requireRole('parent'), c.parentChildren);
router.get('/parent/children/:learnerId/summary', requireRole('parent'), validate({ params: v.learnerParam, query: v.subjectQuery }), requireConsent('summary'), c.parentSummary);
router.get('/parent/children/:learnerId/chats', requireRole('parent'), validate({ params: v.learnerParam }), requireConsent('tutorChats'), c.parentChats);
module.exports = router;
