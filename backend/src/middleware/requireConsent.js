// A parent may read a learner's tutor chats only if the school recorded that consent.
const { forbidden } = require('../utils/errors');
const parentRepo = require('../repositories/parentLinkRepository');

module.exports = (scope) => async (req, res, next) => {
  try {
    const learnerId = Number(req.params.learnerId);
    const link = await parentRepo.findLink(req.user.id, learnerId);
    if (!link) throw forbidden('This learner is not linked to your account');
    if (scope === 'tutorChats' && !link.canViewTutorChats) throw forbidden('Tutor chats are private unless the school records consent', 'CONSENT_REQUIRED');
    req.link = link;
    next();
  } catch (e) { next(e); }
};
