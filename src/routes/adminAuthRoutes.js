const express = require('express');
const controller = require('../controllers/adminAuthController');
const validateRequest = require('../middlewares/validateRequest');
const { loginLimiter } = require('../middlewares/rateLimiter');
const { requireAdminAuth } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { loginBodySchema } = require('../validators/authValidators');

const router = express.Router();

router.post('/login', loginLimiter, validateRequest({ body: loginBodySchema }), asyncHandler(controller.login));
router.get('/me', requireAdminAuth, asyncHandler(controller.me));
router.post('/logout', requireAdminAuth, asyncHandler(controller.logout));

module.exports = router;
