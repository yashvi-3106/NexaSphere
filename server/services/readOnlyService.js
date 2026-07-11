/**
 * Read-Only Mode Service
 *
 * Replaces the hardcoded stubs in routes/readOnlyMode.js with real
 * system-health detection, Redis-backed maintenance mode, and persistent
 * incident logging.
 *
 * Dependencies (all optional — each check degrades gracefully):
 *   - Redis  (utils/redis.js)      for maintenance-mode flag + TTL
 *   - PG     (repositories/db.js)  for DB health check + incident persistence
 *   - CircuitBreaker registry      for service-health visibility
 */

import { withDb, getPoolStats } from '../repositories/db.js';
import { getRedisClient } from '../utils/redis.js';
import { circuitBreakerRegistry } from '../utils/circuitBreaker.js';
import logger from '../utils/logger.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const READ_ONLY_REDIS_KEY = 'system:read-only-mode';
const READ_ONLY_TTL_SECONDS = 86_400; // 24 hours
const POOL_SATURATION_THRESHOLD = 0.8; // 80 % = warning
const OPEN_BREAKER_THRESHOLD = 2; // more than 2 open breakers = warning

// ---------------------------------------------------------------------------
// In-memory fallback flag — used when Redis is unavailable
// ---------------------------------------------------------------------------
let _memoryFlag = false;
let _memoryFlagExpiresAt = 0;

function isMemoryFlagActive() {
  return _memoryFlag && Date.now() < _memoryFlagExpiresAt;
}

function setMemoryFlag(ttlSeconds = READ_ONLY_TTL_SECONDS) {
  _memoryFlag = true;
  _memoryFlagExpiresAt = Date.now() + ttlSeconds * 1000;
}

function clearMemoryFlag() {
  _memoryFlag = false;
  _memoryFlagExpiresAt = 0;
}

// ---------------------------------------------------------------------------
// Health Check Helpers
// ---------------------------------------------------------------------------

async function checkRedis() {
  const client = getRedisClient();
  if (!client) return { ok: false, reason: 'Redis not configured' };
  try {
    const pong = await client.ping();
    return { ok: pong === 'PONG', reason: pong !== 'PONG' ? 'Redis ping failed' : null };
  } catch (err) {
    return { ok: false, reason: `Redis error: ${err.message}` };
  }
}

async function checkDatabase() {
  try {
    await withDb(async (client) => {
      await client.query('SELECT 1');
    });
    return { ok: true, reason: null };
  } catch (err) {
    return { ok: false, reason: `Database unreachable: ${err.message}` };
  }
}

function checkPoolSaturation() {
  const stats = getPoolStats();
  if (!stats) return { ok: null, reason: 'Connection pool not initialized' };
  const saturation = stats.total > 0 ? stats.waiting / stats.total : 0;
  const healthy = saturation < POOL_SATURATION_THRESHOLD;
  return {
    ok: healthy ? true : false,
    reason: healthy
      ? null
      : `Connection pool at ${Math.round(saturation * 100)}% saturation (${stats.waiting} waiting / ${stats.total} total)`,
    saturation: Math.round(saturation * 100),
  };
}

function checkCircuitBreakers() {
  const breakers = circuitBreakerRegistry.list
    ? circuitBreakerRegistry.list()
    : Array.from(circuitBreakerRegistry._breakers?.entries?.() ?? []).map(([name, breaker]) => ({
        name,
        state: breaker.state,
      }));

  const open = breakers.filter((b) => b.state === 'open' || b.state === 'halfOpen');
  const healthy = open.length <= OPEN_BREAKER_THRESHOLD;
  return {
    ok: healthy ? true : false,
    reason: healthy
      ? null
      : `${open.length} circuit breaker(s) in open/half-open state: ${open.map((b) => b.name).join(', ')}`,
    openCount: open.length,
    total: breakers.length,
  };
}

