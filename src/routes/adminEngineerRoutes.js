const express = require('express');
const controller = require('../controllers/adminEngineerController');
const validateRequest = require('../middlewares/validateRequest');
const { requireAdminAuth } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { idParamsSchema } = require('../validators/commonValidators');
const {
  createEngineerBodySchema,
  updateEngineerBodySchema,
  engineerStatusBodySchema,
  engineerAvailabilityBodySchema,
  adminEngineerQuerySchema,
} = require('../validators/engineerValidators');
const {
  portfolioBodySchema,
  updatePortfolioBodySchema,
} = require('../validators/adminResourceValidators');

const router = express.Router();
router.use(requireAdminAuth);

router.get(
  '/engineers',
  validateRequest({ query: adminEngineerQuerySchema }),
  asyncHandler(controller.listEngineers),
);
router.post(
  '/engineers',
  requireRole('superadmin', 'admin'),
  validateRequest({ body: createEngineerBodySchema }),
  asyncHandler(controller.createEngineer),
);
router.get(
  '/engineers/:id',
  validateRequest({ params: idParamsSchema }),
  asyncHandler(controller.getEngineer),
);
router.put(
  '/engineers/:id',
  requireRole('superadmin', 'admin'),
  validateRequest({ params: idParamsSchema, body: updateEngineerBodySchema }),
  asyncHandler(controller.updateEngineer),
);
router.patch(
  '/engineers/:id/status',
  requireRole('superadmin', 'admin'),
  validateRequest({ params: idParamsSchema, body: engineerStatusBodySchema }),
  asyncHandler(controller.updateStatus),
);
router.patch(
  '/engineers/:id/availability',
  validateRequest({ params: idParamsSchema, body: engineerAvailabilityBodySchema }),
  asyncHandler(controller.updateAvailability),
);
router.delete(
  '/engineers/:id',
  requireRole('superadmin', 'admin'),
  validateRequest({ params: idParamsSchema }),
  asyncHandler(controller.deleteEngineer),
);
router.get(
  '/engineers/:id/portfolio',
  validateRequest({ params: idParamsSchema }),
  asyncHandler(controller.listPortfolio),
);
router.post(
  '/engineers/:id/portfolio',
  validateRequest({ params: idParamsSchema, body: portfolioBodySchema }),
  asyncHandler(controller.createPortfolio),
);
router.put(
  '/portfolios/:id',
  validateRequest({ params: idParamsSchema, body: updatePortfolioBodySchema }),
  asyncHandler(controller.updatePortfolio),
);
router.delete(
  '/portfolios/:id',
  requireRole('superadmin', 'admin'),
  validateRequest({ params: idParamsSchema }),
  asyncHandler(controller.deletePortfolio),
);

module.exports = router;
