/* Migration: Create Follow Relationships
   Description: Creates follows table for user follow relationships
   Version: 1.0.0
   Date: 2026-07-02
*/

export const up = (pgm) => {
  // Create follows table
  pgm.createTable('follows', {
    id: { type: 'serial', primaryKey: true },
    follower_id: { type: 'integer', notNull: true },
    following_id: { type: 'integer', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Add unique constraint to prevent duplicate follows
  pgm.addConstraint('follows', 'unique_follow_relationship', {
    unique: ['follower_id', 'following_id'],
  });

  // Add check constraint to prevent users from following themselves
  pgm.addConstraint('follows', 'prevent_self_follow', {
    check: 'follower_id != following_id',
  });

  // Create indexes for efficient queries
  pgm.createIndex('follows', 'follower_id');
  pgm.createIndex('follows', 'following_id');
  pgm.createIndex('follows', ['follower_id', 'created_at'], {
    name: 'idx_follows_follower_created',
  });
  pgm.createIndex('follows', ['following_id', 'created_at'], {
    name: 'idx_follows_following_created',
  });

  // Add foreign key constraints to student_users
  pgm.addConstraint('follows', 'fk_follows_follower', {
    foreignKeys: {
      columns: 'follower_id',
      references: {
        table: 'student_users',
        column: 'id',
      },
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('follows', 'fk_follows_following', {
    foreignKeys: {
      columns: 'following_id',
      references: {
        table: 'student_users',
        column: 'id',
      },
      onDelete: 'CASCADE',
    },
  });
};

export const down = (pgm) => {
  pgm.dropTable('follows');
};
