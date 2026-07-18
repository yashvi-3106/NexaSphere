import { Router } from 'express';
import * as smartFormsController from '../controllers/smartFormsController.js';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware.js';
import { adminAuditMiddleware } from '../middleware/adminAuditMiddleware.js';

const router = Router();

// Mounted at /api/forms

router.get('/:formId', smartFormsController.getFormById);

router.patch(
  '/:formId',
  adminAuthMiddleware.requireScope('events:write'),
  smartFormsController.updateForm,
  adminAuditMiddleware
);

router.delete(
  '/:formId',
  adminAuthMiddleware.requireScope('events:write'),
  smartFormsController.deleteForm,
  adminAuditMiddleware
);

// Responses & Analytics
router.post('/:formId/responses', smartFormsController.submitResponse);

router.get(
  '/:formId/responses',
  adminAuthMiddleware.requireScope('events:read'),
  smartFormsController.getResponses
);

router.patch(
  '/responses/:responseId/status',
  adminAuthMiddleware.requireScope('events:write'),
  smartFormsController.updateResponseStatus,
  adminAuditMiddleware
);

router.get(
  '/:formId/analytics',
  adminAuthMiddleware.requireScope('events:read'),
  smartFormsController.getAnalytics
);

export default router;
