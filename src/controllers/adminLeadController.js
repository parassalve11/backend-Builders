const LeadRequest = require('../models/LeadRequest');
const Engineer = require('../models/Engineer');
const { LEAD_PRIVATE_SELECT, ENGINEER_PRIVATE_SELECT } = require('../utils/adminSelections');
const { success, ApiError } = require('../utils/apiResponse');

async function listLeads(req, res) {
  const { page = 1, limit = 20, status, search } = req.validated.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safe, 'i');
    filter.$or = [{ leadCode: regex }, { engineerCode: regex }, { customerName: regex }, { phone: regex }];
  }
  const [items, total] = await Promise.all([
    LeadRequest.find(filter)
      .select(LEAD_PRIVATE_SELECT)
      .populate({ path: 'engineer', select: `pseudonymCode ${ENGINEER_PRIVATE_SELECT}` })
      .populate({ path: 'assignedEngineer', select: `pseudonymCode ${ENGINEER_PRIVATE_SELECT}` })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    LeadRequest.countDocuments(filter),
  ]);
  return success(res, items, { meta: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
}

async function getLead(req, res) {
  const lead = await LeadRequest.findById(req.validated.params.id)
    .select(LEAD_PRIVATE_SELECT)
    .populate({ path: 'engineer', select: `pseudonymCode ${ENGINEER_PRIVATE_SELECT}` })
    .populate({ path: 'assignedEngineer', select: `pseudonymCode ${ENGINEER_PRIVATE_SELECT}` })
    .populate('project', 'projectCode status');
  if (!lead) throw new ApiError(404, 'Lead not found');
  return success(res, lead);
}

async function updateLead(req, res) {
  const lead = await LeadRequest.findByIdAndUpdate(req.validated.params.id, req.validated.body, {
    new: true,
    runValidators: true,
  }).select(LEAD_PRIVATE_SELECT);
  if (!lead) throw new ApiError(404, 'Lead not found');
  return success(res, lead, { message: 'Lead updated' });
}

async function assignEngineer(req, res) {
  const engineer = await Engineer.findOne({
    _id: req.validated.body.engineerId,
    accountStatus: 'active',
  }).select('_id');
  if (!engineer) throw new ApiError(422, 'Assigned engineer is unavailable');
  const lead = await LeadRequest.findByIdAndUpdate(
    req.validated.params.id,
    { assignedEngineer: engineer._id, status: 'engineer_assigned' },
    { new: true, runValidators: true },
  ).select(LEAD_PRIVATE_SELECT);
  if (!lead) throw new ApiError(404, 'Lead not found');
  return success(res, lead, { message: 'Engineer assigned to lead' });
}

module.exports = { listLeads, getLead, updateLead, assignEngineer };
