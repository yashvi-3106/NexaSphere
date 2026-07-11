import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { studentAuthService } from '../services/studentAuthService.js';
import jwt from 'jsonwebtoken';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

export const hasGoogleOAuth = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
export const hasGitHubOAuth = Boolean(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET);

const DOMAIN_RESTRICTION = process.env.OAUTH_DOMAIN_RESTRICTION || '';

function verifyBypassToken(stateToken, email) {
  if (!stateToken || !process.env.JWT_SECRET) return false;
  try {
    const decoded = jwt.verify(stateToken, process.env.JWT_SECRET);
    return (
      decoded.bypassSso === true &&
      String(decoded.email).toLowerCase() === String(email).toLowerCase()
    );
  } catch (err) {
    return false;
  }
}

if (hasGoogleOAuth) {
  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BASE_URL}/api/auth/google/callback`,
        scope: ['profile', 'email'],
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || '';
          const stateToken = req.query?.state || '';
          const hasBypass = verifyBypassToken(stateToken, email);

          if (
            !hasBypass &&
            DOMAIN_RESTRICTION &&
            !email.toLowerCase().endsWith(`@${DOMAIN_RESTRICTION.toLowerCase()}`)
          ) {
            return done(null, false, { message: `Only @${DOMAIN_RESTRICTION} emails allowed` });
          }
          const user = await studentAuthService.findOrCreateFromOAuth(profile);
          const token = studentAuthService.generateToken(user);
          return done(null, { user, token });
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

if (hasGitHubOAuth) {
  passport.use(
    'github',
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: `${BASE_URL}/api/auth/github/callback`,
        scope: ['user:email'],
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || `${profile.username}@github.oauth`;
          const stateToken = req.query?.state || '';
          const hasBypass = verifyBypassToken(stateToken, email);

          if (
            !hasBypass &&
            DOMAIN_RESTRICTION &&
            !email.toLowerCase().endsWith(`@${DOMAIN_RESTRICTION.toLowerCase()}`)
          ) {
            return done(null, false, { message: `Only @${DOMAIN_RESTRICTION} emails allowed` });
          }
          const user = await studentAuthService.findOrCreateFromOAuth(profile);
          const token = studentAuthService.generateToken(user);
          return done(null, { user, token });
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}
if (hasGitHubOAuth) {
  passport.use(
    'github-portfolio',
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: `${BASE_URL}/api/auth/github/portfolio/callback`,
        scope: ['read:user'],
      },
      (accessToken, refreshToken, profile, done) => {
        // Lightweight strategy for linking a GitHub username to a
        // portfolio. Does not create or touch student accounts.
        return done(null, { githubUsername: profile.username });
      }
    )
  );
}
passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((data, done) => done(null, data));

export default passport;
