import { moderationService } from '../services/moderationService.js';
import { sendSuccess, sendError, sendNoContent } from '../utils/responseHelper.js';

function wrapAsync(fn) {
  return (req, res) =>
    Promise.resolve(fn(req, res)).catch((e) => {
      let status = 500;
      const msg = e.message || '';

      if (msg.includes('Forbidden') || msg.includes('permission')) {
        status = 403;
      } else if (msg.includes('Authentication') || msg.includes('authorized')) {
        status = 401;
      } else if (msg.includes('not found') || msg.includes('Not found')) {
        status = 404;
      } else if (msg.includes('invalid') || msg.includes('required') || msg.includes('Cannot')) {
        status = 400;
      }

      sendError(req, res, msg || 'Internal server error', status);
    });
}

// --- Flagged Content ---
export const createFlag = wrapAsync(async (req, res) => {
  const { contentType, contentId, contentPreview, userId, flagType, reason } = req.body;
  if (!contentType || !contentId || !flagType) {
    return sendError(req, res, 'contentType, contentId, and flagType are required', 400, 'VALIDATION_ERROR');
  }

  const flag = await moderationService.reportContent(
    contentType,
    contentId,
    contentPreview,
    userId,
    req.studentUser?.id,
    flagType,
    reason
  );
  return sendSuccess(res, flag, 201);
});

export const getFlags = wrapAsync(async (req, res) => {
  const { status, flagType, severity, contentType, userId, limit, offset } = req.query;
  const filters = {};
  if (status) filters.status = status;
  if (flagType) filters.flagType = flagType;
  if (severity) filters.severity = severity;
  if (contentType) filters.contentType = contentType;
  if (userId) filters.userId = userId;
  if (limit) filters.limit = parseInt(limit, 10);
  if (offset) filters.offset = parseInt(offset, 10);

  const flags = await moderationService.getFlags(filters);
  return sendSuccess(res, { flags });
});

export const getFlagById = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const flag = await moderationService.getFlagById(id);
  return sendSuccess(res, flag);
});

export const resolveFlag = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const { resolution, note } = req.body;
  if (!resolution) {
    return sendError(req, res, 'Resolution is required (approved, removed, warned, banned)', 400, 'VALIDATION_ERROR');
  }

  const validResolutions = ['approved', 'removed', 'warned', 'banned'];
  if (!validResolutions.includes(resolution)) {
    return sendError(req, res, `Invalid resolution. Must be one of: ${validResolutions.join(', ')}`, 400, 'VALIDATION_ERROR');
  }

  const updated = await moderationService.resolveFlag(id, resolution, req.studentUser?.id, note);
  return sendSuccess(res, updated);
});

export const approveFlag = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const updated = await moderationService.approveFlag(id, req.studentUser?.id);
  return sendSuccess(res, updated);
});

export const removeFlaggedContent = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const updated = await moderationService.removeFlaggedContent(id, req.studentUser?.id, reason);
  return sendSuccess(res, updated);
});

export const escalateFlag = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const updated = await moderationService.escalateFlag(id, req.studentUser?.id);
  return sendSuccess(res, updated);
});

export const deleteFlag = wrapAsync(async (req, res) => {
  const { id } = req.params;
  await moderationService.deleteFlag(id);
  return sendSuccess(res, { success: true });
});

// --- User Warnings ---
export const warnUser = wrapAsync(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;
  if (!reason) {
    return sendError(req, res, 'Reason is required', 400, 'VALIDATION_ERROR');
  }

  const result = await moderationService.warnUser(userId, req.studentUser?.id, reason);
  return sendSuccess(res, result);
});

export const getUserWarnings = wrapAsync(async (req, res) => {
  const { userId } = req.params;
  const warnings = await moderationService.getUserWarnings(userId);
  return sendSuccess(res, { warnings });
});

