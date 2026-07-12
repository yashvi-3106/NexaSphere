const apiAnalyticsService = require("../services/apiAnalyticsService");

// Dashboard
const getDashboard = async (req, res) => {
  try {
    const dashboard = await apiAnalyticsService.getDashboard();

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch API dashboard.",
      error: error.message,
    });
  }
};

// Request Analytics
const getRequestAnalytics = async (req, res) => {
  try {
    const analytics = await apiAnalyticsService.getRequestAnalytics();

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch request analytics.",
      error: error.message,
    });
  }
};

// Response Time Monitoring
const getResponseTimes = async (req, res) => {
  try {
    const responseTimes = await apiAnalyticsService.getResponseTimes();

    res.status(200).json({
      success: true,
      data: responseTimes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch response times.",
      error: error.message,
    });
  }
};

// Error Tracking
const getErrorAnalytics = async (req, res) => {
  try {
    const errors = await apiAnalyticsService.getErrorAnalytics();

    res.status(200).json({
      success: true,
      data: errors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch error analytics.",
      error: error.message,
    });
  }
};

// API Documentation
const getDocumentation = async (req, res) => {
  try {
    const docs = await apiAnalyticsService.getDocumentation();

    res.status(200).json({
      success: true,
      data: docs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch API documentation.",
      error: error.message,
    });
  }
};

// SDK Documentation
const getSDKDocs = async (req, res) => {
  try {
    const sdk = await apiAnalyticsService.getSDKDocs();

    res.status(200).json({
      success: true,
      data: sdk,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch SDK documentation.",
      error: error.message,
    });
  }
};

// Changelog
const getChangelog = async (req, res) => {
  try {
    const changelog = await apiAnalyticsService.getChangelog();

    res.status(200).json({
      success: true,
      data: changelog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch changelog.",
      error: error.message,
    });
  }
};

// API Versions
const getVersions = async (req, res) => {
  try {
    const versions = await apiAnalyticsService.getVersions();

    res.status(200).json({
      success: true,
      data: versions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch API versions.",
      error: error.message,
    });
  }
};

// API Keys
const getApiKeys = async (req, res) => {
  try {
    const keys = await apiAnalyticsService.getApiKeys();

    res.status(200).json({
      success: true,
      data: keys,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch API keys.",
      error: error.message,
    });
  }
};

const generateApiKey = async (req, res) => {
  try {
    const key = await apiAnalyticsService.generateApiKey(req.body);

    res.status(201).json({
      success: true,
      message: "API key generated successfully.",
      data: key,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate API key.",
      error: error.message,
    });
  }
};

const revokeApiKey = async (req, res) => {
  try {
    const key = await apiAnalyticsService.revokeApiKey(req.params.id);

    res.status(200).json({
      success: true,
      message: "API key revoked successfully.",
      data: key,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to revoke API key.",
      error: error.message,
    });
  }
};

// Rate Limits
const getRateLimits = async (req, res) => {
  try {
    const limits = await apiAnalyticsService.getRateLimits();

    res.status(200).json({
      success: true,
      data: limits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch rate limits.",
      error: error.message,
    });
  }
};

// Testing Sandbox
const getSandbox = async (req, res) => {
  try {
    const sandbox = await apiAnalyticsService.getSandbox();

    res.status(200).json({
      success: true,
      data: sandbox,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch testing sandbox.",
      error: error.message,
    });
  }
};

// Developer Announcements
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await apiAnalyticsService.getAnnouncements();

    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch developer announcements.",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
  getRequestAnalytics,
  getResponseTimes,
  getErrorAnalytics,
  getDocumentation,
  getSDKDocs,
  getChangelog,
  getVersions,
  getApiKeys,
  generateApiKey,
  revokeApiKey,
  getRateLimits,
  getSandbox,
  getAnnouncements,
};