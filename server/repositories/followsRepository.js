import { withDb } from './db.js';

export const followsRepository = {
  /**
   * Create a follow relationship
   */
  async follow(followerId, followingId) {
    if (!followerId || !followingId) {
      throw new Error('follower_id and following_id are required');
    }

    if (followerId === followingId) {
      throw new Error('Users cannot follow themselves');
    }

    return withDb(async (client) => {
      try {
        const { rows } = await client.query(
          `INSERT INTO follows (follower_id, following_id)
           VALUES ($1, $2)
           RETURNING id, follower_id, following_id, created_at, updated_at`,
          [followerId, followingId]
        );
        return rows[0];
      } catch (error) {
        // Handle unique constraint violation (duplicate follow)
        if (error.code === '23505') {
          throw new Error('Already following this user');
        }
        throw error;
      }
    });
  },

  /**
   * Remove a follow relationship
   */
  async unfollow(followerId, followingId) {
    if (!followerId || !followingId) {
      throw new Error('follower_id and following_id are required');
    }

    return withDb(async (client) => {
      const { rowCount } = await client.query(
        'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
      );
      return rowCount > 0;
    });
  },

  /**
   * Check if a user follows another user
   */
  async isFollowing(followerId, followingId) {
    if (!followerId || !followingId) {
      throw new Error('follower_id and following_id are required');
    }

    return withDb(async (client) => {
      const { rows } = await client.query(
        'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2 LIMIT 1',
        [followerId, followingId]
      );
      return rows.length > 0;
    });
  },

  /**
   * Get all users that a user is following
   */
  async getFollowing(userId, { page = 1, limit = 20 } = {}) {
    if (!userId) {
      throw new Error('userId is required');
    }

    const offset = (page - 1) * limit;

    return withDb(async (client) => {
      // Get the list of users
      const { rows: users } = await client.query(
        `SELECT 
          su.id,
          su.provider,
          su.provider_id,
          su.email,
          su.full_name,
          su.avatar_url,
          su.role,
          su.last_login_at,
          su.created_at,
          f.created_at as followed_at
         FROM follows f
         INNER JOIN student_users su ON f.following_id = su.id
         WHERE f.follower_id = $1
         ORDER BY f.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      // Get total count
      const { rows: countResult } = await client.query(
        'SELECT COUNT(*)::int as total FROM follows WHERE follower_id = $1',
        [userId]
      );

      return {
        users,
        total: countResult[0]?.total || 0,
        page,
        limit,
      };
    });
  },

  /**
   * Get all followers of a user
   */
  async getFollowers(userId, { page = 1, limit = 20 } = {}) {
    if (!userId) {
      throw new Error('userId is required');
    }

    const offset = (page - 1) * limit;

    return withDb(async (client) => {
      // Get the list of followers
      const { rows: followers } = await client.query(
        `SELECT 
          su.id,
          su.provider,
          su.provider_id,
          su.email,
          su.full_name,
          su.avatar_url,
          su.role,
          su.last_login_at,
          su.created_at,
          f.created_at as followed_at
         FROM follows f
         INNER JOIN student_users su ON f.follower_id = su.id
         WHERE f.following_id = $1
         ORDER BY f.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      // Get total count
      const { rows: countResult } = await client.query(
        'SELECT COUNT(*)::int as total FROM follows WHERE following_id = $1',
        [userId]
      );

      return {
        followers,
        total: countResult[0]?.total || 0,
        page,
        limit,
      };
    });
  },

  /**
   * Get follower/following counts for a user
   */
  async getCounts(userId) {
    if (!userId) {
      throw new Error('userId is required');
    }

    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT 
          (SELECT COUNT(*)::int FROM follows WHERE follower_id = $1) as following_count,
          (SELECT COUNT(*)::int FROM follows WHERE following_id = $1) as followers_count`,
        [userId]
      );
      return {
        followersCount: rows[0]?.followers_count || 0,
        followingCount: rows[0]?.following_count || 0,
      };
    });
  },

  /**
   * Get multiple users' follow counts efficiently
   */
  async getCountsForUsers(userIds) {
    if (!userIds || userIds.length === 0) {
      return {};
    }

    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT 
          su.id,
          COUNT(CASE WHEN f1.follower_id = su.id THEN 1 END)::int as following_count,
          COUNT(CASE WHEN f1.following_id = su.id THEN 1 END)::int as followers_count
         FROM student_users su
         LEFT JOIN follows f1 ON su.id = f1.follower_id OR su.id = f1.following_id
         WHERE su.id = ANY($1)
         GROUP BY su.id`,
        [userIds]
      );

      const result = {};
      rows.forEach((row) => {
        result[row.id] = {
          followersCount: row.followers_count,
          followingCount: row.following_count,
        };
      });

      return result;
    });
  },

  /**
   * Get activity feed from followed users
   */
  async getFollowedUsersActivityFeed(userId, { page = 1, limit = 20 } = {}) {
    if (!userId) {
      throw new Error('userId is required');
    }

    const offset = (page - 1) * limit;

    return withDb(async (client) => {
      // Get the IDs of users that this user is following
      const { rows: followingIds } = await client.query(
        'SELECT following_id FROM follows WHERE follower_id = $1',
        [userId]
      );

      if (followingIds.length === 0) {
        return {
          activities: [],
          total: 0,
          page,
          limit,
        };
      }

      const userIds = followingIds.map((f) => f.following_id);

      // Get activity events from followed users
      // This queries activity_events table for events created by followed users
      const { rows: activities } = await client.query(
        `SELECT 
          ae.id,
          ae.activity_key,
          ae.name,
          ae.date_text,
          ae.tagline,
          ae.description,
          ae.status,
          ae.created_by_name,
          ae.created_by_email,
          ae.created_by_phone,
          ae.created_at,
          su.id as user_id,
          su.full_name as user_full_name,
          su.avatar_url as user_avatar_url,
          su.email as user_email
         FROM activity_events ae
         INNER JOIN student_users su ON LOWER(ae.created_by_email) = LOWER(su.email)
         WHERE su.id = ANY($1)
         ORDER BY ae.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userIds, limit, offset]
      );

      // Get total count
      const { rows: countResult } = await client.query(
        `SELECT COUNT(*)::int as total
         FROM activity_events ae
         INNER JOIN student_users su ON LOWER(ae.created_by_email) = LOWER(su.email)
         WHERE su.id = ANY($1)`,
        [userIds]
      );

      return {
        activities,
        total: countResult[0]?.total || 0,
        page,
        limit,
      };
    });
  },

  /**
   * Check follow status for multiple user pairs
   */
  async checkFollowStatus(followerId, followingIds) {
    if (!followerId || !followingIds || followingIds.length === 0) {
      return {};
    }

    return withDb(async (client) => {
      const { rows } = await client.query(
        `SELECT following_id, true as is_following
         FROM follows
         WHERE follower_id = $1 AND following_id = ANY($2)`,
        [followerId, followingIds]
      );

      const result = {};
      followingIds.forEach((id) => {
        result[id] = false;
      });

      rows.forEach((row) => {
        result[row.following_id] = true;
      });

      return result;
    });
  },
};
