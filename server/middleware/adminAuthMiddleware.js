import {
  createAdminSession,
  getAdminSession,
  revokeAdminSession,
  startAdminSessionCleanup,
} from '../repositories/adminSessionsRepository.js';

const ADMIN_USERNAME = requiredEnv('ADMIN_USERNAME');
const ADMIN_PASSWORD = requiredStrongPassword('ADMIN_PASSWORD');
const LOGIN_WINDOW_MS = parsePositiveInteger(process.env.ADMIN_LOGIN_WINDOW_MS, 15 * 60 * 1000);
const LOGIN_MAX_ATTEMPTS = parsePositiveInteger(process.env.ADMIN_LOGIN_MAX_ATTEMPTS, 5);
const LOGIN_MAX_TRACKED_IPS = parsePositiveInteger(process.env.ADMIN_LOGIN_MAX_TRACKED_IPS, 10000);
const LOGIN_CLEANUP_INTERVAL_MS = parsePositiveInteger(process.env.ADMIN_LOGIN_CLEANUP_INTERVAL_MS, 15 * 60 * 1000);

const loginAttemptsByIp = new Map();

// RECTIFIED: Use a global Redis connection instance instead of an isolated local Map pool
// (Ensure your project has a centralized redis configuration client available)
import { redisClient } from '../config/redis.js';

function requiredEnv(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function requiredStrongPassword(name) {
  const value = requiredEnv(name);
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

function getClientIp(req) {
  const ip = String(req.ip || req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim() || 'unknown';
  // Truncate to maximum 128 characters to prevent extremely large malicious headers from causing memory exhaustion
  return ip.slice(0, 128);
}

// RECTIFIED: Asynchronous Redis key operations with automatic TTL enforcement
async function recordLoginAttempt(ip) {
  const key = `login_attempts:${ip}`;
  try {
    const current = await redisClient.get(key);
    const attempts = current ? parseInt(current, 10) : 0;
    
    // Set counter with exact millisecond-based sliding window expiration
    await redisClient.set(key, attempts + 1, {
      PX: LOGIN_WINDOW_MS
    });
    
    return { attempts: attempts + 1 };
  } catch (err) {
    console.error('[Redis Error] Failed to record login attempt:', err.message);
    return { attempts: 1 };
  }
}

async function getLoginAttemptState(ip) {
  const key = `login_attempts:${ip}`;
  try {
    const attempts = await redisClient.get(key);
    if (!attempts) return null;
    return { attempts: parseInt(attempts, 10) };
  } catch (err) {
    console.error('[Redis Error] Failed to fetch login attempt state:', err.message);
    return null;
  }
}

async function clearLoginAttempts(ip) {
  const key = `login_attempts:${ip}`;
  try {
    await redisClient.del(key);
  } catch (err) {
    console.error('[Redis Error] Failed to clear login attempts:', err.message);
  }
}

startAdminSessionCleanup();

function parseBearer(authHeader = '') {
  if (!authHeader.startsWith('Bearer ')) return '';
  return authHeader.slice(7).trim();
}

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === name) return value;
  }
  return null;
}

async function requireAdmin(req, res, next) {
  try {
    if (req.query.token) {
      return res.status(400).json({ error: 'Do not pass tokens in URLs.' });
    }

    const token = req.cookies?.ns_admin_token || getCookie(req, 'ns_admin_token') || parseBearer(req.headers.authorization || '');
    const session = await getAdminSession(token);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.adminSession = session;
    return next();
  } catch {
    return res.status(500).json({ error: 'Unable to validate admin session' });
  }
}

async function login(req, res) {
  try {
    const u = String(req.body?.username || '').trim();
    const p = String(req.body?.password || '');
    const ip = getClientIp(req);

    // RECTIFIED: Await asynchronous Redis lookup and verification checks
    const state = await getLoginAttemptState(ip);
    if (state && state.attempts > LOGIN_MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many login attempts. Please wait and try again.' });
    }

    const usernameHash = crypto.createHash('sha256').update(u).digest();
    const adminUsernameHash = crypto.createHash('sha256').update(ADMIN_USERNAME).digest();
    const passwordHash = crypto.createHash('sha256').update(p).digest();
    const adminPasswordHash = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();

    const isUsernameValid = crypto.timingSafeEqual(usernameHash, adminUsernameHash);
    const isPasswordValid = crypto.timingSafeEqual(passwordHash, adminPasswordHash);

    if (!isUsernameValid || !isPasswordValid) {
      await recordLoginAttempt(ip);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await clearLoginAttempts(ip);

    const session = await createAdminSession({
      username: u,
      metadata: {
        userAgent: req.get('user-agent') || '',
        ip,
      },
    });

    res.cookie('ns_admin_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(session.expiresAt),
    });

    return res.json({
      username: u,
      expiresAt: session.expiresAt,
    });
  } catch {
    return res.status(500).json({ error: 'Unable to create admin session' });
  }
}

async function logout(req, res) {
  try {
    const token = req.cookies?.ns_admin_token || getCookie(req, 'ns_admin_token') || parseBearer(req.headers.authorization || '');
    if (token) {
      await revokeAdminSession(token);
    }

    res.clearCookie('ns_admin_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Unable to revoke admin session' });
  }
}

export const adminAuthMiddleware = {
  login,
  logout,
  requireAdmin,
  // Private test exports for auditing & validation
  _getLoginAttemptsMapSize: () => loginAttemptsByIp.size,
  _clearAllLoginAttempts: () => loginAttemptsByIp.clear(),
  _cleanupExpiredAttempts: () => {
    const now = Date.now();
    for (const [ip, entry] of loginAttemptsByIp.entries()) {
      if (entry.expiresAt <= now) {
        loginAttemptsByIp.delete(ip);
      }
    }
  },
  _getAttemptsTimer: () => cleanupAttemptsTimer,
};