const express = require('express');
const controller = require('../controllers/projectController');
const validateRequest = require('../middlewares/validateRequest');
const asyncHandler = require('../utils/asyncHandler');
const { publicProjectParamsSchema } = require('../validators/projectValidators');

const router = express.Router();

router.get(
  '/:projectCode/public',
  validateRequest({ params: publicProjectParamsSchema }),
  asyncHandler(controller.getPublicProject),
);

module.exports = router;
