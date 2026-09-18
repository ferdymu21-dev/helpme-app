begin;

-- =========================================================
-- M27 — SERVICE LISTING DASHBOARD READ
--
-- Provider-owned dashboard projections only.
--
-- Goals:
-- - preserve the existing M4 read RPC unchanged
-- - allow provider-owned status filtering
-- - expose authoritative lifecycle counts for Jasa Saya
-- - keep raw table SELECT unavailable to authenticated users
--
-- Actor identity continues to come from auth.uid(), matching
-- the existing get_my_service_listings() read contract.
-- =========================================================


-- =========================================================
-- 1. PROVIDER — OWN SERVICE LISTINGS BY STATUS
-- =========================================================

create or replace function
  public.get_my_service_listings_by_status(
    p_page integer default 1,
    p_page_size integer default 20,
    p_status text default null
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
  cover_storage_path text,
  total_count bigint
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
      as cover_storage_path,

    count(*) over()
      as total_count

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
    sl.provider_id =
      auth.uid()

    and (
      p_status is null
      or sl.status = p_status
    )

  order by
    sl.created_at desc,
    sl.id desc

  limit
    greatest(
      1,
      least(
        coalesce(
          p_page_size,
          20
        ),
        50
      )
    )

  offset (
    (
      greatest(
        coalesce(
          p_page,
          1
        ),
        1
      )::bigint - 1
    )
    *
    greatest(
      1,
      least(
        coalesce(
          p_page_size,
          20
        ),
        50
      )
    )::bigint
  );
$function$;


revoke all
on function
  public.get_my_service_listings_by_status(
    integer,
    integer,
    text
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.get_my_service_listings_by_status(
    integer,
    integer,
    text
  )
to authenticated;


-- =========================================================
-- 2. PROVIDER — OWN SERVICE LISTING STATUS COUNTS
--
-- This projection intentionally ignores the current UI
-- filter. Counts always describe all listings owned by the
-- authenticated Provider.
-- =========================================================

create or replace function
  public.get_my_service_listing_status_counts()
returns table (
  total_count bigint,
  active_count bigint,
  draft_count bigint,
  payment_pending_count bigint,
  paused_count bigint,
  expired_count bigint,
  blocked_count bigint,
  archived_count bigint
)
language sql
stable
security definer
set search_path to ''
as $function$
  select
    count(*)::bigint
      as total_count,

    count(*) filter (
      where sl.status = 'ACTIVE'
    )::bigint
      as active_count,

    count(*) filter (
      where sl.status = 'DRAFT'
    )::bigint
      as draft_count,

    count(*) filter (
      where sl.status = 'PAYMENT_PENDING'
    )::bigint
      as payment_pending_count,

    count(*) filter (
      where sl.status = 'PAUSED'
    )::bigint
      as paused_count,

    count(*) filter (
      where sl.status = 'EXPIRED'
    )::bigint
      as expired_count,

    count(*) filter (
      where sl.status = 'BLOCKED'
    )::bigint
      as blocked_count,

    count(*) filter (
      where sl.status = 'ARCHIVED'
    )::bigint
      as archived_count

  from public.service_listings as sl

  where
    sl.provider_id =
      auth.uid();
$function$;


revoke all
on function
  public.get_my_service_listing_status_counts()
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.get_my_service_listing_status_counts()
to authenticated;


commit;
