import { Router } from 'express';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware.js';
import { requireStudentAuth } from '../middleware/studentAuthMiddleware.js';
import { announcementsService } from '../services/announcementsService.js';
import { apiRateLimiter } from '../middleware/rateLimiter.js';
import eventManager from '../services/eventEmitterService.js';
import logger from '../utils/logger.js';
import { validate } from '../middleware/validate.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from '../validators/routes/announcementsSchemas.js';

const router = Router();

// Student Endpoint to fetch active, targeted announcements
router.get('/api/announcements', requireStudentAuth, apiRateLimiter, async (req, res) => {
  try {
    const user = {
      id: req.studentUser.sub || req.studentUser.id,
      role: req.studentUser.role || 'student',
      stage: req.query.stage || req.studentUser.stage || 'all',
      department: req.query.department || req.studentUser.department || 'all',
      graduationYear: req.query.graduationYear
        ? Number(req.query.graduationYear)
        : req.studentUser.graduationYear
          ? Number(req.studentUser.graduationYear)
          : null,
    };
    const list = await announcementsService.listActiveAnnouncementsForUser(user);
    return sendSuccess(res, { announcements: list });
  } catch (err) {
    logger.error('Error fetching announcements for user:', err.message);
    return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
  }
});

// Admin endpoints
router.get(
  '/api/admin/announcements',
  adminAuthMiddleware.requireScope('events:read'),
  apiRateLimiter,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;
      const result = await announcementsService.listAnnouncements({ page, limit });
      return sendSuccess(res, result);
    } catch (err) {
      logger.error('Error listing admin announcements:', err.message);
      return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
    }
  }
);

router.post(
  '/api/admin/announcements',
  validate(createAnnouncementSchema),
  adminAuthMiddleware.requireScope('events:write'),
  apiRateLimiter,
  async (req, res) => {
    try {
      const created = await announcementsService.createAnnouncement(req.body);
      // Real-time broadcast if published immediately
      if (created.status === 'published') {
        eventManager.emit('admin-announcement', {
          title: created.title,
          message: created.content,
          link: created.ctaUrl,
        });
      }
      return sendSuccess(res, created, 201);
    } catch (err) {
      logger.error('Error creating announcement:', err.message);
      return sendError(
        req,
        res,
        err.message,
        err.name === 'ZodError' ? 400 : 500,
        err.name === 'ZodError' ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
        err.issues
      );
    }
  }
);

router.put(
  '/api/admin/announcements/:id',
  validate(updateAnnouncementSchema),
  adminAuthMiddleware.requireScope('events:write'),
  apiRateLimiter,
  async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return sendError(req, res, 'Invalid announcement ID', 400, 'VALIDATION_ERROR');
      }
      const updated = await announcementsService.updateAnnouncement(id, req.body);
      if (!updated) {
        return sendError(req, res, 'Announcement not found', 404, 'NOT_FOUND');
      }
      // Real-time broadcast if published or updated status to published
      if (updated.status === 'published') {
        eventManager.emit('admin-announcement', {
          title: updated.title,
          message: updated.content,
          link: updated.ctaUrl,
        });
      }
      return sendSuccess(res, updated);
    } catch (err) {
      logger.error('Error updating announcement:', err.message);
      return sendError(
        req,
        res,
        err.message,
        err.name === 'ZodError' ? 400 : 500,
        err.name === 'ZodError' ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
        err.issues
      );
    }
  }
);

router.delete(
  '/api/admin/announcements/:id',
  adminAuthMiddleware.requireScope('events:write'),
  apiRateLimiter,
  async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return sendError(req, res, 'Invalid announcement ID', 400, 'VALIDATION_ERROR');
      }
      const success = await announcementsService.deleteAnnouncement(id);
      if (!success) {
        return sendError(req, res, 'Announcement not found', 404, 'NOT_FOUND');
      }
      return sendSuccess(res, { ok: true });
    } catch (err) {
      logger.error('Error deleting announcement:', err.message);
      return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
    }
  }
);

export default router;
