import assert from 'node:assert/strict';
import test from 'node:test';

import { requirePermission } from '../middleware/rbacMiddleware.js';

test('requirePermission audit log includes the denied permission', async () => {
  const middleware = requirePermission('events:write');
  const req = {
    adminSession: {
      adminId: 'admin-1',
      metadata: { role: 'viewer', permissions: [] },
    },
    ip: '127.0.0.1',
  };
  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  await middleware(req, res, () => {});

  assert.equal(res.statusCode, 403);
  assert.deepEqual(req.requiredPermission, ['events:write']);
});
