import { followsRepository } from '../repositories/followsRepository.js';
import notificationsService from './notificationsService.js';

export const followsService = {
  /**
   * Follow a user with validation
   */
  async followUser(followerId, followingId) {
    if (!followerId || !followingId) {
      throw new Error('followerId and followingId are required');
    }

    if (followerId === followingId) {
      throw new Error('Users cannot follow themselves');
    }

    try {
      const follow = await followsRepository.follow(followerId, followingId);

      // Send notification to the followed user
      await notificationsService.addNotification(followingId, {
        type: 'follow',
        title: 'New Follower',
        message: `Someone followed you!`,
        link: `/profile/${followerId}`,
      });

      return follow;
    } catch (error) {
      if (error.message.includes('Already following')) {
        throw new Error('Already following this user');
      }
      if (error.message.includes('cannot follow themselves')) {
        throw new Error('Users cannot follow themselves');
      }
      throw error;
    }
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId, followingId) {
    if (!followerId || !followingId) {
      throw new Error('followerId and followingId are required');
    }

    return followsRepository.unfollow(followerId, followingId);
  },

  /**
   * Check if a user follows another user
   */
  async isFollowing(followerId, followingId) {
    return followsRepository.isFollowing(followerId, followingId);
  },

  /**
   * Get users that a user is following
   */
  async getFollowing(userId, options = {}) {
    if (!userId) {
      throw new Error('userId is required');
    }

    return followsRepository.getFollowing(userId, {
      page: options.page || 1,
      limit: Math.min(options.limit || 20, 100),
    });
  },

  /**
   * Get followers of a user
   */
  async getFollowers(userId, options = {}) {
    if (!userId) {
      throw new Error('userId is required');
    }

    return followsRepository.getFollowers(userId, {
      page: options.page || 1,
      limit: Math.min(options.limit || 20, 100),
    });
  },

  /**
   * Get follow counts for a user
   */
  async getFollowCounts(userId) {
    if (!userId) {
      throw new Error('userId is required');
    }

    return followsRepository.getCounts(userId);
  },

  /**
   * Get follow counts for multiple users
   */
  async getFollowCountsForUsers(userIds) {
    if (!userIds || userIds.length === 0) {
      return {};
    }

    return followsRepository.getCountsForUsers(userIds);
  },

  /**
   * Get activity feed from followed users
   */
  async getFollowedUsersActivityFeed(userId, options = {}) {
    if (!userId) {
      throw new Error('userId is required');
    }

    return followsRepository.getFollowedUsersActivityFeed(userId, {
      page: options.page || 1,
      limit: Math.min(options.limit || 20, 100),
    });
  },

  /**
   * Check follow status for multiple users
   */
  async checkFollowStatus(followerId, followingIds) {
    if (!followerId || !followingIds) {
      throw new Error('followerId and followingIds are required');
    }

    return followsRepository.checkFollowStatus(followerId, followingIds);
  },
};
