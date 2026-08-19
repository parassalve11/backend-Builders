const express = require('express');
const controller = require('../controllers/adminDashboardController');
const { requireAdminAuth } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.get('/dashboard', requireAdminAuth, asyncHandler(controller.dashboardOverview));

module.exports = router;
