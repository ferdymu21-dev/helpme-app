begin;


-- =========================================================
-- HELPME JASA
-- PROVIDER SERVICE LISTING DETAIL
--
-- Purpose:
--   Retrieve one Service Listing owned by the currently
--   authenticated Provider.
--
-- Security:
--   - no raw table grant is required
--   - Provider identity comes only from auth.uid()
--   - no caller-supplied provider_id
--   - authenticated role only
--
-- This RPC intentionally returns listings in any lifecycle
-- state owned by the Provider so edit/manage flows can load
-- DRAFT, PAYMENT_PENDING, ACTIVE, PAUSED, EXPIRED, BLOCKED,
-- or ARCHIVED records as appropriate.
-- =========================================================

create or replace function
  public.get_my_service_listing_detail(
    p_listing_id uuid
  )
returns table (
  id uuid,
  title text,
  category text,
  description text,
  deliverables text,
  customer_preparation text,
  price_from bigint,
  is_negotiable boolean,
  service_mode text,
  location_name text,
  status text,
  published_at timestamptz,
  activated_at timestamptz,
  expires_at timestamptz,
  paused_at timestamptz,
  blocked_at timestamptz,
  blocked_reason text,
  blocked_from_status text,
  archived_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  cover_storage_path text
)
language sql
stable
security definer
set search_path to ''
as $function$
  select
    sl.id,
    sl.title,
    sl.category,
    sl.description,
    sl.deliverables,
    sl.customer_preparation,
    sl.price_from,
    sl.is_negotiable,
    sl.service_mode,
    sl.location_name,
    sl.status,
    sl.published_at,
    sl.activated_at,
    sl.expires_at,
    sl.paused_at,
    sl.blocked_at,
    sl.blocked_reason,
    sl.blocked_from_status,
    sl.archived_at,
    sl.created_at,
    sl.updated_at,

    cover.storage_path
      as cover_storage_path

  from public.service_listings as sl

  left join lateral (
    select
      sli.storage_path
    from public.service_listing_images as sli
    where
      sli.service_listing_id =
        sl.id
      and sli.kind = 'COVER'
    limit 1
  ) as cover
    on true

  where
    sl.id =
      p_listing_id

    and sl.provider_id =
      auth.uid();
$function$;


revoke all
on function
  public.get_my_service_listing_detail(
    uuid
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.get_my_service_listing_detail(
    uuid
  )
to authenticated;


commit;