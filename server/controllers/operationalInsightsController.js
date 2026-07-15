import operationalInsightsService from '../services/operationalInsightsService.js';
import { sendSuccess } from '../utils/responseHelper.js';

export const getDashboardOverview = (req, res) => {
  sendSuccess(res, operationalInsightsService.getDashboardOverview());
};

export const getSystemHealth = (req, res) => {
  sendSuccess(res, operationalInsightsService.getSystemHealth());
};

export const getActiveUsers = (req, res) => {
  sendSuccess(res, operationalInsightsService.getActiveUsers());
};

export const getApiTraffic = (req, res) => {
  sendSuccess(res, operationalInsightsService.getApiTraffic());
};

export const getDatabasePerformance = (req, res) => {
  sendSuccess(res, operationalInsightsService.getDatabasePerformance());
};

export const getBackgroundJobs = (req, res) => {
  sendSuccess(res, operationalInsightsService.getBackgroundJobs());
};

export const getStorageUsage = (req, res) => {
  sendSuccess(res, operationalInsightsService.getStorageUsage());
};

export const getNotificationStats = (req, res) => {
  sendSuccess(res, operationalInsightsService.getNotificationStats());
};

export const getErrorLogs = (req, res) => {
  sendSuccess(res, operationalInsightsService.getErrorLogs());
};

export const getMaintenanceSchedule = (req, res) => {
  sendSuccess(res, operationalInsightsService.getMaintenanceSchedule());
};

export const getDependencies = (req, res) => {
  sendSuccess(res, operationalInsightsService.getDependencies());
};

export const getResourceUsage = (req, res) => {
  sendSuccess(res, operationalInsightsService.getResourceUsage());
};

export const getOperationalReports = (req, res) => {
  sendSuccess(res, operationalInsightsService.getOperationalReports());
};
