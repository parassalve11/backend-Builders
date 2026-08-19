const express = require('express');
const controller = require('../controllers/adminProjectController');
const validateRequest = require('../middlewares/validateRequest');
const { requireAdminAuth } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { idParamsSchema } = require('../validators/commonValidators');
const {
  createProjectBodySchema,
  updateProjectBodySchema,
  stageBodySchema,
  updateStageBodySchema,
  stageParamsSchema,
  adminProjectQuerySchema,
  estimateBodySchema,
  updateEstimateBodySchema,
} = require('../validators/projectValidators');

const router = express.Router();
router.use(requireAdminAuth);

router.get(
  '/projects',
  validateRequest({ query: adminProjectQuerySchema }),
  asyncHandler(controller.listProjects),
);
router.get(
  '/projects/:id',
  validateRequest({ params: idParamsSchema }),
  asyncHandler(controller.getProject),
);
router.post(
  '/projects',
  validateRequest({ body: createProjectBodySchema }),
  asyncHandler(controller.createProject),
);
router.put(
  '/projects/:id',
  validateRequest({ params: idParamsSchema, body: updateProjectBodySchema }),
  asyncHandler(controller.updateProject),
);
router.post(
  '/projects/:id/stages',
  validateRequest({ params: idParamsSchema, body: stageBodySchema }),
  asyncHandler(controller.createStage),
);
router.put(
  '/projects/:id/stages/:stageId',
  validateRequest({ params: stageParamsSchema, body: updateStageBodySchema }),
  asyncHandler(controller.updateStage),
);
router.post(
  '/projects/:id/estimates',
  validateRequest({ params: idParamsSchema, body: estimateBodySchema }),
  asyncHandler(controller.createEstimate),
);
router.put(
  '/estimates/:id',
  validateRequest({ params: idParamsSchema, body: updateEstimateBodySchema }),
  asyncHandler(controller.updateEstimate),
);

module.exports = router;
