const express = require('express');
const controller = require('../controllers/reviewController');
const validateRequest = require('../middlewares/validateRequest');
const asyncHandler = require('../utils/asyncHandler');
const { engineerCodeParamsSchema } = require('../validators/engineerValidators');

const router = express.Router();

router.get(
  '/engineer/:code',
  validateRequest({ params: engineerCodeParamsSchema }),
  asyncHandler(controller.listPublicEngineerReviews),
);

module.exports = router;
