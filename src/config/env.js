const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const parseBoolean = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === 'true';
};

const parseList = (value, fallback = []) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : fallback;

const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/setu',
  jwtSecret:
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV === 'production' ? '' : 'development-only-setu-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  frontendUrls: parseList(process.env.FRONTEND_URL, ['http://localhost:3000']),
  adminDashboardUrl:
    process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3000/admin/leads',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: parseBoolean(process.env.SMTP_SECURE),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'Setu <no-reply@setu.local>',
    adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || '',
  },
});

function assertEnvironment() {
  if (!env.mongoUri) throw new Error('MONGODB_URI is required');
  if (env.nodeEnv === 'production' && env.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters in production');
  }
}

module.exports = { env, assertEnvironment };
