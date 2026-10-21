const router = require('express').Router();
const c = require('../controllers/engagementController');
const v = require('../validators/engagement.validators');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

router.get('/public', c.publicSettings);                       // no sign-in: the login page is branded too
router.use(requireAuth);
router.get('/', c.getSettings);
router.put('/', requireRole('admin', 'principal'), validate({ body: v.settings }), c.updateSettings);
router.put('/logo', requireRole('admin', 'principal'), validate({ body: v.image }), c.setLogo);
router.delete('/logo', requireRole('admin', 'principal'), c.removeLogo);
module.exports = router;
