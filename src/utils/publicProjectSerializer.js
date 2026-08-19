const { sanitizePublicText } = require('./publicContentSanitizer');

const toPlain = (value) =>
  value && typeof value.toObject === 'function' ? value.toObject() : value || {};

function toPublicStage(value) {
  const stage = toPlain(value);
  return {
    name: stage.name,
    startDate: stage.startDate,
    endDate: stage.endDate,
    status: stage.status,
    progress: stage.progress,
    photos: Array.isArray(stage.approvedPhotos) ? stage.approvedPhotos : [],
    update: sanitizePublicText(stage.customerUpdate),
  };
}

function toPublicProject(value, stages = []) {
  const project = toPlain(value);
  const engineer = toPlain(project.engineer);
  return {
    projectCode: project.projectCode,
    engineerCode: engineer.pseudonymCode || project.engineerCode,
    projectType: project.projectType,
    location: sanitizePublicText(project.publicLocation),
    startDate: project.startDate,
    expectedCompletionDate: project.expectedCompletionDate,
    actualCompletionDate: project.actualCompletionDate,
    status: project.status,
    overallProgress: project.overallProgress || 0,
    currentStage: project.currentStage,
    latestUpdate: sanitizePublicText(project.publicSummary),
    delayDays: project.publicDelayDays || 0,
    stages: stages.filter((stage) => toPlain(stage).customerVisible === true).map(toPublicStage),
  };
}

module.exports = { toPublicProject, toPublicStage };
