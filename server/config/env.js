import { z } from 'zod';
import { secretsManager } from '../services/secretsManager.js';

/**
 * Validates critical infrastructure environment variables during boot sequence.
 * Restores missing closing brace to resolve syntax execution block cascading failures.
 */
function validateEnvironment() {
  const requiredVars = ['NODE_ENV', 'MONGO_URI', 'JWT_SECRET', 'PORT'];

  const missingVars = [];

  requiredVars.forEach((variable) => {
    if (!process.env[variable]) {
      missingVars.push(variable);
    }
  });

  if (missingVars.length > 0) {
    logger.error('Incomplete environment profiles. Server initializing fallback block closure.', {
      missingParameters: missingVars,
      action: 'HALT_BOOT_SEQUENCE',
    });
    throw new Error(`Critical infrastructure variables missing: ${missingVars.join(', ')}`);
  }

  logger.info(
    'Environment variables verification check succeeded. Application configurations loaded.'
  );
} // <-- Restored missing structural closing brace

module.exports = {
  validateEnvironment,
};
