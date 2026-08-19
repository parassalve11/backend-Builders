const express = require('express');
const controller = require('../controllers/cityController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.get('/', asyncHandler(controller.listPublicCities));

module.exports = router;
