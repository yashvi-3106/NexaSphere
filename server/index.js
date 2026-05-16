import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { EventEmitter } from 'events';

import { adminAuthMiddleware } from './middleware/adminAuthMiddleware.js';
import errorHandler from './middleware/errorHandler.js';
import { wrapAsync } from './middleware/asyncHandler.js';
import * as eventsController from './controllers/eventsController.js';
import * as activityEventsController from './controllers/activityEventsController.js';
import * as coreTeamController from './controllers/coreTeamController.js';
import * as formsController from './controllers/formsController.js';
import { eventsService } from './services/eventsService.js';
import { coreTeamService } from './services/coreTeamService.js';
import { HAS_SUPABASE } from './storage/supabaseClient.js';
import { ensureContentFile } from './storage/contentFileStore.js';

const app = express();
const adminEvents = new EventEmitter();

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((value) => value.trim()).filter(Boolean) : true,
  credentials: false,
}));
app.use(express.json({ limit: '512kb' }));

function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  const { method, path } = req;

  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e6;
    const status = res.statusCode;
    const message = `[${method}] ${path} → ${status} (${Math.round(duration)}ms)`;

    if (status >= 500) {
      console.error(message);
    } else if (status >= 400) {
      console.warn(message);
    } else {
      console.log(message);
    }
  });

  next();
}

app.use(requestLogger);

const adminAuth = adminAuthMiddleware.requireAdmin;

adminEvents.on('CORE_TEAM_MEMBER_ADDED', (event) => console.log('[EVENT] CORE_TEAM_MEMBER_ADDED:', event));
adminEvents.on('CORE_TEAM_MEMBER_REMOVED', (event) => console.log('[EVENT] CORE_TEAM_MEMBER_REMOVED:', event));

app.get('/healthz', wrapAsync(async (req, res) => {
  const events = await eventsService.listEvents();
  return res.json({ ok: true, events: events.length, storage: HAS_SUPABASE ? 'supabase' : 'file' });
}));

app.get('/api/content/events', eventsController.listEvents);
app.get('/api/content/activity-events/:activityKey', activityEventsController.listActivityEvents);
app.post('/api/content/activity-events/:activityKey', activityEventsController.addActivityEvent);
app.delete('/api/content/activity-events/:activityKey/:eventId', activityEventsController.deleteActivityEvent);

app.post('/api/admin/login', adminAuthMiddleware.login);
app.post('/api/admin/logout', adminAuthMiddleware.logout);

app.get('/api/admin/events', adminAuth, eventsController.adminListEvents);
app.post('/api/admin/events', adminAuth, eventsController.adminCreateEvent);
app.put('/api/admin/events/:id', adminAuth, eventsController.adminUpdateEvent);
app.delete('/api/admin/events/:id', adminAuth, eventsController.adminDeleteEvent);

app.get('/api/content/core-team', wrapAsync(async (req, res) => {
  const members = await coreTeamService.listMembers();
  return res.json(members);
}));

app.get('/api/admin/core-team', adminAuth, coreTeamController.adminListCoreTeamMembers);
app.post('/api/admin/core-team', adminAuth, coreTeamController.adminAddCoreTeamMember);
app.delete('/api/admin/core-team/:id', adminAuth, coreTeamController.adminDeleteCoreTeamMember);

app.post('/api/forms/membership', formsController.makeHandleForm('membership'));
app.post('/api/forms/recruitment', formsController.makeHandleForm('recruitment'));
app.post('/api/core-team/apply', formsController.makeHandleForm('core_team'));

app.use(errorHandler);

const port = Number(process.env.PORT || 8787);
if (!process.env.VERCEL) {
  const boot = HAS_SUPABASE ? Promise.resolve() : ensureContentFile();
  boot.then(() => {
    app.listen(port, () => {
      console.log(`NexaSphere server listening on http://localhost:${port}`);
    });
  });
} else {
  app.listen(port, () => {
    console.log(`NexaSphere server listening on http://localhost:${port}`);
  });
}

export default app;
