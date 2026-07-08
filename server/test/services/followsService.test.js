import { followsService } from '../followsService.js';
import { followsRepository } from '../../repositories/followsRepository.js';
import notificationsService from '../notificationsService.js';

// Mock the repositories and services
jest.mock('../../repositories/followsRepository.js');
jest.mock('../notificationsService.js');

describe('FollowsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('followUser', () => {
    it('should successfully follow a user', async () => {
      const followerId = 1;
      const followingId = 2;
      const mockFollow = { id: 1, follower_id: followerId, following_id: followingId };

      followsRepository.follow.mockResolvedValue(mockFollow);
      notificationsService.addNotification.mockResolvedValue({});

      const result = await followsService.followUser(followerId, followingId);

      expect(followsRepository.follow).toHaveBeenCalledWith(followerId, followingId);
      expect(notificationsService.addNotification).toHaveBeenCalledWith(
        followingId,
        expect.objectContaining({
          type: 'follow',
          title: 'New Follower',
        })
      );
      expect(result).toEqual(mockFollow);
    });

    it('should throw error when following yourself', async () => {
      const userId = 1;

      await expect(followsService.followUser(userId, userId)).rejects.toThrow(
        'Users cannot follow themselves'
      );
      expect(followsRepository.follow).not.toHaveBeenCalled();
    });

    it('should throw error when already following', async () => {
      const followerId = 1;
      const followingId = 2;

      followsRepository.follow.mockRejectedValue(new Error('Already following'));

      await expect(followsService.followUser(followerId, followingId)).rejects.toThrow(
        'Already following this user'
      );
    });
  });

  describe('unfollowUser', () => {
    it('should successfully unfollow a user', async () => {
      const followerId = 1;
      const followingId = 2;

      followsRepository.unfollow.mockResolvedValue(true);

      const result = await followsService.unfollowUser(followerId, followingId);

      expect(followsRepository.unfollow).toHaveBeenCalledWith(followerId, followingId);
      expect(result).toBe(true);
    });

    it('should return false if not following', async () => {
      const followerId = 1;
      const followingId = 2;

      followsRepository.unfollow.mockResolvedValue(false);

      const result = await followsService.unfollowUser(followerId, followingId);

      expect(result).toBe(false);
    });
  });

  describe('isFollowing', () => {
    it('should return true if following', async () => {
      const followerId = 1;
      const followingId = 2;

      followsRepository.isFollowing.mockResolvedValue(true);

      const result = await followsService.isFollowing(followerId, followingId);

      expect(result).toBe(true);
    });

    it('should return false if not following', async () => {
      const followerId = 1;
      const followingId = 2;

      followsRepository.isFollowing.mockResolvedValue(false);

      const result = await followsService.isFollowing(followerId, followingId);

      expect(result).toBe(false);
    });
  });

  describe('getFollowers', () => {
    it('should return list of followers', async () => {
      const userId = 1;
      const mockFollowers = {
        followers: [
          { id: 2, full_name: 'User 2', email: 'user2@example.com' },
          { id: 3, full_name: 'User 3', email: 'user3@example.com' },
        ],
        total: 2,
        page: 1,
        limit: 20,
      };

      followsRepository.getFollowers.mockResolvedValue(mockFollowers);

      const result = await followsService.getFollowers(userId, { page: 1, limit: 20 });

      expect(followsRepository.getFollowers).toHaveBeenCalledWith(userId, { page: 1, limit: 20 });
      expect(result).toEqual(mockFollowers);
    });

    it('should enforce limit maximum', async () => {
      const userId = 1;
      const mockFollowers = { followers: [], total: 0, page: 1, limit: 100 };

      followsRepository.getFollowers.mockResolvedValue(mockFollowers);

      await followsService.getFollowers(userId, { page: 1, limit: 500 });

      expect(followsRepository.getFollowers).toHaveBeenCalledWith(userId, {
        page: 1,
        limit: 100,
      });
    });
  });

  describe('getFollowing', () => {
    it('should return list of users being followed', async () => {
      const userId = 1;
      const mockFollowing = {
        users: [
          { id: 2, full_name: 'User 2', email: 'user2@example.com' },
          { id: 3, full_name: 'User 3', email: 'user3@example.com' },
        ],
        total: 2,
        page: 1,
        limit: 20,
      };

      followsRepository.getFollowing.mockResolvedValue(mockFollowing);

      const result = await followsService.getFollowing(userId, { page: 1, limit: 20 });

      expect(followsRepository.getFollowing).toHaveBeenCalledWith(userId, { page: 1, limit: 20 });
      expect(result).toEqual(mockFollowing);
    });
  });

  describe('getFollowCounts', () => {
    it('should return follow counts for a user', async () => {
      const userId = 1;
      const mockCounts = { followersCount: 10, followingCount: 5 };

      followsRepository.getCounts.mockResolvedValue(mockCounts);

      const result = await followsService.getFollowCounts(userId);

      expect(followsRepository.getCounts).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockCounts);
    });
  });

  describe('getFollowedUsersActivityFeed', () => {
    it('should return activity feed from followed users', async () => {
      const userId = 1;
      const mockActivityFeed = {
        activities: [
          {
            id: 1,
            name: 'Event 1',
            created_by_name: 'User 2',
            created_at: '2026-07-02T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      };

      followsRepository.getFollowedUsersActivityFeed.mockResolvedValue(mockActivityFeed);

      const result = await followsService.getFollowedUsersActivityFeed(userId, {
        page: 1,
        limit: 20,
      });

      expect(followsRepository.getFollowedUsersActivityFeed).toHaveBeenCalledWith(userId, {
        page: 1,
        limit: 20,
      });
      expect(result).toEqual(mockActivityFeed);
    });
  });
});
