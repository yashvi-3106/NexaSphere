import { getRedisClient } from './utils/redis.js';
import 'dotenv/config';
﻿import 'dotenv/config';
import { tracedFetch } from './config/appContext.js';
import { initObservability } from './observability/index.js';
import { setTraceIdResolver } from './utils/logContext.js';
import { getActiveTraceId } from './observability/tracing.js';
import helmet from 'helmet';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import csrf from 'csurf';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';
import fs, { promises as fsp } from 'fs';
import { body, validationResult } from 'express-validator';
import { EventEmitter } from 'events';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { adminAuthMiddleware } from './middleware/adminAuthMiddleware.js';
import analyticsRouter from './routes/analytics.js';
import customEventsRouter from './routes/customEvents.js';
import apiRouter from './routes/api.js';
import formSubmissionsRouter from './routes/forms.js';
import complianceRouter from './routes/compliance.js';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { eventRemindersQueue } from './services/queueService.js';
import { slackIntegrationService } from './services/slackIntegrationService.js';
import { initializeSocketIO } from './config/socket.js';
import adminStreamRouter from './routes/adminStream.js';
import faqRouter from './routes/faqRoutes.js';
import documentationRouter from './routes/documentation.js';
import monitoringRouter from './routes/monitoring.js';
import healthRouter from './routes/health.js';
import dashboardRouter from './routes/dashboard.js';
import coreTeamRouter from './routes/coreTeam.js';
import healthDashboardRouter from './routes/healthDashboard.js';
import complianceRouter from './routes/compliance.js';
import { logEvent } from './controllers/analyticsController.js';
import { eventRemindersQueue } from './services/queueService.js';
import { bulkOperationsQueue } from './services/bulkOperationsService.js';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import segmentsRouter from './routes/segments.js';
import formsRouter from './routes/forms.js';
import portfolioRouter from './routes/portfolio.js';
import recoveryRouter from './routes/recovery.js';
import healthDashboardRouter from './routes/healthDashboard.js';
import complianceRouter from './routes/compliance.js';
import auditToolsRouter from './routes/auditTools.js';
import certificatesRouter from './routes/certificates.js';
import { logEvent } from './controllers/analyticsController.js';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { eventRemindersQueue } from './services/queueService.js';
import './workers/reminderWorker.js';
import portfolioExportRouter from './routes/portfolioExport.js';
import userGroupsRouter from './routes/userGroups.js';
import notificationsRouter from './routes/notifications.js';
import adminRouter from './routes/admin.js';
import projectHealthRouter from './routes/projectHealth.js';
import portfolioAnalyticsRouter from './routes/portfolioAnalytics.js';
import announcementsRouter from './routes/announcements.js';
import bulkRouter from './routes/bulk.js';
import { validateEnvironment } from './utils/envValidator.js';
import { performanceMonitor } from './middleware/performanceMonitor.js';
import { enhancedTracingMiddleware } from './middleware/enhancedTracingMiddleware.js';
import { apiLogger } from './middleware/apiLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { intrusionDetectionMiddleware, abnormalRequestDetector } from './middleware/intrusionDetectionMiddleware.js';
import { notificationAnalyticsRepository } from './repositories/notificationAnalyticsRepository.js';
import { notificationPreferencesRepository } from './repositories/notificationPreferencesRepository.js';
import notificationsService from './services/notificationsService.js';
import { studentAuthService } from './services/studentAuthService.js';
import { slackIntegrationService } from './services/slackIntegrationService.js';
import { initializeSentry, addSentryErrorHandler } from './utils/sentry.js';
import { recordCompressionRatio } from './observability/metrics.js';
import {
  apiRateLimiter,
  formRateLimiter,
  notificationRateLimiter,
  activityAuthRateLimiter,
  portfolioRateLimiter,
  searchRateLimiter,
  validateLimiters,
} from './middleware/rateLimiter.js';
import {
  authRateLimiter,
  protectedActionRateLimiter,
  passwordResetRateLimiter,
} from './middleware/authRateLimiter.js';
import { portfolioRepository } from './repositories/portfolioRepository.js';
import { portfolioContentSchema, portfolioPutSchema } from './validators/portfolioSchemas.js';
import { searchController } from './controllers/searchController.js';
import { Mutex } from 'async-mutex';
import { CircuitBreaker, circuitBreakerRegistry } from './utils/circuitBreaker.js';
import { getPublicAppUrl } from './utils/publicAppUrl.js';
import * as eventsController from './controllers/eventsController.js';
import './workers/bulkWorker.js';
import './workers/waitlistWorker.js';
import * as activityEventsController from './controllers/activityEventsController.js';
import * as streamController from './controllers/streamController.js';
import * as coreTeamController from './controllers/coreTeamController.js';
import { coreTeamService } from './services/coreTeamService.js';
import { HAS_SUPABASE, SUPABASE_URL, SUPABASE_SERVICE_KEY } from './storage/supabaseClient.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const RedisStore = require('connect-redis').default || require('connect-redis');
import Redis from 'ioredis';
import passport from './config/studentOAuth.js';
import { studentUsersRepository } from './repositories/studentUsersRepository.js';
import { slackRepository } from './repositories/slackRepository.js';
import * as studentAuthController from './controllers/studentAuthController.js';
import * as forumController from './controllers/forumController.js';
import { requireStudentAuth } from './middleware/studentAuthMiddleware.js';
import { loadPersistedPushSubscriptions } from './routes/notifications.js';
import * as mentorshipController from './controllers/mentorshipController.js';
import { xssSanitizer } from './middleware/xssSanitizer.js';
import { sqlInjectionGuard } from './middleware/sqlInjectionGuard.js';
import { tierRateLimiter } from './middleware/tierRateLimiter.js';
import { startWebhookRetryProcessor } from './services/webhookRetryProcessor.js';
import { csrfProtection } from './middleware/csrfMiddleware.js';
import compression from 'compression';
import syncRouter from './routes/sync.js';
import multer from 'multer';
import learningPathRouter from './routes/learningPaths.js';
import { learningPathService } from './services/learningPathService.js';
import * as resourcesController from './controllers/resourcesController.js';
import * as backupController from './controllers/backupController.js';
import scheduledTasksRouter from './routes/scheduledTasks.js';
import financialsRouter from './routes/financials.js';
import { schedulerService } from './services/schedulerService.js';
import feedbackRouter from './routes/feedbackRoutes.js';
import * as slackController from './controllers/slackController.js';
import activityTimelineRoutes from './routes/activityTimeline.js';
app.use('/api/activity-timeline', activityTimelineRoutes);
import advancedProfileRoutes from './routes/advancedProfile.js';

import { initializeTypesenseCollections } from './config/typesense.js';

import moderationRouter from './routes/moderation.js';
import rbacRouter from './routes/rbac.js';
import { startStreamingWorkers } from './streaming/startStreamingWorkers.js';
import {
  listEventsStore,
  createEventStore,
  updateEventStore,
  deleteEventStore,
  listActivityEventsStore,
  createActivityEventStore,
  deleteActivityEventStore,
  listCoreTeamStore,
  createCoreTeamStore,
  deleteCoreTeamStore,
  appendToSupabaseForms,
  timingSafeStringEqual,
  toSafeString,
  validateWhatsApp,
  validateSection,
  sanitizeEvent,
  normalizePhone,
} from './repositories/contentStore.js';
  checkPasskeyLockout,
  recordFailedPasskeyAttempt,
  clearPasskeyAttempts,
} from './middleware/auth/passkeyLockout.js';
  checkActivityAuthLockout,
  recordFailedActivityAuth,
  clearActivityAuthAttempts,
  canManageActivityEvent,
} from './middleware/auth/activityAuth.js';
  requireNotificationPrefAuth,
  requireMentorshipAuth,
} from './middleware/auth/customAuth.js';
  uploadWithMagicCheck,
  validateMagicBytes,
  UPLOADS_DIR,
} from './middleware/uploadMiddleware.js';
import circuitBreakerRouter from './routes/circuitBreaker.js';
import { validate } from './middleware/validate.js';
import * as indexSchemas from './validators/routes/indexSchemas.js';
import { sendSuccess, sendError, sendNoContent } from './utils/responseHelper.js';
import apiKeysRouter from './routes/apiKeys.js';
import { apiKeysRepository } from './repositories/apiKeysRepository.js';

