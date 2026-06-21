import { analyticsRepository } from '../repositories/analyticsRepository.js';
import { analyticsService } from '../services/analyticsService.js';

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
