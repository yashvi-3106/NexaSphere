import { Router } from "express";
import * as controller from "../controllers/activityTimelineController.js";

const router = Router();

router.get("/:userId", controller.getTimeline);

router.post("/:userId", controller.addActivity);

router.get("/:userId/summary", controller.getSummary);

router.get("/:userId/stats", controller.getStats);

export default router;