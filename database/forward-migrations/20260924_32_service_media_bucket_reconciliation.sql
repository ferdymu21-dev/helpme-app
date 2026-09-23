begin;

-- =========================================================
-- M32 - Production service media bucket reconciliation
--
-- Root cause:
--   Production reconciliation M30/M31 covered the public
--   schema but did not restore the Storage bucket defined
--   originally by M8.
--
-- Contract:
--   Match the canonical M8 service-media bucket exactly.
--
-- Scope:
--   - storage.buckets only
--   - no storage.objects policy changes
--   - no public schema changes
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'service-media',
  'service-media',
  true,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]::text[]
)
on conflict (id)
do update
set
  name =
    excluded.name,

  public =
    excluded.public,

  file_size_limit =
    excluded.file_size_limit,

  allowed_mime_types =
    excluded.allowed_mime_types;

commit;