const Project = require('../models/Project');
const ProjectStage = require('../models/ProjectStage');

const PUBLIC_PROJECT_FIELDS = [
  'projectCode',
  'engineer',
  'projectType',
  'publicLocation',
  'startDate',
  'expectedCompletionDate',
  'actualCompletionDate',
  'status',
  'overallProgress',
  'currentStage',
  'publicSummary',
  'publicDelayDays',
  'customerVisible',
].join(' ');

const PUBLIC_STAGE_FIELDS = [
  'name',
  'sequence',
  'startDate',
  'endDate',
  'status',
  'progress',
  'approvedPhotos',
  'customerUpdate',
  'customerVisible',
].join(' ');

async function getPublicProject(projectCode) {
  const project = await Project.findOne({ projectCode, customerVisible: true })
    .select(PUBLIC_PROJECT_FIELDS)
    .populate({ path: 'engineer', select: 'pseudonymCode -_id' })
    .lean();
  if (!project) return null;

  const stages = await ProjectStage.find({ project: project._id, customerVisible: true })
    .select(PUBLIC_STAGE_FIELDS)
    .sort({ sequence: 1 })
    .lean();
  return { project, stages };
}

async function recalculateProjectProgress(projectId) {
  const stages = await ProjectStage.find({ project: projectId }).select('progress status name sequence').lean();
  if (!stages.length) return null;
  const overallProgress = Math.round(
    stages.reduce((total, stage) => total + (stage.progress || 0), 0) / stages.length,
  );
  const current =
    stages
      .sort((a, b) => a.sequence - b.sequence)
      .find((stage) => stage.status === 'in_progress' || stage.status === 'delayed') ||
    stages.find((stage) => stage.status !== 'completed') ||
    stages.at(-1);
  return Project.findByIdAndUpdate(
    projectId,
    { overallProgress, currentStage: current?.name },
    { new: true, runValidators: true },
  );
}

module.exports = {
  PUBLIC_PROJECT_FIELDS,
  PUBLIC_STAGE_FIELDS,
  getPublicProject,
  recalculateProjectProgress,
};
