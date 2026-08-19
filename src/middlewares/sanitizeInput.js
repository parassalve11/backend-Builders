const { ApiError } = require('../utils/apiResponse');

function containsMongoOperator(value) {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some(containsMongoOperator);
  return Object.entries(value).some(
    ([key, child]) => key.startsWith('$') || key.includes('.') || containsMongoOperator(child),
  );
}

function rejectMongoOperators(req, _res, next) {
  if (
    containsMongoOperator(req.body) ||
    containsMongoOperator(req.params) ||
    containsMongoOperator(req.query)
  ) {
    return next(new ApiError(400, 'Invalid request keys'));
  }
  return next();
}

module.exports = { rejectMongoOperators, containsMongoOperator };
