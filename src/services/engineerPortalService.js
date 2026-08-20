const EngineerPerformance = require('../models/EngineerPerformance');
const LeadRequest = require('../models/LeadRequest');
const Project = require('../models/Project');
const ProjectStage = require('../models/ProjectStage');
const { sanitizePublicText } = require('../utils/publicContentSanitizer');

const ENGINEER_SELF_SELECT = [
  '+fullName',
  '+phone',
  '+alternatePhone',
  '+email',
  '+exactAddress',
  '+profilePhoto',
  '+emergencyContact',
  '+college',
  '+graduationYear',
  '+certifications',
  '+professionalRegistration',
  '+licenseDetails',
  '+verificationStatus',
].join(' ');

const OPPORTUNITY_SELECT = [
  'leadCode',
  'city',
  'projectType',
  '+projectDetails',
  'approximateArea',
  'preferredStartDate',
  'status',
  'project',
  'source',
  'createdAt',
  'updatedAt',
].join(' ');

// Customer contact and the exact site are operationally required after a project is assigned.
// Costs, admin ownership, delay reasons, and internal notes deliberately remain unavailable.
const ENGINEER_PROJECT_SELECT = [
  'projectCode',
  '+customerName',
  '+customerPhone',
  '+customerEmail',
  'projectType',
  '+constructionLocation',
  'publicLocation',
  'builtUpArea',
  'floors',
  'startDate',
  'expectedCompletionDate',
  'actualCompletionDate',
  'status',
  'currentStage',
  'overallProgress',
  'publicDelayDays',
  'publicSummary',
  'createdAt',
  'updatedAt',
].join(' ');

// Engineer-authored stage content is available; admin remarks are intentionally excluded.
const ENGINEER_STAGE_SELECT = [
  'project',
  'name',
  'sequence',
  'startDate',
  'endDate',
  'status',
  'progress',
  '+photos',
  'approvedPhotos',
  '+engineerRemarks',
  'customerUpdate',
  'customerVisible',
  'createdAt',
  'updatedAt',
].join(' ');

function toPlain(value) {
  return value && typeof value.toObject === 'function' ? value.toObject() : value;
}

function serializeEngineerSelf(value) {
  const engineer = toPlain(value) || {};
  return {
    id: engineer._id,
    pseudonymCode: engineer.pseudonymCode,
    fullName: engineer.fullName,
    email: engineer.email,
    phone: engineer.phone,
    alternatePhone: engineer.alternatePhone,
    exactAddress: engineer.exactAddress,
    profilePhoto: engineer.profilePhoto,
    emergencyContact: engineer.emergencyContact,
    city: engineer.city,
    cityCode: engineer.cityCode,
    serviceAreas: engineer.serviceAreas,
    engineerType: engineer.engineerType,
    accountStatus: engineer.accountStatus,
    availabilityStatus: engineer.availabilityStatus,
    yearsExperience: engineer.yearsExperience,
    completedProjectsCount: engineer.completedProjectsCount,
    averageProjectDurationMonths: engineer.averageProjectDurationMonths,
    ratePerSqFt: engineer.ratePerSqFt,
    rating: engineer.rating,
    reviewCount: engineer.reviewCount,
    specializations: engineer.specializations,
    skills: engineer.skills,
    qualification: engineer.qualification,
    engineeringBranch: engineer.engineeringBranch,
    college: engineer.college,
    graduationYear: engineer.graduationYear,
    professionalExperience: engineer.professionalExperience,
    certificationBadges: engineer.certificationBadges,
    certifications: engineer.certifications,
    professionalRegistration: engineer.professionalRegistration,
    licenseDetails: engineer.licenseDetails,
    verified: engineer.verified,
    verificationStatus: engineer.verificationStatus,
    joiningDate: engineer.joiningDate,
    lastLoginAt: engineer.lastLoginAt,
    createdAt: engineer.createdAt,
    updatedAt: engineer.updatedAt,
  };
}

function serializeOpportunity(value) {
  const opportunity = toPlain(value) || {};
  return {
    id: opportunity._id,
    leadCode: opportunity.leadCode,
    city: opportunity.city,
    projectType: opportunity.projectType,
    projectBrief: sanitizePublicText(opportunity.projectDetails),
    approximateArea: opportunity.approximateArea,
    preferredStartDate: opportunity.preferredStartDate,
    status: opportunity.status,
    projectId: opportunity.project,
    source: opportunity.source,
    createdAt: opportunity.createdAt,
    updatedAt: opportunity.updatedAt,
  };
}

