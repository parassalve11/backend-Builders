const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const { env } = require('../config/env');
const { success, ApiError } = require('../utils/apiResponse');

function publicAdmin(admin) {
  return {
    id: admin._id,
    fullName: admin.fullName,
    email: admin.email,
    role: admin.role,
  };
}

async function login(req, res) {
  const { email, password } = req.validated.body;
  const admin = await AdminUser.findOne({ email, isActive: true }).select('+password +tokenVersion');
  if (!admin || !(await admin.verifyPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = jwt.sign({ role: admin.role, tv: Number(admin.tokenVersion || 0) }, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: env.jwtExpiresIn,
    subject: String(admin._id),
    issuer: 'setu-api',
    audience: 'setu-admin',
  });
  admin.lastLoginAt = new Date();
  await admin.save();

  return success(res, { token, admin: publicAdmin(admin) }, { message: 'Login successful' });
}

async function me(req, res) {
  return success(res, publicAdmin(req.admin));
}

async function logout(req, res) {
  await AdminUser.findByIdAndUpdate(req.admin._id, { $inc: { tokenVersion: 1 } });
  return success(res, null, {
    message: 'Logged out. Existing admin tokens have been revoked.',
  });
}

module.exports = { login, me, logout };
