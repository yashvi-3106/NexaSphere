import { segmentationService } from '../services/segmentationService.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

function wrapAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export const createSegment = wrapAsync(async (req, res) => {
  const segment = await segmentationService.createSegment(req.body);
  sendSuccess(res, { segment }, 201);
});

export const getSegments = wrapAsync(async (req, res) => {
  const segments = await segmentationService.getSegments();
  sendSuccess(res, { segments });
});

export const getSegmentById = wrapAsync(async (req, res) => {
  const segment = await segmentationService.getSegmentById(req.params.id);
  if (!segment) return sendError(req, res, 'Segment not found', 404, 'NOT_FOUND');
  sendSuccess(res, { segment });
});

export const updateSegment = wrapAsync(async (req, res) => {
  const segment = await segmentationService.updateSegment(req.params.id, req.body);
  sendSuccess(res, { segment });
});

export const deleteSegment = wrapAsync(async (req, res) => {
  const success = await segmentationService.deleteSegment(req.params.id);
  if (!success) return sendError(req, res, 'Segment not found', 404, 'NOT_FOUND');
  sendSuccess(res, { success: true });
});

export const getSegmentUsers = wrapAsync(async (req, res) => {
  const users = await segmentationService.getSegmentUsers(req.params.id);
  sendSuccess(res, { users, count: users.length });
});

export const triggerAutoSegmentation = wrapAsync(async (req, res) => {
  await segmentationService.runAutoSegmentation();
  sendSuccess(res, { message: 'Auto-segmentation completed' });
});
