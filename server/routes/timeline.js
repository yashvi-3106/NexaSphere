import { Router } from 'express';
import { activityTimelineService } from '../services/activityTimelineService.js';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

const router = Router();

// ── Admin: User Activity Timeline ────────────────────────────────────────────

router.get('/admin/users/timeline', adminAuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { email, username } = req.query;
    if (!email && !username) {
      return sendError(req, res, 'Must provide either email or username', 400, 'VALIDATION_ERROR');
    }

    const timeline = await activityTimelineService.getUserTimeline({ email, username });
    return sendSuccess(res, { timeline });
  } catch (error) {
    console.error('Error fetching user timeline:', error);
    return sendError(req, res, 'Internal server error', 500, 'INTERNAL_ERROR');
  }
});

router.get('/admin/users/timeline/export', adminAuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { email, username } = req.query;
    if (!email && !username) {
      return sendError(req, res, 'Must provide either email or username', 400, 'VALIDATION_ERROR');
    }

    const timeline = await activityTimelineService.getUserTimeline({ email, username });

    // Format as CSV
    const headers = ['Timestamp', 'Type', 'Title', 'Description'];
    const rows = timeline.map((event) => [
      new Date(event.timestamp).toISOString(),
      event.type,
      `"${event.title.replace(/"/g, '""')}"`,
      `"${event.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const identifier = username || email.split('@')[0];
    const filename = `timeline_${identifier}_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvContent);
  } catch (error) {
    console.error('Error exporting user timeline:', error);
    return sendError(req, res, 'Internal server error', 500, 'INTERNAL_ERROR');
  }
});

export default router;
