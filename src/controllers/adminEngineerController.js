const Engineer = require('../models/Engineer');
const EngineerPortfolio = require('../models/EngineerPortfolio');
const EngineerDocument = require('../models/EngineerDocument');
const EngineerVerification = require('../models/EngineerVerification');
const EngineerPerformance = require('../models/EngineerPerformance');
const Project = require('../models/Project');
const Review = require('../models/Review');
const City = require('../models/City');
const { generatePseudonymCode, normalizeCityCode } = require('../utils/pseudonymGenerator');
const {
  ENGINEER_PRIVATE_SELECT,
  DOCUMENT_PRIVATE_SELECT,
  PROJECT_PRIVATE_SELECT,
} = require('../utils/adminSelections');
const { escapeRegex } = require('../services/engineerService');
const { success, ApiError } = require('../utils/apiResponse');

async function resolveCityCode(cityName, requestedCode) {
  if (requestedCode) return requestedCode.toUpperCase();
  const city = await City.findOne({ name: new RegExp(`^${escapeRegex(cityName)}$`, 'i') })
    .select('code')
    .lean();
  return city?.code || normalizeCityCode('', cityName);
}

async function listEngineers(req, res) {
  const query = req.validated.query;
  const filter = {};
  if (query.city) filter.city = new RegExp(`^${escapeRegex(query.city)}$`, 'i');
  if (query.accountStatus) filter.accountStatus = query.accountStatus;
  if (query.availabilityStatus) filter.availabilityStatus = query.availabilityStatus;
  if (query.verified !== undefined) filter.verified = query.verified;
  if (query.search) {
    const search = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ pseudonymCode: search }, { fullName: search }, { phone: search }, { email: search }];
  }
  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    Engineer.find(filter)
      .select(ENGINEER_PRIVATE_SELECT)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit),
    Engineer.countDocuments(filter),
  ]);
  return success(res, items, {
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit) || 1,
    },
  });
}

async function getEngineer(req, res) {
  const engineer = await Engineer.findById(req.validated.params.id).select(ENGINEER_PRIVATE_SELECT);
  if (!engineer) throw new ApiError(404, 'Engineer not found');
  const [portfolio, documents, projects, performance, reviews, verification] = await Promise.all([
    EngineerPortfolio.find({ engineer: engineer._id })
      .select('+exactLocation +privateClientName +approvedBy +approvedAt')
      .sort({ createdAt: -1 }),
    EngineerDocument.find({ engineer: engineer._id })
      .select(DOCUMENT_PRIVATE_SELECT)
      .sort({ createdAt: -1 }),
    Project.find({ engineer: engineer._id })
      .select(PROJECT_PRIVATE_SELECT)
      .sort({ createdAt: -1 }),
    EngineerPerformance.findOne({ engineer: engineer._id }).select('+internalNotes'),
    Review.find({ engineer: engineer._id })
      .select('+customerName +adminNotes +approvedBy +approvedAt')
      .sort({ createdAt: -1 }),
    EngineerVerification.findOne({ engineer: engineer._id })
      .select('+notes')
      .populate('documentsChecked', 'documentType displayName verificationStatus expiryDate'),
  ]);
  return success(res, {
    engineer,
    portfolio,
    documents,
    projects,
    performance,
    reviews,
    verification,
  });
}

async function createEngineer(req, res) {
  const data = { ...req.validated.body };
  data.cityCode = await resolveCityCode(data.city, data.cityCode);
  data.pseudonymCode =
    data.pseudonymCode || (await generatePseudonymCode(Engineer, { city: data.city, cityCode: data.cityCode }));
  const engineer = await Engineer.create(data);
  return success(res, engineer, { status: 201, message: 'Engineer created' });
}

async function updateEngineer(req, res) {
  const data = { ...req.validated.body };
  if (data.city) data.cityCode = await resolveCityCode(data.city, data.cityCode);
  const engineer = await Engineer.findByIdAndUpdate(req.validated.params.id, data, {
    new: true,
    runValidators: true,
  }).select(ENGINEER_PRIVATE_SELECT);
  if (!engineer) throw new ApiError(404, 'Engineer not found');
  return success(res, engineer, { message: 'Engineer updated' });
}

async function updateStatus(req, res) {
  const engineer = await Engineer.findByIdAndUpdate(
    req.validated.params.id,
    { accountStatus: req.validated.body.status },
    { new: true, runValidators: true },
  ).select(ENGINEER_PRIVATE_SELECT);
  if (!engineer) throw new ApiError(404, 'Engineer not found');
  return success(res, engineer, { message: 'Engineer status updated' });
}

async function updateAvailability(req, res) {
  const engineer = await Engineer.findByIdAndUpdate(req.validated.params.id, req.validated.body, {
    new: true,
    runValidators: true,
  }).select(ENGINEER_PRIVATE_SELECT);
  if (!engineer) throw new ApiError(404, 'Engineer not found');
  return success(res, engineer, { message: 'Engineer availability updated' });
}

async function deleteEngineer(req, res) {
  const engineer = await Engineer.findByIdAndUpdate(
    req.validated.params.id,
    { accountStatus: 'inactive', availabilityStatus: 'unavailable' },
    { new: true, runValidators: true },
  ).select(ENGINEER_PRIVATE_SELECT);
  if (!engineer) throw new ApiError(404, 'Engineer not found');
  return success(res, engineer, { message: 'Engineer deactivated' });
}

async function listPortfolio(req, res) {
  if (!(await Engineer.exists({ _id: req.validated.params.id }))) {
    throw new ApiError(404, 'Engineer not found');
  }
  const items = await EngineerPortfolio.find({ engineer: req.validated.params.id })
    .select('+exactLocation +privateClientName +approvedBy +approvedAt')
    .sort({ createdAt: -1 });
  return success(res, items);
}

async function createPortfolio(req, res) {
  if (!(await Engineer.exists({ _id: req.validated.params.id }))) {
    throw new ApiError(404, 'Engineer not found');
  }
  const data = { ...req.validated.body, engineer: req.validated.params.id };
  if (data.isPublicApproved) {
    data.approvedBy = req.admin._id;
    data.approvedAt = new Date();
  }
  const item = await EngineerPortfolio.create(data);
  return success(res, item, { status: 201, message: 'Portfolio item created' });
}

async function updatePortfolio(req, res) {
  const data = { ...req.validated.body };
  if (data.isPublicApproved !== undefined) {
    data.approvedBy = data.isPublicApproved ? req.admin._id : null;
    data.approvedAt = data.isPublicApproved ? new Date() : null;
  }
  const item = await EngineerPortfolio.findByIdAndUpdate(req.validated.params.id, data, {
    new: true,
    runValidators: true,
  }).select('+exactLocation +privateClientName +approvedBy +approvedAt');
  if (!item) throw new ApiError(404, 'Portfolio item not found');
  return success(res, item, { message: 'Portfolio item updated' });
}

async function deletePortfolio(req, res) {
  const item = await EngineerPortfolio.findByIdAndDelete(req.validated.params.id);
  if (!item) throw new ApiError(404, 'Portfolio item not found');
  return success(res, null, { message: 'Portfolio item deleted' });
}

module.exports = {
  listEngineers,
  getEngineer,
  createEngineer,
  updateEngineer,
  updateStatus,
  updateAvailability,
  deleteEngineer,
  listPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
};
