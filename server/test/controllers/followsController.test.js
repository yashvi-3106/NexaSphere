import * as followsController from '../followsController.js';
import { followsService } from '../../services/followsService.js';

// Mock the service
jest.mock('../../services/followsService.js');

// Mock the async handler
jest.mock('../../middleware/asyncHandler.js', () => ({
  wrapAsync: (fn) => fn,
}));

describe('FollowsController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      studentUser: { sub: 1 },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('followUser', () => {
    it('should follow a user successfully', async () => {
      req.params.followingId = '2';
      const mockFollow = { id: 1, follower_id: 1, following_id: 2 };

      followsService.followUser.mockResolvedValue(mockFollow);

      await followsController.followUser(req, res);

      expect(followsService.followUser).toHaveBeenCalledWith(1, 2);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Successfully followed user',
          follow: mockFollow,
        })
      );
    });

    it('should return 401 if not authenticated', async () => {
      req.studentUser = undefined;
      req.params.followingId = '2';

      await followsController.followUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should return 400 if trying to follow yourself', async () => {
      req.params.followingId = '1';

      await followsController.followUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Users cannot follow themselves',
      });
    });

    it('should return 400 if already following', async () => {
      req.params.followingId = '2';

      followsService.followUser.mockRejectedValue(new Error('Already following'));

      await followsController.followUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Already following this user' });
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow a user successfully', async () => {
      req.params.followingId = '2';

      followsService.unfollowUser.mockResolvedValue(true);

      await followsController.unfollowUser(req, res);

      expect(followsService.unfollowUser).toHaveBeenCalledWith(1, 2);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Successfully unfollowed user',
      });
    });

    it('should return 401 if not authenticated', async () => {
      req.studentUser = undefined;
      req.params.followingId = '2';

      await followsController.unfollowUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should return 404 if not following', async () => {
      req.params.followingId = '2';

      followsService.unfollowUser.mockResolvedValue(false);

      await followsController.unfollowUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not following this user' });
    });
  });

  describe('checkFollowStatus', () => {
    it('should return follow status', async () => {
      req.params.followingId = '2';

      followsService.isFollowing.mockResolvedValue(true);

      await followsController.checkFollowStatus(req, res);

      expect(followsService.isFollowing).toHaveBeenCalledWith(1, 2);
      expect(res.json).toHaveBeenCalledWith({ isFollowing: true });
    });

    it('should return 401 if not authenticated', async () => {
      req.studentUser = undefined;
      req.params.followingId = '2';

      await followsController.checkFollowStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });
  });

  describe('getFollowCounts', () => {
    it('should return follow counts', async () => {
      req.params.userId = '1';
      const mockCounts = { followersCount: 10, followingCount: 5 };

      followsService.getFollowCounts.mockResolvedValue(mockCounts);

      await followsController.getFollowCounts(req, res);

      expect(followsService.getFollowCounts).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        followersCount: 10,
        followingCount: 5,
      });
    });

    it('should return 400 for invalid userId', async () => {
      req.params.userId = 'invalid';

      await followsController.getFollowCounts(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid userId' });
    });
  });

  describe('getUserFollowers', () => {
    it('should return user followers with pagination', async () => {
      req.params.userId = '1';
      req.query = { page: '1', limit: '20' };
      const mockResult = {
        followers: [{ id: 2, full_name: 'User 2', email: 'user2@example.com' }],
        page: 1,
        limit: 20,
        total: 1,
      };

      followsService.getFollowers.mockResolvedValue(mockResult);

      await followsController.getUserFollowers(req, res);

      expect(followsService.getFollowers).toHaveBeenCalledWith(1, {
        page: 1,
        limit: 20,
      });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          followers: mockResult.followers,
          pagination: expect.objectContaining({
            page: 1,
            total: 1,
          }),
        })
      );
    });
  });

  describe('getFollowedUsersActivityFeed', () => {
    it('should return activity feed from followed users', async () => {
      req.query = { page: '1', limit: '20' };
      const mockActivityFeed = {
        activities: [
          {
            id: 1,
            name: 'Event 1',
            created_at: '2026-07-02T00:00:00Z',
          },
        ],
        page: 1,
        limit: 20,
        total: 1,
      };

      followsService.getFollowedUsersActivityFeed.mockResolvedValue(mockActivityFeed);

      await followsController.getFollowedUsersActivityFeed(req, res);

      expect(followsService.getFollowedUsersActivityFeed).toHaveBeenCalledWith(1, {
        page: 1,
        limit: 20,
      });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          activities: mockActivityFeed.activities,
        })
      );
    });

    it('should return 401 if not authenticated', async () => {
      req.studentUser = undefined;

      await followsController.getFollowedUsersActivityFeed(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });
  });
});
