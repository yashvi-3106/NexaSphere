import { activityTimelineService } from "../services/activityTimelineService.js";

export const getTimeline = (req, res) => {
  const userId = req.params.userId;

  res.json({
    timeline: activityTimelineService.getTimeline(userId)
  });
};

export const addActivity = (req, res) => {
  const userId = req.params.userId;

  activityTimelineService.addActivity(userId, req.body);

  res.json({
    success: true,
    message: "Activity added."
  });
};

export const getSummary = (req, res) => {
  res.json(
    activityTimelineService.getMonthlySummary(req.params.userId)
  );
};

export const getStats = (req, res) => {
  res.json(
    activityTimelineService.getStats(req.params.userId)
  );
};