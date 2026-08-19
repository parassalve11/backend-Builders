const Engineer = require('../models/Engineer');
const EngineerPerformance = require('../models/EngineerPerformance');
const { ENGINEER_PRIVATE_SELECT } = require('../utils/adminSelections');
const { success, ApiError } = require('../utils/apiResponse');

async function listPerformance(req, res) {
  const { page, limit, engineer } = req.validated.query;
  const filter = engineer ? { engineer } : {};
  const [items, total] = await Promise.all([
    EngineerPerformance.find(filter)
      .select('+internalNotes')
      .populate({ path: 'engineer', select: `pseudonymCode ${ENGINEER_PRIVATE_SELECT}` })
      .sort({ qualityScore: -1, averageRating: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    EngineerPerformance.countDocuments(filter),
  ]);
  return success(res, items, { meta: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
}

async function getEngineerPerformance(req, res) {
  if (!(await Engineer.exists({ _id: req.validated.params.id }))) {
    throw new ApiError(404, 'Engineer not found');
  }
  const performance = await EngineerPerformance.findOne({ engineer: req.validated.params.id })
    .select('+internalNotes')
    .populate({ path: 'engineer', select: `pseudonymCode ${ENGINEER_PRIVATE_SELECT}` });
  return success(res, performance);
}

async function upsertEngineerPerformance(req, res) {
  if (!(await Engineer.exists({ _id: req.validated.params.id }))) {
    throw new ApiError(404, 'Engineer not found');
  }
  const performance = await EngineerPerformance.findOneAndUpdate(
    { engineer: req.validated.params.id },
    req.validated.body,
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).select('+internalNotes');
  return success(res, performance, { message: 'Engineer performance saved' });
}

module.exports = { listPerformance, getEngineerPerformance, upsertEngineerPerformance };
