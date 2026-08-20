const express = require('express');
const controller = require('../controllers/engineerPortalController');
const validateRequest = require('../middlewares/validateRequest');
const { loginLimiter } = require('../middlewares/rateLimiter');
const { requireEngineerAuth } = require('../middlewares/engineerAuthMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { loginBodySchema } = require('../validators/authValidators');
const {
  portalProjectQuerySchema,
  opportunityQuerySchema,
  availabilityBodySchema,
} = require('../validators/engineerPortalValidators');

const router = express.Router();

router.post(
  '/auth/login',
  loginLimiter,
  validateRequest({ body: loginBodySchema }),
  asyncHandler(controller.login),
);
router.get('/auth/me', requireEngineerAuth, asyncHandler(controller.me));
router.post('/auth/logout', requireEngineerAuth, asyncHandler(controller.logout));

router.use(requireEngineerAuth);
router.get('/dashboard', asyncHandler(controller.dashboard));
router.get('/profile', asyncHandler(controller.profile));
router.patch(
  '/profile/availability',
  validateRequest({ body: availabilityBodySchema }),
  asyncHandler(controller.updateAvailability),
);
router.get(
  '/projects',
  validateRequest({ query: portalProjectQuerySchema }),
  asyncHandler(controller.projects),
);
router.get(
  '/opportunities',
  validateRequest({ query: opportunityQuerySchema }),
  asyncHandler(controller.opportunities),
);
router.get('/performance', asyncHandler(controller.performance));

module.exports = router;
