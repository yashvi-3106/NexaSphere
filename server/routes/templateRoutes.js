import express from 'express';
import { getTemplates, createTemplate, cloneTemplate } from '../controllers/templateController.js';
import { adminAuth } from '../middleware/auth.js'; // Adjust based on your auth setup

const router = express.Router();

router.get('/', getTemplates);
router.post('/', adminAuth, createTemplate);
router.post('/:id/clone', adminAuth, cloneTemplate);

export default router;
