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

  if (process.env.NODE_ENV === 'test') {
    // Populate dummy variables for test context
    if (!process.env.CORS_ORIGIN) process.env.CORS_ORIGIN = 'http://localhost:3000';
    if (!process.env.ADMIN_EVENT_PASSWORD)
      process.env.ADMIN_EVENT_PASSWORD = 'StrongEventPassword123!';
    if (!process.env.JWT_SECRET)
      process.env.JWT_SECRET =
        'secret_super_long_secret_key_that_is_safe_and_long_enough_for_256bit';
    if (!process.env.ENCRYPTION_KEY)
      process.env.ENCRYPTION_KEY = '12345678901234567890123456789012';
    if (!process.env.SUPABASE_URL) process.env.SUPABASE_URL = 'http://localhost';
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) process.env.SUPABASE_SERVICE_ROLE_KEY = 'mockkey';
    if (!process.env.SESSION_SECRET) process.env.SESSION_SECRET = 'StrongSessionPassword123!@#';
  }

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}
