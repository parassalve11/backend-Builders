const { ApiError } = require('../utils/apiResponse');

const requireRole = (...roles) => (req, _res, next) => {
  if (!req.admin || !roles.includes(req.admin.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action'));
  }
  return next();
};

module.exports = { requireRole };
