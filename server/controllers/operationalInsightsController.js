const operationalInsightsService = require("../services/operationalInsightsService");
const { sendSuccess } = require("../utils/responseHelper.js");

exports.getDashboardOverview = (req, res) => {
  sendSuccess(res,
    operationalInsightsService.getDashboardOverview()
  );
};

exports.getSystemHealth = (req, res) => {
  sendSuccess(res,
    operationalInsightsService.getSystemHealth()
  );
};

exports.getActiveUsers = (req, res) => {
  sendSuccess(res,
    operationalInsightsService.getActiveUsers()
  );
};

exports.getApiTraffic = (req, res) => {
  sendSuccess(res,
    operationalInsightsService.getApiTraffic()
  );
};

exports.getDatabasePerformance = (req, res) => {
  sendSuccess(res,
    operationalInsightsService.getDatabasePerformance()
  );
};

exports.getBackgroundJobs = (req, res) => {
  sendSuccess(res,
    operationalInsightsService.getBackgroundJobs()
  );
};

exports.getStorageUsage = (req, res) => {
  sendSuccess(res,
    operationalInsightsService.getStorageUsage()
  );
};

exports.getNotificationStats = (req, res) => {
  sendSuccess(res,
    operationalInsightsService.getNotificationStats()
  );
};

exports.getErrorLogs = (req, res) => {
  sendSuccess(res,
    operationalInsightsService.getErrorLogs()
  );
};

exports.getMaintenanceSchedule = (req, res) => {
  sendSuccess(res,
    operationalInsightsService.getMaintenanceSchedule()
  );
};

exports.getDependencies = (req, res) => {
  sendSuccess(res,
    operationalInsightsService.getDependencies()
  );
};

exports.getResourceUsage = (req, res) => {
  sendSuccess(res,
    operationalInsightsService.getResourceUsage()
  );
};

exports.getOperationalReports = (req, res) => {
  sendSuccess(res,
    operationalInsightsService.getOperationalReports()
  );
};