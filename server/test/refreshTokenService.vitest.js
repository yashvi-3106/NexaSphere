/**
 * refreshTokenService.test.js
 *
 * Comprehensive unit tests for the JWT Refresh Token Rotation system.
 *
 * Covers:
 *  - Token issuance (issueTokenPair)
 *  - Successful rotation (rotate)
 *  - Expired token rejection
 *  - Reuse detection + full-family revocation
 *  - Single-token revocation (revokeRefreshToken)
 *  - All-sessions revocation (revokeAllSessions)
 *  - Active session listing
 *  - Access-token verification (verifyAccessToken)
 */

import { describe, it, beforeEach, afterEach, vi, expect } from 'vitest';

// ── Environment stubs ─────────────────────────────────────────────────────────
process.env.JWT_SECRET = 'test-super-secret-key-for-refresh-token-tests';
process.env.ACCESS_TOKEN_EXPIRY = '15m';
process.env.REFRESH_TOKEN_TTL_DAYS = '30';

// ── Mock the repository so we never touch PostgreSQL ─────────────────────────
const mockStore = new Map();

vi.mock('../repositories/refreshTokenRepository.js', () => {
  const crypto = require('crypto');

  function hashToken(raw) {
    return crypto.createHash('sha256').update(String(raw)).digest('hex');
  }

  return {
    hashToken,

    createRefreshToken: vi.fn(
      async ({ rawToken, userId, familyId, deviceId, ipAddress, userAgent }) => {
        const hash = hashToken(rawToken);
        const row = {
          id: crypto.randomUUID(),
          token_hash: hash,
          user_id: userId,
          family_id: familyId ?? crypto.randomUUID(),
          device_id: deviceId ?? null,
          ip_address: ipAddress ?? null,
          user_agent: userAgent ?? null,
          is_revoked: false,
          revoked_at: null,
          revoke_reason: null,
          issued_at: new Date(),
          expires_at: new Date(Date.now() + 30 * 86_400_000),
          last_used_at: new Date(),
        };
        mockStore.set(hash, row);
        return row;
      }
    ),

    findByRawToken: vi.fn(async (rawToken) => {
      const hash = hashToken(rawToken);
      return mockStore.get(hash) ?? null;
    }),

    revokeToken: vi.fn(async (tokenHash, reason = 'rotated') => {
      const row = mockStore.get(tokenHash);
      if (row) {
        row.is_revoked = true;
        row.revoked_at = new Date();
        row.revoke_reason = reason;
      }
    }),

    revokeFamilyById: vi.fn(async (familyId, reason = 'reuse_detected') => {
      let count = 0;
      for (const row of mockStore.values()) {
        if (row.family_id === familyId && !row.is_revoked) {
          row.is_revoked = true;
          row.revoked_at = new Date();
          row.revoke_reason = reason;
          count++;
        }
      }
      return count;
    }),

    revokeAllForUser: vi.fn(async (userId, reason = 'user_requested') => {
      let count = 0;
      for (const row of mockStore.values()) {
        if (row.user_id === userId && !row.is_revoked) {
          row.is_revoked = true;
          row.revoked_at = new Date();
          row.revoke_reason = reason;
          count++;
        }
      }
      return count;
    }),

    touchToken: vi.fn(async () => {}),

    cleanupExpiredTokens: vi.fn(async () => {
      let count = 0;
      for (const [hash, row] of mockStore.entries()) {
        if (new Date(row.expires_at) < new Date()) {
          mockStore.delete(hash);
          count++;
        }
      }
      return count;
    }),

    getActiveSessionsForUser: vi.fn(async (userId) => {
      return [...mockStore.values()].filter(
        (r) => r.user_id === userId && !r.is_revoked && new Date(r.expires_at) > new Date()
      );
    }),
  };
});

