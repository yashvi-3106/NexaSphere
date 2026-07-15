import { Router } from 'express';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware.js';
import { apiRateLimiter } from '../middleware/rateLimiter.js';
import { auditLogRepository } from '../repositories/auditLogRepository.js';
import { auditMonitoringService } from '../services/auditMonitoringService.js';
import { generateCSV } from '../utils/csvParser.js';
import { sendSuccess, sendError, sendNoContent } from '../utils/responseHelper.js';

const router = Router();
const adminAuth = [apiRateLimiter, adminAuthMiddleware.requireAdmin];

// Support both mounted and unmounted path prefix styles
const paths = (subPath) => [`${subPath}`, `/api/admin${subPath}`];

// Query audit logs with search, filtering, and paging
router.get(paths('/audit/logs'), adminAuth, async (req, res) => {
  const { actor, action, resourceType, startDate, endDate, searchText, limit, offset } = req.query;
  try {
    const logs = await auditLogRepository.queryAuditLogs({
      actor,
      action,
      resourceType,
      startDate,
      endDate,
      searchText,
      limit,
      offset,
    });
    return sendSuccess(res, { logs });
  } catch (err) {
    return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
  }
});

// Export filtered logs to CSV
router.get(paths('/audit/export'), adminAuth, async (req, res) => {
  const { actor, action, resourceType, startDate, endDate, searchText } = req.query;
  try {
    const logs = await auditLogRepository.queryAuditLogs({
      actor,
      action,
      resourceType,
      startDate,
      endDate,
      searchText,
    });

    const fields = [
      'id',
      'admin_id',
      'action',
      'ip_address',
      'user_agent',
      'resource_type',
      'resource_id',
      'session_id',
      'timestamp',
    ];

    // Normalize logs for CSV format
    const records = logs.map((log) => ({
      id: log.id,
      admin_id: log.admin_id,
      action: log.action,
      ip_address: log.ip_address || '',
      user_agent: log.user_agent || '',
      resource_type: log.resource_type || '',
      resource_id: log.resource_id || '',
      session_id: log.session_id || '',
      timestamp: log.timestamp,
    }));

    const csv = generateCSV(records, fields);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
    return res.send(csv);
  } catch (err) {
    return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
  }
});

// Active sessions tracking
router.get(paths('/audit/sessions'), adminAuth, async (req, res) => {
  try {
    const sessions = await auditMonitoringService.getActiveSessions();
    return sendSuccess(res, { sessions });
  } catch (err) {
    return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
  }
});

// Verify log tampering / integrity check
router.post(paths('/audit/tamper-check'), adminAuth, async (req, res) => {
  try {
    const corruptedIds = await auditLogRepository.verifyLogTampering();
    return sendSuccess(res, {
      status: corruptedIds.length === 0 ? 'SECURE' : 'COMPROMISED',
      corruptedCount: corruptedIds.length,
      corruptedIds,
    });
  } catch (err) {
    return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
  }
});

// Activity Report
router.get(paths('/audit/reports/activity'), adminAuth, async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  try {
    const report = await auditMonitoringService.generateActivityReport(start, end);
    return sendSuccess(res, report);
  } catch (err) {
    return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
  }
});

// Security Incident Report
router.get(paths('/audit/reports/security'), adminAuth, async (req, res) => {
  try {
    const report = await auditMonitoringService.generateSecurityIncidentReport();
    return sendSuccess(res, report);
  } catch (err) {
    return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
  }
});

// Compliance Audit Report
router.get(paths('/audit/reports/compliance'), adminAuth, async (req, res) => {
  try {
    const report = await auditMonitoringService.generateComplianceReport();
    return sendSuccess(res, report);
  } catch (err) {
    return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
  }
});

// Enforce retention policy manual trigger
router.post(paths('/audit/retention'), adminAuth, async (req, res) => {
  const { retentionDays } = req.body;
  const days = retentionDays !== undefined ? parseInt(retentionDays, 10) : 90;

  try {
    const result = await auditMonitoringService.runRetentionCleanup(days);
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
  }
});

// Suspicious login alert check
router.post(paths('/audit/alerts/check'), adminAuth, async (req, res) => {
  const { username, ipAddress } = req.body;
  if (!username || !ipAddress) {
    return sendError(req, res, 'username and ipAddress are required', 400, 'VALIDATION_ERROR');
  }

  try {
    const alerts = await auditMonitoringService.checkSuspiciousActivity(username, ipAddress);
    return sendSuccess(res, { alerts });
  } catch (err) {
    return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
  }
});

export default router;
