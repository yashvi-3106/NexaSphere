import { Router } from 'express';
import * as recommendationController from '../controllers/recommendationEngineController.js';

const router = Router();

// ===============================
// Recommendation APIs
// ===============================

// Get personalized recommendations
router.get('/:userId', recommendationController.getRecommendations);

// Refresh recommendations
router.get('/:userId/refresh', recommendationController.refreshRecommendations);

// Update user interests
router.put('/:userId/interests', recommendationController.updateInterests);

// Submit recommendation feedback
router.post('/:userId/feedback', recommendationController.submitFeedback);

// Mark recommendation as "Not Interested"
router.post(
  '/:userId/not-interested/:recommendationId',
  recommendationController.markNotInterested
);

// ===============================
// Trending & Analytics
// ===============================

// Trending recommendations
router.get('/trending', recommendationController.getTrendingRecommendations);

// Recommendation statistics
router.get('/stats', recommendationController.getRecommendationStats);

// Recommendation engine health
router.get('/health', recommendationController.getRecommendationHealth);

// Recommendation explanation
router.get('/explanation/:recommendationId', recommendationController.getRecommendationExplanation);

export default router;
