import operationalInsightsService from '../services/operationalInsightsService.js';

export const getDashboardOverview = (req, res) => {
  res.status(200).json(operationalInsightsService.getDashboardOverview());
};

export const getSystemHealth = (req, res) => {
  res.status(200).json(operationalInsightsService.getSystemHealth());
};

export const getActiveUsers = (req, res) => {
  res.status(200).json(operationalInsightsService.getActiveUsers());
};

export const getApiTraffic = (req, res) => {
  res.status(200).json(operationalInsightsService.getApiTraffic());
};

export const getDatabasePerformance = (req, res) => {
  res.status(200).json(operationalInsightsService.getDatabasePerformance());
};

export const getBackgroundJobs = (req, res) => {
  res.status(200).json(operationalInsightsService.getBackgroundJobs());
};

export const getStorageUsage = (req, res) => {
  res.status(200).json(operationalInsightsService.getStorageUsage());
};

export const getNotificationStats = (req, res) => {
  res.status(200).json(operationalInsightsService.getNotificationStats());
};

export const getErrorLogs = (req, res) => {
  res.status(200).json(operationalInsightsService.getErrorLogs());
};

export const getMaintenanceSchedule = (req, res) => {
  res.status(200).json(operationalInsightsService.getMaintenanceSchedule());
};

export const getDependencies = (req, res) => {
  res.status(200).json(operationalInsightsService.getDependencies());
};

export const getResourceUsage = (req, res) => {
  res.status(200).json(operationalInsightsService.getResourceUsage());
};

export const getOperationalReports = (req, res) => {
  res.status(200).json(operationalInsightsService.getOperationalReports());
};
