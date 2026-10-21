const config = require('../src/config');

module.exports = async () => {
  if (process.env.NODE_ENV === 'test' && !config.db.name.endsWith('_test')) {
    throw new Error(
      `SAFETY: Test database name must end with "_test". Current: ${config.db.name}\n` +
      `Set DB_NAME_TEST or ensure NODE_ENV=test resolves to a test database.`
    );
  }
  console.log(`[Test Setup] Using database: ${config.db.name}`);
};
