const repo = require('../../repositories/auditRepository');
const logger = require('../../utils/logger');

// Audit writes must never break the request that triggered them.
exports.record = async (action, { actorId = null, targetType = null, targetId = null, meta = null } = {}) => {
  try { await repo.create({ action, actorId, targetType, targetId, meta }); }
  catch (e) { logger.warn('audit write failed', { action, error: e.message }); }
};
exports.recent = (limit) => repo.recent(limit);
