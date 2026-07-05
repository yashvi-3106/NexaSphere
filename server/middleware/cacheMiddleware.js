import { cacheService } from '../services/cacheService.js';

const ALLOWED_PREFIXES = ['response:', 'query:', 'view:'];

export function cacheResponse(duration = 3600) {
  return async (req, res, next) => {
    const cacheKey = cacheService.buildKey('response', req.originalUrl || req.url);
    let cached = null;
    try {
      cached = await cacheService.get(cacheKey);
    } catch (error) {
      console.warn('Cache read failed, continuing without cached response:', error.message);
    }

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    res.setHeader('X-Cache', 'MISS');

    const originalJson = res.json.bind(res);
    res.json = function (data) {
      cacheService.set(cacheKey, data, duration);
      originalJson(data);
    };

    next();
  };
}

export function invalidateCache(pattern) {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode < 400) {
        const sanitized = sanitizeCachePattern(pattern);
        if (sanitized) {
          await cacheService.delPattern(sanitized);
        }
      }
    });
    next();
  };
}

/**
 * Validate and sanitize cache invalidation pattern.
 * Restricts patterns to allowed prefixes and blocks wildcard-only patterns.
 */
function sanitizeCachePattern(pattern) {
  if (!pattern || typeof pattern !== 'string') {
    console.warn('[Cache] Invalid cache pattern rejected:', pattern);
    return null;
  }

  const trimmed = pattern.trim();
  if (trimmed === '' || trimmed === '*' || trimmed === ':*') {
    console.warn('[Cache] Wildcard-only cache pattern rejected:', pattern);
    return null;
  }

  const hasAllowedPrefix = ALLOWED_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
  if (!hasAllowedPrefix) {
    console.warn('[Cache] Cache pattern must start with an allowed prefix:', trimmed);
    return null;
  }

  if (trimmed.length > 256) {
    console.warn('[Cache] Cache pattern exceeds maximum length');
    return null;
  }

  return trimmed;
}
