import { Router } from "express";
import { validate } from "../middleware/validate.js";
import {
  createAnnouncementSchema,
  updatePriorityBodySchema,
  updatePriorityParamsSchema,
  pinAnnouncementBodySchema,
  pinAnnouncementParamsSchema,
  markReadBodySchema,
  markReadParamsSchema,
} from "../validators/routes/announcementPrioritySchemas.js";
import * as announcementPriorityController from "../controllers/announcementPriorityController.js";

const router = Router();

// Get all announcements
router.get(
  "/",
  announcementPriorityController.getAnnouncements
);

// Create a new announcement
router.post(
  "/",
  validate(createAnnouncementSchema),
  announcementPriorityController.createAnnouncement
);

// Update announcement priority
router.patch(
  "/:id/priority",
  validate(updatePriorityParamsSchema, "params"),
  validate(updatePriorityBodySchema),
  announcementPriorityController.updatePriority
);

// Pin or unpin an announcement
router.patch(
  "/:id/pin",
  validate(pinAnnouncementParamsSchema, "params"),
  validate(pinAnnouncementBodySchema),
  announcementPriorityController.pinAnnouncement
);

// Mark announcement as read
router.post(
  "/:id/read",
  validate(markReadParamsSchema, "params"),
  validate(markReadBodySchema),
  announcementPriorityController.markRead
);

// Get analytics
router.get(
  "/analytics",
  announcementPriorityController.analytics
);

export default router;