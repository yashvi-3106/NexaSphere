/**
 * Form Submission Routes
 * Handles public form submissions for membership, recruitment,
 * and core team applications with rate limiting.
 */

import { Router } from 'express';
import * as formsController from '../controllers/formsController.js';
import { formRateLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import {
  membershipFormSchema,
  recruitmentFormSchema,
  coreTeamFormSchema,
} from '../validators/routes/formsSchemas.js';

const router = Router();

router.post(
  '/forms/membership',
  validate(membershipFormSchema),
  formRateLimiter,
  formsController.makeHandleForm('membership')
);
router.post(
  '/forms/recruitment',
  validate(recruitmentFormSchema),
  formRateLimiter,
  formsController.makeHandleForm('recruitment')
);
router.post(
  '/core-team/apply',
  validate(coreTeamFormSchema),
  formRateLimiter,
  formsController.makeHandleForm('core_team')
);

router.post(
  '/submissions/membership',
  validate(membershipFormSchema),
  formRateLimiter,
  formsController.makeHandleForm('membership')
);
router.post(
  '/submissions/recruitment',
  validate(recruitmentFormSchema),
  formRateLimiter,
  formsController.makeHandleForm('recruitment')
);

export default router;
