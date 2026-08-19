const rateLimit = require('express-rate-limit');

const passthrough = (_req, _res, next) => next();
const createLimiter = (options) =>
  process.env.NODE_ENV === 'test' ? passthrough : rateLimit(options);

const publicLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again shortly.' },
});

const leadLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

module.exports = { publicLimiter, leadLimiter, loginLimiter };
