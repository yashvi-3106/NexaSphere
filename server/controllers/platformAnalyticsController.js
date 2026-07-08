import platformAnalyticsService from "../services/platformAnalyticsService.js";

export const getDashboardOverview = (req, res) => {
  res.status(200).json({
    success: true,
    data: platformAnalyticsService.getDashboardOverview(),
  });
};

export const getUserAnalytics = (req, res) => {
  res.status(200).json({
    success: true,
    data: platformAnalyticsService.getUserAnalytics(),
  });
};

export const getEventAnalytics = (req, res) => {
  res.status(200).json({
    success: true,
    data: platformAnalyticsService.getEventAnalytics(),
  });
};

export const getClubAnalytics = (req, res) => {
  res.status(200).json({
    success: true,
    data: platformAnalyticsService.getClubAnalytics(),
  });
};

export const getPortfolioAnalytics = (req, res) => {
  res.status(200).json({
    success: true,
    data: platformAnalyticsService.getPortfolioAnalytics(),
  });
};

export const getGrowthAnalytics = (req, res) => {
  res.status(200).json({
    success: true,
    data: platformAnalyticsService.getGrowthAnalytics(),
  });
};

export const exportReport = (req, res) => {
  res.status(200).json({
    success: true,
    data: platformAnalyticsService.exportReport(),
  });
};