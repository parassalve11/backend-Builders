const crypto = require('node:crypto');
const LeadRequest = require('../models/LeadRequest');
const Engineer = require('../models/Engineer');
const { notifyNewLead } = require('../services/notificationService');
const { success, ApiError } = require('../utils/apiResponse');

async function generateLeadCode() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = `KABH-LD-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    // eslint-disable-next-line no-await-in-loop
    if (!(await LeadRequest.exists({ leadCode: code }))) return code;
  }
  return `KABH-LD-${Date.now()}`;
}

async function createLead(req, res) {
  const input = req.validated.body;
  let engineer = null;
  if (input.engineerCode) {
    engineer = await Engineer.findOne({
      pseudonymCode: input.engineerCode,
      verified: true,
      accountStatus: 'active',
    }).select('_id pseudonymCode');
    if (!engineer) throw new ApiError(404, 'Requested engineer is not available');
  }

  const lead = await LeadRequest.create({
    ...input,
    website: undefined,
    leadCode: await generateLeadCode(),
    engineer: engineer?._id,
    engineerCode: engineer?.pseudonymCode,
    source: engineer ? 'engineer_request' : input.source || 'quote',
  });

  setImmediate(() => {
    void notifyNewLead(lead);
  });

  return success(
    res,
    {
      leadCode: lead.leadCode,
      status: lead.status,
    },
    {
      status: 201,
      message: 'Request received. ॠKABH will review it and contact you shortly.',
    },
  );
}

module.exports = { createLead, generateLeadCode };
