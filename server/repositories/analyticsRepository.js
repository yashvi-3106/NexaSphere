import { query } from '../config/db.js';

export const analyticsRepository = {
  async createSession(sessionData) {
    const { id, user_id, device, browser, os } = sessionData;
    const q = `
      INSERT INTO analytics_sessions (id, user_id, device, browser, os)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const res = await query(q, [id, user_id || null, device, browser, os]);
    return res.rows[0];
  },

  async endSession(sessionId) {
    const q = `
      UPDATE analytics_sessions
      SET end_time = current_timestamp
      WHERE id = $1
      RETURNING *
    `;
    const res = await query(q, [sessionId]);
    return res.rows[0];
  },

  async logEvent(eventData) {
    const { session_id, user_id, event_type, url, element_selector, metadata } = eventData;
    const q = `
      INSERT INTO analytics_events (session_id, user_id, event_type, url, element_selector, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const res = await query(q, [
      session_id,
      user_id || null,
      event_type,
      url,
      element_selector,
      metadata ? JSON.stringify(metadata) : null,
    ]);
    return res.rows[0];
  },

  async saveRecording(sessionId, eventsJson) {
    // Upsert logic for recording
    const checkQuery = `SELECT id FROM analytics_recordings WHERE session_id = $1`;
    const checkRes = await query(checkQuery, [sessionId]);

    if (checkRes.rows.length > 0) {
      // Append to existing array (simplistic version, for rrweb it's better to fetch and concat, or send entire array)
      const q = `
        UPDATE analytics_recordings
        SET events_json = $2
        WHERE session_id = $1
        RETURNING *
      `;
      const res = await query(q, [sessionId, JSON.stringify(eventsJson)]);
      return res.rows[0];
    } else {
      const q = `
        INSERT INTO analytics_recordings (session_id, events_json)
        VALUES ($1, $2)
        RETURNING *
      `;
      const res = await query(q, [sessionId, JSON.stringify(eventsJson)]);
      return res.rows[0];
    }
  },

  async getRecording(sessionId) {
    const q = `SELECT events_json FROM analytics_recordings WHERE session_id = $1`;
    const res = await query(q, [sessionId]);
    return res.rows[0]?.events_json;
  },

  async getRecordingsList() {
    const q = `
      SELECT r.id, r.session_id, r.created_at, s.device, s.browser, s.start_time, s.end_time, u.name as user_name
      FROM analytics_recordings r
      JOIN analytics_sessions s ON r.session_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT 100
    `;
    const res = await query(q);
    return res.rows;
  },

  async getHeatmapData(url) {
    const q = `
      SELECT element_selector, COUNT(*) as clicks
      FROM analytics_events
      WHERE event_type = 'click' AND url = $1 AND element_selector IS NOT NULL
      GROUP BY element_selector
    `;
    const res = await query(q, [url]);
    return res.rows;
  },

  async getAllSegments() {
    const q = `SELECT * FROM analytics_segments`;
    const res = await query(q);
    return res.rows;
  },

  async createSegment(segmentData) {
    const { name, description, rules_json } = segmentData;
    const q = `
      INSERT INTO analytics_segments (name, description, rules_json)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const res = await query(q, [name, description, JSON.stringify(rules_json)]);
    return res.rows[0];
  },

  async getUserSegments(userId) {
    const q = `
      SELECT s.*
      FROM analytics_segments s
      JOIN analytics_user_segments us ON s.id = us.segment_id
      WHERE us.user_id = $1
    `;
    const res = await query(q, [userId]);
    return res.rows;
  },

  async getCohortData(signupMonth) {
    // Calculates retention metrics for a specific signup month cohort
    // Uses date_trunc('month', created_at)
    const q = `
      WITH cohort_users AS (
        SELECT id, created_at
        FROM users
        WHERE TO_CHAR(created_at, 'YYYY-MM') = $1
      ),
      retention AS (
        SELECT
          c.id,
          CASE WHEN EXISTS (
            SELECT 1 FROM analytics_sessions s
            WHERE s.user_id = c.id AND s.start_time > c.created_at + INTERVAL '30 days'
          ) THEN 1 ELSE 0 END as retained_30d
        FROM cohort_users c
      )
      SELECT
        COUNT(id) as total_users,
        SUM(retained_30d) as retained_30d_users
      FROM retention
    `;
    const res = await query(q, [signupMonth]);
    return res.rows[0];
  },
};
