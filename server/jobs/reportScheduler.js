/**
 * reportScheduler.js
 * server/jobs/reportScheduler.js
 *
 * Registers and manages cron jobs for scheduled report generation.
 * Call initScheduler() once at server startup (in your main app.js / server.js).
 *
 * Usage:
 *   import { initScheduler } from './jobs/reportScheduler.js';
 *   initScheduler();
 */

import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { runReport } from '../controllers/reportController.js';

const prisma = new PrismaClient();

// In-memory map of active cron tasks: reportType → cron.ScheduledTask
const activeTasks = new Map();

// Default schedules (used when no DB config exists)
const DEFAULTS = {
  daily_attendance: {
    cronExpression: '0 7 * * *', // Every day at 07:00
    enabled: true,
  },
  weekly_analytics: {
    cronExpression: '0 8 * * 1', // Every Monday at 08:00
    enabled: true,
  },
};

function scheduleJob(reportType, cronExpression, enabled) {
  // Cancel existing task for this type
  if (activeTasks.has(reportType)) {
    activeTasks.get(reportType).stop();
    activeTasks.delete(reportType);
  }

  if (!enabled) {
    console.log(`[scheduler] Job "${reportType}" is disabled — skipping.`);
    return;
  }

  if (!cron.validate(cronExpression)) {
    console.error(`[scheduler] Invalid cron expression for "${reportType}": ${cronExpression}`);
    return;
  }

  const task = cron.schedule(cronExpression, async () => {
    console.log(`[scheduler] Running report: ${reportType}`);
    try {
      const report = await runReport(reportType);
      console.log(`[scheduler] Report generated: ${report.filename}`);
    } catch (err) {
      console.error('[scheduler] Report failed for %s:', String(reportType), err.message);
    }
  });

  activeTasks.set(reportType, task);
  console.log(`[scheduler] Scheduled "${reportType}" → ${cronExpression}`);
}

/**
 * Load all schedule configs from DB and start cron jobs.
 * Falls back to DEFAULTS for any type not configured in DB.
 */
export async function initScheduler() {
  console.log('[scheduler] Initialising report scheduler…');

  const dbConfigs = await prisma.reportScheduleConfig.findMany();
  const configMap = Object.fromEntries(dbConfigs.map((c) => [c.reportType, c]));

  for (const [type, defaults] of Object.entries(DEFAULTS)) {
    const config = configMap[type] ?? defaults;
    scheduleJob(type, config.cronExpression, config.enabled ?? true);
  }

  // Also schedule any extra types defined in DB but not in DEFAULTS
  for (const config of dbConfigs) {
    if (!DEFAULTS[config.reportType]) {
      scheduleJob(config.reportType, config.cronExpression, config.enabled);
    }
  }

  console.log(`[scheduler] ${activeTasks.size} job(s) active.`);
}

/**
 * Reload a single job (called by reportController when schedule config changes).
 */
export function reloadJob(reportType, config) {
  scheduleJob(reportType, config.cronExpression, config.enabled);
}

/**
 * Stop all scheduled jobs (useful for graceful shutdown).
 */
export function stopAll() {
  for (const [type, task] of activeTasks) {
    task.stop();
    console.log(`[scheduler] Stopped job: ${type}`);
  }
  activeTasks.clear();
}
