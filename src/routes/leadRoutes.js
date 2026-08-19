const express = require('express');
const controller = require('../controllers/leadController');
const validateRequest = require('../middlewares/validateRequest');
const { leadLimiter } = require('../middlewares/rateLimiter');
const asyncHandler = require('../utils/asyncHandler');
const { createLeadBodySchema } = require('../validators/leadValidators');

const router = express.Router();

router.post(
  '/',
  leadLimiter,
  validateRequest({ body: createLeadBodySchema }),
  asyncHandler(controller.createLead),
);

module.exports = router;
