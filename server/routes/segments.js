import { Router } from 'express';
import * as userSegmentsController from '../controllers/userSegmentsController.js';

const router = Router();

router.get('/', userSegmentsController.getSegments);
router.post('/', userSegmentsController.createSegment);
router.get('/:id', userSegmentsController.getSegmentById);
router.put('/:id', userSegmentsController.updateSegment);
router.delete('/:id', userSegmentsController.deleteSegment);
router.get('/:id/users', userSegmentsController.getSegmentUsers);

// Trigger auto-segmentation manually
router.post('/auto/trigger', userSegmentsController.triggerAutoSegmentation);

export default router;
