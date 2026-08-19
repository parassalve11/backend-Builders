const express = require('express');
const controller = require('../controllers/adminLeadController');
const validateRequest = require('../middlewares/validateRequest');
const { requireAdminAuth } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { idParamsSchema } = require('../validators/commonValidators');
const {
  updateLeadBodySchema,
  assignEngineerBodySchema,
} = require('../validators/leadValidators');
const { adminLeadQuerySchema } = require('../validators/adminResourceValidators');

const router = express.Router();
router.use(requireAdminAuth);

router.get(
  '/leads',
  validateRequest({ query: adminLeadQuerySchema }),
  asyncHandler(controller.listLeads),
);
router.get(
  '/leads/:id',
  validateRequest({ params: idParamsSchema }),
  asyncHandler(controller.getLead),
);
router.patch(
  '/leads/:id',
  validateRequest({ params: idParamsSchema, body: updateLeadBodySchema }),
  asyncHandler(controller.updateLead),
);
router.post(
  '/leads/:id/assign-engineer',
  validateRequest({ params: idParamsSchema, body: assignEngineerBodySchema }),
  asyncHandler(controller.assignEngineer),
);

module.exports = router;
