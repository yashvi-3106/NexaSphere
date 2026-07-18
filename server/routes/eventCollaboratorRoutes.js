import { Router } from 'express';
import { eventCollaboratorController } from '../controllers/eventCollaboratorController.js';
import { requireStudentAuth } from '../middleware/studentAuthMiddleware.js';

const router = Router({ mergeParams: true }); // mergeParams to access event_id

// We assume these endpoints are mounted at /api/events/:event_id/collaborators
// Authentication is required for all collaborator routes
router.use(requireStudentAuth);

router.get('/', eventCollaboratorController.list);
router.post('/invite', eventCollaboratorController.invite);
router.post('/accept', eventCollaboratorController.accept);
router.delete('/', eventCollaboratorController.remove);

// Messaging
router.get('/messages', eventCollaboratorController.getMessages);
router.post('/messages', eventCollaboratorController.addMessage);

export default router;
