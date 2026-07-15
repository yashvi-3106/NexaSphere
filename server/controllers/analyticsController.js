import { analyticsService, FUNNEL_STEP_TYPES } from '../services/analyticsService.js';
import { analyticsRepository } from '../repositories/analyticsRepository.js';
import { sendSuccess, sendError, sendNoContent } from '../utils/responseHelper.js';

function wrapAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export const logEvent = wrapAsync(async (req, res) => {
  const { type, path, metadata } = req.body;
  const userId = req.user?.id; // Optional
  const sessionId = req.headers['x-session-id'] || req.ip;

  await analyticsService.logEvent({ type, userId, sessionId, path, metadata });
  return sendSuccess(res, { success: true }, 202);
});

export const getDashboardSummary = wrapAsync(async (req, res) => {
  const summary = await analyticsService.getDashboardSummary();
  return sendSuccess(res, { summary });
});

export const getUserAnalytics = wrapAsync(async (req, res) => {
  const analytics = await analyticsService.getUserAnalytics();
  return sendSuccess(res, { analytics });
});

export const getEngagementFunnel = wrapAsync(async (req, res) => {
  const funnel = await analyticsService.getEngagementFunnel();
  return sendSuccess(res, { funnel });
});

/**
 * POST /api/admin/analytics/funnel/custom
 * Body: { steps: ['PAGE_VIEW', 'EVENT_REGISTER', 'EVENT_ATTEND'] }
 * Returns detailed funnel analysis with drop-off and time-between-steps.
 */
export const getCustomFunnel = wrapAsync(async (req, res) => {
  const { steps } = req.body;

  if (!Array.isArray(steps) || steps.length < 2) {
    return sendError(req, res, 'At least 2 funnel steps are required', 400, 'VALIDATION_ERROR');
  }

  // Validate step names against known types
  const invalid = steps.filter((s) => !FUNNEL_STEP_TYPES.includes(s));
  if (invalid.length > 0) {
    return sendError(req, res, `Invalid step type(s): ${invalid.join(', ')}`, 400, 'VALIDATION_ERROR', { validTypes: FUNNEL_STEP_TYPES });
  }

  const funnel = await analyticsService.getFunnelAnalysis(steps);
  return sendSuccess(res, { funnel, validStepTypes: FUNNEL_STEP_TYPES });
});

/**
 * GET /api/admin/analytics/funnel/steps
 * Returns the list of valid step types for the UI to build the step selector.
 */
export const getFunnelStepTypes = wrapAsync(async (req, res) => {
  return sendSuccess(res, { stepTypes: FUNNEL_STEP_TYPES });
});

export const executeCustomReport = wrapAsync(async (req, res) => {
  const { metric, timeRange } = req.body;
  const report = await analyticsService.executeCustomReport({ metric, timeRange });
  return sendSuccess(res, { report });
});

export const saveCustomReport = wrapAsync(async (req, res) => {
  const { name, description, config, scheduleType } = req.body;
  const report = await analyticsService.saveCustomReport({
    name,
    description,
    config,
    scheduleType,
  });
  return sendSuccess(res, { report });
});

export const getCustomReports = wrapAsync(async (req, res) => {
  const reports = await analyticsService.getCustomReports();
  return sendSuccess(res, { reports });
});

export const startSession = wrapAsync(async (req, res) => {
  const sessionData = req.body; // { id, device, browser, os }
  sessionData.user_id = req.user?.id; // If authenticated
  const session = await analyticsRepository.createSession(sessionData);
  return sendSuccess(res, session, 201);
});

export const endSession = wrapAsync(async (req, res) => {
  const { sessionId } = req.params;
  const session = await analyticsRepository.endSession(sessionId);
  return sendSuccess(res, session);
});

export const ingestEvents = wrapAsync(async (req, res) => {
  const { sessionId, events } = req.body;
  const userId = req.user?.id;
  await analyticsService.processEventBatch(sessionId, userId, events);
  return sendSuccess(res, { success: true }, 201);
});

export const saveRecording = wrapAsync(async (req, res) => {
  const { sessionId, eventsJson } = req.body;
  const rec = await analyticsRepository.saveRecording(sessionId, eventsJson);
  return sendSuccess(res, rec, 201);
});

export const adminGetRecordings = wrapAsync(async (req, res) => {
  const recordings = await analyticsRepository.getRecordingsList();
  return sendSuccess(res, recordings);
});

export const adminGetRecording = wrapAsync(async (req, res) => {
  const { sessionId } = req.params;
  const events = await analyticsRepository.getRecording(sessionId);
  return sendSuccess(res, events || []);
});

export const adminGetHeatmap = wrapAsync(async (req, res) => {
  const { url } = req.query;
  if (!url) return sendError(req, res, 'url required', 400, 'VALIDATION_ERROR');
  const data = await analyticsRepository.getHeatmapData(url);
  return sendSuccess(res, data);
});

export const adminGetSegments = wrapAsync(async (req, res) => {
  const segments = await analyticsRepository.getAllSegments();
  return sendSuccess(res, segments);
});

export const adminCreateSegment = wrapAsync(async (req, res) => {
  const segment = await analyticsRepository.createSegment(req.body);
  return sendSuccess(res, segment, 201);
});

export const adminPerformSegmentAction = wrapAsync(async (req, res) => {
  const { segmentId } = req.params;
  const result = await analyticsService.performSegmentAction(segmentId, req.body);
  return sendSuccess(res, result);
});

export const adminGetCohortAnalysis = wrapAsync(async (req, res) => {
  const { month } = req.query; // YYYY-MM
  if (!month) return sendError(req, res, 'month required', 400, 'VALIDATION_ERROR');
  const data = await analyticsRepository.getCohortData(month);
  return sendSuccess(res, data);
});
