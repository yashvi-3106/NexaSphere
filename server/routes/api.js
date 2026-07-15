import { Router } from 'express';
import { throttleMiddleware } from '../middleware/throttleMiddleware.js';
import settingsRouter from './settingsRoutes.js';
import rateLimitAdminRoutes from './rateLimitAdminRoutes.js';
import { auditLogController } from '../controllers/auditLogController.js';
import * as eventsController from '../controllers/eventsController.js';
import * as activityEventsController from '../controllers/activityEventsController.js';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware.js';
import * as eventRegistrationController from '../controllers/eventRegistrationController.js';
import * as usersController from '../controllers/usersController.js';
import { usersRepository } from '../repositories/usersRepository.js';
import * as attendanceController from '../controllers/attendanceController.js';
import * as eventAnalyticsController from '../controllers/eventAnalyticsController.js';
import * as bannersController from '../controllers/bannersController.js';
import { adminAuditMiddleware, attachOldState } from '../middleware/adminAuditMiddleware.js';
import { eventsRepository } from '../repositories/eventsRepository.js';
import { authRateLimiter, protectedActionRateLimiter } from '../middleware/authRateLimiter.js';
import { eventRegistrationLimiter } from '../middleware/rateLimiter.js';
import { portfolioRepository } from '../repositories/portfolioRepository.js';
import { achievementsRepository } from '../repositories/achievementsRepository.js';
import { portfolioService } from '../services/portfolioService.js';
import { waitingRoomService } from '../services/waitingRoomService.js';
import { studentAuthService } from '../services/studentAuthService.js';
import { requireStudentAuth } from '../middleware/studentAuthMiddleware.js';
import * as sponsorshipsController from '../controllers/sponsorshipsController.js';
import * as subscriptionsController from '../controllers/subscriptionsController.js';
import * as portfolioAnalyticsController from '../controllers/portfolioAnalyticsController.js';
import { achievementSchema } from '../validators/portfolioSchemas.js';
import { auditLogRepository } from '../repositories/auditLogRepository.js';
import { validate } from '../middleware/validate.js';
import { sendSuccess, sendError, sendNoContent } from '../utils/responseHelper.js';
import {
  awardXPSchema,
  exportPDFSchema,
  eventRegistrationSchema,
  emailSchema,
  addActivityEventSchema,
  accountRecoveryRequestSchema,
  accountRecoveryVerifySchema,
  markAttendanceSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  adminLoginSchema,
  localLoginSchema,
  verifyTwoFactorSchema,
  verifyTwoFactorSetupSchema,
  adminCreateEventSchema,
  adminUpdateEventSchema,
  createSubscriptionSchema,
  adminBannerBodySchema,
} from '../validators/routes/apiSchemas.js';
import announcementPriorityRouter from "./announcementPriority.js";
import eventConflictRouter from "./eventConflict.js";
import waitlistRoutes from "./waitlist.js";
import * as localAuthController from '../controllers/localAuthController.js';

import * as recommendationsController from '../controllers/recommendationsController.js';
import * as gamificationController from '../controllers/gamificationController.js';
import multer from 'multer';

const router = Router();

