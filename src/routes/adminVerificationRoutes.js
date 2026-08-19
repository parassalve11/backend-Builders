const express = require('express');
const controller = require('../controllers/adminVerificationController');
const validateRequest = require('../middlewares/validateRequest');
const { requireAdminAuth } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { idParamsSchema } = require('../validators/commonValidators');
const {
  verificationBodySchema,
  verificationQuerySchema,
} = require('../validators/adminResourceValidators');

const router = express.Router();
router.use(requireAdminAuth);
router.get(
  '/verifications',
  validateRequest({ query: verificationQuerySchema }),
  asyncHandler(controller.listVerifications),
);
router.post(
  '/engineers/:id/verification',
  validateRequest({ params: idParamsSchema, body: verificationBodySchema }),
  asyncHandler(controller.upsertVerification),
);
router.put(
  '/verifications/:id',
  validateRequest({ params: idParamsSchema, body: verificationBodySchema }),
  asyncHandler(controller.updateVerification),
);

module.exports = router;
