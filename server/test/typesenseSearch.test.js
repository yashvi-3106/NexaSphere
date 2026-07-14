import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { searchController } from '../controllers/searchController.js';
import { isTypesenseEnabled } from '../config/typesense.js';

describe('Typesense Search Fallback and Controller Tests', () => {
  test('Gracefully falls back to local database search when Typesense is disabled', async () => {
    assert.equal(isTypesenseEnabled, false); // Typesense is disabled by default in tests

    const req = {
      query: { q: 'hackathon', type: 'all' },
    };

    let resData = null;
    const res = {
      json(data) {
        resData = data;
        return this;
      },
      status(code) {
        return this;
      },
    };

    await searchController.search(req, res);

    assert.ok(resData);
    assert.ok(Array.isArray(resData.results));
    assert.equal(resData.query, 'hackathon');
  });
});
