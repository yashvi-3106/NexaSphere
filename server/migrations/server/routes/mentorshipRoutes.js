// server/routes/mentorshipRoutes.js
import { Router } from 'express';
import * as controller from '../controllers/mentorshipController.js';
// Assume your project has a generic validation helper middleware
import { validateBody } from '../middleware/validationMiddleware.js';
import { profileSetupSchema } from '../validators/mentorshipValidator.js';

const router = Router();

router.post('/profile', validateBody(profileSetupSchema), controller.setupProfile);
router.get('/suggestions', controller.fetchSuggestions);

export default router;
