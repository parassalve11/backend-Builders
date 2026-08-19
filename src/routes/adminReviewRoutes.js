const express = require('express');
const controller = require('../controllers/reviewController');
const validateRequest = require('../middlewares/validateRequest');
const { requireAdminAuth } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { idParamsSchema } = require('../validators/commonValidators');
const {
  reviewBodySchema,
  updateReviewBodySchema,
  adminReviewQuerySchema,
} = require('../validators/adminResourceValidators');

const router = express.Router();
router.use(requireAdminAuth);
router.get(
  '/reviews',
  validateRequest({ query: adminReviewQuerySchema }),
  asyncHandler(controller.listAdminReviews),
);
router.post(
  '/reviews',
  validateRequest({ body: reviewBodySchema }),
  asyncHandler(controller.createAdminReview),
);
router.put(
  '/reviews/:id',
  validateRequest({ params: idParamsSchema, body: updateReviewBodySchema }),
  asyncHandler(controller.updateAdminReview),
);
router.delete(
  '/reviews/:id',
  validateRequest({ params: idParamsSchema }),
  asyncHandler(controller.deleteAdminReview),
);

module.exports = router;
