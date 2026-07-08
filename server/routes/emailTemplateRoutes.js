import { Router } from 'express';
import { emailTemplateController } from '../controllers/emailTemplateController.js';
import * as adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';

const router = Router();

// All routes here are admin only
router.use(adminAuthMiddleware.requireAdmin);

router.get('/', emailTemplateController.getTemplates);
router.get('/:name', emailTemplateController.getTemplate);
router.put('/:name', emailTemplateController.updateTemplate);
router.post('/:name/reset', emailTemplateController.resetTemplate);
router.post('/:name/preview', emailTemplateController.previewTemplate);
router.post('/:name/test', emailTemplateController.testTemplate);

export default router;
