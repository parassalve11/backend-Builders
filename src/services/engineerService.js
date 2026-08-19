const Engineer = require('../models/Engineer');
const EngineerPortfolio = require('../models/EngineerPortfolio');

const PUBLIC_ENGINEER_FIELDS = [
  'pseudonymCode',
  'city',
  'cityCode',
  'serviceAreas',
  'engineerType',
  'availabilityStatus',
  'yearsExperience',
  'completedProjectsCount',
  'averageProjectDurationMonths',
  'ratePerSqFt',
  'rating',
  'reviewCount',
  'specializations',
  'skills',
  'qualification',
  'engineeringBranch',
  'professionalExperience',
  'certificationBadges',
  'verified',
].join(' ');

const PUBLIC_PORTFOLIO_FIELDS = [
  'projectCode',
  'projectName',
  'projectType',
  'publicLocation',
  'description',
  'builtUpArea',
  'floors',
  'status',
  'completionDate',
  'photos',
  'plans2D',
  'elevations3D',
  'isPublicApproved',
].join(' ');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildPublicFilter(query) {
  const filter = { verified: true, accountStatus: 'active' };
  if (query.search) {
    const search = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [
      { pseudonymCode: search },
      { city: search },
      { specializations: search },
    ];
  }
  if (query.city) filter.city = new RegExp(`^${escapeRegex(query.city)}$`, 'i');
  if (query.specialization) filter.specializations = new RegExp(escapeRegex(query.specialization), 'i');
  if (query.engineerType) filter.engineerType = query.engineerType;
  if (query.availability) filter.availabilityStatus = query.availability;
  if (query.minRating !== undefined) filter.rating = { $gte: query.minRating };
  if (query.minExperience !== undefined) filter.yearsExperience = { $gte: query.minExperience };
  if (query.minRate !== undefined) filter['ratePerSqFt.max'] = { $gte: query.minRate };
  if (query.maxRate !== undefined) filter['ratePerSqFt.min'] = { $lte: query.maxRate };
  return filter;
}

function getSort(sort) {
  const sorts = {
    rating: { rating: -1, completedProjectsCount: -1, pseudonymCode: 1 },
    experience: { yearsExperience: -1, rating: -1 },
    projects: { completedProjectsCount: -1, rating: -1 },
    rate_low: { 'ratePerSqFt.min': 1, rating: -1 },
    newest: { createdAt: -1 },
  };
  return sorts[sort] || sorts.rating;
}

async function listPublicEngineers(query) {
  const filter = buildPublicFilter(query);
  const skip = (query.page - 1) * query.limit;
  const [engineers, total] = await Promise.all([
    Engineer.find(filter)
      .select(PUBLIC_ENGINEER_FIELDS)
      .sort(getSort(query.sort))
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Engineer.countDocuments(filter),
  ]);
  return { engineers, total };
}

async function getPublicEngineer(code) {
  const engineer = await Engineer.findOne({
    pseudonymCode: code,
    verified: true,
    accountStatus: 'active',
  })
    .select(PUBLIC_ENGINEER_FIELDS)
    .lean();
  if (!engineer) return null;

  const portfolio = await EngineerPortfolio.find({
    engineer: engineer._id,
    isPublicApproved: true,
  })
    .select(PUBLIC_PORTFOLIO_FIELDS)
    .sort({ completionDate: -1, createdAt: -1 })
    .lean();
  return { engineer, portfolio };
}

module.exports = {
  PUBLIC_ENGINEER_FIELDS,
  PUBLIC_PORTFOLIO_FIELDS,
  listPublicEngineers,
  getPublicEngineer,
  escapeRegex,
};
