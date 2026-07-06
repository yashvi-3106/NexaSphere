export const up = (pgm) => {
  pgm.createTable('faqs', {
    id: { type: 'serial', primaryKey: true },
    question: { type: 'text', notNull: true },
    answer: { type: 'text', notNull: true },
    category: { type: 'varchar(100)', notNull: true, default: 'General' },
    views: { type: 'integer', notNull: true, default: 0 },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('faqs', 'category');
};

export const down = (pgm) => {
  pgm.dropTable('faqs');
};