router.use(rateLimitAdminRoutes);
router.use(throttleMiddleware);

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Public
router.get('/api/dashboard/leaderboard', gamificationController.getLeaderboard);
router.post(
  '/api/dashboard/xp',
  protectedActionRateLimiter,
  adminAuthMiddleware.requireAdmin,
  validate(awardXPSchema),
  gamificationController.awardXP
);
router.post(
  '/api/assistant/recommend',
  upload.single('file'),
  recommendationsController.getProjectRecommendations
);
router.get('/api/users', usersController.getPublicUsers);
router.post('/api/whiteboard/export-pdf', validate(exportPDFSchema), whiteboardController.exportPDF);
router.get('/api/content/events', eventsController.listEvents);
router.get('/api/content/banners', bannersController.listActiveBanners);
router.post(
  '/api/content/events/:eventId/register',
  eventRegistrationLimiter,
  validate(eventRegistrationSchema),
  eventRegistrationController.registerForEvent
);
router.get('/api/content/events/:eventId/calendar', eventRegistrationController.getEventCalendar);
router.post(
  '/api/content/events/:eventId/cancel',
  eventRegistrationLimiter,
  requireStudentAuth,
  validate(emailSchema),
  eventRegistrationController.cancelRegistration
);
router.get(
  '/api/content/events/:eventId/waitlist-position',
  eventRegistrationController.getWaitlistPosition
);
router.post(
  '/api/content/events/:eventId/waitlist/confirm',
  validate(emailSchema),
  eventRegistrationController.confirmWaitlistSpot
);
router.delete(
  '/api/content/events/:eventId/waitlist',
  eventRegistrationLimiter,
  validate(emailSchema),
  eventRegistrationController.leaveWaitlist
);
router.get(
  '/api/content/activity-events/:activityKey',
  activityEventsController.listActivityEvents
);
router.post(
  '/api/content/activity-events/:activityKey',
  protectedActionRateLimiter,
  adminAuthMiddleware.requireScope('events:write'),
  validate(addActivityEventSchema),
  activityEventsController.addActivityEvent
);
router.delete(
  '/api/content/activity-events/:activityKey/:eventId',
  protectedActionRateLimiter,
  adminAuthMiddleware.requireScope('events:write'),
  activityEventsController.deleteActivityEvent
);
router.post('/account-recovery/request', authRateLimiter, validate(accountRecoveryRequestSchema), async (req, res) => {
  const { email } = req.body;

  await studentAuthService.createRecoveryRequest(email);

  return sendSuccess(res, {
    success: true,
    message: 'If an account with that email exists, a recovery code has been sent.',
  });
});
router.post('/account-recovery/verify', authRateLimiter, validate(accountRecoveryVerifySchema), async (req, res) => {
  const { email, enteredCode } = req.body;

  const valid = await studentAuthService.verifyRecoveryCode(email, enteredCode);

  return sendSuccess(res, {
    success: valid,
  });
});

// Admin auth
router.post(
  '/api/attendance/mark',
  adminAuthMiddleware.requireAdmin,
  validate(markAttendanceSchema),
  attendanceController.markAttendance
);
router.get(
  '/api/attendance',
  adminAuthMiddleware.requireAdmin,
  attendanceController.getAttendanceList
);
router.get('/api/admin/users', adminAuthMiddleware.requireAdmin, usersController.getAdminUsers);
router.post(
  '/api/admin/users',
  adminAuthMiddleware.requireAdmin,
  adminAuditMiddleware,
  validate(adminCreateUserSchema),
  usersController.adminCreateUser
);
router.put(
  '/api/admin/users/:id',
  adminAuthMiddleware.requireAdmin,
  attachOldState((req) => usersRepository.getUserById(req.params.id)),
  adminAuditMiddleware,
  validate(adminUpdateUserSchema),
  usersController.adminUpdateUser
);
router.delete(
  '/api/admin/users/:id',
  adminAuthMiddleware.requireAdmin,
  adminAuditMiddleware,
  usersController.adminDeactivateUser
);
router.post('/api/admin/login', authRateLimiter, validate(adminLoginSchema), adminAuthMiddleware.login);

// Local User Auth
router.post('/api/auth/local/login', authRateLimiter, validate(localLoginSchema), localAuthController.localLogin);

router.post('/api/admin/2fa/verify', authRateLimiter, validate(verifyTwoFactorSchema), adminAuthMiddleware.verifyTwoFactor);
router.post(
  '/api/admin/2fa/setup/verify',
  authRateLimiter,
  validate(verifyTwoFactorSetupSchema),
  adminAuthMiddleware.verifyTwoFactorSetup
);
router.post('/api/admin/logout', adminAuthMiddleware.requireAdmin, adminAuthMiddleware.logout);
router.get(
  '/api/admin/security',
  adminAuthMiddleware.requireAdmin,
  adminAuthMiddleware.getSecurityOverview
);
router.delete(
  '/api/admin/security/sessions/:sessionId',
  adminAuthMiddleware.requireAdmin,
  adminAuthMiddleware.revokeSession
);
router.post(
  '/api/admin/security/sessions/logout-others',
  adminAuthMiddleware.requireAdmin,
  adminAuthMiddleware.logoutOtherSessions
);
router.get('/api/admin/audit-logs', adminAuthMiddleware.requireAdmin, async (req, res) => {
  const logs = await auditLogRepository.searchAuditLogs(req.query);
  return sendSuccess(res, { logs });
});
router.get('/api/admin/audit-logs/export', adminAuthMiddleware.requireAdmin, async (req, res) => {
  const csv = await auditLogRepository.exportAuditLogsCsv(req.query);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="admin-audit-logs.csv"');
  return res.send(csv);
});

