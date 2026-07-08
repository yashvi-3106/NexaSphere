const request = require('supertest');
const app = require('../../app');

describe('Team Applications API', () => {
  test('GET /api/applications/pending – returns pending', async () => {
    const res = await request(app)
      .get('/api/applications/pending')
      .set('Authorization', 'Bearer admin-token');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
