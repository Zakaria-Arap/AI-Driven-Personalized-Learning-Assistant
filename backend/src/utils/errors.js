class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
const badRequest = (m = 'Bad request', code = 'BAD_REQUEST', d) => new AppError(400, code, m, d);
const unauthorized = (m = 'Not signed in', code = 'UNAUTHORIZED', d) => new AppError(401, code, m, d);
const forbidden = (m = 'Not allowed', code = 'FORBIDDEN', d) => new AppError(403, code, m, d);
const notFound = (m = 'Not found', code = 'NOT_FOUND') => new AppError(404, code, m);
const locked = (m = 'Account locked', d) => new AppError(423, 'ACCOUNT_LOCKED', m, d);
module.exports = { AppError, badRequest, unauthorized, forbidden, notFound, locked };
