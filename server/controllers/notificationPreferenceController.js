import { notificationPreferenceService } from "../services/notificationPreferenceService.js";

export const getPreferences = (req, res) => {
  res.json(
    notificationPreferenceService.getPreferences(req.params.userId)
  );
};

export const updatePreferences = (req, res) => {
  const updated =
    notificationPreferenceService.updatePreferences(
      req.params.userId,
      req.body
    );

  res.json(updated);
};

export const getHistory = (req, res) => {
  res.json({
    history:
      notificationPreferenceService.getHistory(req.params.userId),
  });
};