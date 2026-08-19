const crypto = require('node:crypto');
const Project = require('../models/Project');
const ProjectStage = require('../models/ProjectStage');
const ProjectEstimate = require('../models/ProjectEstimate');
const Engineer = require('../models/Engineer');
const LeadRequest = require('../models/LeadRequest');
const { recalculateProjectProgress } = require('../services/projectService');
const {
  PROJECT_PRIVATE_SELECT,
  STAGE_PRIVATE_SELECT,
  ENGINEER_PRIVATE_SELECT,
} = require('../utils/adminSelections');
const { success, ApiError } = require('../utils/apiResponse');

async function generateProjectCode() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = `KABH-PROJ-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    // eslint-disable-next-line no-await-in-loop
    if (!(await Project.exists({ projectCode: code }))) return code;
  }
  return `KABH-PROJ-${Date.now()}`;
}

async function listProjects(req, res) {
  const { page = 1, limit = 20, status, engineer, search } = req.validated.query;
  const filter = {};
  if (status) filter.status = status;
  if (engineer) filter.engineer = engineer;
  if (search) {
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safe, 'i');
    filter.$or = [{ projectCode: regex }, { customerName: regex }, { projectType: regex }];
  }
  const [items, total] = await Promise.all([
    Project.find(filter)
      .select(PROJECT_PRIVATE_SELECT)
      .populate({ path: 'engineer', select: `pseudonymCode ${ENGINEER_PRIVATE_SELECT}` })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Project.countDocuments(filter),
  ]);
  return success(res, items, { meta: { page, limit, total, pages: Math.ceil(total / limit) || 1 } });
}

async function getProject(req, res) {
  const project = await Project.findById(req.validated.params.id)
    .select(PROJECT_PRIVATE_SELECT)
    .populate({ path: 'engineer', select: `pseudonymCode ${ENGINEER_PRIVATE_SELECT}` })
    .populate('lead', 'leadCode status')
    .populate('adminManager', 'fullName email role');
  if (!project) throw new ApiError(404, 'Project not found');
  const [stages, estimates] = await Promise.all([
    ProjectStage.find({ project: project._id }).select(STAGE_PRIVATE_SELECT).sort({ sequence: 1 }),
    ProjectEstimate.find({ project: project._id }).select('+notes').sort({ estimationDate: -1 }),
  ]);
  return success(res, { project, stages, estimates });
}

async function createProject(req, res) {
  const data = { ...req.validated.body };
  const engineer = await Engineer.findOne({ _id: data.engineer, accountStatus: 'active' }).select('_id');
  if (!engineer) throw new ApiError(422, 'Selected engineer is unavailable');
  if (data.lead && !(await LeadRequest.exists({ _id: data.lead }))) {
    throw new ApiError(422, 'Lead not found');
  }
  data.projectCode = data.projectCode || (await generateProjectCode());
  data.adminManager = req.admin._id;
  const project = await Project.create(data);
  if (data.lead) {
    await LeadRequest.findByIdAndUpdate(data.lead, {
      project: project._id,
      assignedEngineer: engineer._id,
      status: 'project_created',
    });
  }
  return success(res, project, { status: 201, message: 'Project created' });
}

async function updateProject(req, res) {
  const existing = await Project.findById(req.validated.params.id).select('startDate expectedCompletionDate');
  if (!existing) throw new ApiError(404, 'Project not found');
  const startDate = req.validated.body.startDate || existing.startDate;
  const expectedCompletionDate =
    req.validated.body.expectedCompletionDate || existing.expectedCompletionDate;
  if (startDate && expectedCompletionDate && expectedCompletionDate < startDate) {
    throw new ApiError(422, 'Expected completion date must be on or after the start date');
  }
  const project = await Project.findByIdAndUpdate(req.validated.params.id, req.validated.body, {
    new: true,
    runValidators: true,
  }).select(PROJECT_PRIVATE_SELECT);
  if (!project) throw new ApiError(404, 'Project not found');
  return success(res, project, { message: 'Project updated' });
}

async function createStage(req, res) {
  if (!(await Project.exists({ _id: req.validated.params.id }))) {
    throw new ApiError(404, 'Project not found');
  }
  const stage = await ProjectStage.create({ ...req.validated.body, project: req.validated.params.id });
  await recalculateProjectProgress(req.validated.params.id);
  return success(res, stage, { status: 201, message: 'Project stage created' });
}

async function updateStage(req, res) {
  const existing = await ProjectStage.findOne({
    _id: req.validated.params.stageId,
    project: req.validated.params.id,
  }).select('startDate endDate');
  if (!existing) throw new ApiError(404, 'Project stage not found');
  const startDate = req.validated.body.startDate || existing.startDate;
  const endDate = req.validated.body.endDate || existing.endDate;
  if (startDate && endDate && endDate < startDate) {
    throw new ApiError(422, 'Stage end date must be on or after its start date');
  }
  const stage = await ProjectStage.findOneAndUpdate(
    { _id: req.validated.params.stageId, project: req.validated.params.id },
    req.validated.body,
    { new: true, runValidators: true },
  ).select(STAGE_PRIVATE_SELECT);
  if (!stage) throw new ApiError(404, 'Project stage not found');
  await recalculateProjectProgress(req.validated.params.id);
  return success(res, stage, { message: 'Project stage updated' });
}

async function createEstimate(req, res) {
  if (!(await Project.exists({ _id: req.validated.params.id }))) {
    throw new ApiError(404, 'Project not found');
  }
  const estimate = await ProjectEstimate.create({ ...req.validated.body, project: req.validated.params.id });
  return success(res, estimate, { status: 201, message: 'Estimate created' });
}

async function updateEstimate(req, res) {
  const estimate = await ProjectEstimate.findByIdAndUpdate(req.validated.params.id, req.validated.body, {
    new: true,
    runValidators: true,
  }).select('+notes');
  if (!estimate) throw new ApiError(404, 'Estimate not found');
  return success(res, estimate, { message: 'Estimate updated' });
}

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  createStage,
  updateStage,
  createEstimate,
  updateEstimate,
  generateProjectCode,
};
