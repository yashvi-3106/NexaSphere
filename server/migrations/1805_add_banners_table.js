exports.up = (pgm) => {
  pgm.createTable('banners', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    title: { type: 'text', notNull: true },
    image_url: { type: 'text', notNull: true },
    link_url: { type: 'text' },
    start_time: { type: 'timestamptz' },
    end_time: { type: 'timestamptz' },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('banners');
};
