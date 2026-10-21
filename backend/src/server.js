const app = require('./app');
const config = require('./config');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

(async () => {
  try {
    await sequelize.authenticate();
    logger.info('database connected');
  } catch (e) {
    logger.error('database not reachable - is MySQL running? (docker compose up -d)', { message: e.message });
    process.exit(1);
  }
  app.listen(config.port, () => logger.info(`Somo API listening on http://localhost:${config.port}/api`));
})();
