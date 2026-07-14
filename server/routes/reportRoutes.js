/**
 * reportRoutes.js
 * server/routes/reportRoutes.js
 *
 * Mount in api.js:
 *   import reportRouter from './reportRoutes.js';
 *   router.use('/api/admin/reports', adminAuthMiddleware.requireAdmin, reportRouter);
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  triggerReport,
  getArchive,
  downloadReport,
  getScheduleConfigs,
  upsertScheduleConfig,
} from '../controllers/reportController.js';

const router = Router();

const reportsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests to reports API' },
});

router.use(reportsLimiter);

router.post('/generate', triggerReport);
router.get('/archive', getArchive);
router.get('/archive/:id/download', downloadReport);
router.get('/schedule', getScheduleConfigs);
router.post('/schedule', upsertScheduleConfig);

export default router;
