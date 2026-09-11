begin;

set local lock_timeout = '10s';
set local statement_timeout = '60s';


-- =========================================================
-- HELPME JASA
-- M4A — SERVICE LISTING READ + DRAFT RPC
--
-- Self-authorizing authenticated mutations:
-- - actor comes from auth.uid()
-- - provider_id is never accepted from the caller
--
-- Public reads:
-- - explicit safe projection only
-- - ACTIVE + non-expired listings only
-- - banned / actively suspended providers excluded
--
-- Raw Service tables remain unavailable to browser roles.
-- =========================================================


-- =========================================================
-- 1. INTERNAL ACTOR GUARD
--
-- Not exposed to browser roles.
-- Used by trusted SECURITY DEFINER listing mutations.
-- =========================================================

create or replace function
  public.require_current_service_actor()
returns uuid
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  v_user_id uuid :=
    auth.uid();

  v_is_banned boolean;
  v_is_suspended boolean;
  v_suspended_until timestamptz;
begin
  if v_user_id is null then
    raise exception
      'Authenticated user identity is required.'
      using errcode = '42501';
  end if;

  select
    coalesce(u.is_banned, false),
    coalesce(u.is_suspended, false),
    u.suspended_until
  into
    v_is_banned,
    v_is_suspended,
    v_suspended_until
  from public.users as u
  where u.id = v_user_id;

  if not found then
    raise exception
      'User profile was not found.'
      using errcode = '42501';
  end if;

  if v_is_banned then
    raise exception
      'Account is not allowed to use Service Marketplace.'
      using errcode = '42501';
  end if;

  if
    v_is_suspended
    and (
      v_suspended_until is null
      or v_suspended_until >
        statement_timestamp()
    )
  then
    raise exception
      'Account is temporarily restricted.'
      using errcode = '42501';
  end if;

  return v_user_id;
end;
$function$;


revoke all
on function
  public.require_current_service_actor()
from PUBLIC, anon, authenticated, service_role;


-- =========================================================
-- 2. CREATE SERVICE LISTING DRAFT
--
-- Profile-completeness publication requirements are
-- intentionally NOT enforced here.
--
-- A user may prepare a draft first.
-- Publication eligibility is enforced later in M4B.
-- =========================================================

create or replace function
  public.create_service_listing_draft(
    p_title text,
    p_category text,
    p_description text,
    p_deliverables text,
    p_customer_preparation text,
    p_price_from bigint,
    p_is_negotiable boolean,
    p_service_mode text,
    p_location_name text
  )
returns uuid
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_provider_id uuid;

  v_listing_id uuid;
begin
  v_provider_id :=
    public.require_current_service_actor();

  insert into public.service_listings (
    provider_id,
    title,
    category,
    description,
    deliverables,
    customer_preparation,
    price_from,
    is_negotiable,
    service_mode,
    location_name,
    status
  )
  values (
    v_provider_id,
    btrim(p_title),
    btrim(p_category),
    btrim(p_description),
    btrim(p_deliverables),
    nullif(
      btrim(p_customer_preparation),
      ''
    ),
    p_price_from,
    p_is_negotiable,
    p_service_mode,
    nullif(
      btrim(p_location_name),
      ''
    ),
    'DRAFT'
  )
  returning id
  into v_listing_id;

  return v_listing_id;
end;
$function$;


