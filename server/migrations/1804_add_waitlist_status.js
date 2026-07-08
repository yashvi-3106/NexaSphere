export const up = (pgm) => {
  pgm.addColumn('event_registrations', {
    waitlist_status: {
      type: 'varchar(20)',
      notNull: false,
    },
  });
};

export const down = (pgm) => {
  pgm.dropColumn('event_registrations', 'waitlist_status');
};