async function checkMaintenanceFlag() {
  const client = getRedisClient();
  if (client) {
    try {
      const val = await client.get(READ_ONLY_REDIS_KEY);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          return {
            active: true,
            reason: parsed.reason || 'Maintenance mode enabled via admin panel',
            activatedAt: parsed.activatedAt,
            activatedBy: parsed.activatedBy || 'unknown',
          };
        } catch {
          return { active: true, reason: val, activatedAt: null, activatedBy: null };
        }
      }
    } catch (err) {
      logger.warn('[readOnlyService] Redis read error for maintenance flag:', err.message);
    }
  }

  // Fall back to in-memory flag
  if (isMemoryFlagActive()) {
    return {
      active: true,
      reason: 'Maintenance mode enabled (in-memory fallback)',
      activatedAt: new Date(_memoryFlagExpiresAt).toISOString(),
      activatedBy: 'system',
    };
  }

  return { active: false, reason: null, activatedAt: null, activatedBy: null };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run all health checks in parallel and return a comprehensive status object.
 *
 * @returns {{ enabled: boolean, message: string, reasons: string[], details: object, checkedAt: string }}
 */
export async function getReadOnlyStatus() {
  const [redis, db, pool, breakers, maintenance] = await Promise.all([
    checkRedis(),
    checkDatabase(),
    checkPoolSaturation(),
    checkCircuitBreakers(),
    checkMaintenanceFlag(),
  ]);

  const reasons = [];
  let enabled = maintenance.active;

  // Build human-readable reasons list
  if (redis.ok === false) reasons.push(redis.reason);
  if (db.ok === false) reasons.push(db.reason);
  if (pool.ok === false) reasons.push(pool.reason);
  if (breakers.ok === false) reasons.push(breakers.reason);
  if (maintenance.active) {
    reasons.push(`Maintenance mode: ${maintenance.reason}`);
    enabled = true; // Admin toggle always overrides
  }

  // Auto-enable read-only when core services are down
  if (redis.ok === false && db.ok === false) {
    enabled = true;
    if (!reasons.some((r) => r.includes('auto-enabled'))) {
      reasons.push('Auto-enabled: Redis and Database both unreachable');
    }
  }

  const message = enabled
    ? 'System is operating in read-only mode. Some operations are unavailable.'
    : 'System operating normally';

  return {
    enabled,
    message,
    reasons,
    details: {
      redis: { ok: redis.ok, error: redis.reason },
      database: { ok: db.ok, error: db.reason },
      connectionPool: { ok: pool.ok, saturation: pool.saturation, error: pool.reason },
      circuitBreakers: {
        ok: breakers.ok,
        openCount: breakers.openCount,
        total: breakers.total,
        error: breakers.reason,
      },
      maintenanceMode: {
        active: maintenance.active,
        reason: maintenance.reason,
        activatedAt: maintenance.activatedAt,
        activatedBy: maintenance.activatedBy,
      },
    },
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Activate read-only mode with an optional reason.
 * Stores the flag in Redis (24h TTL) with an in-memory fallback.
 *
 * @param {string} reason  Human-readable explanation for the mode change.
 * @param {string} [activatedBy='admin']  Who triggered the activation.
 * @returns {{ status: string, activatedAt: string, message: string }}
 */
export async function activateReadOnlyMode(
  reason = 'Manual activation by admin',
  activatedBy = 'admin'
) {
  const payload = {
    reason,
    activatedAt: new Date().toISOString(),
    activatedBy,
  };

  const client = getRedisClient();
  if (client) {
    try {
      await client.set(READ_ONLY_REDIS_KEY, JSON.stringify(payload), 'EX', READ_ONLY_TTL_SECONDS);
      // Clear in-memory fallback since we have Redis
      clearMemoryFlag();
    } catch (err) {
      logger.warn('[readOnlyService] Redis write failed, using in-memory fallback:', err.message);
      setMemoryFlag();
    }
  } else {
    logger.info('[readOnlyService] Redis not available, using in-memory fallback');
    setMemoryFlag();
  }

  logger.info('[readOnlyService] Read-only mode activated', {
    reason,
    activatedBy,
    ttlSeconds: READ_ONLY_TTL_SECONDS,
  });

  return {
    status: 'READ_ONLY_ENABLED',
    activatedAt: payload.activatedAt,
    message: `Read-only mode enabled: ${reason}`,
  };
}

/**
 * Deactivate read-only mode — clears both Redis key and in-memory flag.
 *
 * @returns {{ status: string, deactivatedAt: string, message: string }}
 */
export async function deactivateReadOnlyMode() {
  const client = getRedisClient();
  if (client) {
    try {
      await client.del(READ_ONLY_REDIS_KEY);
    } catch (err) {
      logger.warn('[readOnlyService] Redis delete failed:', err.message);
    }
  }

  clearMemoryFlag();

  const deactivatedAt = new Date().toISOString();
  logger.info('[readOnlyService] Read-only mode deactivated', { deactivatedAt });

  return {
    status: 'READ_ONLY_DISABLED',
    deactivatedAt,
    message: 'Read-only mode disabled. System fully operational.',
  };
}

/**
 * Express middleware that returns 503 for non-GET requests when read-only
 * is active. GET requests are allowed through so the public site remains
 * browsable during maintenance.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function readOnlyGuard(req, res, next) {
  // Always allow GET requests so the site stays browsable
  if (req.method === 'GET') return next();

  // Skip health-check and read-only endpoints so monitoring stays functional
  if (req.path.startsWith('/api/admin/read-only') || req.path.startsWith('/api/health')) {
    return next();
  }

  try {
    const status = await getReadOnlyStatus();
    if (status.enabled) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: status.message,
        reasons: status.reasons,
        retryAfter: 60, // hint for clients to retry after 60s
      });
    }
  } catch (err) {
    // If the health check itself fails, fail open (let requests through)
    // so a failing health check doesn't take down the whole site.
    logger.error('[readOnlyGuard] Health check failed, allowing request:', err.message);
  }

  next();
}

/**
 * Log an incident to the system_incidents table.
 * Falls back to structured logging if the table doesn't exist yet.
 *
 * @param {object} incident
 * @param {'info'|'warning'|'error'|'critical'} incident.severity
 * @param {string} incident.message
 * @param {object} [incident.details]
 * @param {string} [incident.createdBy='system']
 * @returns {Promise<object>}
 */
export async function logIncident(incident) {
  const { severity = 'info', message, details = {}, createdBy = 'system' } = incident;

  const record = {
    incident_type: 'read_only',
    severity,
    message,
    details: JSON.stringify(details),
    created_by: createdBy,
  };

  // Try DB persistence first
  try {
    const result = await withDb(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO system_incidents (incident_type, severity, message, details, created_by)
         VALUES ($1, $2, $3, $4::jsonb, $5)
         RETURNING id, created_at`,
        [record.incident_type, record.severity, record.message, record.details, record.created_by]
      );
      return rows[0];
    });

    logger.info('[readOnlyService] Incident logged to database', {
      id: result.id,
      severity,
      message: message?.slice(0, 80),
    });

    return {
      id: result.id,
      incident_type: record.incident_type,
      severity,
      message,
      created_at: result.created_at,
      persisted: true,
    };
  } catch (err) {
    // Table may not exist yet — log to console and return an ephemeral record
    logger.warn(
      '[readOnlyService] Could not persist incident to DB (table may not exist yet):',
      err.message
    );
    logger.info('[readOnlyService] Incident (console fallback)', {
      severity,
      message,
      details: record.details,
      createdBy,
    });

    return {
      id: null,
      incident_type: record.incident_type,
      severity,
      message,
      created_at: new Date().toISOString(),
      persisted: false,
    };
  }
}
