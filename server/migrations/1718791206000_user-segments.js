export const up = (pgm) => {
  pgm.addColumn('student_users', {
    activity_level: { type: 'varchar(50)', default: 'active' },
  });

  pgm.createTable('user_segments', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    criteria: { type: 'jsonb', notNull: true, default: '{}' },
    auto_update: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('student_users', 'activity_level');
};

export const down = (pgm) => {
  pgm.dropTable('user_segments');
  pgm.dropColumn('student_users', 'activity_level');
};
