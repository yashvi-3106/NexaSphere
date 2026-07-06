/**
 * SQL safety utilities — validates identifiers (table/column names) against
 * an allowlist to prevent SQL injection via template-literal interpolation.
 *
 * PostgreSQL parameterized queries ($1, $2) only protect *values*, not
 * *identifiers*. These helpers must be used whenever a table or column name
 * is interpolated into a query string.
 */

/**
 * Allowed table names for dynamic SQL queries.
 * Add new tables here when they are created via migrations.
 */
const ALLOWED_TABLES = new Set([
  'admin_sessions',
  'admin_security_accounts',
  'users',
  'events',
  'notifications',
  'push_subscriptions',
  'notification_preferences',
  'moderation_flags',
  'moderation_user_warnings',
  'moderation_notes',
  'moderation_appeals',
  'forum_threads',
  'forum_replies',
  'resources',
  'stream_chats',
  'streams',
  'registrations',
  'waitlist',
  'portfolios',
  'portfolio_analytics',
  'certificates',
  'event_certificates',
  'custom_roles',
  'user_roles',
  'rbac_audit_logs',
  'student_users',
  'email_campaigns',
  'user_segments',
  'custom_events',
  'analytics_events',
  'webhook_subscriptions',
  'backup_metadata',
  'content_store',
  'activity_timeline',
  'announcements',
  'scheduled_jobs',
  'pricing_tiers',
  'subscriptions',
  'invoices',
  'payments',
  'sponsorships',
  'learning_paths',
  'learning_path_steps',
  'user_learning_progress',
  'forum_thread_tags',
  'event_feedback',
  'event_checkins',
  'leaderboard',
  'gamification_points',
  'gamification_badges',
  'user_badges',
  'compliance_audit_logs',
  'gdpr_requests',
  'pci_audit_logs',
  'wcag_issues',
  'outbox_events',
  'event_stream_outbox',
]);

/**
 * Allowed column name pattern — alphanumeric + underscores only.
 * This is a secondary defense; the primary defense is the table allowlist.
 */
const VALID_IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Validates that a table name is in the allowlist.
 * Throws an error if the table name is not allowed.
 *
 * @param {string} table - The table name to validate
 * @returns {string} The validated table name (quoted for SQL)
 * @throws {Error} If the table name is not in the allowlist
 */
export function validateTableName(table) {
  if (typeof table !== 'string' || !table) {
    throw new Error('Table name must be a non-empty string');
  }
  if (!ALLOWED_TABLES.has(table)) {
    throw new Error(`SQL injection blocked: table "${table}" is not in the allowlist`);
  }
  return `"${table}"`;
}

/**
 * Validates that a column name matches the safe identifier pattern.
 * Throws an error if the column name contains invalid characters.
 *
 * @param {string} column - The column name to validate
 * @returns {string} The validated column name (quoted for SQL)
 * @throws {Error} If the column name contains invalid characters
 */
export function validateColumnName(column) {
  if (typeof column !== 'string' || !column) {
    throw new Error('Column name must be a non-empty string');
  }
  if (!VALID_IDENTIFIER_PATTERN.test(column)) {
    throw new Error(`SQL injection blocked: column "${column}" contains invalid characters`);
  }
  return `"${column}"`;
}

/**
 * Validates that an identifier (table or column) is safe for SQL interpolation.
 * Uses a permissive regex for backward compatibility with existing code.
 *
 * @param {string} name - The identifier to validate
 * @returns {string} The validated identifier
 * @throws {Error} If the identifier contains invalid characters
 */
export function validateIdentifier(name) {
  if (typeof name !== 'string' || !name) {
    throw new Error('Identifier must be a non-empty string');
  }
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(`SQL injection blocked: identifier "${name}" contains invalid characters`);
  }
  return name;
}