// --- Moderator Notes ---
export const addModeratorNote = wrapAsync(async (req, res) => {
  const { targetType, targetId, note } = req.body;
  if (!targetType || !targetId || !note) {
    return sendError(req, res, 'targetType, targetId, and note are required', 400, 'VALIDATION_ERROR');
  }

  const result = await moderationService.addModeratorNote(
    targetType,
    targetId,
    note,
    req.studentUser?.id
  );
  return sendSuccess(res, result, 201);
});

export const getModeratorNotes = wrapAsync(async (req, res) => {
  const { targetType, targetId } = req.query;
  if (!targetType || !targetId) {
    return sendError(req, res, 'targetType and targetId are required', 400, 'VALIDATION_ERROR');
  }

  const notes = await moderationService.getModeratorNotes(targetType, targetId);
  return sendSuccess(res, { notes });
});

// --- Appeals ---
export const submitAppeal = wrapAsync(async (req, res) => {
  const { flagId, reason } = req.body;
  if (!flagId || !reason) {
    return sendError(req, res, 'flagId and reason are required', 400, 'VALIDATION_ERROR');
  }

  const appeal = await moderationService.submitAppeal(flagId, req.studentUser?.id, reason);
  return sendSuccess(res, appeal, 201);
});

export const reviewAppeal = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const { decision, decisionNote } = req.body;
  if (!decision) {
    return sendError(req, res, 'Decision is required (upheld, overturned)', 400, 'VALIDATION_ERROR');
  }

  const validDecisions = ['upheld', 'overturned'];
  if (!validDecisions.includes(decision)) {
    return sendError(req, res, `Invalid decision. Must be one of: ${validDecisions.join(', ')}`, 400, 'VALIDATION_ERROR');
  }

  const updated = await moderationService.reviewAppeal(
    id,
    req.studentUser?.id,
    decision,
    decisionNote
  );
  return sendSuccess(res, updated);
});

export const getAppeals = wrapAsync(async (req, res) => {
  const { status, userId } = req.query;
  const filters = {};
  if (status) filters.status = status;
  if (userId) filters.userId = userId;

  const appeals = await moderationService.getAppeals(filters);
  return sendSuccess(res, { appeals });
});

// --- Analytics ---
export const getFlagStats = wrapAsync(async (req, res) => {
  const stats = await moderationService.getFlagStats();
  return sendSuccess(res, stats);
});

export const getFlagStatsByType = wrapAsync(async (req, res) => {
  const stats = await moderationService.getFlagStatsByType();
  return sendSuccess(res, { stats });
});

export const getFlagVolumeOverTime = wrapAsync(async (req, res) => {
  const { days } = req.query;
  const volume = await moderationService.getFlagVolumeOverTime(days ? parseInt(days, 10) : 30);
  return sendSuccess(res, { volume });
});

export const getTopViolatingUsers = wrapAsync(async (req, res) => {
  const { limit } = req.query;
  const users = await moderationService.getTopViolatingUsers(limit ? parseInt(limit, 10) : 10);
  return sendSuccess(res, { users });
});

export const getModeratorWorkload = wrapAsync(async (req, res) => {
  const workload = await moderationService.getModeratorWorkload();
  return sendSuccess(res, { workload });
});

export const getUserContentHistory = wrapAsync(async (req, res) => {
  const { userId } = req.params;
  const { limit } = req.query;
  const history = await moderationService.getUserContentHistory(
    userId,
    limit ? parseInt(limit, 10) : 50
  );
  return sendSuccess(res, { history });
});

// --- Bulk Actions ---
export const approveAllFromUser = wrapAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await moderationService.approveAllFromUser(userId, req.studentUser?.id);
  return sendSuccess(res, result);
});

export const bulkResolve = wrapAsync(async (req, res) => {
  const { flagIds, resolution, note } = req.body;
  if (!flagIds || !Array.isArray(flagIds) || !resolution) {
    return sendError(req, res, 'flagIds (array) and resolution are required', 400, 'VALIDATION_ERROR');
  }

  const results = await moderationService.bulkResolve(
    flagIds,
    resolution,
    req.studentUser?.id,
    note
  );
  return sendSuccess(res, { results });
});
