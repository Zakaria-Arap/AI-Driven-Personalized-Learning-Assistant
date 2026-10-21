// Used by sequelize-cli (CommonJS, plain objects per environment).
require('dotenv').config();

const base = {
  username: process.env.DB_USER || 'somo',
  password: process.env.DB_PASSWORD || 'somopass',
  database: process.env.DB_NAME || 'somo_dev',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  dialect: 'mysql',
  logging: false,
  define: { underscored: true },
};

module.exports = {
  development: base,
  test: { ...base, database: (process.env.DB_NAME || 'somo_dev') + '_test' },
  production: base,
};
