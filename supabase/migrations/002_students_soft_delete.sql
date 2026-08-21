-- ============================================================================
-- Migration 002: soft-delete for students
-- Run this ONCE in your existing Supabase project (SQL Editor → New query).
-- Fresh installs already get this via the updated supabase/schema.sql.
-- ============================================================================

alter table public.students
  add column if not exists deleted_at timestamptz;

-- Fast lookup of active (non-deleted) students per tutor.
create index if not exists students_active_idx
  on public.students (tutor_id)
  where deleted_at is null;
