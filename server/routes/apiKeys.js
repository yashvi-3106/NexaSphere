import { Router } from 'express';
import { apiKeysRepository } from '../repositories/apiKeysRepository.js';
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware.js';

const router = Router();

// Generate a new API key
router.post('/api/admin/apikeys', adminAuthMiddleware.requireAdmin, async (req, res) => {
  const { name, scopes, expiresAt } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const result = await apiKeysRepository.createKey({ name, scopes, expiresAt });
    return res.status(201).json(result);
  } catch (err) {
    console.error('[API Keys Route] Failed to create key:', err);
    return res.status(500).json({ error: 'Failed to generate API key' });
  }
});

// List all API keys
router.get('/api/admin/apikeys', adminAuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const keys = await apiKeysRepository.listKeys();
    return res.json({ keys });
  } catch (err) {
    console.error('[API Keys Route] Failed to list keys:', err);
    return res.status(500).json({ error: 'Failed to retrieve API keys' });
  }
});

// Revoke an API key
router.post('/api/admin/apikeys/:id/revoke', adminAuthMiddleware.requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await apiKeysRepository.revokeKey(parseInt(id, 10));
    if (!result) {
      return res.status(404).json({ error: 'API key not found' });
    }
    return res.json({ success: true, revoked: result });
  } catch (err) {
    console.error('[API Keys Route] Failed to revoke key:', err);
    return res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

export default router;
