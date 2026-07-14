import request from 'supertest';
import { app } from '../../index.js';
import { followsRepository } from '../../repositories/followsRepository.js';
import { studentUsersRepository } from '../../repositories/studentUsersRepository.js';

// Mock authentication
const mockStudentUser = {
  sub: 1,
  email: 'user1@example.com',
  full_name: 'User 1',
};

const mockAuthHeader = (userId = 1) => ({
  Authorization: `Bearer fake-token-${userId}`,
});

describe('Follows API Integration Tests', () => {
  let testUserId1, testUserId2, testUserId3;

  beforeAll(async () => {
    // Create test users
    const user1 = await studentUsersRepository.upsertFromOAuth({
      provider: 'test',
      providerId: 'test-1',
      email: 'testuser1@example.com',
      fullName: 'Test User 1',
    });
    testUserId1 = user1.id;

    const user2 = await studentUsersRepository.upsertFromOAuth({
      provider: 'test',
      providerId: 'test-2',
      email: 'testuser2@example.com',
      fullName: 'Test User 2',
    });
    testUserId2 = user2.id;

    const user3 = await studentUsersRepository.upsertFromOAuth({
      provider: 'test',
      providerId: 'test-3',
      email: 'testuser3@example.com',
      fullName: 'Test User 3',
    });
    testUserId3 = user3.id;
  });

  describe('POST /api/student/follows/:followingId', () => {
    it('should follow a user successfully', async () => {
      const response = await request(app)
        .post(`/api/student/follows/${testUserId2}`)
        .set(mockAuthHeader(testUserId1))
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('follow');
      expect(response.body.follow).toHaveProperty('follower_id', testUserId1);
      expect(response.body.follow).toHaveProperty('following_id', testUserId2);
    });

    it('should prevent following yourself', async () => {
      const response = await request(app)
        .post(`/api/student/follows/${testUserId1}`)
        .set(mockAuthHeader(testUserId1))
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('cannot follow themselves');
    });

    it('should prevent duplicate follows', async () => {
      // First follow
      await request(app)
        .post(`/api/student/follows/${testUserId3}`)
        .set(mockAuthHeader(testUserId1));

      // Second follow (should fail)
      const response = await request(app)
        .post(`/api/student/follows/${testUserId3}`)
        .set(mockAuthHeader(testUserId1))
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Already following');
    });

    it('should require authentication', async () => {
      const response = await request(app).post(`/api/student/follows/${testUserId2}`).expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/student/follows/:followingId', () => {
    it('should unfollow a user successfully', async () => {
      // First follow
      await followsRepository.follow(testUserId1, testUserId2);

      // Then unfollow
      const response = await request(app)
        .delete(`/api/student/follows/${testUserId2}`)
        .set(mockAuthHeader(testUserId1))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 404 if not following', async () => {
      const response = await request(app)
        .delete(`/api/student/follows/${testUserId3}`)
        .set(mockAuthHeader(testUserId1))
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/student/follows/status/:followingId', () => {
    it('should return follow status', async () => {
      // Follow user
      await followsRepository.follow(testUserId1, testUserId2);

      const response = await request(app)
        .get(`/api/student/follows/status/${testUserId2}`)
        .set(mockAuthHeader(testUserId1))
        .expect(200);

      expect(response.body).toHaveProperty('isFollowing', true);
    });

    it('should return false if not following', async () => {
      const response = await request(app)
        .get(`/api/student/follows/status/${testUserId3}`)
        .set(mockAuthHeader(testUserId1))
        .expect(200);

      expect(response.body).toHaveProperty('isFollowing', false);
    });
  });

  describe('GET /api/student/users/:userId/followers', () => {
    it('should return user followers', async () => {
      // Create follow relationship
      await followsRepository.follow(testUserId2, testUserId1);

      const response = await request(app)
        .get(`/api/student/users/${testUserId1}/followers`)
        .expect(200);

      expect(response.body).toHaveProperty('followers');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.followers)).toBe(true);
    });

    it('should return empty array if no followers', async () => {
      const response = await request(app)
        .get(`/api/student/users/${testUserId3}/followers`)
        .expect(200);

      expect(response.body.followers).toHaveLength(0);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe('GET /api/student/users/:userId/following', () => {
    it('should return users that user is following', async () => {
      const response = await request(app)
        .get(`/api/student/users/${testUserId1}/following`)
        .expect(200);

      expect(response.body).toHaveProperty('following');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.following)).toBe(true);
    });
  });

  describe('GET /api/student/users/:userId/follow-counts', () => {
    it('should return follow counts', async () => {
      const response = await request(app)
        .get(`/api/student/users/${testUserId1}/follow-counts`)
        .expect(200);

      expect(response.body).toHaveProperty('followersCount');
      expect(response.body).toHaveProperty('followingCount');
      expect(typeof response.body.followersCount).toBe('number');
      expect(typeof response.body.followingCount).toBe('number');
    });
  });

  describe('GET /api/student/me/following', () => {
    it('should return current user following list', async () => {
      const response = await request(app)
        .get('/api/student/me/following')
        .set(mockAuthHeader(testUserId1))
        .expect(200);

      expect(response.body).toHaveProperty('following');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/student/me/following').expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/student/me/followers', () => {
    it('should return current user followers list', async () => {
      const response = await request(app)
        .get('/api/student/me/followers')
        .set(mockAuthHeader(testUserId1))
        .expect(200);

      expect(response.body).toHaveProperty('followers');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('GET /api/student/me/follow-counts', () => {
    it('should return current user follow counts', async () => {
      const response = await request(app)
        .get('/api/student/me/follow-counts')
        .set(mockAuthHeader(testUserId1))
        .expect(200);

      expect(response.body).toHaveProperty('followersCount');
      expect(response.body).toHaveProperty('followingCount');
    });
  });

  describe('GET /api/student/activity-feed/followed', () => {
    it('should return activity feed from followed users', async () => {
      const response = await request(app)
        .get('/api/student/activity-feed/followed')
        .set(mockAuthHeader(testUserId1))
        .expect(200);

      expect(response.body).toHaveProperty('activities');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.activities)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/student/activity-feed/followed').expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
