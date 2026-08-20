const jwt = require('jsonwebtoken');
const Engineer = require('../models/Engineer');
const LeadRequest = require('../models/LeadRequest');
const Project = require('../models/Project');
const { env } = require('../config/env');
const { success, ApiError } = require('../utils/apiResponse');
const {
  ENGINEER_SELF_SELECT,
  serializeEngineerSelf,
  ownedProjectsFilter,
  relevantOpportunitiesFilter,
  listOwnProjects,
  listOwnOpportunities,
  getOwnPerformance,
} = require('../services/engineerPortalService');

async function login(req, res) {
  const { email, password } = req.validated.body;
  const engineer = await Engineer.findOne({ email, accountStatus: 'active' }).select(
    `${ENGINEER_SELF_SELECT} +password +tokenVersion +lastLoginAt`,
  );
  if (!engineer || !engineer.password || !(await engineer.verifyPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = jwt.sign({ role: 'engineer', tv: Number(engineer.tokenVersion || 0) }, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: env.jwtExpiresIn,
    subject: String(engineer._id),
    issuer: 'rkabh-api',
    audience: 'rkabh-engineer',
  });
  engineer.lastLoginAt = new Date();
  await engineer.save();

  return success(res, { token, engineer: serializeEngineerSelf(engineer) }, { message: 'Login successful' });
}

async function me(req, res) {
  return success(res, serializeEngineerSelf(req.engineer));
}

async function logout(req, res) {
  await Engineer.findByIdAndUpdate(req.engineer._id, { $inc: { tokenVersion: 1 } });
  return success(res, null, {
    message: 'Logged out. Existing engineer tokens have been revoked.',
  });
}

async function dashboard(req, res) {
  const engineerId = req.engineer._id;
  const openOpportunityFilter = relevantOpportunitiesFilter(engineerId);
  openOpportunityFilter.status = { $nin: ['project_created', 'closed', 'rejected', 'spam'] };
  const activeProjectFilter = ownedProjectsFilter(engineerId);
  activeProjectFilter.status = { $in: ['planning', 'active', 'on_hold', 'delayed'] };

  const [
    openOpportunities,
    activeProjects,
    completedProjects,
    delayedProjects,
    recentProjects,
    recentOpportunities,
    performance,
  ] = await Promise.all([
    LeadRequest.countDocuments(openOpportunityFilter),
    Project.countDocuments(activeProjectFilter),
    Project.countDocuments(ownedProjectsFilter(engineerId, 'completed')),
    Project.countDocuments(ownedProjectsFilter(engineerId, 'delayed')),
    listOwnProjects(engineerId, { page: 1, limit: 5 }),
    listOwnOpportunities(engineerId, { page: 1, limit: 5 }),
    getOwnPerformance(engineerId),
  ]);

  return success(res, {
    engineer: {
      id: req.engineer._id,
      pseudonymCode: req.engineer.pseudonymCode,
      fullName: req.engineer.fullName,
      availabilityStatus: req.engineer.availabilityStatus,
      verificationStatus: req.engineer.verificationStatus,
      verified: req.engineer.verified,
      rating: req.engineer.rating,
    },
    stats: { openOpportunities, activeProjects, completedProjects, delayedProjects },
    performance,
    recentProjects: recentProjects.items,
    recentOpportunities: recentOpportunities.items,
  });
}

async function profile(req, res) {
  return success(res, serializeEngineerSelf(req.engineer));
}

async function updateAvailability(req, res) {
  const engineer = await Engineer.findOneAndUpdate(
    { _id: req.engineer._id, accountStatus: 'active' },
    { availabilityStatus: req.validated.body.availabilityStatus },
    { new: true, runValidators: true },
  ).select(`${ENGINEER_SELF_SELECT} +lastLoginAt`);
  if (!engineer) throw new ApiError(401, 'Engineer account is unavailable');
  return success(res, serializeEngineerSelf(engineer), { message: 'Availability updated' });
}

async function projects(req, res) {
  const query = req.validated.query;
  const result = await listOwnProjects(req.engineer._id, query);
  return success(res, result.items, {
    meta: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      pages: Math.ceil(result.total / query.limit) || 1,
    },
  });
}

async function opportunities(req, res) {
  const query = req.validated.query;
  const result = await listOwnOpportunities(req.engineer._id, query);
  return success(res, result.items, {
    meta: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      pages: Math.ceil(result.total / query.limit) || 1,
    },
  });
}

async function performance(req, res) {
  return success(res, await getOwnPerformance(req.engineer._id));
}

module.exports = {
  login,
  me,
  logout,
  dashboard,
  profile,
  updateAvailability,
  projects,
  opportunities,
  performance,
};
