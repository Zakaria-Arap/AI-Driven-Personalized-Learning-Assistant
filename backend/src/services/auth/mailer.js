// Delivery of reset codes. Open item OI: decide email vs admin-only codes.
// In development the code is printed to the server console. Replace sendCode with SMTP later.
const logger = require('../../utils/logger');
exports.sendCode = async ({ to, code, name }) => {
  logger.info(`[DEV MAIL] reset code for ${name} <${to}>: ${code}`);
};
