import { query } from '../config/db.js';
import { withDb } from './db.js';

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

  /**
   * Get event registration metrics
   */
  async getEventMetrics(eventId) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT
           e.id,
           e.name,
           e.date_text as date,
           COALESCE(COUNT(DISTINCT r.id), 0) as totalRegistrations,
           COALESCE(SUM(CASE WHEN r.status = 'checked_in' THEN 1 ELSE 0 END), 0) as checkedIn,
           COALESCE(SUM(CASE WHEN r.status = 'registered' THEN 1 ELSE 0 END), 0) as pendingCheckIn,
           e.max_attendees as maxAttendees,
           e.created_at as eventCreatedAt,
           e.updated_at as eventUpdatedAt
         FROM events e
         LEFT JOIN registrations r ON e.id = r.event_id
         WHERE e.id = $1
         GROUP BY e.id, e.name, e.date_text, e.max_attendees, e.created_at, e.updated_at`,
        [eventId]
      );

      if (!rows.length) return null;

      const row = rows[0];
      return {
        eventId: row.id,
        eventName: row.name,
        eventDate: row.date,
        totalRegistrations: parseInt(row.totalRegistrations, 10),
        checkedIn: parseInt(row.checkedIn, 10),
        pendingCheckIn: parseInt(row.pendingCheckIn, 10),
        maxAttendees: row.maxAttendees,
        availableSeats: Math.max(
          0,
          (row.maxAttendees || 999) - parseInt(row.totalRegistrations, 10)
        ),
        occupancyRate: row.maxAttendees
          ? ((parseInt(row.totalRegistrations, 10) / row.maxAttendees) * 100).toFixed(2)
          : 0,
        eventCreatedAt: row.eventCreatedAt,
        eventUpdatedAt: row.eventUpdatedAt,
      };
    });
  },

  /**
   * Get all events metrics for dashboard
   */
  async getAllEventsMetrics() {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT
           e.id,
           e.name,
           e.date_text as date,
           e.status,
           COALESCE(COUNT(DISTINCT r.id), 0) as totalRegistrations,
           COALESCE(SUM(CASE WHEN r.status = 'checked_in' THEN 1 ELSE 0 END), 0) as checkedIn,
           e.max_attendees as maxAttendees
         FROM events e
         LEFT JOIN registrations r ON e.id = r.event_id
         GROUP BY e.id, e.name, e.date_text, e.status, e.max_attendees
         ORDER BY e.created_at DESC`
      );

      return rows.map((row) => ({
        eventId: row.id,
        eventName: row.name,
        eventDate: row.date,
        eventStatus: row.status,
        totalRegistrations: parseInt(row.totalRegistrations, 10),
        checkedIn: parseInt(row.checkedIn, 10),
        maxAttendees: row.maxAttendees,
        occupancyRate: row.maxAttendees
          ? ((parseInt(row.totalRegistrations, 10) / row.maxAttendees) * 100).toFixed(2)
          : 0,
      }));
    });
  },

  /**
   * Get registration trends over time for an event
   */
  async getRegistrationTrends(eventId, timeWindow = '7 days') {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT
           DATE(r.created_at) as date,
           COUNT(*) as registrations,
           SUM(CASE WHEN r.status = 'checked_in' THEN 1 ELSE 0 END) as checkedIn
         FROM registrations r
         WHERE r.event_id = $1 
           AND r.created_at > NOW() - INTERVAL $2
         GROUP BY DATE(r.created_at)
         ORDER BY date ASC`,
        [eventId, timeWindow]
      );

      return rows.map((row) => ({
        date: row.date,
        registrations: parseInt(row.registrations, 10),
        checkedIn: parseInt(row.checkedIn, 10),
      }));
    });
  },

  /**
   * Get hourly registration trends
   */
  async getHourlyRegistrationTrends(eventId, hours = 24) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT
           DATE_TRUNC('hour', r.created_at) as hour,
           COUNT(*) as registrations,
           SUM(CASE WHEN r.status = 'checked_in' THEN 1 ELSE 0 END) as checkedIn
         FROM registrations r
         WHERE r.event_id = $1 
           AND r.created_at > NOW() - INTERVAL '1 hour' * $2
         GROUP BY DATE_TRUNC('hour', r.created_at)
         ORDER BY hour ASC`,
        [eventId, hours]
      );

      return rows.map((row) => ({
        hour: row.hour,
        registrations: parseInt(row.registrations, 10),
        checkedIn: parseInt(row.checkedIn, 10),
      }));
    });
  },

  /**
   * Record a registration event
   */
  async recordRegistration(eventId, userId, email, status = 'registered') {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO registrations (id, event_id, user_id, email, status)
         VALUES (gen_random_uuid(), $1, $2, $3, $4)
         ON CONFLICT (event_id, email) DO UPDATE SET
           status = EXCLUDED.status,
           updated_at = NOW()
         RETURNING *`,
        [eventId, userId, email, status]
      );

      return {
        id: rows[0].id,
        eventId: rows[0].event_id,
        userId: rows[0].user_id,
        email: rows[0].email,
        status: rows[0].status,
        createdAt: rows[0].created_at,
      };
    });
  },

  /**
   * Update registration status (e.g., check-in)
   */
  async updateRegistrationStatus(registrationId, status) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `UPDATE registrations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, registrationId]
      );

      if (!rows.length) return null;

      return {
        id: rows[0].id,
        eventId: rows[0].event_id,
        email: rows[0].email,
        status: rows[0].status,
        updatedAt: rows[0].updated_at,
      };
    });
  },

  /**
   * Get recent registrations for an event
   */
  async getRecentRegistrations(eventId, limit = 20) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT id, email, status, created_at
         FROM registrations
         WHERE event_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [eventId, limit]
      );

      return rows.map((row) => ({
        id: row.id,
        email: row.email,
        status: row.status,
        createdAt: row.created_at,
      }));
    });
  },

  /**
   * Get check-in statistics for event
   */
  async getCheckInStats(eventId) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT
           status,
           COUNT(*) as count,
           COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
         FROM registrations
         WHERE event_id = $1
         GROUP BY status`,
        [eventId]
      );

      const stats = {};
      rows.forEach((row) => {
        stats[row.status] = {
          count: parseInt(row.count, 10),
          percentage: parseFloat(row.percentage).toFixed(2),
        };
      });

      return stats;
    });
  },

  /**
   * Export analytics data
   */
  async exportEventAnalytics(eventId, format = 'csv') {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT
           e.id,
           e.name,
           e.date_text,
           r.email,
           r.status,
           r.created_at,
           r.updated_at
         FROM events e
         LEFT JOIN registrations r ON e.id = r.event_id
         WHERE e.id = $1
         ORDER BY r.created_at DESC`,
        [eventId]
      );

      return rows;
    });
  },
};
