const router = require('express').Router();
const c = require('../controllers/engagementController');
const v = require('../validators/engagement.validators');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);
router.patch('/', validate({ body: v.profile }), c.updateProfile);
router.put('/avatar', validate({ body: v.image }), c.setAvatar);
router.delete('/avatar', c.removeAvatar);
router.post('/password', validate({ body: v.password }), c.changePassword);
router.get('/sessions', c.sessions);
router.post('/sessions/revoke-others', c.revokeOthers);
router.delete('/sessions/:id', validate({ params: v.idParam }), c.revokeSession);
module.exports = router;
