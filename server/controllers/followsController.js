import { followsService } from '../services/followsService.js';
import { wrapAsync } from '../middleware/asyncHandler.js';

const MAX_LIMIT = 100;

function parsePaginationParams(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit };
}

/**
 * Follow a user
 * POST /api/student/follows/:followingId
 */
export const followUser = wrapAsync(async (req, res) => {
  const followerId = req.studentUser?.sub;
  const { followingId } = req.params;

  if (!followerId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const followingIdNum = parseInt(followingId, 10);
  if (isNaN(followingIdNum)) {
    return res.status(400).json({ error: 'Invalid followingId' });
  }

  if (followerId === followingIdNum) {
    return res.status(400).json({ error: 'Users cannot follow themselves' });
  }

  try {
    const follow = await followsService.followUser(followerId, followingIdNum);

    return res.status(201).json({
      success: true,
      message: 'Successfully followed user',
      follow,
    });
  } catch (error) {
    if (
      error.message.includes('Already following') ||
      error.message.includes('already following')
    ) {
      return res.status(400).json({ error: 'Already following this user' });
    }
    if (error.message.includes('cannot follow themselves')) {
      return res.status(400).json({ error: 'Users cannot follow themselves' });
    }

    console.error('[Follows] Error following user:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Unfollow a user
 * DELETE /api/student/follows/:followingId
 */
export const unfollowUser = wrapAsync(async (req, res) => {
  const followerId = req.studentUser?.sub;
  const { followingId } = req.params;

  if (!followerId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const followingIdNum = parseInt(followingId, 10);
  if (isNaN(followingIdNum)) {
    return res.status(400).json({ error: 'Invalid followingId' });
  }

  try {
    const unfollowed = await followsService.unfollowUser(followerId, followingIdNum);

    if (!unfollowed) {
      return res.status(404).json({ error: 'Not following this user' });
    }

    return res.json({
      success: true,
      message: 'Successfully unfollowed user',
    });
  } catch (error) {
    console.error('[Follows] Error unfollowing user:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get followers of a user
 * GET /api/student/users/:userId/followers
 */
export const getUserFollowers = wrapAsync(async (req, res) => {
  const { userId } = req.params;
  const { page, limit } = parsePaginationParams(req.query);

  const userIdNum = parseInt(userId, 10);
  if (isNaN(userIdNum)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    const result = await followsService.getFollowers(userIdNum, { page, limit });

    return res.json({
      followers: result.followers,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('[Follows] Error getting followers:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get users that a user is following
 * GET /api/student/users/:userId/following
 */
export const getUserFollowing = wrapAsync(async (req, res) => {
  const { userId } = req.params;
  const { page, limit } = parsePaginationParams(req.query);

  const userIdNum = parseInt(userId, 10);
  if (isNaN(userIdNum)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    const result = await followsService.getFollowing(userIdNum, { page, limit });

    return res.json({
      following: result.users,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('[Follows] Error getting following:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get follow counts for a user
 * GET /api/student/users/:userId/follow-counts
 */
export const getFollowCounts = wrapAsync(async (req, res) => {
  const { userId } = req.params;

  const userIdNum = parseInt(userId, 10);
  if (isNaN(userIdNum)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    const counts = await followsService.getFollowCounts(userIdNum);

    return res.json({
      followersCount: counts.followersCount,
      followingCount: counts.followingCount,
    });
  } catch (error) {
    console.error('[Follows] Error getting follow counts:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Check if current user follows another user
 * GET /api/student/follows/status/:followingId
 */
export const checkFollowStatus = wrapAsync(async (req, res) => {
  const followerId = req.studentUser?.sub;
  const { followingId } = req.params;

  if (!followerId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const followingIdNum = parseInt(followingId, 10);
  if (isNaN(followingIdNum)) {
    return res.status(400).json({ error: 'Invalid followingId' });
  }

  try {
    const isFollowing = await followsService.isFollowing(followerId, followingIdNum);

    return res.json({
      isFollowing,
    });
  } catch (error) {
    console.error('[Follows] Error checking follow status:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get activity feed from followed users
 * GET /api/student/activity-feed/followed
 */
export const getFollowedUsersActivityFeed = wrapAsync(async (req, res) => {
  const userId = req.studentUser?.sub;
  const { page, limit } = parsePaginationParams(req.query);

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const result = await followsService.getFollowedUsersActivityFeed(userId, {
      page,
      limit,
    });

    return res.json({
      activities: result.activities,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('[Follows] Error getting activity feed:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get current user's following list
 * GET /api/student/me/following
 */
export const getCurrentUserFollowing = wrapAsync(async (req, res) => {
  const userId = req.studentUser?.sub;
  const { page, limit } = parsePaginationParams(req.query);

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const result = await followsService.getFollowing(userId, { page, limit });

    return res.json({
      following: result.users,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('[Follows] Error getting current user following:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get current user's followers list
 * GET /api/student/me/followers
 */
export const getCurrentUserFollowers = wrapAsync(async (req, res) => {
  const userId = req.studentUser?.sub;
  const { page, limit } = parsePaginationParams(req.query);

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const result = await followsService.getFollowers(userId, { page, limit });

    return res.json({
      followers: result.followers,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('[Follows] Error getting current user followers:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get current user's follow counts
 * GET /api/student/me/follow-counts
 */
export const getCurrentUserFollowCounts = wrapAsync(async (req, res) => {
  const userId = req.studentUser?.sub;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const counts = await followsService.getFollowCounts(userId);

    return res.json({
      followersCount: counts.followersCount,
      followingCount: counts.followingCount,
    });
  } catch (error) {
    console.error('[Follows] Error getting current user follow counts:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
