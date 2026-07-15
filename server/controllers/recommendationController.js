import { recommendationService } from '../services/recommendationService.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

function wrapAsync(fn) {
  return (req, res) =>
    Promise.resolve(fn(req, res)).catch((err) => {
      console.error('[RecommendationController]', err);
      sendError(req, res, 'Internal server error', 500, 'INTERNAL_ERROR');
    });
}

// GET /api/recommendations?userId=&limit=&page=
export const getRecommendations = wrapAsync(async (req, res) => {
  const { userId, limit = 10, page = 1 } = req.query;
  if (!userId) return sendError(req, res, 'userId is required', 400, 'VALIDATION_ERROR');

  const result = await recommendationService.getRecommendations(userId, {
    limit: parseInt(limit, 10),
    page: parseInt(page, 10),
  });
  sendSuccess(res, { ...result });
});

// GET /api/recommendations/similar/:eventId?limit=
export const getSimilarEvents = wrapAsync(async (req, res) => {
  const { eventId } = req.params;
  const { limit = 6 } = req.query;

  const similar = await recommendationService.getSimilarEvents(eventId, {
    limit: parseInt(limit, 10),
  });
  sendSuccess(res, { similar });
});

// GET /api/recommendations/trending?limit=
export const getTrendingEvents = wrapAsync(async (req, res) => {
  const { limit = 10 } = req.query;
  const trending = await recommendationService.getTrendingEvents({ limit: parseInt(limit, 10) });
  sendSuccess(res, { trending });
});

// GET /api/recommendations/preferences/:userId
export const getPreferences = wrapAsync(async (req, res) => {
  const { userId } = req.params;
  const prefs = await recommendationService.getPreferences(userId);
  sendSuccess(res, { preferences: prefs });
});

// PUT /api/recommendations/preferences/:userId
export const upsertPreferences = wrapAsync(async (req, res) => {
  const { userId } = req.params;
  const { interests, preferredDays } = req.body;

  if (!Array.isArray(interests)) {
    return sendError(req, res, 'interests must be an array', 400, 'VALIDATION_ERROR');
  }

  const prefs = await recommendationService.upsertPreferences(userId, { interests, preferredDays });
  sendSuccess(res, { preferences: prefs });
});

// POST /api/recommendations/interact
export const trackInteraction = wrapAsync(async (req, res) => {
  const { userId, eventId, type } = req.body;
  if (!userId || !eventId || !type) {
    return sendError(req, res, 'userId, eventId, and type are required', 400, 'VALIDATION_ERROR');
  }

  const interaction = await recommendationService.trackInteraction(userId, eventId, type);
  sendSuccess(res, { interaction }, 201);
});

// GET /api/recommendations/interactions/:userId
export const getInteractions = wrapAsync(async (req, res) => {
  const { userId } = req.params;
  const interactions = await recommendationService.getInteractions(userId);
  sendSuccess(res, { interactions });
});
