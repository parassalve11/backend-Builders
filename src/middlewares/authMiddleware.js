const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const { env } = require('../config/env');
const { ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const requireAdminAuth = asyncHandler(async (req, _res, next) => {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) throw new ApiError(401, 'Authentication required');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, {
      algorithms: ['HS256'],
      issuer: 'setu-api',
      audience: 'setu-admin',
    });
  } catch (_error) {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const admin = await AdminUser.findOne({ _id: payload.sub, isActive: true }).select('+tokenVersion');
  if (!admin) throw new ApiError(401, 'Admin account is unavailable');
  const currentTokenVersion = Number(admin.tokenVersion || 0);
  if (!Number.isInteger(payload.tv) || payload.tv !== currentTokenVersion) {
    throw new ApiError(401, 'Token has been revoked');
  }
  req.admin = admin;
  next();
});

module.exports = { requireAdminAuth };
