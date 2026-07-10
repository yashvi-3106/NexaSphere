import { Router } from 'express';
import * as smartFormsController from '../controllers/smartFormsController.js';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware.js';
import { adminAuditMiddleware } from '../middleware/adminAuditMiddleware.js';

const router = Router({ mergeParams: true });

// Mounted at /api/events/:eventId/forms

// Event-specific routes
router.get('/', smartFormsController.getForms);
router.post(
  '/',
  adminAuthMiddleware.requireScope('events:write'),
  smartFormsController.createForm,
  adminAuditMiddleware
);

export default router;
