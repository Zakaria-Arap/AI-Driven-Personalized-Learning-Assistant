const { ZodError } = require('zod');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      code: 'VALIDATION',
      message: 'Please check the highlighted fields.',
      details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ ok: false, code: err.code, message: err.message, details: err.details });
  }
  logger.error('unhandled', { message: err.message, stack: err.stack });
  return res.status(500).json({ ok: false, code: 'SERVER_ERROR', message: 'Something went wrong on our side.' });
};
