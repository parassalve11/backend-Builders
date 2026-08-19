const { getPublicProject } = require('../services/projectService');
const { toPublicProject } = require('../utils/publicProjectSerializer');
const { success, ApiError } = require('../utils/apiResponse');

async function getPublicProjectController(req, res) {
  const result = await getPublicProject(req.validated.params.projectCode);
  if (!result) throw new ApiError(404, 'Public project view not found');
  return success(res, toPublicProject(result.project, result.stages));
}

module.exports = { getPublicProject: getPublicProjectController };
