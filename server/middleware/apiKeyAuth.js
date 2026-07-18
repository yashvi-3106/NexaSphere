import { apiKeysRepository } from '../repositories/apiKeysRepository.js';

export const apiKeyAuth = async (req, res, next) => {
  let key = req.headers['x-api-key'];

  if (!key && req.headers['authorization']) {
    const parts = req.headers['authorization'].split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      key = parts[1];
    }
  }

  if (!key) {
    return res.status(401).json({ error: 'Unauthorized: Missing API Key' });
  }

  try {
    const keyRecord = await apiKeysRepository.validateKey(key);
    if (!keyRecord) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired API Key' });
    }

    req.apiKeyRecord = keyRecord;
    next();
  } catch (err) {
    console.error('[API Key Auth] Validation error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
