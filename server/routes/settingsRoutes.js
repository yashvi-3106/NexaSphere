/**
 * settingsRoutes.js
 *
 * Mount in api.js:
 *   import settingsRouter from './routes/settingsRoutes.js';
 *   router.use('/api/admin/settings', adminAuthMiddleware.requireAdmin, rateLimiter, settingsRouter);
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate.js';
import {
  updateSettingsSchema,
  rollbackSettingSchema,
  importSettingsSchema,
} from '../validators/routes/settingsRoutesSchemas.js';
import {
  getSettings,
  updateSettings,
  getHistory,
  rollbackSetting,
  exportSettings,
  importSettings,
} from '../controllers/settingsController.js';

const router = Router();

const settingsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests to settings API' },
});

router.use(settingsLimiter);

router.get('/', getSettings);
router.put('/', validate(updateSettingsSchema), updateSettings);
router.get('/history', getHistory);
router.post('/rollback', validate(rollbackSettingSchema), rollbackSetting);
router.get('/export', exportSettings);
router.post('/import', validate(importSettingsSchema), importSettings);

export default router;
