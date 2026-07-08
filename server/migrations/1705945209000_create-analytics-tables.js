export const up = async (pgm) => {
  pgm.createTable('analytics_sessions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'integer', notNull: false, references: '"users"(id)', onDelete: 'SET NULL' },
    device: { type: 'varchar(255)' },
    browser: { type: 'varchar(255)' },
    os: { type: 'varchar(255)' },
    start_time: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    end_time: { type: 'timestamp' },
  });

  pgm.createTable('analytics_events', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    session_id: {
      type: 'uuid',
      notNull: true,
      references: 'analytics_sessions(id)',
      onDelete: 'CASCADE',
    },
    user_id: { type: 'integer', notNull: false, references: '"users"(id)', onDelete: 'SET NULL' },
    event_type: { type: 'varchar(50)', notNull: true },
    url: { type: 'text' },
    element_selector: { type: 'text' },
    metadata: { type: 'jsonb' },
    timestamp: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('analytics_recordings', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    session_id: {
      type: 'uuid',
      notNull: true,
      references: 'analytics_sessions(id)',
      onDelete: 'CASCADE',
    },
    events_json: { type: 'jsonb', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('analytics_segments', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(255)', notNull: true, unique: true },
    description: { type: 'text' },
    rules_json: { type: 'jsonb', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createTable('analytics_user_segments', {
    user_id: { type: 'integer', notNull: true, references: '"users"(id)', onDelete: 'CASCADE' },
    segment_id: {
      type: 'uuid',
      notNull: true,
      references: 'analytics_segments(id)',
      onDelete: 'CASCADE',
    },
    joined_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('analytics_user_segments', 'pk_analytics_user_segments', {
    primaryKey: ['user_id', 'segment_id'],
  });

  pgm.createIndex('analytics_events', 'session_id');
  pgm.createIndex('analytics_events', 'user_id');
  pgm.createIndex('analytics_events', 'event_type');
  pgm.createIndex('analytics_events', 'timestamp');
  pgm.createIndex('analytics_recordings', 'session_id');
};

export const down = async (pgm) => {
  pgm.dropTable('analytics_user_segments');
  pgm.dropTable('analytics_segments');
  pgm.dropTable('analytics_recordings');
  pgm.dropTable('analytics_events');
  pgm.dropTable('analytics_sessions');
};
