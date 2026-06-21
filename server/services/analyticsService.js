import { analyticsRepository } from '../repositories/analyticsRepository.js';
import { query } from '../config/db.js';

export const analyticsService = {
  async processEventBatch(sessionId, userId, events) {
    const results = [];
    for (const ev of events) {
      const res = await analyticsRepository.logEvent({
        session_id: sessionId,
        user_id: userId,
        event_type: ev.type,
        url: ev.url,
        element_selector: ev.selector,
        metadata: ev.metadata,
      });
      results.push(res);
    }
    return results;
  },

  async evaluateSegments() {
    // This function can run periodically (e.g., cron)
    // to calculate and assign users to segments
    const segments = await analyticsRepository.getAllSegments();

    for (const segment of segments) {
      try {
        const rules = segment.rules_json;
        // Basic rule evaluator based on rules JSON
        // E.g. {"condition": "events_count", "operator": ">=", "value": 5, "days": 30}
        if (rules.condition === 'events_count') {
          const days = rules.days || 30;
          const value = rules.value || 5;
          const q = `
            INSERT INTO analytics_user_segments (user_id, segment_id)
            SELECT user_id, $1
            FROM analytics_events
            WHERE timestamp > current_timestamp - interval '${days} days'
              AND user_id IS NOT NULL
            GROUP BY user_id
            HAVING COUNT(*) >= $2
            ON CONFLICT DO NOTHING
          `;
          await query(q, [segment.id, value]);
        } else if (rules.condition === 'inactivity') {
          const days = rules.days || 60;
          const q = `
            INSERT INTO analytics_user_segments (user_id, segment_id)
            SELECT u.id, $1
            FROM users u
            LEFT JOIN analytics_events e ON u.id = e.user_id AND e.timestamp > current_timestamp - interval '${days} days'
            WHERE e.id IS NULL
            ON CONFLICT DO NOTHING
          `;
          await query(q, [segment.id]);
        }
      } catch (err) {
        console.error(`Error evaluating segment ${segment.name}:`, err);
      }
    }
  },

  async performSegmentAction(segmentId, actionData) {
    // actionData: { action: 'email', template: 'miss_you' }
    if (actionData.action === 'email') {
      const q = `
        SELECT u.email, u.name
        FROM users u
        JOIN analytics_user_segments us ON u.id = us.user_id
        WHERE us.segment_id = $1
      `;
      const res = await query(q, [segmentId]);
      const users = res.rows;
      // Mocking email send
      console.log(
        `Sending email to ${users.length} users in segment ${segmentId} with template ${actionData.template}`
      );
      return { success: true, count: users.length };
    }
    return { success: false, reason: 'Unknown action' };
  },
};
