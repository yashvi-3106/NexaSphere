import { Router } from 'express';
import { faqController } from '../controllers/faqController.js';
import * as adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';

const router = Router();

// Public endpoints
router.get('/', faqController.getFAQs);
router.post('/:id/view', faqController.trackView);

// Admin endpoints
router.get('/admin', adminAuthMiddleware.requireAdmin, faqController.adminGetFAQs);
router.post('/admin', adminAuthMiddleware.requireAdmin, faqController.adminCreateFAQ);
router.put('/admin/:id', adminAuthMiddleware.requireAdmin, faqController.adminUpdateFAQ);
router.delete('/admin/:id', adminAuthMiddleware.requireAdmin, faqController.adminDeleteFAQ);

export default router;