validateLimiters();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_FILE = path.join(__dirname, 'data', 'content.json');

validateEnvironment();
initializeTypesenseCollections().catch((err) => {
  console.error('Failed to initialize Typesense collections:', err);
});

function requiredStrongPassword(name) {
  if (process.env.NODE_ENV === 'test') {
    return process.env[name] || 'TestStrongPass123!';
  }
  const value = String(process.env[name] || '').trim();
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);
  if (value.length < 12 || !hasLower || !hasUpper || !hasNumber || !hasSymbol) {
    throw new Error(
      `${name} must be at least 12 characters and include uppercase, lowercase, number, and symbol`
    );
  }
  return value;
}
const ADMIN_EVENT_PASSWORD = requiredStrongPassword('ADMIN_EVENT_PASSWORD');
const SESSION_SECRET = requiredStrongPassword('SESSION_SECRET');
const ADMIN_PASSWORD = requiredStrongPassword('ADMIN_PASSWORD');

const app = express();

const useStructuredHttpLog = (process.env.LOG_FORMAT || '').toLowerCase() === 'json';
// RECTIFIED: Enable 'trust proxy' to correctly extract client IPs from X-Forwarded-For headers when behind ALBs/Serverless layers
app.set('trust proxy', 1);

initializeSentry(app);
app.use(compression());
app.use('/api/notification-preferences', notificationPreferenceRoutes);

// Use compression with fallback (Brotli supported by default in compression v1.8 if zlib supports it)
// Skip compression for responses smaller than 1KB (1024 bytes)
app.use(
  compression({
    threshold: 1024,
  })
);

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'NexaSphere API Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Middleware to monitor compression ratio
app.use((req, res, next) => {
  const originalWrite = res.write;
  const originalEnd = res.end;
  let originalSize = 0;

  res.write = function (chunk, encoding, callback) {
    if (chunk) {
      originalSize += Buffer.isBuffer(chunk)
        ? chunk.length
        : Buffer.byteLength(chunk, typeof encoding === 'string' ? encoding : 'utf8');
    }
    return originalWrite.call(this, chunk, encoding, callback);
  };

  res.end = function (chunk, encoding, callback) {
    if (chunk && typeof chunk !== 'function') {
      originalSize += Buffer.isBuffer(chunk)
        ? chunk.length
        : Buffer.byteLength(chunk, typeof encoding === 'string' ? encoding : 'utf8');
    }
    return originalEnd.apply(this, arguments);
  };

  res.on('finish', () => {
    const contentEncoding = res.get('Content-Encoding');
    if (contentEncoding && ['gzip', 'br', 'deflate'].includes(contentEncoding)) {
      const compressedSize = parseInt(res.get('Content-Length') || '0', 10);
      if (originalSize > 0 && compressedSize > 0) {
        const ratio = compressedSize / originalSize;
        recordCompressionRatio(contentEncoding, ratio);
      }
    }
  });

  next();
});
const corsOrigin =
  process.env.CORS_ORIGIN ||
  (process.env.NODE_ENV === 'test' ? 'http://localhost,http://127.0.0.1' : '');
if (!corsOrigin) {
  throw new Error('CORS_ORIGIN environment variable must be set.');
}

const allowedOrigins = corsOrigin
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  helmet({
    // Prevent MIME sniffing
    noSniff: true,

    // Prevent clickjacking
    frameguard: {
      action: 'deny',
    },

    // Hide X-Powered-By
    hidePoweredBy: true,

    // Enable XSS filter (legacy IE/Edge protection)
    xssFilter: true,

    // Restrict referrer leakage
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },

    // Enforce HTTPS in production
    hsts:
      process.env.NODE_ENV === 'production'
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          }
        : false,

    // ✅ FIXED: Strict Content Security Policy with ALL directives
    // Strict Content Security Policy with ALL directives
    contentSecurityPolicy: {
      useDefaults: false,

      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://challenges.cloudflare.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://api.dicebear.com',
          'https://images.unsplash.com',
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        connectSrc: [
          "'self'",
          'https://challenges.cloudflare.com',
          'https://*.ingest.sentry.io',
          'https://*.ingest.us.sentry.io',
          process.env.FRONTEND_URL || 'http://localhost:5173',
          `wss://${process.env.DOMAIN || 'localhost'}`,
        ],
        objectSrc: ["'none'"],

        // ✅ CRITICAL FIX: Missing directives added below
        baseUri: ["'self'"], // Prevents <base> tag injection
        frameAncestors: ["'none'"], // Prevents clickjacking
        formAction: ["'self'"], // Prevents form submission to external sites
        workerSrc: ["'self'", 'blob:'], // Restricts web worker sources
        manifestSrc: ["'self'"], // Restricts manifest sources
        mediaSrc: ["'self'"], // Restricts media sources

        frameSrc: ["'self'", 'https://challenges.cloudflare.com', 'https://maps.google.com'], // Restricts iframe sources
        childSrc: ["'none'"], // Restricts child browsing contexts
        upgradeInsecureRequests: [], // Upgrades HTTP to HTTPS
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
        workerSrc: ["'self'", 'blob:'],
        manifestSrc: ["'self'"],
        mediaSrc: ["'self'"],
        frameSrc: [
          "'self'",
          'https://challenges.cloudflare.com',
          'https://maps.google.com',
          'https://www.google.com',
          'https://www.google.co.in',
        ],
        childSrc: ["'none'"],
        frameSrc: ["'self'", 'https://challenges.cloudflare.com', 'https://maps.google.com'],
        reportUri: '/api/v1/csp-violation',
      },
    },

    // Safer cross-origin behavior
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: {
      policy: 'same-origin',
    },
    crossOriginResourcePolicy: {
      policy: 'same-origin',
    },

    // Disable DNS prefetching
    dnsPrefetchControl: {
      allow: false,
    },

    // Prevent browser feature abuse
    permissionsPolicy: {
      features: {
        geolocation: [],
        microphone: [],
        camera: [],
        payment: [],
        usb: [],
        magnetometer: [],
        gyroscope: [],
      },
    },
  })
);
app.use(intrusionDetectionMiddleware);
app.use(abnormalRequestDetector);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (process.env.NODE_ENV === 'test') {
        try {
          const url = new URL(origin);
          if (
            url.hostname === 'localhost' ||
            url.hostname === '127.0.0.1' ||
            url.hostname === '[::1]' ||
            url.hostname === '::1'
          ) {
            return callback(null, true);
          }
        } catch {}
      if (origin && allowedOrigins.includes(origin)) {
      }
      if (process.env.NODE_ENV === 'test') {
        try {
          const url = new URL(origin);
          if (
            url.hostname === 'localhost' ||
            url.hostname === '127.0.0.1' ||
            url.hostname === '[::1]' ||
            url.hostname === '::1'
          ) {
            return callback(null, true);
          }
        } catch {}
      }
      return callback(new Error('CORS Policy: Origin not allowed.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400,
  })
);

app.options('*', cors());

app.use(enhancedTracingMiddleware);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(xssSanitizer);
app.use(sqlInjectionGuard);
if (!useStructuredHttpLog) {
  app.use(morgan('combined'));
}
app.use(apiLogger);
app.use(performanceMonitor);
app.use(cookieParser());

