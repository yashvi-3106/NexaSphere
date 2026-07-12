const express = require("express");
const router = express.Router();

const apiAnalyticsController = require("../controllers/apiAnalyticsController");

// API Usage Dashboard
router.get("/dashboard", apiAnalyticsController.getDashboard);

// Request Analytics
router.get("/requests", apiAnalyticsController.getRequestAnalytics);

// Response Time Monitoring
router.get("/response-times", apiAnalyticsController.getResponseTimes);

// Error Tracking
router.get("/errors", apiAnalyticsController.getErrorAnalytics);

// Interactive API Documentation
router.get("/docs", apiAnalyticsController.getDocumentation);

// SDK Documentation
router.get("/sdk", apiAnalyticsController.getSDKDocs);

// Changelog
router.get("/changelog", apiAnalyticsController.getChangelog);

// API Versions
router.get("/versions", apiAnalyticsController.getVersions);

// API Key Management
router.get("/keys", apiAnalyticsController.getApiKeys);
router.post("/keys", apiAnalyticsController.generateApiKey);
router.delete("/keys/:id", apiAnalyticsController.revokeApiKey);

// Rate Limit Visualization
router.get("/rate-limits", apiAnalyticsController.getRateLimits);

// Testing Sandbox
router.get("/sandbox", apiAnalyticsController.getSandbox);

// Developer Announcements
router.get("/announcements", apiAnalyticsController.getAnnouncements);

module.exports = router;