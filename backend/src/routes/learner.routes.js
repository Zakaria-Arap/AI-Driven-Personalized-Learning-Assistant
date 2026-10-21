const router = require('express').Router();
const c = require('../controllers/learnerController');
const v = require('../validators/learning.validators');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

router.use(requireAuth, requireRole('learner'));
router.get('/dashboard', validate({ query: v.subjectQuery }), c.dashboard);
router.get('/subjects', c.subjects);
router.get('/subjects/options', c.options);
router.put('/subjects/choice', validate({ body: v.choice }), c.choose);
router.get('/insights', require('../controllers/engagementController').insights);
router.get('/practice/:topicId', validate({ params: v.topicParam }), c.practice);
router.post('/answers', validate({ body: v.answer }), c.answer);
module.exports = router;
