const Engineer = require('../models/Engineer');
const LeadRequest = require('../models/LeadRequest');
const Project = require('../models/Project');
const EngineerVerification = require('../models/EngineerVerification');
const { LEAD_PRIVATE_SELECT } = require('../utils/adminSelections');
const { success } = require('../utils/apiResponse');

async function dashboardOverview(_req, res) {
  const [
    newLeads,
    availableEngineers,
    activeProjects,
    completedProjects,
    pendingVerifications,
    delayedProjects,
    recentLeads,
  ] = await Promise.all([
    LeadRequest.countDocuments({ status: 'new' }),
    Engineer.countDocuments({ accountStatus: 'active', availabilityStatus: 'available', verified: true }),
    Project.countDocuments({ status: 'active' }),
    Project.countDocuments({ status: 'completed' }),
    EngineerVerification.countDocuments({ status: { $in: ['pending', 'under_review'] } }),
    Project.countDocuments({ status: 'delayed' }),
    LeadRequest.find().select(LEAD_PRIVATE_SELECT).sort({ createdAt: -1 }).limit(5),
  ]);
  return success(res, {
    stats: {
      newLeads,
      availableEngineers,
      activeProjects,
      completedProjects,
      pendingVerifications,
      delayedProjects,
    },
    recentLeads,
  });
}

module.exports = { dashboardOverview };
