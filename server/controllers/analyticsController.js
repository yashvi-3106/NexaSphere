import { analyticsRepository } from '../repositories/analyticsRepository.js';
import { analyticsService, FUNNEL_STEP_TYPES } from '../services/analyticsService.js';

function wrapAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export const startSession = async (req, res) => {
  try {
    const sessionData = req.body; // { id, device, browser, os }
    sessionData.user_id = req.user?.id; // If authenticated
    const session = await analyticsRepository.createSession(sessionData);
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await analyticsRepository.endSession(sessionId);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const ingestEvents = async (req, res) => {
  try {
    const { sessionId, events } = req.body;
    const userId = req.user?.id;
    await analyticsService.processEventBatch(sessionId, userId, events);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const saveRecording = async (req, res) => {
  try {
    const { sessionId, eventsJson } = req.body;
    const rec = await analyticsRepository.saveRecording(sessionId, eventsJson);
    res.status(201).json(rec);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const adminGetRecordings = async (req, res) => {
  try {
    const recordings = await analyticsRepository.getRecordingsList();
    res.json(recordings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const adminGetRecording = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const events = await analyticsRepository.getRecording(sessionId);
    res.json(events || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const adminGetHeatmap = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'url required' });
    const data = await analyticsRepository.getHeatmapData(url);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const adminGetSegments = async (req, res) => {
  try {
    const segments = await analyticsRepository.getAllSegments();
    res.json(segments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const adminCreateSegment = async (req, res) => {
  try {
    const segment = await analyticsRepository.createSegment(req.body);
    res.status(201).json(segment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const adminPerformSegmentAction = async (req, res) => {
  try {
    const { segmentId } = req.params;
    const result = await analyticsService.performSegmentAction(segmentId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const adminGetCohortAnalysis = async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    if (!month) return res.status(400).json({ error: 'month required' });
    const data = await analyticsRepository.getCohortData(month);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logEvent = wrapAsync(async (req, res) => {
  const { type, path, metadata } = req.body;
  const userId = req.user?.id; // Optional
  const sessionId = req.headers['x-session-id'] || req.ip;

  await analyticsService.logEvent({ type, userId, sessionId, path, metadata });
  res.status(202).json({ success: true });
});

export const getDashboardSummary = wrapAsync(async (req, res) => {
  const summary = await analyticsService.getDashboardSummary();
  res.json({ success: true, summary });
});

export const getUserAnalytics = wrapAsync(async (req, res) => {
  const analytics = await analyticsService.getUserAnalytics();
  res.json({ success: true, analytics });
});

export const getEngagementFunnel = wrapAsync(async (req, res) => {
  const funnel = await analyticsService.getEngagementFunnel();
  res.json({ success: true, funnel });
});

/**
 * POST /api/admin/analytics/funnel/custom
 * Body: { steps: ['PAGE_VIEW', 'EVENT_REGISTER', 'EVENT_ATTEND'] }
 * Returns detailed funnel analysis with drop-off and time-between-steps.
 */
export const getCustomFunnel = wrapAsync(async (req, res) => {
  const { steps } = req.body;

  if (!Array.isArray(steps) || steps.length < 2) {
    return res.status(400).json({ error: 'At least 2 funnel steps are required' });
  }

  // Validate step names against known types
  const invalid = steps.filter((s) => !FUNNEL_STEP_TYPES.includes(s));
  if (invalid.length > 0) {
    return res.status(400).json({
      error: `Invalid step type(s): ${invalid.join(', ')}`,
      validTypes: FUNNEL_STEP_TYPES,
    });
  }

  const funnel = await analyticsService.getFunnelAnalysis(steps);
  res.json({ success: true, funnel, validStepTypes: FUNNEL_STEP_TYPES });
});

/**
 * GET /api/admin/analytics/funnel/steps
 * Returns the list of valid step types for the UI to build the step selector.
 */
export const getFunnelStepTypes = wrapAsync(async (req, res) => {
  res.json({ success: true, stepTypes: FUNNEL_STEP_TYPES });
});

export const executeCustomReport = wrapAsync(async (req, res) => {
  const { metric, timeRange } = req.body;
  const report = await analyticsService.executeCustomReport({ metric, timeRange });
  res.json({ success: true, report });
});

export const saveCustomReport = wrapAsync(async (req, res) => {
  const { name, description, config, scheduleType } = req.body;
  const report = await analyticsService.saveCustomReport({
    name,
    description,
    config,
    scheduleType,
  });
  res.json({ success: true, report });
});

export const getCustomReports = wrapAsync(async (req, res) => {
  const reports = await analyticsService.getCustomReports();
  res.json({ success: true, reports });
});
