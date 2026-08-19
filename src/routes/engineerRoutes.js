const express = require('express');
const controller = require('../controllers/engineerController');
const validateRequest = require('../middlewares/validateRequest');
const asyncHandler = require('../utils/asyncHandler');
const {
  publicEngineerQuerySchema,
  engineerCodeParamsSchema,
} = require('../validators/engineerValidators');

const router = express.Router();

router.get(
  '/',
  validateRequest({ query: publicEngineerQuerySchema }),
  asyncHandler(controller.listEngineers),
);
router.get(
  '/:code',
  validateRequest({ params: engineerCodeParamsSchema }),
  asyncHandler(controller.getEngineer),
);

module.exports = router;
