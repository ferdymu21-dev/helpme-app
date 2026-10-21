-- M39 - HelpMe Siaga organization media path columns
-- Production release migration candidate; tested against disposable PostgreSQL.
-- Execute only after separate explicit production-release approval.
-- Migration 37 is explicitly excluded and must remain unchanged.

BEGIN;

ALTER TABLE public.emergency_organizations
  ADD COLUMN IF NOT EXISTS profile_image_path text,
  ADD COLUMN IF NOT EXISTS cover_image_path text;

NOTIFY pgrst, 'reload schema';

COMMIT;
