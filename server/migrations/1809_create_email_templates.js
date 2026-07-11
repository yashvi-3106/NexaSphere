export const up = (pgm) => {
  pgm.createTable('email_templates', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(100)', notNull: true, unique: true },
    subject: { type: 'varchar(255)', notNull: true },
    body: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
};

export const down = (pgm) => {
  pgm.dropTable('email_templates');
};
