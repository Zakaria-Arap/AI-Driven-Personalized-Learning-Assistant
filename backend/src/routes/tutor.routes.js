const router = require('express').Router();
const c = require('../controllers/tutorController');
const v = require('../validators/learning.validators');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { tutorLimiter } = require('../middleware/rateLimit');

router.use(requireAuth);
router.get('/ladder', c.ladder);
router.post('/sessions', requireRole('learner'), validate({ body: v.tutorStart }), c.start);
router.post('/sessions/:id/messages', requireRole('learner'), tutorLimiter, validate({ params: v.sessionParam, body: v.tutorSend }), c.send);
router.get('/sessions/:id', requireRole('learner', 'teacher'), validate({ params: v.sessionParam }), c.transcript);
module.exports = router;
