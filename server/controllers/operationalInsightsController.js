const operationalInsightsService = require("../services/operationalInsightsService");

exports.getDashboardOverview = (req, res) => {
  res.status(200).json(
    operationalInsightsService.getDashboardOverview()
  );
};

exports.getSystemHealth = (req, res) => {
  res.status(200).json(
    operationalInsightsService.getSystemHealth()
  );
};

exports.getActiveUsers = (req, res) => {
  res.status(200).json(
    operationalInsightsService.getActiveUsers()
  );
};

exports.getApiTraffic = (req, res) => {
  res.status(200).json(
    operationalInsightsService.getApiTraffic()
  );
};

exports.getDatabasePerformance = (req, res) => {
  res.status(200).json(
    operationalInsightsService.getDatabasePerformance()
  );
};

exports.getBackgroundJobs = (req, res) => {
  res.status(200).json(
    operationalInsightsService.getBackgroundJobs()
  );
};

exports.getStorageUsage = (req, res) => {
  res.status(200).json(
    operationalInsightsService.getStorageUsage()
  );
};

exports.getNotificationStats = (req, res) => {
  res.status(200).json(
    operationalInsightsService.getNotificationStats()
  );
};

exports.getErrorLogs = (req, res) => {
  res.status(200).json(
    operationalInsightsService.getErrorLogs()
  );
};

exports.getMaintenanceSchedule = (req, res) => {
  res.status(200).json(
    operationalInsightsService.getMaintenanceSchedule()
  );
};

exports.getDependencies = (req, res) => {
  res.status(200).json(
    operationalInsightsService.getDependencies()
  );
};

exports.getResourceUsage = (req, res) => {
  res.status(200).json(
    operationalInsightsService.getResourceUsage()
  );
};

exports.getOperationalReports = (req, res) => {
  res.status(200).json(
    operationalInsightsService.getOperationalReports()
  );
};