function serializeStage(value) {
  const stage = toPlain(value) || {};
  return {
    id: stage._id,
    name: stage.name,
    sequence: stage.sequence,
    startDate: stage.startDate,
    endDate: stage.endDate,
    status: stage.status,
    progress: stage.progress,
    photos: stage.photos,
    approvedPhotos: stage.approvedPhotos,
    engineerRemarks: stage.engineerRemarks,
    customerUpdate: stage.customerUpdate,
    customerVisible: stage.customerVisible,
    createdAt: stage.createdAt,
    updatedAt: stage.updatedAt,
  };
}

function serializeProject(value, stages = []) {
  const project = toPlain(value) || {};
  return {
    id: project._id,
    projectCode: project.projectCode,
    customer: {
      name: project.customerName,
      phone: project.customerPhone,
      email: project.customerEmail,
    },
    projectType: project.projectType,
    constructionLocation: project.constructionLocation,
    publicLocation: project.publicLocation,
    builtUpArea: project.builtUpArea,
    floors: project.floors,
    startDate: project.startDate,
    expectedCompletionDate: project.expectedCompletionDate,
    actualCompletionDate: project.actualCompletionDate,
    status: project.status,
    currentStage: project.currentStage,
    overallProgress: project.overallProgress,
    publicDelayDays: project.publicDelayDays,
    publicSummary: project.publicSummary,
    stages: stages.map(serializeStage),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

function serializePerformance(value) {
  const performance = toPlain(value);
  if (!performance) return null;
  return {
    totalProjects: performance.totalProjects,
    completedProjects: performance.completedProjects,
    ongoingProjects: performance.ongoingProjects,
    averageRating: performance.averageRating,
    customerSatisfaction: performance.customerSatisfaction,
    averageProjectDurationMonths: performance.averageProjectDurationMonths,
    estimationAccuracy: performance.estimationAccuracy,
    qualityScore: performance.qualityScore,
    onTimeCompletionPercentage: performance.onTimeCompletionPercentage,
    complaintCount: performance.complaintCount,
    currentAssignments: performance.currentAssignments,
    siteInspectionScore: performance.siteInspectionScore,
    safetyCompliance: performance.safetyCompliance,
    reworkCount: performance.reworkCount,
    issueCount: performance.issueCount,
    updatedAt: performance.updatedAt,
  };
}

function ownedProjectsFilter(engineerId, status) {
  const filter = { engineer: engineerId };
  if (status) filter.status = status;
  return filter;
}

function relevantOpportunitiesFilter(engineerId, status) {
  const filter = {
    $or: [{ assignedEngineer: engineerId }, { engineer: engineerId }],
  };
  if (status) filter.status = status;
  return filter;
}

async function findStagesForProjects(projects) {
  if (!projects.length) return new Map();
  const ids = projects.map((project) => project._id);
  const stages = await ProjectStage.find({ project: { $in: ids } })
    .select(ENGINEER_STAGE_SELECT)
    .sort({ project: 1, sequence: 1 })
    .lean();
  const byProject = new Map();
  for (const stage of stages) {
    const key = String(stage.project);
    if (!byProject.has(key)) byProject.set(key, []);
    byProject.get(key).push(stage);
  }
  return byProject;
}

async function listOwnProjects(engineerId, query) {
  const filter = ownedProjectsFilter(engineerId, query.status);
  const skip = (query.page - 1) * query.limit;
  const [projects, total] = await Promise.all([
    Project.find(filter)
      .select(ENGINEER_PROJECT_SELECT)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    Project.countDocuments(filter),
  ]);
  const stages = await findStagesForProjects(projects);
  return {
    items: projects.map((project) => serializeProject(project, stages.get(String(project._id)) || [])),
    total,
  };
}

async function listOwnOpportunities(engineerId, query) {
  const filter = relevantOpportunitiesFilter(engineerId, query.status);
  const skip = (query.page - 1) * query.limit;
  const [opportunities, total] = await Promise.all([
    LeadRequest.find(filter)
      .select(OPPORTUNITY_SELECT)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    LeadRequest.countDocuments(filter),
  ]);
  return { items: opportunities.map(serializeOpportunity), total };
}

async function getOwnPerformance(engineerId) {
  const performance = await EngineerPerformance.findOne({ engineer: engineerId }).lean();
  return serializePerformance(performance);
}

module.exports = {
  ENGINEER_SELF_SELECT,
  OPPORTUNITY_SELECT,
  ENGINEER_PROJECT_SELECT,
  ENGINEER_STAGE_SELECT,
  serializeEngineerSelf,
  serializeOpportunity,
  serializeProject,
  serializePerformance,
  ownedProjectsFilter,
  relevantOpportunitiesFilter,
  listOwnProjects,
  listOwnOpportunities,
  getOwnPerformance,
};
