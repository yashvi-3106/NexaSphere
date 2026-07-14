import { withDb } from './db.js';

export const userSegmentsRepository = {
  async createSegment({ name, description, criteria, auto_update }) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO user_segments (name, description, criteria, auto_update)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, description, JSON.stringify(criteria || {}), auto_update ?? true]
      );
      return rows[0];
    });
  },

  async getSegments() {
    return withDb(async (client) => {
      const { rows } = await client.query('SELECT * FROM user_segments ORDER BY created_at DESC');
      return rows;
    });
  },

  async getSegmentById(id) {
    return withDb(async (client) => {
      const { rows } = await client.query('SELECT * FROM user_segments WHERE id = $1', [id]);
      return rows[0];
    });
  },

  async updateSegment(id, { name, description, criteria, auto_update }) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `UPDATE user_segments SET 
           name = COALESCE($2, name),
           description = COALESCE($3, description),
           criteria = COALESCE($4, criteria),
           auto_update = COALESCE($5, auto_update),
           updated_at = NOW()
         WHERE id = $1 RETURNING *`,
        [id, name, description, criteria ? JSON.stringify(criteria) : null, auto_update]
      );
      return rows[0];
    });
  },

  async deleteSegment(id) {
    return withDb(async (client) => {
      const { rowCount } = await client.query('DELETE FROM user_segments WHERE id = $1', [id]);
      return rowCount > 0;
    });
  },

  // Auto-segmentation batch updates
  async batchUpdateActivityLevels(thresholds) {
    return withDb(async (client) => {
      // thresholds.inactiveDays = 30
      // if last_login_at < 30 days ago => 'inactive'
      // else if login_count (we dont have login_count, but we can just use last_login_at or assume active) => 'active'
      // We'll do a simple query for inactive

      const inactiveQuery = `
        UPDATE student_users
        SET activity_level = 'inactive'
        WHERE last_login_at < NOW() - INTERVAL '${thresholds.inactiveDays} days'
          AND activity_level != 'inactive'
      `;
      await client.query(inactiveQuery);

      const activeQuery = `
        UPDATE student_users
        SET activity_level = 'active'
        WHERE last_login_at >= NOW() - INTERVAL '${thresholds.inactiveDays} days'
          AND activity_level != 'active'
      `;
      await client.query(activeQuery);
    });
  },
};
