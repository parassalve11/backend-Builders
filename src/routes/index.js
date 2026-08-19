const express = require('express');
const mongoose = require('mongoose');
const engineerRoutes = require('./engineerRoutes');
const leadRoutes = require('./leadRoutes');
const projectRoutes = require('./projectRoutes');
const reviewRoutes = require('./reviewRoutes');
const cityRoutes = require('./cityRoutes');
const adminAuthRoutes = require('./adminAuthRoutes');
const adminEngineerRoutes = require('./adminEngineerRoutes');
const adminLeadRoutes = require('./adminLeadRoutes');
const adminProjectRoutes = require('./adminProjectRoutes');
const adminVerificationRoutes = require('./adminVerificationRoutes');
const adminDocumentRoutes = require('./adminDocumentRoutes');
const adminPerformanceRoutes = require('./adminPerformanceRoutes');
const adminCityRoutes = require('./adminCityRoutes');
const adminReviewRoutes = require('./adminReviewRoutes');
const adminDashboardRoutes = require('./adminDashboardRoutes');

const router = express.Router();

router.get('/health', (_req, res) => {
  const databaseStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    success: true,
    data: {
      status: 'ok',
      database: databaseStates[mongoose.connection.readyState] || 'unknown',
      timestamp: new Date().toISOString(),
    },
  });
});

router.use('/cities', cityRoutes);
router.use('/engineers', engineerRoutes);
router.use('/leads', leadRoutes);
router.use('/projects', projectRoutes);
router.use('/reviews', reviewRoutes);

router.use('/admin/auth', adminAuthRoutes);
router.use('/admin', adminDashboardRoutes);
router.use('/admin', adminEngineerRoutes);
router.use('/admin', adminLeadRoutes);
router.use('/admin', adminProjectRoutes);
router.use('/admin', adminVerificationRoutes);
router.use('/admin', adminDocumentRoutes);
router.use('/admin', adminPerformanceRoutes);
router.use('/admin', adminCityRoutes);
router.use('/admin', adminReviewRoutes);

module.exports = router;
