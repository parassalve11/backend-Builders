const { env } = require('../config/env');

function notFoundHandler(req, _res, next) {
  const error = new Error('Route not found');
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let details = error.details;

  if (error.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }
  if (error.code === 11000) {
    statusCode = 409;
    message = `A record with that ${Object.keys(error.keyPattern || {})[0] || 'value'} already exists`;
  }
  if (error.name === 'ValidationError') {
    statusCode = 422;
    message = 'Database validation failed';
    details = Object.values(error.errors).map((item) => item.message);
  }

  const payload = { success: false, message };
  if (details) payload.errors = details;
  if (env.nodeEnv !== 'production' && statusCode >= 500) payload.stack = error.stack;
  res.status(statusCode).json(payload);
}

module.exports = { notFoundHandler, errorHandler };
