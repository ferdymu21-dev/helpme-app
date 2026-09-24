begin;

-- =========================================================
-- M35 - Normalize legacy Service Listing categories
--
-- Canonical taxonomy source:
-- src/features/service-listings/constants/service-categories.ts
--
-- This migration only normalizes legacy category values that
-- are already explicitly mapped by the application taxonomy.
--
-- No unknown/free-text categories are modified.
-- =========================================================

update public.service_listings
set category =
  case category
    when 'belanja'
      then 'Belanja, Titip & Antre'

    when 'antri'
      then 'Belanja, Titip & Antre'

    when 'Antar'
      then 'Antar, Angkut & Pindahan'

    when 'Temani'
      then 'Pendampingan & Bantuan Harian'

    else category
  end
where category in (
  'belanja',
  'antri',
  'Antar',
  'Temani'
);

commit;