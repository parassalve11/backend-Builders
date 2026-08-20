const jwt = require('jsonwebtoken');
const Engineer = require('../models/Engineer');
const { env } = require('../config/env');
const { ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { ENGINEER_SELF_SELECT } = require('../services/engineerPortalService');

const requireEngineerAuth = asyncHandler(async (req, _res, next) => {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) throw new ApiError(401, 'Authentication required');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, {
      algorithms: ['HS256'],
      issuer: 'rkabh-api',
      audience: 'rkabh-engineer',
    });
  } catch (_error) {
    throw new ApiError(401, 'Invalid or expired token');
  }

  if (payload.role !== 'engineer') throw new ApiError(401, 'Invalid or expired token');
  const engineer = await Engineer.findOne({ _id: payload.sub, accountStatus: 'active' }).select(
    `${ENGINEER_SELF_SELECT} +tokenVersion +lastLoginAt`,
  );
  if (!engineer) throw new ApiError(401, 'Engineer account is unavailable');
  const currentTokenVersion = Number(engineer.tokenVersion || 0);
  if (!Number.isInteger(payload.tv) || payload.tv !== currentTokenVersion) {
    throw new ApiError(401, 'Token has been revoked');
  }
  req.engineer = engineer;
  next();
});

module.exports = { requireEngineerAuth };
