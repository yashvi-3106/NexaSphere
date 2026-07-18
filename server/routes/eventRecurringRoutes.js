import { Router } from 'express';
import * as eventRecurringController from '../controllers/eventRecurringController.js';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware.js';
import { adminAuditMiddleware, attachOldState } from '../middleware/adminAuditMiddleware.js';

const router = Router();

router.post(
  '/',
  adminAuthMiddleware.requireScope('events:write'),
  eventRecurringController.createSeries,
  adminAuditMiddleware
);

router.patch(
  '/:seriesId',
  adminAuthMiddleware.requireScope('events:write'),
  attachOldState('EventSeries'),
  eventRecurringController.updateSeries,
  adminAuditMiddleware
);

router.delete(
  '/:seriesId',
  adminAuthMiddleware.requireScope('events:write'),
  attachOldState('EventSeries'),
  eventRecurringController.deleteSeries,
  adminAuditMiddleware
);

export default router;
