-- Migration: Create core_team_applications table
-- Issue: #1510 - Core Team Approval Workflow

CREATE TABLE IF NOT EXISTS core_team_applications (
  id            SERIAL PRIMARY KEY,
  student_id    TEXT        NOT NULL,
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  year          TEXT        NOT NULL,
  branch        TEXT        NOT NULL,
  section       CHAR(1)     NOT NULL,
  whatsapp      CHAR(10)    NOT NULL,
  reason        TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by   TEXT,
  review_note   TEXT,
  applied_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cta_student_id ON core_team_applications (student_id);
CREATE INDEX IF NOT EXISTS idx_cta_status     ON core_team_applications (status);
