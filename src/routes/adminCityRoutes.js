const express = require('express');
const controller = require('../controllers/cityController');
const validateRequest = require('../middlewares/validateRequest');
const { requireAdminAuth } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { idParamsSchema } = require('../validators/commonValidators');
const { cityBodySchema, updateCityBodySchema } = require('../validators/cityValidators');

const router = express.Router();
router.use(requireAdminAuth);
router.get('/cities', asyncHandler(controller.listAdminCities));
router.post('/cities', validateRequest({ body: cityBodySchema }), asyncHandler(controller.createCity));
router.put(
  '/cities/:id',
  validateRequest({ params: idParamsSchema, body: updateCityBodySchema }),
  asyncHandler(controller.updateCity),
);
router.delete(
  '/cities/:id',
  validateRequest({ params: idParamsSchema }),
  asyncHandler(controller.deleteCity),
);

module.exports = router;
