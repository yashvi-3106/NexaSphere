import crypto from 'crypto';
import { withDb } from './db.js';
import { HAS_SUPABASE } from '../storage/supabaseClient.js';

export const apiKeysRepository = {
  async ensureSchema() {
    if (!HAS_SUPABASE) return;
    return withDb(async (client) => {
      await client.query(`
        CREATE TABLE IF NOT EXISTS api_keys (
          id SERIAL PRIMARY KEY,
          key_hash VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(100) NOT NULL,
          scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMPTZ,
          revoked_at TIMESTAMPTZ DEFAULT NULL,
          last_used_at TIMESTAMPTZ DEFAULT NULL
        )
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash)
      `);
    });
  },

  hashKey(key) {
    return crypto.createHash('sha256').update(key).digest('hex');
  },

  async createKey({ name, scopes, expiresAt }) {
    const rawKey = `ns_live_${crypto.randomBytes(24).toString('hex')}`;
    const hash = this.hashKey(rawKey);

    return withDb(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO api_keys (key_hash, name, scopes, expires_at)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, scopes, expires_at, created_at`,
        [hash, name, JSON.stringify(scopes || []), expiresAt || null]
      );
      return {
        apiKey: rawKey,
        record: rows[0],
      };
    });
  },

  async validateKey(rawKey) {
    const hash = this.hashKey(rawKey);
    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT * FROM api_keys 
         WHERE key_hash = $1 AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > NOW())
         LIMIT 1`,
        [hash]
      );
      const keyRecord = rows[0];
      if (keyRecord) {
        await client.query(`UPDATE api_keys SET last_used_at = NOW() WHERE id = $1`, [
          keyRecord.id,
        ]);
      }
      return keyRecord || null;
    });
  },

  async listKeys() {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT id, name, scopes, expires_at, created_at, revoked_at, last_used_at 
         FROM api_keys 
         ORDER BY created_at DESC`
      );
      return rows;
    });
  },

  async revokeKey(id) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `UPDATE api_keys 
         SET revoked_at = NOW() 
         WHERE id = $1 
         RETURNING id, name, revoked_at`,
        [id]
      );
      return rows[0] || null;
    });
  },
};
