require('dotenv').config();

const required = (name, fallback) => {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing env var ${name}`);
  return v;
};

const env = process.env.NODE_ENV || 'development';

module.exports = {
  env,
  isProd: env === 'production',
  port: Number(process.env.PORT || 4000),
  uploadsDir: require('path').resolve(__dirname, '../../uploads'),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME || 'somo_dev',
    user: process.env.DB_USER || 'somo',
    password: process.env.DB_PASSWORD || 'somopass',
  },
  jwt: {
    secret: env === 'production' ? required('JWT_SECRET') : required('JWT_SECRET', 'dev-secret-not-for-production'),
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  mail: {
    provider: process.env.MAIL_PROVIDER || 'log',
    smtp: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    from: process.env.MAIL_FROM || 'noreply@somo.local',
  },
};