// ── Mock logger to silence output in tests ────────────────────────────────────
vi.mock('../utils/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// ── Import subject under test ─────────────────────────────────────────────────
import { refreshTokenService } from '../services/refreshTokenService.js';

// ── Test fixtures ─────────────────────────────────────────────────────────────
const mockUser = {
  id: 'user-123',
  provider: 'local',
  email: 'alice@example.com',
  full_name: 'Alice Test',
  role: 'student',
  scopes: ['profile:read', 'events:read'],
};

const mockMeta = { ip: '127.0.0.1', userAgent: 'TestAgent/1.0', deviceId: 'dev-abc' };

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('refreshTokenService', () => {
  beforeEach(() => {
    mockStore.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── issueTokenPair ──────────────────────────────────────────────────────────

  describe('issueTokenPair', () => {
    it('returns a valid accessToken JWT and an opaque refreshToken', async () => {
      const result = await refreshTokenService.issueTokenPair(mockUser, mockMeta);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.expiresIn).toBe(15 * 60);

      // Access token must be a valid JWT
      const payload = refreshTokenService.verifyAccessToken(result.accessToken);
      expect(payload).not.toBeNull();
      expect(payload.sub).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
    });

    it('stores a hashed token (not the raw value) in the repository', async () => {
      const { createRefreshToken } = await import('../repositories/refreshTokenRepository.js');
      const result = await refreshTokenService.issueTokenPair(mockUser, mockMeta);

      expect(createRefreshToken).toHaveBeenCalledOnce();
      const [args] = createRefreshToken.mock.calls;
      expect(args[0].rawToken).toBe(result.refreshToken);
      expect(args[0].userId).toBe(mockUser.id);
    });

    it('records device metadata on the stored token', async () => {
      const { createRefreshToken } = await import('../repositories/refreshTokenRepository.js');
      await refreshTokenService.issueTokenPair(mockUser, mockMeta);

      const [args] = createRefreshToken.mock.calls;
      expect(args[0].ipAddress).toBe(mockMeta.ip);
      expect(args[0].userAgent).toBe(mockMeta.userAgent);
      expect(args[0].deviceId).toBe(mockMeta.deviceId);
    });
  });

  // ── rotate ──────────────────────────────────────────────────────────────────

  describe('rotate', () => {
    it('returns a new access token and refresh token on success', async () => {
      const issued = await refreshTokenService.issueTokenPair(mockUser, mockMeta);
      const result = await refreshTokenService.rotate(issued.refreshToken, mockUser, mockMeta);

      expect(result).not.toHaveProperty('error');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.refreshToken).not.toBe(issued.refreshToken);
    });

    it('invalidates the old refresh token after rotation', async () => {
      const { findByRawToken, revokeToken } =
        await import('../repositories/refreshTokenRepository.js');
      const issued = await refreshTokenService.issueTokenPair(mockUser, mockMeta);
      await refreshTokenService.rotate(issued.refreshToken, mockUser, mockMeta);

      // The old token row should now be revoked
      const oldRow = await findByRawToken(issued.refreshToken);
      expect(oldRow.is_revoked).toBe(true);
      expect(oldRow.revoke_reason).toBe('rotated');
    });

    it('preserves the family_id through the rotation chain', async () => {
      const { findByRawToken } = await import('../repositories/refreshTokenRepository.js');
      const issued = await refreshTokenService.issueTokenPair(mockUser, mockMeta);
      const oldRow = await findByRawToken(issued.refreshToken);
      const originalFamilyId = oldRow.family_id;

      const rotated = await refreshTokenService.rotate(issued.refreshToken, mockUser, mockMeta);
      const newRow = await findByRawToken(rotated.refreshToken);

      expect(newRow.family_id).toBe(originalFamilyId);
    });

    it('returns an error for an unknown token', async () => {
      const result = await refreshTokenService.rotate('does-not-exist', mockUser, mockMeta);
      expect(result.error).toBeTruthy();
      expect(result.reuseDetected).toBe(false);
    });

    it('returns an error for an expired token', async () => {
      // Manually insert an expired row into the mock store
      const crypto = (await import('crypto')).default;
      const raw = 'expired-token-value';
      const hash = crypto.createHash('sha256').update(raw).digest('hex');
      mockStore.set(hash, {
        id: crypto.randomUUID(),
        token_hash: hash,
        user_id: mockUser.id,
        family_id: crypto.randomUUID(),
        is_revoked: false,
        expires_at: new Date(Date.now() - 1000), // already expired
        issued_at: new Date(),
        last_used_at: new Date(),
      });

      const result = await refreshTokenService.rotate(raw, mockUser, mockMeta);
      expect(result.error).toMatch(/expired/i);
      expect(result.reuseDetected).toBe(false);
    });
  });

  // ── Reuse detection ─────────────────────────────────────────────────────────

  describe('reuse detection', () => {
    it('revokes the entire token family when a revoked token is presented again', async () => {
      const { revokeFamilyById } = await import('../repositories/refreshTokenRepository.js');

      // Issue → rotate → attempt to reuse the OLD refresh token
      const issued = await refreshTokenService.issueTokenPair(mockUser, mockMeta);
      const rotated = await refreshTokenService.rotate(issued.refreshToken, mockUser, mockMeta);
      expect(rotated.accessToken).toBeTruthy();

      // Now try to reuse the already-rotated token
      const reuseResult = await refreshTokenService.rotate(issued.refreshToken, mockUser, mockMeta);

      expect(reuseResult.reuseDetected).toBe(true);
      expect(reuseResult.error).toMatch(/reuse/i);
      expect(revokeFamilyById).toHaveBeenCalledWith(expect.any(String), 'reuse_detected');
    });

    it('makes the new (rotated) token unusable after reuse of the old one', async () => {
      const { findByRawToken } = await import('../repositories/refreshTokenRepository.js');

      const issued = await refreshTokenService.issueTokenPair(mockUser, mockMeta);
      const rotated = await refreshTokenService.rotate(issued.refreshToken, mockUser, mockMeta);

      // Reuse old token — this should wipe the family
      await refreshTokenService.rotate(issued.refreshToken, mockUser, mockMeta);

      // The new token should also now be revoked
      const newRow = await findByRawToken(rotated.refreshToken);
      expect(newRow.is_revoked).toBe(true);
    });
  });

  // ── revokeRefreshToken ──────────────────────────────────────────────────────

  describe('revokeRefreshToken', () => {
    it('revokes the given token', async () => {
      const { findByRawToken } = await import('../repositories/refreshTokenRepository.js');
      const issued = await refreshTokenService.issueTokenPair(mockUser, mockMeta);

      await refreshTokenService.revokeRefreshToken(issued.refreshToken);

      const row = await findByRawToken(issued.refreshToken);
      expect(row.is_revoked).toBe(true);
    });

    it('is a no-op for a non-existent token', async () => {
      await expect(refreshTokenService.revokeRefreshToken('ghost-token')).resolves.not.toThrow();
    });
  });

  // ── revokeAllSessions ───────────────────────────────────────────────────────

  describe('revokeAllSessions', () => {
    it('revokes all active sessions for a user', async () => {
      // Issue 3 tokens for the same user
      await refreshTokenService.issueTokenPair(mockUser, mockMeta);
      await refreshTokenService.issueTokenPair(mockUser, { ...mockMeta, deviceId: 'dev-2' });
      await refreshTokenService.issueTokenPair(mockUser, { ...mockMeta, deviceId: 'dev-3' });

      const count = await refreshTokenService.revokeAllSessions(mockUser.id);
      expect(count).toBe(3);

      // None should be active
      const sessions = await refreshTokenService.getActiveSessions(mockUser.id);
      expect(sessions).toHaveLength(0);
    });

    it('does not affect other users sessions', async () => {
      const otherUser = { ...mockUser, id: 'user-other' };
      await refreshTokenService.issueTokenPair(mockUser, mockMeta);
      await refreshTokenService.issueTokenPair(otherUser, mockMeta);

      await refreshTokenService.revokeAllSessions(mockUser.id);

      const otherSessions = await refreshTokenService.getActiveSessions(otherUser.id);
      expect(otherSessions).toHaveLength(1);
    });
  });

  // ── getActiveSessions ───────────────────────────────────────────────────────

  describe('getActiveSessions', () => {
    it('lists all non-revoked sessions for a user', async () => {
      await refreshTokenService.issueTokenPair(mockUser, mockMeta);
      await refreshTokenService.issueTokenPair(mockUser, { ...mockMeta, deviceId: 'dev-2' });

      const sessions = await refreshTokenService.getActiveSessions(mockUser.id);
      expect(sessions).toHaveLength(2);
    });

    it('excludes revoked sessions', async () => {
      const issued = await refreshTokenService.issueTokenPair(mockUser, mockMeta);
      await refreshTokenService.issueTokenPair(mockUser, { ...mockMeta, deviceId: 'dev-2' });

      await refreshTokenService.revokeRefreshToken(issued.refreshToken);

      const sessions = await refreshTokenService.getActiveSessions(mockUser.id);
      expect(sessions).toHaveLength(1);
    });
  });

  // ── verifyAccessToken ───────────────────────────────────────────────────────

  describe('verifyAccessToken', () => {
    it('returns a decoded payload for a valid access token', async () => {
      const { accessToken } = await refreshTokenService.issueTokenPair(mockUser, mockMeta);
      const payload = refreshTokenService.verifyAccessToken(accessToken);

      expect(payload).not.toBeNull();
      expect(payload.sub).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
    });

    it('returns null for a tampered token', () => {
      const result = refreshTokenService.verifyAccessToken('totally.invalid.token');
      expect(result).toBeNull();
    });

    it('returns null for an empty/null token', () => {
      expect(refreshTokenService.verifyAccessToken(null)).toBeNull();
      expect(refreshTokenService.verifyAccessToken('')).toBeNull();
    });
  });
});
