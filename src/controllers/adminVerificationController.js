const Engineer = require('../models/Engineer');
const EngineerVerification = require('../models/EngineerVerification');
const { ENGINEER_PRIVATE_SELECT } = require('../utils/adminSelections');
const { success, ApiError } = require('../utils/apiResponse');

async function listVerifications(req, res) {
  const { page, limit, status } = req.validated.query;
  const filter = status ? { status } : {};
  const [items, total] = await Promise.all([
    EngineerVerification.find(filter)
      .select('+notes')
      .populate({ path: 'engineer', select: `pseudonymCode ${ENGINEER_PRIVATE_SELECT}` })
      .populate('verifiedBy', 'fullName email')
      .populate('documentsChecked', 'documentType displayName verificationStatus expiryDate')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    EngineerVerification.countDocuments(filter),
  ]);
  return success(res, items, { meta: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
}

async function upsertVerification(req, res) {
  const engineerId = req.validated.params.id;
  if (!(await Engineer.exists({ _id: engineerId }))) throw new ApiError(404, 'Engineer not found');
  const data = req.validated.body;
  const verification = await EngineerVerification.findOneAndUpdate(
    { engineer: engineerId },
    {
      ...data,
      verificationDate: data.status === 'verified' ? new Date() : undefined,
      verifiedBy: req.admin._id,
    },
    { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true },
  ).select('+notes');
  await Engineer.findByIdAndUpdate(engineerId, {
    verified: data.status === 'verified',
    verificationStatus: data.status,
  });
  return success(res, verification, { status: 201, message: 'Verification saved' });
}

async function updateVerification(req, res) {
  const existing = await EngineerVerification.findById(req.validated.params.id);
  if (!existing) throw new ApiError(404, 'Verification not found');
  const data = req.validated.body;
  const verification = await EngineerVerification.findByIdAndUpdate(
    existing._id,
    {
      ...data,
      verificationDate: data.status === 'verified' ? new Date() : existing.verificationDate,
      verifiedBy: req.admin._id,
    },
    { new: true, runValidators: true },
  ).select('+notes');
  await Engineer.findByIdAndUpdate(existing.engineer, {
    verified: data.status === 'verified',
    verificationStatus: data.status,
  });
  return success(res, verification, { message: 'Verification updated' });
}

module.exports = { listVerifications, upsertVerification, updateVerification };