router.get(
  '/api/admin/events',
  adminAuthMiddleware.requireScope('events:read'),
  eventsController.adminListEvents
);
router.get(
  '/api/admin/events/recommendations',
  adminAuthMiddleware.requireScope('events:read'),
  eventAnalyticsController.getEventRecommendations
);
router.get(
  '/api/admin/events/:eventId/analytics',
  adminAuthMiddleware.requireScope('events:read'),
  eventAnalyticsController.getEventStats
);
router.post(
  '/api/admin/events',
  adminAuthMiddleware.requireScope('events:write'),
  adminAuditMiddleware,
  validate(adminCreateEventSchema),
  eventsController.adminCreateEvent
);
router.put(
  '/api/admin/events/:id',
  adminAuthMiddleware.requireScope('events:write'),
  attachOldState((req) => eventsRepository.getById(req.params.id)),
  adminAuditMiddleware,
  validate(adminUpdateEventSchema),
  eventsController.adminUpdateEvent
);
router.delete(
  '/api/admin/events/:id',
  adminAuthMiddleware.requireScope('events:write'),
  attachOldState((req) => eventsRepository.getById(req.params.id)),
  adminAuditMiddleware,
  eventsController.adminDeleteEvent
);

// Subscription management APIs
router.get(
  '/api/admin/subscriptions',
  adminAuthMiddleware.requireScope('events:read'),
  subscriptionsController.listSubscriptions
);
router.get(
  '/api/admin/subscriptions/stats',
  adminAuthMiddleware.requireScope('events:read'),
  subscriptionsController.getStats
);
router.post(
  '/api/admin/subscriptions',
  adminAuthMiddleware.requireScope('events:write'),
  adminAuditMiddleware,
  validate(createSubscriptionSchema),
  subscriptionsController.createSubscription
);

// Banners Admin
router.get('/api/admin/banners', adminAuthMiddleware.requireAdmin, bannersController.listAllBanners);
router.post(
  '/api/admin/banners',
  adminAuthMiddleware.requireAdmin,
  validate(adminBannerBodySchema),
  bannersController.createBanner
);
router.put(
  '/api/admin/banners/:id',
  adminAuthMiddleware.requireAdmin,
  validate(adminBannerBodySchema),
  bannersController.updateBanner
);
router.delete('/api/admin/banners/:id', adminAuthMiddleware.requireAdmin, bannersController.deleteBanner);

router.post(
  '/api/admin/subscriptions/:userId/cancel',
  adminAuthMiddleware.requireScope('events:write'),
  adminAuditMiddleware,
  subscriptionsController.cancelSubscription
);
router.get(
  '/api/admin/subscriptions/:userId/billing',
  adminAuthMiddleware.requireScope('events:read'),
  subscriptionsController.getBillingHistory
);

// Portfolio management APIs
router.get(
  '/api/admin/portfolios',
  adminAuthMiddleware.requireScope('events:read'),
  async (req, res) => {
    try {
      const username = String(req.query.username || '').trim();
      if (username) {
        const portfolio = await portfolioService.getByUsername(username);
        return sendSuccess(res, portfolio ? { portfolios: [portfolio] } : { portfolios: [] });
      }
      const portfolios = (await portfolioRepository.listAll)
        ? await portfolioRepository.listAll()
        : [];
      return sendSuccess(res, { portfolios });
    } catch (err) {
      return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
    }
  }
);
router.delete(
  '/api/admin/portfolios/:username',
  adminAuthMiddleware.requireScope('events:write'),
  adminAuditMiddleware,
  async (req, res) => {
    try {
      const username = String(req.params.username || '')
        .trim()
        .toLowerCase();
      if (!username) return sendError(req, res, 'Username required', 400, 'VALIDATION_ERROR');
      await portfolioRepository.delete(username);
      return sendSuccess(res, { ok: true });
    } catch (err) {
      return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
    }
  }
);

// Portfolio Analytics APIs

router.get(
  '/api/portfolio/:username/analytics',
  portfolioAnalyticsController.getPortfolioAnalytics
);

router.post(
  '/api/portfolio/:username/visit',
  portfolioAnalyticsController.recordPortfolioVisit
);

router.get(
  '/api/portfolio/:username/monthly-report',
  portfolioAnalyticsController.getMonthlyReport
);

