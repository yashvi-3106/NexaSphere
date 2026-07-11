import { test, expect } from '@playwright/test';

test('GET /api/auth/profile/advanced returns 401 unauthenticated', async ({ request }) => {
  const res = await request.get('/api/auth/profile/advanced');
  expect(res.status()).toBe(401);
});