revoke all
on function
  public.create_service_listing_draft(
    text,
    text,
    text,
    text,
    text,
    bigint,
    boolean,
    text,
    text
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.create_service_listing_draft(
    text,
    text,
    text,
    text,
    text,
    bigint,
    boolean,
    text,
    text
  )
to authenticated;


-- =========================================================
-- 3. UPDATE OWN SERVICE LISTING CONTENT
--
-- Content editing is allowed while:
-- DRAFT
-- PAYMENT_PENDING
-- ACTIVE
-- PAUSED
-- EXPIRED
--
-- BLOCKED and ARCHIVED listings are immutable from the
-- normal Provider editing path.
--
-- This function never changes lifecycle/payment fields.
-- =========================================================

create or replace function
  public.update_service_listing(
    p_listing_id uuid,
    p_title text,
    p_category text,
    p_description text,
    p_deliverables text,
    p_customer_preparation text,
    p_price_from bigint,
    p_is_negotiable boolean,
    p_service_mode text,
    p_location_name text
  )
returns uuid
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_provider_id uuid;

  v_status text;
begin
  v_provider_id :=
    public.require_current_service_actor();

  select
    sl.status
  into
    v_status
  from public.service_listings as sl
  where
    sl.id = p_listing_id
    and sl.provider_id = v_provider_id
  for update;

  if not found then
    raise exception
      'Service listing was not found.'
      using errcode = 'P0002';
  end if;

  if v_status in (
    'BLOCKED',
    'ARCHIVED'
  ) then
    raise exception
      'Service listing cannot be edited in its current state.'
      using errcode = '42501';
  end if;

  update public.service_listings
  set
    title =
      btrim(p_title),

    category =
      btrim(p_category),

    description =
      btrim(p_description),

    deliverables =
      btrim(p_deliverables),

    customer_preparation =
      nullif(
        btrim(
          p_customer_preparation
        ),
        ''
      ),

    price_from =
      p_price_from,

    is_negotiable =
      p_is_negotiable,

    service_mode =
      p_service_mode,

    location_name =
      nullif(
        btrim(
          p_location_name
        ),
        ''
      ),

    updated_at =
      statement_timestamp()

  where
    id = p_listing_id
    and provider_id = v_provider_id;

  return p_listing_id;
end;
$function$;


revoke all
on function
  public.update_service_listing(
    uuid,
    text,
    text,
    text,
    text,
    text,
    bigint,
    boolean,
    text,
    text
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.update_service_listing(
    uuid,
    text,
    text,
    text,
    text,
    text,
    bigint,
    boolean,
    text,
    text
  )
to authenticated;


-- =========================================================
-- 4. DELETE OWN DRAFT
--
-- Only never-published DRAFT listings may be hard deleted.
--
-- Image metadata may cascade because Service Listing Images
-- belongs to the draft.
--
-- Transaction/history tables must have no rows.
-- =========================================================

create or replace function
  public.delete_service_listing_draft(
    p_listing_id uuid
  )
returns boolean
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_provider_id uuid;

  v_status text;
begin
  v_provider_id :=
    public.require_current_service_actor();

  select
    sl.status
  into
    v_status
  from public.service_listings as sl
  where
    sl.id = p_listing_id
    and sl.provider_id = v_provider_id
  for update;

  if not found then
    raise exception
      'Service listing was not found.'
      using errcode = 'P0002';
  end if;

  if v_status <> 'DRAFT' then
    raise exception
      'Only draft Service listings can be deleted.'
      using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.service_requests as sr
    where sr.service_listing_id =
      p_listing_id
  ) then
    raise exception
      'Service listing already has transaction history.'
      using errcode = '23503';
  end if;

  if exists (
    select 1
    from public.service_listing_payments as sp
    where sp.service_listing_id =
      p_listing_id
  ) then
    raise exception
      'Service listing already has payment history.'
      using errcode = '23503';
  end if;

  if exists (
    select 1
    from public.service_listing_publication_periods as pp
    where pp.service_listing_id =
      p_listing_id
  ) then
    raise exception
      'Service listing already has publication history.'
      using errcode = '23503';
  end if;

  delete from public.service_listings
  where
    id = p_listing_id
    and provider_id = v_provider_id
    and status = 'DRAFT';

  if not found then
    raise exception
      'Service listing could not be deleted.'
      using errcode = '40001';
  end if;

  return true;
end;
$function$;


revoke all
on function
  public.delete_service_listing_draft(
    uuid
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.delete_service_listing_draft(
    uuid
  )
to authenticated;


-- =========================================================
-- 5. PROVIDER — OWN SERVICE LISTINGS
--
-- No raw table SELECT is granted.
--
-- A Provider can retrieve all of their own lifecycle
-- states through this explicit projection.
-- =========================================================

create or replace function
  public.get_my_service_listings(
    p_page integer default 1,
    p_page_size integer default 20
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
  public.get_my_service_listings(
    integer,
    integer
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.get_my_service_listings(
    integer,
    integer
  )
to authenticated;


-- =========================================================
-- 6. PUBLIC SERVICE FEED
--
-- Safe projection only.
--
-- Provider moderation columns are used internally for
-- filtering but are NEVER returned.
--
-- Feed ordering for MVP:
-- newest first.
-- =========================================================

create or replace function
  public.get_public_service_listings(
    p_page integer default 1,
    p_page_size integer default 20,
    p_category text default null,
    p_service_mode text default null,
    p_search text default null,
    p_provider_id uuid default null
  )
returns table (
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

    u.full_name
      as provider_full_name,

    u.username
      as provider_username,

    u.avatar_url
      as provider_avatar_url,

    u.rating
      as provider_rating,

    u.total_reviews
      as provider_total_reviews,

    u.verification_status
      as provider_verification_status,

    count(*) over()
      as total_count

  from public.service_listings as sl

  join public.users as u
    on u.id = sl.provider_id

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
    sl.status = 'ACTIVE'

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

    and (
      p_provider_id is null
      or sl.provider_id =
        p_provider_id
    )

    and (
      p_category is null
      or btrim(p_category) = ''
      or sl.category =
        p_category
    )

    and (
      p_service_mode is null
      or btrim(p_service_mode) = ''
      or sl.service_mode =
        p_service_mode
      or (
        p_service_mode in (
          'ONLINE',
          'OFFLINE'
        )
        and sl.service_mode =
          'BOTH'
      )
    )

    and (
      p_search is null
      or btrim(p_search) = ''
      or sl.title ilike
        '%' || btrim(p_search) || '%'
      or sl.description ilike
        '%' || btrim(p_search) || '%'
      or sl.category ilike
        '%' || btrim(p_search) || '%'
      or coalesce(
        sl.location_name,
        ''
      ) ilike
        '%' || btrim(p_search) || '%'
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
  public.get_public_service_listings(
    integer,
    integer,
    text,
    text,
    text,
    uuid
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.get_public_service_listings(
    integer,
    integer,
    text,
    text,
    text,
    uuid
  )
to anon, authenticated, service_role;


-- =========================================================
-- 7. PUBLIC SERVICE LISTING DETAIL
--
-- Safe public projection.
-- Only currently discoverable ACTIVE listings are returned.
-- =========================================================

create or replace function
  public.get_public_service_listing_detail(
    p_listing_id uuid
  )
returns table (
  id uuid,
  provider_id uuid,
  title text,
  category text,
  description text,
  deliverables text,
  customer_preparation text,
  price_from bigint,
  is_negotiable boolean,
  service_mode text,
  location_name text,
  published_at timestamptz,
  created_at timestamptz,
  expires_at timestamptz,
  cover_storage_path text,
  provider_full_name text,
  provider_username text,
  provider_avatar_url text,
  provider_rating numeric,
  provider_total_reviews integer,
  provider_verification_status text
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
    sl.deliverables,
    sl.customer_preparation,
    sl.price_from,
    sl.is_negotiable,
    sl.service_mode,
    sl.location_name,
    sl.published_at,
    sl.created_at,
    sl.expires_at,

    cover.storage_path
      as cover_storage_path,

    u.full_name
      as provider_full_name,

    u.username
      as provider_username,

    u.avatar_url
      as provider_avatar_url,

    u.rating
      as provider_rating,

    u.total_reviews
      as provider_total_reviews,

    u.verification_status
      as provider_verification_status

  from public.service_listings as sl

  join public.users as u
    on u.id = sl.provider_id

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
    sl.id = p_listing_id

    and sl.status = 'ACTIVE'

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
    );
$function$;


revoke all
on function
  public.get_public_service_listing_detail(
    uuid
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.get_public_service_listing_detail(
    uuid
  )
to anon, authenticated, service_role;


commit;