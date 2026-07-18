// @ts-nocheck
import { test, expect } from '@playwright/test';

test('GET /api/auth/profile/advanced returns JSON (unauthenticated => 401)', async ({
  request,
}) => {
  const res = await request.get('/api/auth/profile/advanced');
  expect(res.status()).toBe(401);
});