// Verify Redis URL protocol in production
const redisSessionUrl = process.env.REDIS_URL || '';
if (process.env.NODE_ENV === 'production' && !redisSessionUrl.startsWith('rediss://')) {
  console.warn('Security Warning: Redis URL should use rediss:// for TLS in production.');
}
// Reuse the existing getRedisClient if possible, else create a new one
let sessionClient = getRedisClient();
if (!sessionClient) {
  sessionClient = new Redis(redisSessionUrl);
app.use(
  session({
    store: new RedisStore({ client: sessionClient, prefix: 'session:express:' }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'ns_session',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: process.env.NODE_ENV === 'production' ? 8 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    },
  })
);
// Session logging middleware
app.use((req, res, next) => {
  if (req.session && !req.session.created_at) {
    req.session.created_at = Date.now();
    req.session.ip = req.ip || req.connection?.remoteAddress || 'unknown';
    console.log('[Session] New session created:', req.sessionID, 'IP:', req.session.ip);
  } else if (
    req.session &&
    req.session.ip &&
    req.session.ip !== (req.ip || req.connection?.remoteAddress)
  ) {
    console.warn(
      '[Session] Suspicious activity: Session accessed from different IP. Original:',
      req.session.ip,
      'New:',
      req.ip || req.connection?.remoteAddress
  next();
});
// Idle timeout middleware (30 mins)
  if (req.session) {
    const now = Date.now();
    if (req.session.lastActive && now - req.session.lastActive > 30 * 60 * 1000) {
      console.log('[Session] Destroying idle session:', req.sessionID);
      req.session.destroy((err) => {
        if (err) console.error('[Session] Error destroying idle session:', err);
        return res.status(401).json({ error: 'Session expired due to inactivity' });
      return;
    req.session.lastActive = now;
// Track app activity for smart notification frequency adjustment
app.use((req, res, next) => {
  if (req.studentUser || req.adminSession) {
    const userId = req.studentUser?.id || req.adminSession?.userId;
    if (userId) notificationAnalyticsRepository.trackAppActivity(userId);
  }
  next();
});

// CSRF protection â€” double-submit cookie pattern for all state-changing endpoints
app.use(csrfProtection);

// Global API rate limiter â€” protects all /api routes from request flooding
app.use('/api', apiRateLimiter);
app.use('/api', tierRateLimiter());

// Read-only guard — blocks non-GET requests when system is in maintenance mode
app.use(readOnlyGuard);
// CSRF protection — double-submit cookie pattern for all state-changing endpoints
// Global API rate limiter — protects all /api routes from request flooding
// Mount route modules
app.post('/api/analytics/track', validate(indexSchemas.analyticsTrackSchema), logEvent);
app.post('/api/analytics/track', logEvent);
// Advanced user profile endpoints
app.use('/', advancedProfileRoutes);
app.use('/api/monitoring', monitoringRouter);

app.use('/api/health-dashboard', healthDashboardRouter);
app.use('/api', documentationRouter);
app.use('/', dashboardRouter);
app.use('/', apiRouter);
app.use('/', healthRouter);
app.use('/', coreTeamRouter);
app.use('/', announcementsRouter);
app.use('/api', formsRouter);
app.use('/api', portfolioAnalyticsRouter);
app.use('/api', portfolioRouter);
app.use('/api', recoveryRouter);
app.use('/api/faqs', faqRouter);
app.use('/api', userGroupsRouter);
app.use('/api', notificationsRouter);
app.use('/', notificationsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin', projectHealthRouter);
app.use('/api', learningPathRouter);
app.use('/', syncRouter);
app.use('/api/feedback', feedbackRouter);
import webhooksRouter from './routes/webhooks.js';

const adminAuth = [apiRateLimiter, adminAuthMiddleware.requireAdmin];

// Webhooks Management
app.use('/api/webhooks', webhooksRouter);

// Scheduled Tasks Management
app.use('/api/admin/scheduled-tasks', adminAuth, scheduledTasksRouter);

// User Segments
app.use('/api/admin/segments', adminAuth, segmentsRouter);
app.use('/api/admin/email-templates', adminAuth, emailTemplateRouter);

// Content Moderation
app.use('/api/moderation', adminAuth, moderationRouter);

// Role-Based Access Control
app.use('/api/admin/rbac', adminAuth, rbacRouter);
// Database Backup & Recovery Endpoints
app.get('/api/admin/backups', adminAuth, backupController.getBackups);
app.post(
  '/api/admin/backups/manual',
  validate(indexSchemas.manualBackupSchema),
  adminAuth,
  backupController.runManualBackup
);
app.post(
  '/api/admin/backups/restore',
  validate(indexSchemas.restoreBackupSchema),
  adminAuth,
  backupController.runRestore
);
app.get('/api/admin/backups/restore-test-history', adminAuth, backupController.getRestoreHistory);
app.delete(
  '/api/admin/backups',
  validate(indexSchemas.deleteBackupSchema),
  adminAuth,
  backupController.deleteBackup
);

// API Key Management
app.use(apiKeysRouter);

const defaultContent = {
  events: [
    {
      id: 'kss-153',
      name: 'KSS #153 â€” Knowledge Sharing Session',
      shortName: 'KSS #153',
      date: 'March 14, 2025',
      description: "NexaSphere's inaugural Knowledge Sharing Session focused on the impact of AI.",
      status: 'completed',
      icon: 'Brain',
      tags: ['AI', 'Learning', 'Community'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  activityEvents: {},
  coreTeam: [],
};

// â”€â”€ File Upload Configuration â”€â”€
const UPLOADS_DIR = path.join(__dirname, 'uploads');
try {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch (_) {}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const MAGIC_BYTES = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47]],
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/gif': [[0x47, 0x49, 0x46]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],
  'application/zip': [
    [0x50, 0x4b, 0x03, 0x04],
    [0x50, 0x4b, 0x05, 0x06],
    [0x50, 0x4b, 0x07, 0x08],
  ],
  'application/x-zip-compressed': [[0x50, 0x4b, 0x03, 0x04]],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    [0x50, 0x4b, 0x03, 0x04],
  ],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': [
    [0x50, 0x4b, 0x03, 0x04],
  ],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [[0x50, 0x4b, 0x03, 0x04]],
  'text/plain': [],
  'text/markdown': [],
  'application/json': [],
};

function validateMagicBytes(filepath, mimeType) {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures || signatures.length === 0) return true;
  const fd = fs.openSync(filepath, 'r');
  const buffer = Buffer.alloc(8);
  fs.readSync(fd, buffer, 0, 8, 0);
  fs.closeSync(fd);
  return signatures.some((sig) => sig.every((byte, i) => buffer[i] === byte));
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const fileFilter = (_req, file, cb) => {
  if (!file.originalname || file.originalname.includes('..') || file.originalname.includes('/')) {
    return cb(new Error('Invalid file name'), false);
  }
  const allowedMimes = Object.keys(MAGIC_BYTES);
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

const uploadWithMagicCheck = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return sendError(req, res, 'File too large. Maximum size is 10MB.', 413, 'INTERNAL_ERROR');
      }
      return sendError(req, res, err.message, 400, 'VALIDATION_ERROR');
    }
    if (req.file && !validateMagicBytes(req.file.path, req.file.mimetype)) {
      fs.unlink(req.file.path, () => {});
      return sendError(
        req,
        res,
        'File content does not match its declared type.',
        400,
        'VALIDATION_ERROR'
      );
    }
    next();
  });
};

// Serve uploaded files statically
function requiredStrongPassword(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);
  if (value.length < 12 || !hasLower || !hasUpper || !hasNumber || !hasSymbol) {
    throw new Error(
      `${name} must be at least 12 characters and include uppercase, lowercase, number, and symbol`
    );
  return value;
const ADMIN_EVENT_PASSWORD = requiredStrongPassword('ADMIN_EVENT_PASSWORD');
const SESSION_SECRET = requiredStrongPassword('SESSION_SECRET');
// ── File Upload Configuration ──
app.use('/uploads', express.static(UPLOADS_DIR));

// Compliance & Legal Documents (handles both public and admin routes internally)
app.use('/api/compliance', complianceRouter);

// Compliance & Accessibility Audit Tools (#1801)
app.use('/api', auditToolsRouter);

export async function runWithFileLock(callback) {
  return await fileMutex.runExclusive(callback);
}

async function readContent() {
  await ensureContentFile();
  const raw = await fsp.readFile(CONTENT_FILE, 'utf8');
  return JSON.parse(raw);
}

async function writeContent(content) {
  await ensureContentFile();
  await fsp.writeFile(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf8');
}

let contentLock = Promise.resolve();

function withContentLock(fn) {
  let release;
  const next = new Promise((resolve) => {
    release = resolve;
  });
  const current = contentLock;
  contentLock = next;
  return current.then(() => fn()).finally(() => release());
}

const _rawSupabaseRequest = async function _rawSupabaseRequest(
  pathname,
  { method = 'GET', body } = {}
) {
  if (!HAS_SUPABASE) throw new Error('Supabase is not configured');
  const res = await tracedFetch(`${SUPABASE_URL}/rest/v1/${pathname}`, {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: method === 'GET' ? 'count=exact' : 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error (${res.status}): ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
};

export { _rawSupabaseRequest as supabaseRequest };

export const supabaseBreaker = circuitBreakerRegistry.register(
  'index-supabase',
  new CircuitBreaker(_rawSupabaseRequest, {
    name: 'index-supabase',
    failureThreshold: 5,
    successThreshold: 2,
    coolDownPeriod: 10000,
    maxCoolDownPeriod: 60000,
  })
);

// Paginated variant: appends LIMIT/OFFSET to a PostgREST GET request and reads
// the total row count from the Content-Range response header (sent when
// Prefer: count=exact is set). Returns { rows, total } instead of a bare array.
async function supabasePaginatedRequest(pathname, page, limit) {
  if (!HAS_SUPABASE) throw new Error('Supabase is not configured');
  const offset = (page - 1) * limit;
  const separator = pathname.includes('?') ? '&' : '?';
  const url = `${SUPABASE_URL}/rest/v1/${pathname}${separator}limit=${limit}&offset=${offset}`;
  const res = await tracedFetch(url, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'count=exact',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error (${res.status}): ${text}`);
  }
  const text = await res.text();
  const rows = text ? JSON.parse(text) : [];
  // Content-Range format from PostgREST: "0-19/150" or "*/0" when empty
  const contentRange = res.headers.get('content-range') || '';
  const totalMatch = contentRange.match(/\/(\d+)$/);
  const total = totalMatch ? parseInt(totalMatch[1], 10) : rows.length;
  return { rows, total };
}

// Parses ?page and ?limit from a request query object, clamps to safe bounds,
// and returns normalised integers. Defaults: page=1, limit=20, cap=100.
function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit };
}

function toSafeString(value, max = 4000) {
  return String(value ?? '')
    .trim()
    .slice(0, max);
}

function validateWhatsApp(str) {
  const v = String(str || '').trim();
  if (!/^\d{10}$/.test(v)) throw new Error('WhatsApp must be exactly 10 digits');
  return v;
}

function validateSection(str) {
  const v = String(str || '')
    .trim()
    .toUpperCase();
  if (!/^[A-Z]$/.test(v)) throw new Error('Section must be a single letter (A-Z)');
  return v;
}

function sanitizeEvent(input = {}) {
  const status = input.status === 'upcoming' ? 'upcoming' : 'completed';
  const tags = Array.isArray(input.tags)
    ? input.tags
        .map((t) => toSafeString(t, 40))
        .filter(Boolean)
        .slice(0, 12)
    : String(input.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 12);

  return {
    id:
      toSafeString(input.id || input.shortName || input.name, 80)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `event-${Date.now()}`,
    name: toSafeString(input.name, 120),
    shortName: toSafeString(input.shortName || input.name, 60),
    date: toSafeString(input.date, 80),
    description: toSafeString(input.description, 1200),
    status,
    icon: toSafeString(input.icon || 'Pin', 32),
    tags,
  };
}

function normalizePhone(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

async function canManageActivityEvent({ name, email, phone, password }) {
  const expectedPassword = process.env.ADMIN_EVENT_PASSWORD;
  // Use constant-time comparison to prevent timing-based password recovery.
  if (!timingSafeStringEqual(String(password ?? ''), expectedPassword)) {
    return false;
  }
  const n = String(name || '')
    .trim()
    .toLowerCase();
  const e = String(email || '')
    .trim()
    .toLowerCase();
  const p = normalizePhone(phone);

  const members = await listCoreTeamStore();
  return members.some(
    (m) =>
      m.name.toLowerCase() === n && m.email.toLowerCase() === e && normalizePhone(m.whatsapp) === p
  );
}

async function listEventsStore({ page = 1, limit = 20 } = {}) {
  if (HAS_SUPABASE) {
    const { rows, total } = await supabasePaginatedRequest(
      'events?select=*&order=created_at.desc',
      page,
      limit
    );
    return {
      events: rows.map((r) =>
        sanitizeEventRecord({
          id: r.id,
          name: r.name,
          shortName: r.short_name || r.shortName || r.name,
          date: r.date_text || r.date,
          description: r.description,
          status: r.status,
          icon: r.icon || 'Pin',
          tags: Array.isArray(r.tags) ? r.tags : [],
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        })
      ),
      total,
    };
  }
  const content = await readContent();
  const all = (content.events || []).map((event) => sanitizeEventRecord(event));
  const total = all.length;
  const start = (page - 1) * limit;
  return { events: all.slice(start, start + limit), total };
}

const ALLOWED_EVENT_FIELDS = [
  'id',
  'name',
  'description',
  'date_text',
  'time',
  'location',
  'type',
  'mode',
  'category',
  'tags',
  'image_url',
  'registration_link',
  'capacity',
  'registered_count',
  'price',
  'created_at',
  'updated_at',
];

function sanitizeEventRecord(event) {
  if (!event || typeof event !== 'object') return event;
  const sanitized = {};
  for (const field of ALLOWED_EVENT_FIELDS) {
    if (field in event) sanitized[field] = event[field];
  }
  return sanitized;
}

async function createEventStore(event) {
  if (HAS_SUPABASE) {
    let payload = {
      id: event.id,
      name: event.name,
      short_name: event.shortName,
      date_text: event.date,
      description: event.description,
      status: event.status,
      icon: event.icon,
      tags: event.tags,
    };

    let row;
    try {
      [row] = await supabaseRequest('events', {
        method: 'POST',
        body: [payload],
      });
    } catch (e) {
      // Retry with suffix if id collision occurs.
      payload = { ...payload, id: `${event.id}-${Date.now()}` };
      [row] = await supabaseRequest('events', {
        method: 'POST',
        body: [payload],
      });
    }
    return sanitizeEventRecord({
      id: row.id,
      name: row.name,
      shortName: row.short_name || row.name,
      date: row.date_text,
      description: row.description,
      status: row.status,
      icon: row.icon || 'Pin',
      tags: Array.isArray(row.tags) ? row.tags : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  // Safe atomic fallback operation preventing data loss using async-mutex
  return withContentLock(async () => {
    const content = await readContent();
    content.events.unshift({
      ...event,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await writeContent(content);
    return sanitizeEventRecord(content.events[0]);
  });
}
async function updateEventStore(id, patch) {
  if (HAS_SUPABASE) {
    const [row] = await supabaseRequest(`events?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: {
        name: patch.name,
        short_name: patch.shortName,
        date_text: patch.date,
        description: patch.description,
        status: patch.status,
        icon: patch.icon,
        tags: patch.tags,
        updated_at: new Date().toISOString(),
      },
    });
    if (!row) return null;
    return sanitizeEventRecord({
      id: row.id,
      name: row.name,
      shortName: row.short_name || row.name,
      date: row.date_text,
      description: row.description,
      status: row.status,
      icon: row.icon || 'Pin',
      tags: Array.isArray(row.tags) ? row.tags : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
  return withContentLock(async () => {
    const content = await readContent();
    const idx = content.events.findIndex((e) => e.id === id);
    if (idx < 0) return null;
    content.events[idx] = {
      ...content.events[idx],
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    };
    await writeContent(content);
    return sanitizeEventRecord(content.events[idx]);
  });
}

async function deleteEventStore(id) {
  if (HAS_SUPABASE) {
    const rows = await supabaseRequest(`events?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return Array.isArray(rows) && rows.length > 0;
  }
  return withContentLock(async () => {
    const content = await readContent();
    const before = content.events.length;
    content.events = content.events.filter((e) => e.id !== id);
    if (content.events.length === before) return false;
    await writeContent(content);
    return true;
  });
}

async function listActivityEventsStore(activityKey, { page = 1, limit = 20 } = {}) {
  if (HAS_SUPABASE) {
    const { rows, total } = await supabasePaginatedRequest(
      `activity_events?activity_key=eq.${encodeURIComponent(activityKey)}&select=*&order=created_at.desc`,
      page,
      limit
    );
    return {
      events: rows.map((r) =>
        sanitizeActivityEventRecord({
          id: r.id,
          name: r.name,
          date: r.date_text || r.date,
          tagline: r.tagline,
          description: r.description,
          status: r.status || 'completed',
          createdAt: r.created_at,
        })
      ),
      total,
    };
  }
  const content = await readContent();
  const all = (content.activityEvents?.[activityKey] || []).map((event) =>
    sanitizeActivityEventRecord(event)
  );
  const total = all.length;
  const start = (page - 1) * limit;
  return { events: all.slice(start, start + limit), total };
}

function sanitizeActivityEventRecord(event) {
  if (!event || typeof event !== 'object') return event;
  const { createdBy, ...safe } = event;
  return safe;
}

async function createActivityEventStore(activityKey, event) {
  if (HAS_SUPABASE) {
    const [row] = await supabaseRequest('activity_events', {
      method: 'POST',
      body: [
        {
          id: event.id,
          activity_key: activityKey,
          name: event.name,
          date_text: event.date,
          tagline: event.tagline,
          description: event.description,
          status: event.status,
          created_by_name: event.createdBy?.name || '',
          created_by_email: event.createdBy?.email || '',
          created_by_phone: event.createdBy?.phone || '',
        },
      ],
    });
    return sanitizeActivityEventRecord({
      id: row.id,
      name: row.name,
      date: row.date_text,
      tagline: row.tagline,
      description: row.description,
      status: row.status || 'completed',
      createdAt: row.created_at,
    });
  }
  return withContentLock(async () => {
    const content = await readContent();
    content.activityEvents = content.activityEvents || {};
    content.activityEvents[activityKey] = content.activityEvents[activityKey] || [];
    content.activityEvents[activityKey].unshift(event);
    await writeContent(content);
    return sanitizeActivityEventRecord(event);
  });
}

async function deleteActivityEventStore(activityKey, eventId) {
  if (HAS_SUPABASE) {
    const rows = await supabaseRequest(
      `activity_events?activity_key=eq.${encodeURIComponent(activityKey)}&id=eq.${encodeURIComponent(eventId)}`,
      { method: 'DELETE' }
    );
    return Array.isArray(rows) && rows.length > 0;
  }
  return withContentLock(async () => {
    const content = await readContent();
    content.activityEvents = content.activityEvents || {};
    const list = content.activityEvents[activityKey] || [];
    const next = list.filter((e) => e.id !== eventId);
    if (next.length === list.length) return false;
    content.activityEvents[activityKey] = next;
    await writeContent(content);
    return true;
  });
}

async function listCoreTeamStore() {
  if (HAS_SUPABASE) {
    const rows = await supabaseRequest('core_team_members?select=*&order=created_at.asc');
    return rows.map((r) =>
      sanitizeCoreTeamMemberRecord({
        id: r.id,
        name: r.name,
        role: r.role,
        year: r.year,
        branch: r.branch,
        section: r.section,
        email: r.email,
        whatsapp: r.whatsapp,
        linkedin: r.linkedin,
        instagram: r.instagram,
        photoUrl: r.photo_url,
        createdAt: r.created_at,
      })
    );
  }
  const content = await readContent();
  return (content.coreTeam || []).map((member) => sanitizeCoreTeamMemberRecord(member));
}

const ALLOWED_TEAM_MEMBER_FIELDS = [
  'id',
  'name',
  'role',
  'position',
  'bio',
  'avatar_url',
  'github_url',
  'linkedin_url',
  'email',
  'joined_at',
  'order',
];

function sanitizeCoreTeamMemberRecord(member) {
  if (!member || typeof member !== 'object') return member;
  const sanitized = {};
  for (const field of ALLOWED_TEAM_MEMBER_FIELDS) {
    if (field in member) sanitized[field] = member[field];
  }
  return sanitized;
}

async function createCoreTeamStore(member) {
  if (HAS_SUPABASE) {
    const [row] = await supabaseRequest('core_team_members', {
      method: 'POST',
      body: [
        {
          name: member.name,
          role: member.role,
          year: member.year,
          branch: member.branch,
          section: member.section,
          email: member.email,
          whatsapp: member.whatsapp,
          linkedin: member.linkedin,
          instagram: member.instagram,
          photo_url: member.photoUrl,
        },
      ],
    });
    return sanitizeCoreTeamMemberRecord({
      id: row.id,
      name: row.name,
      role: row.role,
      year: row.year,
      branch: row.branch,
      section: row.section,
      email: row.email,
      whatsapp: row.whatsapp,
      linkedin: row.linkedin,
      instagram: row.instagram,
      photoUrl: row.photo_url,
      createdAt: row.created_at,
    });
  }
  return withContentLock(async () => {
    const content = await readContent();
    content.coreTeam = content.coreTeam || [];
    const newMember = {
      ...member,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    content.coreTeam.push(newMember);
    await writeContent(content);
    return sanitizeCoreTeamMemberRecord(newMember);
  });
}

async function deleteCoreTeamStore(id) {
  if (HAS_SUPABASE) {
    const rows = await supabaseRequest(`core_team_members?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return Array.isArray(rows) && rows.length > 0;
  }
  return withContentLock(async () => {
    const content = await readContent();
    content.coreTeam = content.coreTeam || [];
    const before = content.coreTeam.length;
    content.coreTeam = content.coreTeam.filter((m) => String(m.id) !== String(id));
    if (content.coreTeam.length === before) return false;
    await writeContent(content);
    return true;
  });
}

async function appendToSupabaseForms(formType, payload) {
  if (!HAS_SUPABASE) return false;
  try {
    await supabaseRequest('form_submissions', {
      method: 'POST',
      body: [
        {
          form_type: formType,
          full_name: toSafeString(payload.fullName, 140),
          college_email: toSafeString(payload.collegeEmail, 140),
          whatsapp: toSafeString(payload.whatsapp, 40),
          payload,
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

// Constant-time string comparison that does not short-circuit on the first
// mismatched character. Both operands are encoded to UTF-8 Buffers of equal
// length before the comparison so response time is independent of how many
// leading characters match. Returns false immediately if either value is empty,
// so callers cannot exploit a zero-length buffer edge case.
function timingSafeStringEqual(a, b) {
  const sa = String(a ?? '');
  const sb = String(b ?? '');
  if (!sa.length || !sb.length) return sa === sb;
  const ba = Buffer.from(sa, 'utf8');
  const bb = Buffer.from(sb, 'utf8');
  // Buffers must be the same byte length for timingSafeEqual. Pad the shorter
  // one so the comparison always runs the full loop.
  if (ba.length !== bb.length) {
    const maxLen = Math.max(ba.length, bb.length);
    const paddedA = Buffer.alloc(maxLen);
    const paddedB = Buffer.alloc(maxLen);
    ba.copy(paddedA);
    bb.copy(paddedB);
    // The length mismatch already means they cannot be equal, but we still run
    // the full comparison so the execution time is data-independent.
    crypto.timingSafeEqual(paddedA, paddedB);
    return false;
  }
  return crypto.timingSafeEqual(ba, bb);
}

// Per-IP failed-attempt tracking for the activity-event auth endpoints.
// Mirrors the passkey lockout pattern used for portfolio mutations below.
const failedActivityAuthAttempts = new Map();
const ACTIVITY_AUTH_MAX_ATTEMPTS = 5;
const ACTIVITY_AUTH_LOCKOUT_MS = 15 * 60 * 1000;

function checkActivityAuthLockout(ip) {
  const entry = failedActivityAuthAttempts.get(ip);
  if (!entry) return null;
  if (Date.now() > entry.lockoutUntil) {
    failedActivityAuthAttempts.delete(ip);
    return null;
  }
  return entry;
}

function recordFailedActivityAuth(ip) {
  const entry = failedActivityAuthAttempts.get(ip) || {
    count: 0,
    lockoutUntil: 0,
  };
  entry.count += 1;
  if (entry.count >= ACTIVITY_AUTH_MAX_ATTEMPTS) {
    entry.lockoutUntil = Date.now() + ACTIVITY_AUTH_LOCKOUT_MS;
    entry.count = 0;
  }
  failedActivityAuthAttempts.set(ip, entry);
  return entry;
}

function clearActivityAuthAttempts(ip) {
  failedActivityAuthAttempts.delete(ip);
}
// Event Certification & Digital Badges (#1787)
app.use('/api', certificatesRouter);

// Compliance & Legal Documents (handles both public and admin routes internally)
app.use('/api/compliance', complianceRouter);

// Admin Analytics & Metrics (mounted with admin auth)
app.use('/api/admin/analytics', adminAuth, analyticsRouter);
app.use('/api/admin/custom-events', adminAuth, customEventsRouter);
app.use('/api/admin/metrics', adminAuth, adminStreamRouter);

// Setup Bull Board for background job monitoring
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/api/admin/queues');
createBullBoard({
  queues: [
    ...(eventRemindersQueue ? [new BullMQAdapter(eventRemindersQueue)] : []),
    ...(bulkOperationsQueue ? [new BullMQAdapter(bulkOperationsQueue)] : [])
  ],
  serverAdapter,
});
app.use('/api/admin/queues', adminAuth, serverAdapter.getRouter());

// Setup Bull Board for background job monitoring
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/api/admin/queues');
createBullBoard({
  queues: eventRemindersQueue ? [new BullMQAdapter(eventRemindersQueue)] : [],
  serverAdapter,
});
app.use('/api/admin/queues', adminAuth, serverAdapter.getRouter());

// OAuth / SSO Student Auth Endpoints
app.get('/api/auth/mock-login', async (req, res, next) => {
  try {
    const { studentAuthService } = await import('./services/studentAuthService.js');
    const user = await studentUsersRepository.upsertFromOAuth({
      provider: 'google',
      providerId: 'mock-student-id-123',
      email: 'teststudent@glbajaj.org',
      fullName: 'Test Student',
      avatarUrl: '👤',
    });
    const token = studentAuthService.generateToken(user);
    res.cookie('ns_student_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});
app.get('/api/auth/google', studentAuthController.googleAuth);
app.get('/api/auth/google/callback', studentAuthController.googleCallback);
app.get('/api/auth/github', studentAuthController.githubAuth);
app.get('/api/auth/github/callback', studentAuthController.githubCallback);
// Student Auth & Me Endpoints
app.get('/api/auth/me', requireStudentAuth, studentAuthController.getMe);
app.delete('/api/auth/me', requireStudentAuth, studentAuthController.deleteAccount);
app.get('/api/auth/export', requireStudentAuth, studentAuthController.exportData);
app.post(
  '/api/auth/theme',
  validate(indexSchemas.updateThemeSchema),
  requireStudentAuth,
  studentAuthController.updateTheme
);
app.post('/api/auth/logout', studentAuthController.logout);

// Student Profile Endpoints
app.get('/api/auth/profile', requireStudentAuth, studentAuthController.getProfile);
app.put(
  '/api/auth/profile',
  validate(indexSchemas.updateProfileSchema),
  requireStudentAuth,
  studentAuthController.updateProfile
);
app.get('/api/auth/registrations', requireStudentAuth, studentAuthController.getRegistrations);

// Slack Integration Endpoints
app.post(
  '/api/auth/slack-settings',
  validate(indexSchemas.slackSettingsSchema),
  requireStudentAuth,
  studentAuthController.updateSlackSettings
);
app.get('/api/slack/auth', slackController.startSlackAuth);
app.get('/api/slack/auth/callback', slackController.slackAuthCallback);
app.post(
  '/api/slack/commands',
  express.urlencoded({ extended: true }),
  slackController.handleSlackCommand
);
app.get('/api/admin/slack/config', adminAuth, slackController.getSlackConfig);
app.post(
  '/api/admin/slack/config',
  validate(indexSchemas.slackConfigSchema),
  adminAuth,
  slackController.updateSlackConfig
);
app.delete('/api/admin/slack/disconnect', adminAuth, slackController.disconnectSlack);

// â”€â”€ Event Admin Management â”€â”€
app.get('/api/admin/events', adminAuth, eventsController.adminListEvents);
app.post('/api/admin/events', adminAuth, eventsController.adminCreateEvent);
app.put('/api/admin/events/:id', adminAuth, eventsController.adminUpdateEvent);
app.delete('/api/admin/events/:id', adminAuth, eventsController.adminDeleteEvent);

// Live Streaming
app.get('/api/streams', streamController.listStreams);
app.get('/api/streams/event/:eventId', streamController.getStreamByEvent);
app.get('/api/streams/:id', streamController.getStream);
app.post(
  '/api/streams',
  validate(indexSchemas.createStreamSchema),
  adminAuth,
  streamController.createStream
);
app.put(
  '/api/streams/:id',
  validate(indexSchemas.updateStreamSchema),
  adminAuth,
  streamController.updateStream
);
app.patch(
  '/api/streams/:id/status',
  validate(indexSchemas.streamStatusSchema),
  adminAuth,
  streamController.setStreamStatus
);
app.delete('/api/streams/:id', adminAuth, streamController.deleteStream);
app.post(
  '/api/streams/:id/chat',
  validate(indexSchemas.addChatMessageSchema),
  apiRateLimiter,
  streamController.addChatMessage
);
app.get('/api/streams/:id/chat', streamController.listChatMessages);
app.post(
  '/api/streams/:id/ban',
  validate(indexSchemas.banUserSchema),
  adminAuth,
  streamController.banUser
);
app.post(
  '/api/streams/:id/polls',
  validate(indexSchemas.createPollSchema),
  adminAuth,
  streamController.createPoll
);
app.get('/api/streams/:id/polls', streamController.listPolls);
app.post(
  '/api/streams/polls/:pollId/vote',
  validate(indexSchemas.votePollSchema),
  streamController.votePoll
);
app.patch('/api/streams/polls/:pollId/close', adminAuth, streamController.closePoll);
app.patch('/api/streams/chat/:messageId/moderate', adminAuth, streamController.moderateChatMessage);
app.get('/api/admin/streams', adminAuth, streamController.adminListAll);
app.post(
  '/api/streams/:id/mod-chat',
  validate(indexSchemas.addModChatMessageSchema),
  adminAuth,
  streamController.addModChatMessage
);
app.get('/api/streams/:id/mod-chat', adminAuth, streamController.listModChatMessages);
app.get('/api/streams/:id/analytics', adminAuth, streamController.getStreamAnalytics);

// Streaming Engagement: Q&A and Reactions
app.post(
  '/api/streams/:id/questions',
  validate(indexSchemas.addQuestionSchema),
  streamController.addQuestion
);
app.get('/api/streams/:id/questions', streamController.listQuestions);
app.patch(
  '/api/streams/questions/:qId/answer',
  validate(indexSchemas.answerQuestionSchema),
  adminAuth,
  streamController.answerQuestion
);
app.post(
  '/api/streams/:id/reactions',
  validate(indexSchemas.addReactionSchema),
  streamController.addReaction
);
app.get('/api/streams/:id/reactions', streamController.getReactions);

// search routes
app.get('/api/search', searchRateLimiter, searchController.search);
app.get('/api/search/trending', searchRateLimiter, searchController.trending);
app.get('/api/recommendations', searchRateLimiter, searchController.recommendations);

// Circuit Breaker Admin API
app.get('/api/admin/circuit-breaker/metrics', adminAuth, async (req, res) => {
  const metrics = circuitBreakerRegistry.getAllMetrics();
  return sendSuccess(res, { circuitBreakers: metrics });
});

app.post('/api/admin/circuit-breaker/reset/:name', adminAuth, async (req, res) => {
  const { name } = req.params;
  const ok = circuitBreakerRegistry.reset(name);
  if (!ok) {
    return sendError(req, res, `No circuit breaker found: "${name}"`, 404, 'NOT_FOUND');
  }
  return sendSuccess(res, { ok: true, message: `Circuit breaker "${name}" reset to CLOSED` });
});

app.post('/api/admin/circuit-breaker/retry/:name', adminAuth, async (req, res) => {
  const { name } = req.params;
  try {
    const breaker = circuitBreakerRegistry.get(name);
    if (!breaker) {
      return sendError(req, res, `No circuit breaker found: "${name}"`, 404, 'NOT_FOUND');
    }
    const result = await breaker.manualRetry();
    return sendSuccess(res, { ok: true, state: breaker.state, result });
  } catch (err) {
    return sendSuccess(res, { ok: false, error: err.message });
  }
});

// Hard cap on tracked entries. When the limit is reached, the
// oldest inserted entry is evicted before adding a new one, preventing the
// Map from growing without bound when an attacker rotates through many
// distinct usernames from the same or different IP addresses.
const MAX_PASSKEY_TRACKED_KEYS = 10_000;
const failedPasskeyAttemptsByIp = new Map();
const failedPasskeyAttemptsByUsername = new Map();

// Periodic sweep every 30 minutes: remove entries whose lockout period has
// expired and whose attempt count has already been reset to 0, so they do
// not accumulate for keys that are never visited again.
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of failedPasskeyAttemptsByIp) {
      if (entry.count === 0 && now > entry.lockoutUntil) {
        failedPasskeyAttemptsByIp.delete(key);
      }
    }
    for (const [key, entry] of failedPasskeyAttemptsByUsername) {
      if (now > entry.lockoutUntil) {
        failedPasskeyAttemptsByUsername.delete(key);
      }
    }
  },
  30 * 60 * 1000
).unref();

function checkPasskeyLockout(username, ip) {
  const ipKey = String(ip || 'unknown');
  const userKey = String(username || '').toLowerCase();

  const ipEntry = failedPasskeyAttemptsByIp.get(ipKey);
  const userEntry = failedPasskeyAttemptsByUsername.get(userKey);

  const now = Date.now();

  if (ipEntry && ipEntry.lockoutUntil !== 0 && now <= ipEntry.lockoutUntil) {
    return true;
  }

  if (userEntry && userEntry.lockoutUntil !== 0 && now <= userEntry.lockoutUntil) {
    return true;
  }

  // Cleanup expired entries proactively
  if (ipEntry && ipEntry.lockoutUntil !== 0 && now > ipEntry.lockoutUntil) {
    failedPasskeyAttemptsByIp.delete(ipKey);
  }
  if (userEntry && userEntry.lockoutUntil !== 0 && now > userEntry.lockoutUntil) {
    failedPasskeyAttemptsByUsername.delete(userKey);
  }

  return false;
}

function recordFailedPasskeyAttempt(username, ip) {
  const ipKey = String(ip || 'unknown');
  const userKey = String(username || '').toLowerCase();

  // IP tracking
  if (
    !failedPasskeyAttemptsByIp.has(ipKey) &&
    failedPasskeyAttemptsByIp.size >= MAX_PASSKEY_TRACKED_KEYS
  ) {
    failedPasskeyAttemptsByIp.delete(failedPasskeyAttemptsByIp.keys().next().value);
  }
  const ipEntry = failedPasskeyAttemptsByIp.get(ipKey) || { count: 0, lockoutUntil: 0 };
  ipEntry.count += 1;
  if (ipEntry.count >= 5) {
    ipEntry.lockoutUntil = Date.now() + 15 * 60 * 1000; // 15 mins
    ipEntry.count = 0; // Reset count so they need 5 more AFTER lockout to be locked again
  }
  failedPasskeyAttemptsByIp.set(ipKey, ipEntry);

  // Username tracking (Exponential backoff)
  if (
    !failedPasskeyAttemptsByUsername.has(userKey) &&
    failedPasskeyAttemptsByUsername.size >= MAX_PASSKEY_TRACKED_KEYS
  ) {
    failedPasskeyAttemptsByUsername.delete(failedPasskeyAttemptsByUsername.keys().next().value);
  }
  const userEntry = failedPasskeyAttemptsByUsername.get(userKey) || { count: 0, lockoutUntil: 0 };
  userEntry.count += 1;
  if (userEntry.count >= 5) {
    // 5 attempts = 1 min, 6 = 2 mins, 7 = 4 mins, 8 = 8 mins, 9+ = 15 mins
    const factor = Math.pow(2, Math.max(0, userEntry.count - 5));
    const delayMinutes = Math.min(15, factor);
    userEntry.lockoutUntil = Date.now() + delayMinutes * 60 * 1000;
  }
  failedPasskeyAttemptsByUsername.set(userKey, userEntry);

  return { ipEntry, userEntry };
}

function clearPasskeyAttempts(username, ip) {
  const ipKey = String(ip || 'unknown');
  const userKey = String(username || '').toLowerCase();

  failedPasskeyAttemptsByIp.delete(ipKey);
  failedPasskeyAttemptsByUsername.delete(userKey);
}

app.get('/api/notifications', adminAuth, async (req, res) => {
  try {
    const userId = req.query.userId || 'global';
    const offset = parseInt(req.query.offset, 10) || 0;
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const list = await notificationsService.getNotifications(userId, offset, limit);
    return sendSuccess(res, { notifications: list });
  } catch (err) {
    return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
  }
});

app.get('/api/notifications/preferences', adminAuth, async (req, res) => {
  try {
    const userId = req.query.userId || 'global';
    const prefs = await notificationPreferencesRepository.list(userId);
    return sendSuccess(res, { preferences: prefs });
  } catch (err) {
    return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
  }
});
// Notification analytics (lightweight collector)
app.put(
  '/api/notifications/preferences',
  validate(indexSchemas.notificationPreferencesSchema),
  adminAuth,
  async (req, res) => {
    try {
      const userId = req.body.userId || 'global';
      const { category, email, push, in_app, sms, frequency, quiet_start, quiet_end, dnd } =
        req.body;
      if (!category) return sendError(req, res, 'category is required', 400, 'VALIDATION_ERROR');
      const pref = await notificationPreferencesRepository.set(userId, category, {
        email,
        push,
        in_app,
        sms,
        frequency,
        quiet_start,
        quiet_end,
        dnd,
      });
      return sendSuccess(res, { preference: pref });
    } catch (err) {
      return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
    }
  }
});
// Public listings
// Admin Team Management
app.get(
  '/api/admin/core-team',
  adminAuthMiddleware.requireScope('settings:admin'),
  coreTeamController.adminListCoreTeamMembers
);
app.post(
  coreTeamController.adminAddCoreTeamMember
app.put(
  '/api/admin/core-team/:id',
  coreTeamController.adminUpdateCoreTeamMember
app.delete(
  coreTeamController.adminDeleteCoreTeamMember
app.use('/api/admin/circuit-breaker', circuitBreakerRouter);
  '/api/notifications/preferences/bulk',
  validate(indexSchemas.bulkNotificationPreferencesSchema),
  adminAuth,
  async (req, res) => {
    try {
      const userId = req.body.userId || 'global';
      const { preferences } = req.body;
      if (!Array.isArray(preferences) || !preferences.length) {
        return sendError(req, res, 'preferences array is required', 400, 'VALIDATION_ERROR');
      }
      const results = await notificationPreferencesRepository.setBulk(userId, preferences);
      return sendSuccess(res, { preferences: results });
    } catch (err) {
      return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');

// Notification analytics (lightweight collector)
app.post('/api/notifications/analytics', async (req, res) => {
  try {
    const event = req.body || {};
    // Minimal validation â€” in future route can forward to analytics pipeline
    console.log('[notification-analytics]', event.type || 'unknown', event);
    return sendSuccess(res, { ok: true });
  } catch (err) {
    return sendError(req, res, err.message, 500, 'INTERNAL_ERROR');
  }
});

app.put('/api/portfolio', portfolioRateLimiter, async (req, res) => {
  try {
    const body = req.body || {};
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';

    // 1. Validate credentials up front.  Anything below this point
    //    trusts the username + passkey pair.
    const credentials = portfolioPutSchema.safeParse({
      username: body.username,
      passkey: body.passkey,
    });
    if (!credentials.success) {
      const firstIssue = credentials.error.issues[0];
      return sendError(
        req,
        res,
        firstIssue?.message || 'Invalid request body',
        400,
        'VALIDATION_ERROR'
      );
    }
    const { username, passkey } = credentials.data;

    // 2. Validate the content body.  This rejects XSS payloads such
    //    as javascript: URLs and unknown protocol schemes before
    //    the data ever reaches the repository.  The repository
    //    re-sanitizes as defense-in-depth.
    const content = portfolioContentSchema.safeParse(body);
    if (!content.success) {
      const firstIssue = content.error.issues[0];
      return sendError(
        req,
        res,
        `Invalid portfolio content: ${firstIssue?.path?.join('.') || ''} ${firstIssue?.message || ''}`.trim(),
        400,
        'VALIDATION_ERROR'
      );
    }

    const existingPortfolio = await portfolioRepository.getByUsername(username);
    const isNewRegistration = !existingPortfolio;

    const lockout = checkPasskeyLockout(username, ip);
    if (lockout) {
      return sendError(
        req,
        res,
        'Too many failed passkey attempts. Please try again later.',
        429,
        'RATE_LIMITED'
      );
    }

    const isAuthorized = await portfolioRepository.verifyPasskey(username, passkey, {
      allowNew: isNewRegistration,
    });
    if (!isAuthorized) {
      recordFailedPasskeyAttempt(username, ip);
      return sendError(req, res, 'Incorrect passkey for this username', 401, 'UNAUTHORIZED');
    }

    clearPasskeyAttempts(username, ip);

    const saved = await portfolioRepository.createOrUpdate({
      ...content.data,
      username,
      passkey,
    });
    return sendSuccess(res, { ok: true, portfolio: saved });
  } catch (err) {
    if (err.code === '23505') {
      return sendError(
        req,
        res,
        'Username already exists. Another request may have just created it.',
        409,
        'CONFLICT'
      );
    }
    console.error('Error saving portfolio:', err);
    return sendError(req, res, err.message || 'Internal server error', 500, 'INTERNAL_ERROR');
  }
});

// â”€â”€ Forum / Q&A â”€â”€
app.get('/api/forum/categories', forumController.listCategories);
app.get('/api/forum/threads', forumController.listThreads);
app.get('/api/forum/threads/:id', forumController.getThread);
app.post('/api/forum/threads', requireStudentAuth, forumController.createThread);
app.put('/api/forum/threads/:id', requireStudentAuth, forumController.updateThread);
app.delete('/api/forum/threads/:id', requireStudentAuth, forumController.deleteThread);
app.get('/api/forum/threads/:id/replies', forumController.listReplies);
app.post('/api/forum/threads/:id/replies', requireStudentAuth, forumController.createReply);
app.put('/api/forum/replies/:replyId', requireStudentAuth, forumController.updateReply);
app.delete('/api/forum/replies/:replyId', requireStudentAuth, forumController.deleteReply);
app.post('/api/forum/threads/:id/vote', requireStudentAuth, forumController.voteThread);
app.post('/api/forum/replies/:replyId/vote', requireStudentAuth, forumController.voteReply);
app.post('/api/forum/threads/:id/accept/:replyId', requireStudentAuth, forumController.acceptReply);
app.patch(
  '/api/admin/forum/threads/:id/moderate',
  validate(indexSchemas.moderateThreadSchema),
  adminAuth,
  forumController.moderateThread
);
app.patch(
  '/api/admin/forum/replies/:replyId/moderate',
  validate(indexSchemas.moderateReplySchema),
  adminAuth,
  forumController.moderateReply
);
app.get('/api/admin/forum/threads', adminAuth, forumController.adminListThreads);

function requireMentorshipAuth(req, res, next) {
  adminAuthMiddleware.requireAdmin(req, res, (err) => {
    if (!err && req.adminSession) {
      return next();
    }
    requireStudentAuth(req, res, (err2) => {
      if (!err2 && req.studentUser) {
        return next();
      }
      return sendError(req, res, 'Unauthorized: Authentication required', 401, 'UNAUTHORIZED');
    });
  });
}

// â”€â”€ Mentorship & Buddy System â”€â”€
app.get('/api/mentorship/mentors', mentorshipController.listMentors);
app.get('/api/mentorship/mentors/:id', mentorshipController.getMentor);
app.post('/api/mentorship/mentors', requireStudentAuth, mentorshipController.registerMentor);
app.put('/api/mentorship/mentors/:id', requireMentorshipAuth, mentorshipController.updateMentor);
app.post('/api/mentorship/requests', requireStudentAuth, mentorshipController.requestMentorship);
app.get('/api/mentorship/requests', requireMentorshipAuth, mentorshipController.listMentorships);
app.get('/api/mentorship/requests/:id', requireMentorshipAuth, mentorshipController.getMentorship);
app.put(
  '/api/mentorship/requests/:id/status',
  validate(indexSchemas.updateMentorshipStatusSchema),
  requireMentorshipAuth,
  mentorshipController.updateMentorshipStatus
);
app.post(
  '/api/mentorship/requests/:id/sessions',
  requireStudentAuth,
  mentorshipController.logSession
);
app.get(
  '/api/mentorship/requests/:id/sessions',
  requireStudentAuth,
  mentorshipController.listSessions
);
app.post('/api/mentorship/buddy-pairs', requireStudentAuth, mentorshipController.createBuddyPair);
app.get('/api/mentorship/buddy-pairs', requireStudentAuth, mentorshipController.listBuddyPairs);
app.get('/api/admin/mentorships', adminAuth, mentorshipController.adminListAll);
app.get('/api/admin/mentors', adminAuth, mentorshipController.adminListMentors);

// â”€â”€ Search, Discovery & Recommendation Engine â”€â”€
app.get('/api/search', searchRateLimiter, searchController.search);
app.get('/api/search/trending', searchRateLimiter, searchController.trending);
app.get('/api/recommendations', searchRateLimiter, searchController.recommendations);
// â”€â”€ Resource Library Routes â”€â”€
// ── Search, Discovery & Recommendation Engine ──
// ── Resource Library Routes ──
// Public resource endpoints
app.get('/api/resources', resourcesController.listResources);
app.get('/api/resources/:id', resourcesController.getResource);
app.post('/api/resources', requireStudentAuth, resourcesController.createResource);
app.post(
  '/api/resources',
  validate(indexSchemas.createResourceSchema),
  resourcesController.createResource
);
app.post('/api/resources/:id/vote', resourcesController.voteResource);
app.post('/api/resources/:id/download', resourcesController.downloadResource);
app.post('/api/resources/:id/download-track', resourcesController.downloadResource);

// Student resource upload (authenticated)
app.post(
  '/api/resources/upload',
  requireStudentAuth,
  uploadWithMagicCheck,
  resourcesController.uploadFile
);

// Admin resource management
app.get('/api/admin/resources', adminAuth, resourcesController.listResources);
app.post(
  '/api/admin/resources',
  validate(indexSchemas.createResourceSchema),
  adminAuth,
  resourcesController.createResource
);
app.put(
  '/api/admin/resources/:id',
  validate(indexSchemas.updateResourceSchema),
  adminAuth,
  resourcesController.updateResource
);
app.delete('/api/admin/resources/:id', adminAuth, resourcesController.deleteResource);
app.patch(
  '/api/admin/resources/:id/moderate',
  validate(indexSchemas.moderateResourceSchema),
  adminAuth,
  resourcesController.moderateResource
);
// Must be registered after all routes.
app.use(notFoundHandler);
addSentryErrorHandler(app);
app.use(errorHandler);

process.on('unhandledRejection', (reason) => {
  console.error(
    '[Process] Unhandled rejection:',
    reason instanceof Error ? reason.message : reason
  );
});

process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught exception:', err instanceof Error ? err.message : err);
  if (err && err.stack) console.error(err.stack);
  process.exit(1);
});

const port = Number(process.env.PORT || 8787);
let server;

if (process.env.NODE_ENV !== 'test') {
  if (!process.env.VERCEL) {
    const boot = HAS_SUPABASE
      ? Promise.all([
          studentUsersRepository.ensureSchema(),
          slackRepository.ensureSchema(),
          apiKeysRepository.ensureSchema(),
        ])
      : ensureContentFile();
    boot.then(async () => {
      loadPersistedPushSubscriptions();

      // Start background streaming workers (outbox dispatcher)
      try {
        await startStreamingWorkers();
      } catch (err) {
        console.error('[streamingWorkers] failed to start', err?.message || err);
      }
      slackIntegrationService.init();
      server = app.listen(port, () => {
        console.log(`NexaSphere server listening on http://localhost:${port}`);
        schedulerService.init();

        // Register Learning Path Nudges (Runs daily)
        schedulerService.schedule('0 10 * * *', async () => {
          await learningPathService.runNudgeJob();
        });
      });
      server.on('error', (err) => {
        console.error('SERVER LISTEN ERROR:', err.code, err.message);
      });
      initializeSocketIO(server);
    });
  } else {
    loadPersistedPushSubscriptions();
    slackIntegrationService.init();
    server = app.listen(port, () => {
      console.log(`NexaSphere server listening on http://localhost:${port}`);
      schedulerService.init();
      initScheduler();
      startWebhookRetryProcessor();
    });
    initializeSocketIO(server);
  }
}

export default app;
