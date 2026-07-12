import express from 'express';
const router = express.Router();

import * as controller from '../controllers/operationalInsightsController.js';

router.get('/overview', controller.getDashboardOverview);

router.get('/health', controller.getSystemHealth);

router.get('/users', controller.getActiveUsers);

router.get('/traffic', controller.getApiTraffic);

router.get('/database', controller.getDatabasePerformance);

router.get('/jobs', controller.getBackgroundJobs);

router.get('/storage', controller.getStorageUsage);

router.get('/notifications', controller.getNotificationStats);

router.get('/errors', controller.getErrorLogs);

router.get('/maintenance', controller.getMaintenanceSchedule);

router.get('/dependencies', controller.getDependencies);

router.get('/resources', controller.getResourceUsage);

router.get('/reports', controller.getOperationalReports);

export default router;
