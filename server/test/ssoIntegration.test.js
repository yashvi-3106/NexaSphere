import './setupEnv.js';
// Set variables immediately before any other code imports
process.env.GOOGLE_CLIENT_ID = 'test-google-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
process.env.GITHUB_CLIENT_ID = 'test-github-id';
process.env.GITHUB_CLIENT_SECRET = 'test-github-secret';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.OAUTH_DOMAIN_RESTRICTION = 'glbitm.ac.in';

import { describe, test, before } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import passport from 'passport';

describe('SSO Integration and Invite Bypass — Unit Tests', () => {
  const jwtSecret = 'test-jwt-secret';

  before(async () => {
    // Dynamic import to guarantee environment variables are set before strategy registration
    await import('../config/studentOAuth.js');
  });

  test('Generates valid JWT invite token and bypasses domain check', async (t) => {
    // Get the Google strategy
    const googleStrategy = passport._strategies.google;
    assert.ok(googleStrategy, 'Google Strategy should be registered');

    // Case 1: Attempt to verify with a non-matching domain and no bypass token
    let messageResult = null;
    let userResult = null;

    const verifyCallback1 = googleStrategy._verify;
    await verifyCallback1(
      { query: {} }, // req mockup without state
      'access-token',
      'refresh-token',
      {
        provider: 'google',
        id: '12345',
        emails: [{ value: 'external.user@gmail.com' }],
        displayName: 'Guest Speaker',
      },
      (err, user, info) => {
        if (info) messageResult = info.message;
        userResult = user;
      }
    );

    assert.equal(userResult, false);
    assert.match(messageResult, /Only @glbitm.ac.in emails allowed/i);

    // Case 2: Attempt to verify with a non-matching domain WITH a valid bypass token
    const token = jwt.sign({ email: 'external.user@gmail.com', bypassSso: true }, jwtSecret);

    // Mock studentAuthService.findOrCreateFromOAuth and studentAuthService.generateToken
    const { studentAuthService } = await import('../services/studentAuthService.js');
    t.mock.method(studentAuthService, 'findOrCreateFromOAuth', async (profile) => {
      return { id: 'user-guest', email: profile.emails[0].value };
    });
    t.mock.method(studentAuthService, 'generateToken', () => 'dummy-jwt-session-token');

    let successUser = null;
    await verifyCallback1(
      { query: { state: token } }, // req mockup with token in state
      'access-token',
      'refresh-token',
      {
        provider: 'google',
        id: '12345',
        emails: [{ value: 'external.user@gmail.com' }],
        displayName: 'Guest Speaker',
      },
      (err, data) => {
        successUser = data;
      }
    );

    assert.ok(successUser);
    assert.equal(successUser.user.id, 'user-guest');
    assert.equal(successUser.token, 'dummy-jwt-session-token');
  });

  test('Rejects matching domain callback if the token is tampered/invalid', async (t) => {
    const googleStrategy = passport._strategies.google;
    const verifyCallback = googleStrategy._verify;

    const invalidToken = jwt.sign(
      { email: 'external.user@gmail.com', bypassSso: false }, // bypassSso is false
      jwtSecret
    );

    let userResult = null;
    await verifyCallback(
      { query: { state: invalidToken } },
      'access-token',
      'refresh-token',
      {
        provider: 'google',
        id: '12345',
        emails: [{ value: 'external.user@gmail.com' }],
        displayName: 'Guest Speaker',
      },
      (err, user, info) => {
        userResult = user;
      }
    );

    assert.equal(userResult, false);
  });
});
