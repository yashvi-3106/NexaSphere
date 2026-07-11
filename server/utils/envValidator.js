export function validateEnvironment() {
  if (process.env.NODE_ENV === 'test') {
    process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
    process.env.ADMIN_EVENT_PASSWORD =
      process.env.ADMIN_EVENT_PASSWORD || 'StrongEventPassword123!';
    process.env.JWT_SECRET =
      process.env.JWT_SECRET ||
      'secret_super_long_secret_key_that_is_safe_and_long_enough_for_256bit';
    process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a'.repeat(32);
    process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'StrongSessionSecret123!';
    return;
  }

  const required = ['CORS_ORIGIN', 'ADMIN_EVENT_PASSWORD', 'JWT_SECRET', 'ENCRYPTION_KEY'];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}
