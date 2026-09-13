begin;


-- =========================================================
-- PUBLIC SERVICE LISTING MEDIA
--
-- Safe public projection for media belonging to a currently
-- discoverable Service Listing.
--
-- The underlying service_listing_images table remains
-- inaccessible through direct browser reads.
--
-- Returned projection intentionally matches
-- get_my_service_listing_media() so the existing runtime
-- parser and mapper can be reused by the application layer.
-- =========================================================

create or replace function
  public.get_public_service_listing_media(
    p_listing_id uuid
  )
returns table (
  id uuid,
  service_listing_id uuid,
  storage_path text,
  kind text,
  sort_order integer,
  created_at timestamptz
)
language sql
stable
security definer
set search_path to ''
as $function$
  select
    sli.id,
    sli.service_listing_id,
    sli.storage_path,
    sli.kind,
    sli.sort_order,
    sli.created_at

  from public.service_listing_images as sli

  join public.service_listings as sl
    on sl.id =
      sli.service_listing_id

  join public.users as u
    on u.id =
      sl.provider_id

  where
    sli.service_listing_id =
      p_listing_id

    and sli.kind in (
      'COVER',
      'PORTFOLIO'
    )

    and sl.status =
      'ACTIVE'

    and sl.expires_at >
      statement_timestamp()

    and not coalesce(
      u.is_banned,
      false
    )

    and not (
      coalesce(
        u.is_suspended,
        false
      )
      and (
        u.suspended_until is null
        or u.suspended_until >
          statement_timestamp()
      )
    )

  order by
    case
      when sli.kind = 'COVER'
        then 0
      else 1
    end,
    sli.sort_order,
    sli.created_at,
    sli.id;
$function$;


revoke all
on function
  public.get_public_service_listing_media(
    uuid
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.get_public_service_listing_media(
    uuid
  )
to anon, authenticated, service_role;


commit;