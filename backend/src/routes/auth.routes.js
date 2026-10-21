const router = require('express').Router();
const c = require('../controllers/authController');
const v = require('../validators/auth.validators');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/requireAuth');
const { authLimiter } = require('../middleware/rateLimit');

router.get('/rules', c.rules);
router.post('/login', authLimiter, validate({ body: v.login }), c.login);
router.post('/activate', authLimiter, validate({ body: v.activate }), c.activate);
router.post('/forgot', authLimiter, validate({ body: v.forgot }), c.forgot);
router.post('/verify-code', authLimiter, validate({ body: v.verifyCode }), c.verifyCode);
router.post('/reset', authLimiter, validate({ body: v.reset }), c.reset);
router.post('/google', authLimiter, validate({ body: v.google }), c.google);
router.post('/logout', c.logout);
router.get('/me', requireAuth, c.me);
module.exports = router;
