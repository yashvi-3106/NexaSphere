import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { getErrorStats, getAllErrorGroups, getErrorGroup } from '../utils/errorTracker.js';
import { getAllActiveTraces, getActiveTraceInfo } from '../middleware/enhancedTracingMiddleware.js';
import logger from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

const router = Router();

router.get('/errors', auth('admin'), async (req, res) => {
  try {
    const stats = getErrorStats();
    sendSuccess(res, { data: stats });
  } catch (error) {
    logger.error('Error fetching error stats', { error: error.message });
    sendError(req, res, error.message, 500, 'INTERNAL_ERROR');
  }
});

router.get('/errors/groups', auth('admin'), async (req, res) => {
  try {
    const groups = getAllErrorGroups();
    sendSuccess(res, { data: groups });
  } catch (error) {
    logger.error('Error fetching error groups', { error: error.message });
    sendError(req, res, error.message, 500, 'INTERNAL_ERROR');
  }
});

router.get('/errors/groups/:fingerprint', auth('admin'), async (req, res) => {
  try {
    const group = getErrorGroup(req.params.fingerprint);
    if (!group) {
      return sendError(req, res, 'Error group not found', 404, 'NOT_FOUND');
    }
    sendSuccess(res, { data: group });
  } catch (error) {
    logger.error('Error fetching error group', { error: error.message });
    sendError(req, res, error.message, 500, 'INTERNAL_ERROR');
  }
});

router.get('/traces', auth('admin'), async (req, res) => {
  try {
    const traces = getAllActiveTraces();
    sendSuccess(res, { data: traces });
  } catch (error) {
    logger.error('Error fetching traces', { error: error.message });
    sendError(req, res, error.message, 500, 'INTERNAL_ERROR');
  }
});

router.get('/traces/:reqId', auth('admin'), async (req, res) => {
  try {
    const traceInfo = getActiveTraceInfo(req.params.reqId);
    if (!traceInfo) {
      return sendError(req, res, 'Trace not found', 404, 'NOT_FOUND');
    }
    sendSuccess(res, { data: traceInfo });
  } catch (error) {
    logger.error('Error fetching trace', { error: error.message });
    sendError(req, res, error.message, 500, 'INTERNAL_ERROR');
  }
});

export default router;
