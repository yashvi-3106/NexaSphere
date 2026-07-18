import passport from 'passport';
import { studentUsersRepository } from '../repositories/studentUsersRepository.js';
import { studentAuthService } from '../services/studentAuthService.js';
import { withDb } from '../repositories/db.js';
import { intrusionDetectionService, EVENT_TYPES } from '../services/intrusionDetectionService.js';

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
      intrusionDetectionService.reportEvent(EVENT_TYPES.AUTH_FAILURE, req.ip, null).catch(console.error);
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
      intrusionDetectionService.reportEvent(EVENT_TYPES.AUTH_FAILURE, req.ip, null).catch(console.error);
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
  // Load fresh user data including theme from DB
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
