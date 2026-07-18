import test from 'node:test';
import assert from 'node:assert';
import { setWithDbOverride } from '../repositories/db.js';

// Mock in-memory database storage
const mockDatabase = [];

setWithDbOverride(async (fn) => {
  const mockClient = {
    query: async (sql, params) => {
      const normalizedSql = sql.trim().replace(/\s+/g, ' ');

      if (normalizedSql.includes('INSERT INTO api_keys')) {
        const record = {
          id: mockDatabase.length + 1,
          key_hash: params[0],
          name: params[1],
          scopes: JSON.parse(params[2]),
          expires_at: params[3] || null,
          created_at: new Date(),
          revoked_at: null,
          last_used_at: null,
        };
        mockDatabase.push(record);
        return { rows: [record], rowCount: 1 };
      }

      if (normalizedSql.includes('SELECT * FROM api_keys WHERE key_hash =')) {
        const hash = params[0];
        const record = mockDatabase.find(
          (k) =>
            k.key_hash === hash && !k.revoked_at && (!k.expires_at || k.expires_at > new Date())
        );
        if (record) {
          record.last_used_at = new Date();
        }
        return { rows: record ? [record] : [], rowCount: record ? 1 : 0 };
      }

      if (
        normalizedSql.includes(
          'SELECT id, name, scopes, expires_at, created_at, revoked_at, last_used_at FROM api_keys'
        )
      ) {
        return { rows: mockDatabase, rowCount: mockDatabase.length };
      }

      if (normalizedSql.includes('UPDATE api_keys SET revoked_at = NOW() WHERE id =')) {
        const id = params[0];
        const record = mockDatabase.find((k) => k.id === id);
        if (record) {
          record.revoked_at = new Date();
        }
        return { rows: record ? [record] : [], rowCount: record ? 1 : 0 };
      }

      return { rows: [], rowCount: 0 };
    },
  };
  return fn(mockClient);
});

// Import modules AFTER overriding withDb
const { apiKeysRepository } = await import('../repositories/apiKeysRepository.js');
const { apiKeyAuth } = await import('../middleware/apiKeyAuth.js');

test.describe('API Key Management & Middleware Tests', () => {
  test('should successfully generate, list, validate, and revoke an API key', async () => {
    // 1. Create a key
    const createResult = await apiKeysRepository.createKey({
      name: 'Test Integration Key',
      scopes: ['read:stats'],
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
    });

    assert.ok(createResult.apiKey.startsWith('ns_live_'));
    assert.strictEqual(createResult.record.name, 'Test Integration Key');
    assert.deepStrictEqual(createResult.record.scopes, ['read:stats']);

    // 2. Validate the key
    const validated = await apiKeysRepository.validateKey(createResult.apiKey);
    assert.ok(validated);
    assert.strictEqual(validated.name, 'Test Integration Key');

    // 3. List keys
    const keys = await apiKeysRepository.listKeys();
    assert.ok(keys.length > 0);
    const found = keys.find((k) => k.id === createResult.record.id);
    assert.ok(found);

    // 4. Revoke the key
    const revoked = await apiKeysRepository.revokeKey(createResult.record.id);
    assert.ok(revoked.revoked_at);

    // 5. Try validating again (should fail)
    const revalidated = await apiKeysRepository.validateKey(createResult.apiKey);
    assert.strictEqual(revalidated, null);
  });

  test('apiKeyAuth middleware allows request with valid API key', async () => {
    const createResult = await apiKeysRepository.createKey({
      name: 'Middleware Auth Test Key',
      scopes: [],
    });

    const req = {
      headers: {
        'x-api-key': createResult.apiKey,
      },
    };
    let nextCalled = false;
    const res = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      },
    };

    await apiKeyAuth(req, res, () => {
      nextCalled = true;
    });

    assert.ok(nextCalled);
    assert.ok(req.apiKeyRecord);
    assert.strictEqual(req.apiKeyRecord.name, 'Middleware Auth Test Key');

    // Clean up/revoke key
    await apiKeysRepository.revokeKey(createResult.record.id);
  });

  test('apiKeyAuth middleware rejects missing or invalid keys', async () => {
    const req = { headers: {} };
    const res = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        return this;
      },
    };

    let nextCalled = false;
    await apiKeyAuth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.error, 'Unauthorized: Missing API Key');
  });
});
