/**
 * 1804_create-system-incidents.js
 *
 * Creates the `system_incidents` table for persisting read-only mode
 * events, infrastructure warnings, and other system-level incident records.
 *
 * Tables:
 *   - system_incidents: persistent log of system incidents with severity,
 *     message, optional details (JSONB), and who triggered the action.
 */

export async function up(pgm) {
  await pgm.createTable('system_incidents', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    incident_type: { type: 'varchar(50)', notNull: true },
    severity: {
      type: 'varchar(20)',
      notNull: true,
      default: 'info',
      check: "severity IN ('info', 'warning', 'error', 'critical')",
    },
    message: { type: 'text', notNull: true },
    details: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_by: { type: 'varchar(100)', notNull: true, default: 'system' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  await pgm.createIndex('system_incidents', 'system_incidents_severity_idx', {
    severity: 'varchar(20)',
  });
  await pgm.createIndex('system_incidents', 'system_incidents_incident_type_idx', {
    incident_type: 'varchar(50)',
  });
  await pgm.createIndex('system_incidents', 'system_incidents_created_at_idx', {
    created_at: 'timestamptz',
  });
}

export async function down(pgm) {
  await pgm.dropTable('system_incidents');
}
