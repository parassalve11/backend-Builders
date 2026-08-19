const express = require('express');
const controller = require('../controllers/adminPerformanceController');
const validateRequest = require('../middlewares/validateRequest');
const { requireAdminAuth } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { idParamsSchema } = require('../validators/commonValidators');
const {
  performanceBodySchema,
  performanceQuerySchema,
} = require('../validators/adminResourceValidators');

const router = express.Router();
router.use(requireAdminAuth);
router.get(
  '/performance',
  validateRequest({ query: performanceQuerySchema }),
  asyncHandler(controller.listPerformance),
);
router.get(
  '/engineers/:id/performance',
  validateRequest({ params: idParamsSchema }),
  asyncHandler(controller.getEngineerPerformance),
);
router.put(
  '/engineers/:id/performance',
  validateRequest({ params: idParamsSchema, body: performanceBodySchema }),
  asyncHandler(controller.upsertEngineerPerformance),
);

module.exports = router;