// Achievement management APIs
router.get(
  '/api/admin/portfolios/:username/achievements',
  adminAuthMiddleware.requireScope('events:read'),
  async (req, res) => {
    try {
      const username = String(req.params.username || '')
        .trim()
        .toLowerCase();
      const achievements = await achievementsRepository.getByUsername(username);
      return sendSuccess(res, { achievements });
    } catch (err) {
      return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
    }
  }
);
router.post(
  '/api/admin/portfolios/:username/achievements',
  adminAuthMiddleware.requireScope('events:write'),
  adminAuditMiddleware,
  validate(achievementSchema),
  async (req, res) => {
    try {
      const username = String(req.params.username || '')
        .trim()
        .toLowerCase();

      const achievement = await portfolioService.awardAchievement(username, req.body);
      return sendSuccess(res, { achievement }, 201);
    } catch (err) {
      return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
    }
  }
);
router.delete(
  '/api/admin/portfolios/:username/achievements/:name',
  adminAuthMiddleware.requireScope('events:write'),
  attachOldState(async (req) => {
    const username = String(req.params.username || '')
      .trim()
      .toLowerCase();
    const achievements = await achievementsRepository.getByUsername(username);
    const targetName = String(req.params.name || '').trim();
    return achievements.find((a) => a.name === targetName);
  }),
  adminAuditMiddleware,
  async (req, res) => {
    try {
      const username = String(req.params.username || '')
        .trim()
        .toLowerCase();
      const name = String(req.params.name || '').trim();
      await portfolioService.removeAchievement(username, name);
      return sendSuccess(res, { ok: true });
    } catch (err) {
      return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
    }
  }
);

// Waiting room management API
// Waiting room management API
router.get(
  '/api/admin/events/:eventId/waiting-room',
  adminAuthMiddleware.requireScope('events:read'),
  async (req, res) => {
    try {
      const eventId = String(req.params.eventId || '').trim();
      const queue = waitingRoomService.getQueue(eventId);
      return sendSuccess(res, { queue, total: queue.length });
    } catch (err) {
      return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
    }
  }
);
router.use('/api/admin/settings', adminAuthMiddleware.requireAdmin, settingsRouter);
router.post('/api/admin/impersonate/stop', adminAuthMiddleware.requireAdmin, (req, res) => {
  impersonationService.stop(req.adminSession.token);
  return sendSuccess(res, { impersonating: false });
});
router.get('/api/admin/impersonate/status', adminAuthMiddleware.requireAdmin, (req, res) => {
  const active = impersonationService.getActive(req.adminSession.token);
  return sendSuccess(res, { impersonating: !!active, user: active?.targetUser || null });
});
router.use(
  "/api/announcements",
  announcementPriorityRouter
);
router.use("/api/events", eventConflictRouter);
router.use(
  "/api/admin/waitlist",
  waitlistRoutes
);
// Audit Log Viewer APIs
router.get('/api/admin/audit-logs', adminAuthMiddleware.requireAdmin, auditLogController.listLogs);
router.get(
  '/api/admin/audit-logs/stats',
  adminAuthMiddleware.requireAdmin,
  auditLogController.getStats
);
router.use(
  "/recommendations",
  recommendationEngine
);

// Follows/User Following System APIs
// Follow/Unfollow operations
router.post(
  '/api/student/follows/:followingId',
  requireStudentAuth,
  protectedActionRateLimiter,
  followsController.followUser
);
router.delete(
  '/api/student/follows/:followingId',
  requireStudentAuth,
  protectedActionRateLimiter,
  followsController.unfollowUser
);

// Check follow status
router.get(
  '/api/student/follows/status/:followingId',
  requireStudentAuth,
  followsController.checkFollowStatus
);

// Get followers and following lists
router.get('/api/student/users/:userId/followers', followsController.getUserFollowers);
router.get('/api/student/users/:userId/following', followsController.getUserFollowing);

// Get follow counts
router.get('/api/student/users/:userId/follow-counts', followsController.getFollowCounts);

// Current user endpoints
router.get(
  '/api/student/me/followers',
  requireStudentAuth,
  followsController.getCurrentUserFollowers
);
router.get(
  '/api/student/me/following',
  requireStudentAuth,
  followsController.getCurrentUserFollowing
);
router.get(
  '/api/student/me/follow-counts',
  requireStudentAuth,
  followsController.getCurrentUserFollowCounts
);

// Activity feed from followed users
router.get(
  '/api/student/activity-feed/followed',
  requireStudentAuth,
  followsController.getFollowedUsersActivityFeed
);

// Platform Analytics APIs
router.use("/api/analytics", platformAnalyticsRoutes);

export default router;
