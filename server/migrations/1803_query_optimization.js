exports.up = (pgm) => {
  // Add indexes to events for frequent queries (status, created_at, date_text)
  pgm.createIndex('events', 'status', { ifNotExists: true });
  pgm.createIndex('events', 'created_at', { ifNotExists: true });
  pgm.createIndex('events', 'date_text', { ifNotExists: true });

  // Add index to event_registrations for email lookup (since we often query by email and event_id)
  pgm.createIndex('event_registrations', 'email', { ifNotExists: true });
  pgm.createIndex('event_registrations', 'created_at', { ifNotExists: true });

  // Add indexes for form_submissions
  pgm.createIndex('form_submissions', 'form_type', { ifNotExists: true });
  pgm.createIndex('form_submissions', 'created_at', { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropIndex('events', 'status', { ifExists: true });
  pgm.dropIndex('events', 'created_at', { ifExists: true });
  pgm.dropIndex('events', 'date_text', { ifExists: true });

  pgm.dropIndex('event_registrations', 'email', { ifExists: true });
  pgm.dropIndex('event_registrations', 'created_at', { ifExists: true });

  pgm.dropIndex('form_submissions', 'form_type', { ifExists: true });
  pgm.dropIndex('form_submissions', 'created_at', { ifExists: true });
};
