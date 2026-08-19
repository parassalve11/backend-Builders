const Engineer = require('../models/Engineer');
const EngineerDocument = require('../models/EngineerDocument');
const { DOCUMENT_PRIVATE_SELECT, ENGINEER_PRIVATE_SELECT } = require('../utils/adminSelections');
const { success, ApiError } = require('../utils/apiResponse');

async function listAllDocuments(req, res) {
  const { page, limit, verificationStatus, documentType, engineer } = req.validated.query;
  const filter = {};
  if (engineer) filter.engineer = engineer;
  if (verificationStatus) filter.verificationStatus = verificationStatus;
  if (documentType) filter.documentType = documentType;
  const [items, total] = await Promise.all([
    EngineerDocument.find(filter)
      .select(DOCUMENT_PRIVATE_SELECT)
      .populate({ path: 'engineer', select: `pseudonymCode ${ENGINEER_PRIVATE_SELECT}` })
      .populate('verifiedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    EngineerDocument.countDocuments(filter),
  ]);
  return success(res, items, { meta: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
}

async function listEngineerDocuments(req, res) {
  if (!(await Engineer.exists({ _id: req.validated.params.id }))) {
    throw new ApiError(404, 'Engineer not found');
  }
  const items = await EngineerDocument.find({ engineer: req.validated.params.id })
    .select(DOCUMENT_PRIVATE_SELECT)
    .populate('verifiedBy', 'fullName email')
    .sort({ createdAt: -1 });
  return success(res, items);
}

async function createDocument(req, res) {
  if (!(await Engineer.exists({ _id: req.validated.params.id }))) {
    throw new ApiError(404, 'Engineer not found');
  }
  const data = { ...req.validated.body, engineer: req.validated.params.id };
  if (data.verificationStatus === 'verified') {
    data.verifiedBy = req.admin._id;
    data.verifiedAt = new Date();
  }
  const document = await EngineerDocument.create(data);
  return success(res, document, { status: 201, message: 'Document metadata created' });
}

async function updateDocument(req, res) {
  const data = { ...req.validated.body };
  if (data.verificationStatus !== undefined) {
    data.verifiedBy = data.verificationStatus === 'verified' ? req.admin._id : null;
    data.verifiedAt = data.verificationStatus === 'verified' ? new Date() : null;
  }
  const document = await EngineerDocument.findByIdAndUpdate(req.validated.params.id, data, {
    new: true,
    runValidators: true,
  }).select(DOCUMENT_PRIVATE_SELECT);
  if (!document) throw new ApiError(404, 'Document not found');
  return success(res, document, { message: 'Document updated' });
}

async function deleteDocument(req, res) {
  const document = await EngineerDocument.findByIdAndDelete(req.validated.params.id);
  if (!document) throw new ApiError(404, 'Document not found');
  return success(res, null, { message: 'Document metadata deleted' });
}

module.exports = {
  listAllDocuments,
  listEngineerDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
};
