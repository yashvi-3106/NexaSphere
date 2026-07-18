import express from 'express';
import { getAdvancedProfile } from '../controllers/advancedProfileController.js';

const router = express.Router();

router.get('/auth/profile/advanced', getAdvancedProfile);

export default router;
