const recommendationEngineService = require("../services/recommendationEngineService");

exports.getRecommendations = (req, res) => {
  try {
    const { userId } = req.params;
    const { category, limit } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const recommendations =
      recommendationEngineService.getRecommendations(
        userId,
        category,
        limit
      );

    res.status(200).json({
      success: true,
      message: "Recommendations fetched successfully",
      total:
        recommendations.recommendations?.length || 0,
      data: recommendations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recommendations",
      error: error.message,
    });
  }
};

exports.getTrendingRecommendations = (req, res) => {
  try {
    const data =
      recommendationEngineService.getTrendingRecommendations();

    res.status(200).json({
      success: true,
      message: "Trending recommendations fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch trending recommendations",
      error: error.message,
    });
  }
};

exports.submitFeedback = (req, res) => {
  try {
    const { userId } = req.params;
    const { recommendationId, feedback } = req.body;

    if (!recommendationId || !feedback) {
      return res.status(400).json({
        success: false,
        message:
          "Recommendation ID and feedback are required",
      });
    }

    const response =
      recommendationEngineService.submitFeedback(
        userId,
        recommendationId,
        feedback
      );

    res.status(200).json({
      success: true,
      message: "Feedback submitted successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      error: error.message,
    });
  }
};

exports.updateInterests = (req, res) => {
  try {
    const { userId } = req.params;
    const { interests } = req.body;

    if (!Array.isArray(interests)) {
      return res.status(400).json({
        success: false,
        message: "Interests should be an array",
      });
    }

    const result =
      recommendationEngineService.updateInterests(
        userId,
        interests
      );

    res.status(200).json({
      success: true,
      message: "User interests updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update interests",
      error: error.message,
    });
  }
};

exports.getRecommendationExplanation = (req, res) => {
  try {
    const { recommendationId } = req.params;

    const explanation =
      recommendationEngineService.getRecommendationExplanation(
        recommendationId
      );

    res.status(200).json({
      success: true,
      message: "Recommendation explanation generated",
      data: explanation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate explanation",
      error: error.message,
    });
  }
};

exports.markNotInterested = (req, res) => {
  try {
    const { userId, recommendationId } = req.params;

    const result =
      recommendationEngineService.markNotInterested(
        userId,
        recommendationId
      );

    res.status(200).json({
      success: true,
      message: "Recommendation hidden successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update recommendation",
      error: error.message,
    });
  }
};

exports.refreshRecommendations = (req, res) => {
  try {
    const { userId } = req.params;

    const data =
      recommendationEngineService.refreshRecommendations(
        userId
      );

    res.status(200).json({
      success: true,
      message: "Recommendations refreshed successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to refresh recommendations",
      error: error.message,
    });
  }
};

exports.getRecommendationStats = (req, res) => {
  try {
    const stats =
      recommendationEngineService.getRecommendationStats();

    res.status(200).json({
      success: true,
      message: "Recommendation analytics fetched successfully",
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};

exports.getRecommendationHealth = (req, res) => {
  res.status(200).json({
    success: true,
    service: "Recommendation Engine",
    status: "Running",
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
};  