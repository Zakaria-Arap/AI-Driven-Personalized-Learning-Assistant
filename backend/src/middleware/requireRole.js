const { forbidden } = require('../utils/errors');
module.exports = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : next(forbidden('Your role cannot open this'));
