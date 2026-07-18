/**
 * Migration: 1810_create_refresh_tokens_table.js
 *
 * Creates the student_refresh_tokens table used for JWT refresh-token rotation
 * with reuse detection. Only hashed tokens are persisted; raw token values
 * never touch the database.
 */

export const up = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS student_refresh_tokens (
      id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      token_hash      TEXT        NOT NULL UNIQUE,
      user_id         TEXT        NOT NULL,
      device_id       TEXT,
      ip_address      TEXT,
      user_agent      TEXT,
      family_id       UUID        NOT NULL DEFAULT gen_random_uuid(),
      is_revoked      BOOLEAN     NOT NULL DEFAULT FALSE,
      revoked_at      TIMESTAMPTZ,
      revoke_reason   TEXT,
      issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at      TIMESTAMPTZ NOT NULL,
      last_used_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_srt_token_hash
      ON student_refresh_tokens (token_hash)
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_srt_user_id
      ON student_refresh_tokens (user_id)
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_srt_family_id
      ON student_refresh_tokens (family_id)
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_srt_expires_at
      ON student_refresh_tokens (expires_at)
  `);
};

export const down = async (client) => {
  await client.query('DROP TABLE IF EXISTS student_refresh_tokens');
};
