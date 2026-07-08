import logger from '../utils/logger.js';

// Patterns to identify sensitive tokens in paths
const SENSITIVE_PATH_PATTERNS = [
  { regex: /(\/api\/auth\/reset-password\/)([^/?]+)/g, replacement: '$1[REDACTED]' },
  { regex: /(\/api\/auth\/verify\/)([^/?]+)/g, replacement: '$1[REDACTED]' },
];

/**
 * Redacts sensitive tokens or passwords from the URL path.
 */
function redactPath(path) {
  let redacted = path;
  for (const pattern of SENSITIVE_PATH_PATTERNS) {
    redacted = redacted.replace(pattern.regex, pattern.replacement);
  }
  // Mask query parameters if they contain sensitive tokens
  redacted = redacted.replace(/(token|password|secret)=([^&]+)/gi, '$1=[REDACTED]');
  return redacted;
}

/**
 * Express middleware to log API requests.
 * Writes structured JSON to api-requests.log and logs via Winston.
 */
export function apiLogger(req, res, next) {
  const start = process.hrtime.bigint();
  const startMs = Date.now();
  const { method, originalUrl, reqId } = req;

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const duration = Date.now() - startMs;
    const status = res.statusCode;

    const safePath = redactPath(originalUrl || req.path);

    // 1. Write structured JSON to logs/api-requests.log
    const fileEntry = {
      timestamp: new Date().toISOString(),
      method,
      path: safePath,
      status,
      responseTimeMs: Math.round(durationMs),
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      query: Object.keys(req.query || {}).length ? sanitize(req.query) : undefined,
    };
    try {
      logStream.write(JSON.stringify(fileEntry) + '\n');
    } catch (err) {
      console.error('Failed to write to api-requests.log:', err);
    }

    // 2. Log via Winston
    const logPayload = {
      reqId,
      method,
      path: safePath,
      status,
      durationMs: Math.round(durationMs),
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
    };

    const message = `${method} ${safePath} -> ${status} (${Math.round(durationMs)}ms)`;

    if (status >= 500) {
      logger.error(message, logPayload);
    } else if (status >= 400) {
      logger.warn(message, logPayload);
    } else {
      logger.http(message, logPayload);
    }
  });

  next();
}
