import { studentUsersRepository } from '../repositories/studentUsersRepository.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

/**
 * Get Leaderboard lists sorted by XP score
 */
export async function getLeaderboard(req, res, next) {
  try {
    const filter = String(req.query.filter || 'all').toLowerCase();
    const leaderboard = await studentUsersRepository.getLeaderboard(filter);

    // Map database properties to the frontend payload shape
    const formatted = leaderboard.map((user, i) => ({
      rank: i + 1,
      name: user.name || user.email.split('@')[0],
      xp: user.xp || 0,
      level: user.level || 1,
      avatar: user.avatar_url || '👤',
      badges: user.badges || [],
    }));

    const { data, hit } = await getOrSet({
      key: cacheKey,
      ttlSeconds: 60 * 5,
      getValue: async () => {
        const leaderboard = await studentUsersRepository.getLeaderboard(filter);

        // Map database properties to the frontend payload shape
        return leaderboard.map((user, i) => ({
          rank: i + 1,
          name: user.name || user.email.split('@')[0],
          xp: user.xp || 0,
          level: user.level || 1,
          avatar: user.avatar_url || '👤',
          badges: user.badges || [],
        }));
      },
    });

    res.setHeader('X-Cache', hit ? 'HIT' : 'MISS');
    return sendSuccess(res, data);
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    return sendError(req, res, 'Failed to retrieve leaderboard rankings.', 500, 'INTERNAL_ERROR');
  }
}

/**
 * Award XP to a student user dynamically
 */
export async function awardXP(req, res, next) {
  try {
    const { userId, amount } = req.body;
    if (!userId) {
      return sendError(req, res, 'userId is required', 400, 'VALIDATION_ERROR');
    }
    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return sendError(req, res, 'Valid positive amount is required', 400, 'VALIDATION_ERROR');
    }

    const updatedUser = await studentUsersRepository.awardXP(userId, parsedAmount);
    if (!updatedUser) {
      return sendError(req, res, 'User not found', 404, 'NOT_FOUND');
    }


    return sendSuccess(res, {
      xp: updatedUser.xp,
      level: updatedUser.level,
      badges: updatedUser.badges,
    });
  } catch (error) {
    console.error('Failed to award XP:', error);
    return sendError(req, res, 'Failed to award XP.', 500, 'INTERNAL_ERROR');
  }
}

/**
 * Get XP History logs for a student user
 */
export async function getXPHistory(req, res, next) {
  try {
    const userId = req.user?.id || req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const history = await studentUsersRepository.getXPHistory(parseInt(userId, 10));
    return res.json(history);
  } catch (error) {
    console.error('Failed to get XP history:', error);
    return res.status(500).json({ error: 'Failed to retrieve XP history.' });
  }
}
