import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveSocketCorsOrigin } from '../config/socket.js';

test('resolveSocketCorsOrigin uses explicit FRONTEND_URL', () => {
  const origin = resolveSocketCorsOrigin({
    FRONTEND_URL: 'https://nexasphere.example',
    NODE_ENV: 'production',
  });

  assert.equal(origin, 'https://nexasphere.example');
});

test('resolveSocketCorsOrigin keeps localhost fallback outside production', () => {
  const origin = resolveSocketCorsOrigin({ NODE_ENV: 'development' });

  assert.equal(origin, 'http://localhost:5173');
});

test('resolveSocketCorsOrigin rejects missing FRONTEND_URL in production', () => {
  assert.throws(
    () => resolveSocketCorsOrigin({ NODE_ENV: 'production' }),
    /FRONTEND_URL must be set in production/
  );
});
