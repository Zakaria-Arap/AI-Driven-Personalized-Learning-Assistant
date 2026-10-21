const router = require('express').Router();
const c = require('../controllers/engagementController');
const v = require('../validators/engagement.validators');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

router.use(['/notifications', '/announcements', '/assignments'], requireAuth);
router.get('/notifications', c.notifications);
router.post('/notifications/read-all', c.readAll);
router.post('/notifications/:id/read', validate({ params: v.idParam }), c.readNotification);

router.get('/announcements', c.announcements);
router.post('/announcements', requireRole('teacher', 'principal', 'admin'), validate({ body: v.announcement }), c.postAnnouncement);
router.delete('/announcements/:id', requireRole('teacher', 'principal', 'admin'), validate({ params: v.idParam }), c.deleteAnnouncement);
router.post('/announcements/:id/pin', requireRole('principal', 'admin'), validate({ params: v.idParam }), c.pinAnnouncement);

router.get('/assignments', requireRole('teacher', 'learner'), c.assignments);
router.post('/assignments', requireRole('teacher'), validate({ body: v.assignment }), c.createAssignment);
router.delete('/assignments/:id', requireRole('teacher'), validate({ params: v.idParam }), c.deleteAssignment);
module.exports = router;
