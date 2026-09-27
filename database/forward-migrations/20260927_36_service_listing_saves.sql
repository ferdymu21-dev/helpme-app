begin;

-- =========================================================
-- M36 - Saved Service Listings
--
-- Account-based saved services for authenticated users.
--
-- Security:
--   - no direct anon/authenticated table access
--   - writes and reads go through SECURITY DEFINER RPCs
--   - users can only manage their own saved rows
--
-- Visibility:
--   - a saved relation is preserved when a listing becomes
--     PAUSED/EXPIRED
--   - get_my_saved_service_listings() only returns listings
--     that satisfy the same public visibility rules as
--     get_public_service_listings()
-- =========================================================

create table public.service_listing_saves (
  user_id uuid not null
    references public.users(id)
    on delete cascade,

  service_listing_id uuid not null
    references public.service_listings(id)
    on delete cascade,

  created_at timestamptz not null
    default statement_timestamp(),

  primary key (
    user_id,
    service_listing_id
  )
);

create index service_listing_saves_user_created_idx
  on public.service_listing_saves (
    user_id,
    created_at desc,
    service_listing_id
  );

create index service_listing_saves_listing_idx
  on public.service_listing_saves (
    service_listing_id
  );

alter table public.service_listing_saves
  enable row level security;

revoke all
on table public.service_listing_saves
from public, anon, authenticated;

-- ---------------------------------------------------------
-- Save a currently-public Service Listing.
--
-- Idempotent:
-- repeated saves do not create duplicates.
-- ---------------------------------------------------------

create function public.save_service_listing(
  p_listing_id uuid
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_user_id uuid;
begin
  v_user_id :=
    auth.uid();

  if v_user_id is null then
    raise exception
      'Authentication required.'
      using errcode = '42501';
  end if;

  if not exists (
    select
      1
    from public.users as current_user_profile
    where
      current_user_profile.id =
        v_user_id
  ) then
    raise exception
      'User profile was not found.'
      using errcode = 'P0002';
  end if;

  if not exists (
    select
      1
    from public.service_listings as sl
    join public.users as provider
      on provider.id =
        sl.provider_id
    where
      sl.id =
        p_listing_id

      and sl.status =
        'ACTIVE'

      and sl.expires_at >
        statement_timestamp()

      and not coalesce(
        provider.is_banned,
        false
      )

      and not (
        coalesce(
          provider.is_suspended,
          false
        )
        and (
          provider.suspended_until is null
          or provider.suspended_until >
            statement_timestamp()
        )
      )
  ) then
    raise exception
      'Service listing is not available.'
      using errcode = 'P0002';
  end if;

  insert into public.service_listing_saves (
    user_id,
    service_listing_id
  )
  values (
    v_user_id,
    p_listing_id
  )
  on conflict (
    user_id,
    service_listing_id
  )
  do nothing;

  return p_listing_id;
end;
$function$;

revoke all
on function public.save_service_listing(uuid)
from public;

grant execute
on function public.save_service_listing(uuid)
to authenticated;

-- ---------------------------------------------------------
-- Remove a saved Service Listing.
--
-- Idempotent:
-- removing an already-unsaved listing remains successful.
-- ---------------------------------------------------------

create function public.unsave_service_listing(
  p_listing_id uuid
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_user_id uuid;
begin
  v_user_id :=
    auth.uid();

  if v_user_id is null then
    raise exception
      'Authentication required.'
      using errcode = '42501';
  end if;

  delete from public.service_listing_saves
  where
    user_id =
      v_user_id
    and service_listing_id =
      p_listing_id;

  return p_listing_id;
end;
$function$;

revoke all
on function public.unsave_service_listing(uuid)
from public;

grant execute
on function public.unsave_service_listing(uuid)
to authenticated;

-- ---------------------------------------------------------
-- Lightweight state query for bookmark buttons.
--
-- Intentionally includes saved relations whose listing is
-- temporarily not public. The relation remains preserved so
-- it becomes visible again if the listing returns ACTIVE.
-- ---------------------------------------------------------

create function public.get_my_saved_service_listing_ids()
returns table(
  service_listing_id uuid
)
language sql
stable
security definer
set search_path to ''
as $function$
  select
    saves.service_listing_id
  from public.service_listing_saves as saves
  where
    saves.user_id =
      auth.uid()
  order by
    saves.created_at desc,
    saves.service_listing_id desc;
$function$;

revoke all
on function public.get_my_saved_service_listing_ids()
from public;

grant execute
on function public.get_my_saved_service_listing_ids()
to authenticated;

-- ---------------------------------------------------------
-- Saved Service Listing cards.
--
-- Public visibility rules intentionally mirror
-- get_public_service_listings():
--
--   ACTIVE
--   non-expired
--   provider not banned
--   provider not actively suspended
--
-- Card projection intentionally matches
-- get_public_service_listings() so the existing
-- PublicServiceListingCard mapper can be reused.
-- ---------------------------------------------------------

create function public.get_my_saved_service_listings(
  p_page integer default 1,
  p_page_size integer default 20
)
returns table(
  id uuid,
  provider_id uuid,
  title text,
  category text,
  description text,
  price_from bigint,
  is_negotiable boolean,
  service_mode text,
  location_name text,
  created_at timestamptz,
  expires_at timestamptz,
  cover_storage_path text,
  provider_full_name text,
  provider_username text,
  provider_avatar_url text,
  provider_rating numeric,
  provider_total_reviews integer,
  provider_verification_status text,
  total_count bigint
)
language sql
stable
security definer
set search_path to ''
as $function$
  select
    sl.id,
    sl.provider_id,
    sl.title,
    sl.category,
    sl.description,
    sl.price_from,
    sl.is_negotiable,
    sl.service_mode,
    sl.location_name,
    sl.created_at,
    sl.expires_at,

    cover.storage_path
      as cover_storage_path,

    provider.full_name
      as provider_full_name,

    provider.username
      as provider_username,

    provider.avatar_url
      as provider_avatar_url,

    provider.rating
      as provider_rating,

    provider.total_reviews
      as provider_total_reviews,

    provider.verification_status
      as provider_verification_status,

    count(*) over()
      as total_count

  from public.service_listing_saves as saves

  join public.service_listings as sl
    on sl.id =
      saves.service_listing_id

  join public.users as provider
    on provider.id =
      sl.provider_id

  left join lateral (
    select
      sli.storage_path
    from public.service_listing_images as sli
    where
      sli.service_listing_id =
        sl.id
      and sli.kind =
        'COVER'
    limit 1
  ) as cover
    on true

  where
    saves.user_id =
      auth.uid()

    and sl.status =
      'ACTIVE'

    and sl.expires_at >
      statement_timestamp()

    and not coalesce(
      provider.is_banned,
      false
    )

    and not (
      coalesce(
        provider.is_suspended,
        false
      )
      and (
        provider.suspended_until is null
        or provider.suspended_until >
          statement_timestamp()
      )
    )

  order by
    saves.created_at desc,
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
on function public.get_my_saved_service_listings(
  integer,
  integer
)
from public;

grant execute
on function public.get_my_saved_service_listings(
  integer,
  integer
)
to authenticated;

commit;