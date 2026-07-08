import { segmentationService } from '../services/segmentationService.js';

function wrapAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export const createSegment = wrapAsync(async (req, res) => {
  const segment = await segmentationService.createSegment(req.body);
  res.status(201).json({ success: true, segment });
});

export const getSegments = wrapAsync(async (req, res) => {
  const segments = await segmentationService.getSegments();
  res.json({ success: true, segments });
});

export const getSegmentById = wrapAsync(async (req, res) => {
  const segment = await segmentationService.getSegmentById(req.params.id);
  if (!segment) return res.status(404).json({ error: 'Segment not found' });
  res.json({ success: true, segment });
});

export const updateSegment = wrapAsync(async (req, res) => {
  const segment = await segmentationService.updateSegment(req.params.id, req.body);
  res.json({ success: true, segment });
});

export const deleteSegment = wrapAsync(async (req, res) => {
  const success = await segmentationService.deleteSegment(req.params.id);
  if (!success) return res.status(404).json({ error: 'Segment not found' });
  res.json({ success: true });
});

export const getSegmentUsers = wrapAsync(async (req, res) => {
  const users = await segmentationService.getSegmentUsers(req.params.id);
  res.json({ success: true, users, count: users.length });
});

export const triggerAutoSegmentation = wrapAsync(async (req, res) => {
  await segmentationService.runAutoSegmentation();
  res.json({ success: true, message: 'Auto-segmentation completed' });
});
