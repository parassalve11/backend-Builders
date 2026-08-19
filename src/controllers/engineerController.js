const { listPublicEngineers, getPublicEngineer } = require('../services/engineerService');
const { toPublicEngineer } = require('../utils/publicEngineerSerializer');
const { success, ApiError } = require('../utils/apiResponse');

async function listEngineers(req, res) {
  const query = req.validated.query;
  const { engineers, total } = await listPublicEngineers(query);
  const pages = Math.ceil(total / query.limit) || 1;
  return success(res, engineers.map((engineer) => toPublicEngineer(engineer)), {
    meta: { page: query.page, limit: query.limit, total, pages },
  });
}

async function getEngineer(req, res) {
  const result = await getPublicEngineer(req.validated.params.code);
  if (!result) throw new ApiError(404, 'Verified engineer not found');
  return success(res, toPublicEngineer(result.engineer, result.portfolio));
}

module.exports = { listEngineers, getEngineer };
