function success(res, data, options = {}) {
  const { status = 200, message, meta } = options;
  const payload = { success: true };
  if (message) payload.message = message;
  if (data !== undefined) payload.data = data;
  if (meta) payload.meta = meta;
  return res.status(status).json(payload);
}

class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = { success, ApiError };
