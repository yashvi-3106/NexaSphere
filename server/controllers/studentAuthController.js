import passport from 'passport';
import { studentUsersRepository } from '../repositories/studentUsersRepository.js';
import { studentAuthService } from '../services/studentAuthService.js';
import { withDb } from '../repositories/db.js';

export const googleAuth = (req, res, next) => {
  const state = req.query.token || '';
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
    state,
  })(req, res, next);
};

export const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, data, info) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5175';
    if (err) return next(err);
    if (!data) {
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(info?.message || 'Authentication failed')}`
      );
    }
    res.cookie('ns_student_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.redirect(`${frontendUrl}/dashboard`);
  })(req, res, next);
};

export const githubAuth = (req, res, next) => {
  const state = req.query.token || '';
  passport.authenticate('github', {
    session: false,
    scope: ['user:email'],
    state,
  })(req, res, next);
};

export const githubCallback = (req, res, next) => {
  passport.authenticate('github', { session: false }, (err, data, info) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5175';
    if (err) return next(err);
    if (!data) {
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(info?.message || 'Authentication failed')}`
      );
    }
    res.cookie('ns_student_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.redirect(`${frontendUrl}/dashboard`);
  })(req, res, next);
};
export const githubPortfolioAuth = passport.authenticate('github-portfolio', {
  session: false,
  scope: ['read:user'],
});

export const githubPortfolioCallback = (req, res, next) => {
  passport.authenticate('github-portfolio', { session: false }, (err, data) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5175';
    if (err || !data?.githubUsername) {
      return res.redirect(`${frontendUrl}/portfolio-builder?githubError=1`);
    }
    return res.redirect(
      `${frontendUrl}/portfolio-builder?github=${encodeURIComponent(data.githubUsername)}`
    );
  })(req, res, next);
};
export const getMe = async (req, res) => {
  if (!req.studentUser) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  let freshUser = null;
  try {
    freshUser = await studentUsersRepository.findByProvider(
      req.studentUser.provider,
      req.studentUser.provider_id || req.studentUser.sub
    );
    if (!freshUser) {
      freshUser = await studentUsersRepository.findByEmail(req.studentUser.email);
    }
  } catch (err) {
    console.error('Error fetching fresh user details in getMe:', err);
  }

  const userToSend = freshUser
    ? {
        id: freshUser.id,
        provider: freshUser.provider,
        email: freshUser.email,
        name: freshUser.full_name,
        role: freshUser.role,
        avatar_url: freshUser.avatar_url,
        theme: freshUser.theme,
      }
    : req.studentUser;

  return res.json({ user: userToSend });
};

export const updateTheme = async (req, res) => {
  if (!req.studentUser) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { theme } = req.body;
  if (theme !== 'light' && theme !== 'dark' && theme !== 'system') {
    return res.status(400).json({ error: 'Invalid theme' });
  }
  try {
    await studentUsersRepository.updateTheme(req.studentUser.sub || req.studentUser.id, theme);
    return res.json({ ok: true, theme });
  } catch (err) {
    console.error('Error updating theme in database:', err);
    return res.status(500).json({ error: 'Failed to update theme' });
  }
};

export const updateSlackSettings = async (req, res) => {
  if (!req.studentUser) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { slackUserId, slackDmReminders } = req.body;
  try {
    const updatedUser = await studentUsersRepository.updateSlackSettings(req.studentUser.email, {
      slackUserId,
      slackDmReminders,
    });
    return res.json({ success: true, user: { ...req.studentUser, ...updatedUser } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update Slack settings: ' + err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.ns_student_token || req.headers.authorization?.split(' ')[1];
    if (token) {
      await studentAuthService.logout(token);
    }
    res.clearCookie('ns_student_token');
    return res.json({ ok: true });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Logout failed' });
  }
};

// ── NEW: Student Profile endpoints ──────────────────────────────────────────

export const getProfile = async (req, res) => {
  if (!req.studentUser) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const userId = req.studentUser.sub || req.studentUser.id;

    const user =
      (await studentUsersRepository.findByProvider(req.studentUser.provider, userId)) ||
      (await studentUsersRepository.findByEmail(req.studentUser.email));

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Safely count related data — tables may not exist yet in all envs
    let registrations = [];
    let forumPosts = 0;
    let mentorSessions = 0;

    try {
      const { default: db } = await import('../db/index.js');
      registrations = await db('registrations')
        .where({ user_id: user.id })
        .leftJoin('events', 'registrations.event_id', 'events.id')
        .select(
          'registrations.*',
          'events.title as event_title',
          'events.date  as event_date',
          'events.location as event_location'
        )
        .orderBy('registrations.created_at', 'desc');
    } catch (_) {
      /* table may not exist yet */
    }

    try {
      const { default: db } = await import('../db/index.js');
      const [{ count }] = await db('forum_threads')
        .where({ author_id: user.id })
        .count('id as count');
      forumPosts = Number(count);
    } catch (_) {
      /* table may not exist yet */
    }

    try {
      const { default: db } = await import('../db/index.js');
      const [{ count }] = await db('mentor_sessions')
        .where({ mentee_id: user.id })
        .count('id as count');
      mentorSessions = Number(count);
    } catch (_) {
      /* table may not exist yet */
    }

    const attendedEvents = registrations.filter(
      (r) => r.attended || r.status === 'attended'
    ).length;

    return res.json({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      avatar: user.avatar_url,
      bio: user.bio || '',
      socialLinks: user.social_links || {},
      role: user.role,
      createdAt: user.created_at,
      stats: {
        totalRegistrations: registrations.length,
        attendedEvents,
        forumPosts,
        mentorSessions,
      },
      registrations,
    });
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

export const updateProfile = async (req, res) => {
  if (!req.studentUser) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const userId = req.studentUser.sub || req.studentUser.id;
    const allowed = ['fullName', 'bio', 'socialLinks'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // Map camelCase keys to snake_case DB columns
    const dbUpdates = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.socialLinks !== undefined)
      dbUpdates.social_links = JSON.stringify(updates.socialLinks);

    const updatedUser = await studentUsersRepository.updateProfile(userId, dbUpdates);
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    return res.json({
      id: updatedUser.id,
      fullName: updatedUser.full_name,
      email: updatedUser.email,
      bio: updatedUser.bio || '',
      socialLinks: updatedUser.social_links || {},
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

export const getRegistrations = async (req, res) => {
  if (!req.studentUser) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const user = await studentUsersRepository.findByEmail(req.studentUser.email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let registrations = [];
    try {
      const { default: db } = await import('../db/index.js');
      registrations = await db('registrations')
        .where({ user_id: user.id })
        .leftJoin('events', 'registrations.event_id', 'events.id')
        .select(
          'registrations.*',
          'events.title    as event_title',
          'events.date     as event_date',
          'events.location as event_location'
        )
        .orderBy('registrations.created_at', 'desc');
    } catch (_) {
      /* table may not exist yet */
    }

    return res.json(registrations);
  } catch (err) {
    console.error('getRegistrations error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
};
