const express = require('express');
const controller = require('../controllers/adminDocumentController');
const validateRequest = require('../middlewares/validateRequest');
const { requireAdminAuth } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { idParamsSchema } = require('../validators/commonValidators');
const {
  documentBodySchema,
  updateDocumentBodySchema,
  documentQuerySchema,
} = require('../validators/adminResourceValidators');

const router = express.Router();
router.use(requireAdminAuth);

router.get(
  '/documents',
  validateRequest({ query: documentQuerySchema }),
  asyncHandler(controller.listAllDocuments),
);
router.get(
  '/engineers/:id/documents',
  validateRequest({ params: idParamsSchema }),
  asyncHandler(controller.listEngineerDocuments),
);
router.post(
  '/engineers/:id/documents',
  validateRequest({ params: idParamsSchema, body: documentBodySchema }),
  asyncHandler(controller.createDocument),
);
router.put(
  '/documents/:id',
  validateRequest({ params: idParamsSchema, body: updateDocumentBodySchema }),
  asyncHandler(controller.updateDocument),
);
router.delete(
  '/documents/:id',
  requireRole('superadmin', 'admin'),
  validateRequest({ params: idParamsSchema }),
  asyncHandler(controller.deleteDocument),
);

module.exports = router;
