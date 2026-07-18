import { Router } from "express";
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
  announcementPriorityController.createAnnouncement
);

// Update announcement priority
router.patch(
  "/:id/priority",
  announcementPriorityController.updatePriority
);

// Pin or unpin an announcement
router.patch(
  "/:id/pin",
  announcementPriorityController.pinAnnouncement
);

// Mark announcement as read
router.post(
  "/:id/read",
  announcementPriorityController.markRead
);

// Get analytics
router.get(
  "/analytics",
  announcementPriorityController.analytics
);

export default router;
router.get('/', announcementPriorityController.getAnnouncements);
router.post('/', announcementPriorityController.createAnnouncement);
router.patch('/:id/priority', announcementPriorityController.updatePriority);
router.patch('/:id/pin', announcementPriorityController.pinAnnouncement);
router.post('/:id/read', announcementPriorityController.markRead);
router.get('/analytics', announcementPriorityController.analytics);
