begin;

set local lock_timeout = '10s';
set local statement_timeout = '60s';


-- =========================================================
-- HELPME JASA
-- M4C1 — SERVICE LISTING PUBLICATION ENTITLEMENT CORE
--
-- This migration intentionally contains NO Midtrans
-- orchestration.
--
-- It provides:
-- - Provider-scoped transaction serialization
-- - Reserved live-slot counting
-- - Atomic FIRST_LISTING_FREE entitlement
-- - Exact 30-day first publication
-- - Expiration reconciliation
--
-- Paid publication / renewal remains deferred to F7.
-- =========================================================


-- =========================================================
-- 1. PROVIDER PUBLICATION SERIALIZATION LOCK
--
-- Publication operations for the same Provider must be
-- serialized before checking:
--
-- - reserved live slots
-- - first-publication entitlement
-- - payment reservation
--
-- Transaction-scoped advisory lock:
-- automatically released on COMMIT / ROLLBACK.
--
-- Internal function.
-- No browser or service_role direct EXECUTE permission.
-- =========================================================

create or replace function
  public.lock_service_provider_publication(
    p_provider_id uuid
  )
returns void
language plpgsql
volatile
security definer
set search_path to ''
as $function$
begin
  if p_provider_id is null then
    raise exception
      'Service Provider identity is required.'
      using errcode = '22004';
  end if;

  perform
    pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(
        p_provider_id::text,
        843746291::bigint
      )
    );
end;
$function$;


revoke all
on function
  public.lock_service_provider_publication(
    uuid
  )
from PUBLIC, anon, authenticated, service_role;


-- =========================================================
-- 2. RESERVED LIVE-SLOT COUNTER
--
-- F4.B rule:
--
-- Maximum reserved Service Listing slots are supplied
-- by trusted backend configuration.
--
-- Current product default:
-- 5 / Provider
--
-- Counted:
--
-- ACTIVE
-- PAUSED
-- BLOCKED
--   only while publication period is unexpired
--
-- PAYMENT_PENDING
--   represents a newly reserved slot awaiting payment
--
-- Not counted:
--
-- DRAFT
-- EXPIRED
-- ARCHIVED
--
-- EARLY_RENEWAL will keep an existing listing ACTIVE/PAUSED,
-- therefore it does not consume a second slot.
--
-- Internal function.
-- Caller must acquire Provider publication lock before
-- making an authoritative slot decision.
-- =========================================================

create or replace function
  public.count_service_provider_reserved_slots(
    p_provider_id uuid,
    p_at timestamptz
  )
returns integer
language sql
stable
security definer
set search_path to ''
as $function$
  select
    count(*)::integer

  from public.service_listings as sl

  where
    sl.provider_id =
      p_provider_id

    and (
      (
        sl.status in (
          'ACTIVE',
          'PAUSED',
          'BLOCKED'
        )

        and sl.expires_at is not null

        and sl.expires_at >
          p_at
      )

      or sl.status =
        'PAYMENT_PENDING'
    );
$function$;


revoke all
on function
  public.count_service_provider_reserved_slots(
    uuid,
    timestamptz
  )
from PUBLIC, anon, authenticated, service_role;


-- =========================================================
-- 3. CLAIM FIRST LISTING FREE
--
-- Trusted backend primitive.
--
-- service_role supplies the authenticated Provider ID
-- resolved by the application server.
--
-- This function:
--
-- 1. serializes Provider publication operations
-- 2. locks the target listing
-- 3. verifies ownership
-- 4. verifies account access state
-- 5. verifies minimum Service Provider profile
-- 6. verifies COVER metadata
-- 7. checks maximum reserved slots
-- 8. checks that Provider has NEVER published before
-- 9. creates FIRST_LISTING_FREE publication period
-- 10. activates listing for exactly 30 days
--
-- Returns activated = false when the first-free entitlement
-- is no longer available.
--
-- That is NOT an error:
-- the application may continue into the paid F7 flow.
--
-- IMPORTANT:
-- No Midtrans payment is created here.
-- =========================================================

create or replace function
  public.claim_first_free_service_listing_publication(
    p_listing_id uuid,
    p_provider_id uuid,
    p_first_free_enabled boolean,
    p_max_reserved_slots integer
  )
returns table (
  activated boolean,
  listing_id uuid,
  publication_period_id uuid,
  starts_at timestamptz,
  ends_at timestamptz
)
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_status text;

  v_full_name text;

  v_username text;

  v_is_banned boolean;

  v_is_suspended boolean;

  v_suspended_until timestamptz;

  v_reserved_slots integer;

  v_period_id uuid;

  v_now timestamptz :=
    statement_timestamp();

  v_duration_seconds integer :=
    2592000;

  v_ends_at timestamptz;
begin
  if p_listing_id is null then
    raise exception
      'Service Listing identity is required.'
      using errcode = '22004';
  end if;

    if p_provider_id is null then
    raise exception
      'Service Provider identity is required.'
      using errcode = '22004';
  end if;


  if p_first_free_enabled is null then
    raise exception
      'First-free publication configuration is required.'
      using errcode = '22004';
  end if;


  if
    p_max_reserved_slots is null
    or p_max_reserved_slots < 1
  then
    raise exception
      'Maximum reserved Service listing slots must be at least 1.'
      using errcode = '22023';
  end if;


  -- -------------------------------------------------------
  -- Serialize all publication decisions for this Provider.
  -- -------------------------------------------------------

  perform
    public.lock_service_provider_publication(
      p_provider_id
    );


  -- -------------------------------------------------------
  -- Lock and authorize the exact Service Listing.
  -- -------------------------------------------------------

  select
    sl.status
  into
    v_status
  from public.service_listings as sl
  where
    sl.id = p_listing_id
    and sl.provider_id =
      p_provider_id
  for update;

  if not found then
    raise exception
      'Service listing was not found.'
      using errcode = 'P0002';
  end if;


  -- FIRST_LISTING_FREE is only an INITIAL publication.
  --
  -- Renewal of EXPIRED/ACTIVE/PAUSED listings belongs to
  -- the paid publication flow.

    if v_status <> 'DRAFT' then
    raise exception
      'Only a draft Service listing can use first publication entitlement.'
      using errcode = '55000';
  end if;


  -- -------------------------------------------------------
  -- FIRST_LISTING_FREE is a configurable promotion.
  --
  -- When disabled, this primitive does not consume any
  -- entitlement. The trusted backend may continue into
  -- the paid publication flow.
  -- -------------------------------------------------------

  if not p_first_free_enabled then
    return query
    select
      false,
      p_listing_id,
      null::uuid,
      null::timestamptz,
      null::timestamptz;

    return;
  end if;


  -- -------------------------------------------------------
  -- Account + minimum profile gate.
  --
  -- Minimum HelpMe Jasa profile:
  -- - full_name
  -- - username
  --
  -- Avatar, bio, profile location, and KTP verification
  -- are intentionally optional.
  -- -------------------------------------------------------

  select
    u.full_name,
    u.username,
    coalesce(
      u.is_banned,
      false
    ),
    coalesce(
      u.is_suspended,
      false
    ),
    u.suspended_until

  into
    v_full_name,
    v_username,
    v_is_banned,
    v_is_suspended,
    v_suspended_until

  from public.users as u

  where
    u.id =
      p_provider_id;

  if not found then
    raise exception
      'Service Provider profile was not found.'
      using errcode = 'P0002';
  end if;


  if v_is_banned then
    raise exception
      'Account is not allowed to publish Service listings.'
      using errcode = '42501';
  end if;


  if
    v_is_suspended
    and (
      v_suspended_until is null
      or v_suspended_until >
        v_now
    )
  then
    raise exception
      'Account is temporarily restricted from publishing Service listings.'
      using errcode = '42501';
  end if;


  if
    v_full_name is null
    or btrim(v_full_name) = ''
    or v_username is null
    or btrim(v_username) = ''
  then
    raise exception
      'Complete full name and username before publishing a Service listing.'
      using errcode = '23514';
  end if;


  -- -------------------------------------------------------
  -- COVER is mandatory before publication.
  -- -------------------------------------------------------

  if not exists (
    select 1

    from public.service_listing_images
      as sli

    where
      sli.service_listing_id =
        p_listing_id

      and sli.kind =
        'COVER'
  ) then
    raise exception
      'A Service listing cover image is required before publication.'
      using errcode = '23514';
  end if;


  -- -------------------------------------------------------
  -- Provider live-slot capacity.
  --
  -- Advisory lock makes count + activation atomic against
  -- all correctly implemented Service publication paths.
  -- -------------------------------------------------------

  v_reserved_slots :=
    public.count_service_provider_reserved_slots(
      p_provider_id,
      v_now
    );


    if
    v_reserved_slots >=
      p_max_reserved_slots
  then
    raise exception
      'Maximum reserved Service listing slots reached.'
      using errcode = '54000';
  end if;


  -- -------------------------------------------------------
  -- FIRST LISTING means FIRST SUCCESSFUL PUBLICATION.
  --
  -- Checking only source_type = FIRST_LISTING_FREE would
  -- incorrectly allow:
  --
  -- PAYMENT publication first
  -- then free publication later.
  --
  -- Therefore ANY previous publication period makes the
  -- first-free entitlement unavailable.
  -- -------------------------------------------------------

  if exists (
    select 1

    from public.service_listing_publication_periods
      as pp

    where
      pp.provider_id =
        p_provider_id
  ) then
    return query
    select
      false,
      p_listing_id,
      null::uuid,
      null::timestamptz,
      null::timestamptz;

    return;
  end if;


  -- -------------------------------------------------------
  -- Exact publication duration:
  --
  -- 30 * 24 * 60 * 60 = 2,592,000 seconds.
  -- -------------------------------------------------------

  v_ends_at :=
    v_now
    +
    v_duration_seconds
      * interval '1 second';


  -- -------------------------------------------------------
  -- Activate the listing.
  -- -------------------------------------------------------

  update public.service_listings
  set
    status =
      'ACTIVE',

    published_at =
      v_now,

    activated_at =
      v_now,

    expires_at =
      v_ends_at,

    paused_at =
      null,

    blocked_at =
      null,

    blocked_reason =
      null,

    blocked_from_status =
      null,

    archived_at =
      null,

    updated_at =
      v_now

  where
    id =
      p_listing_id

    and provider_id =
      p_provider_id

    and status =
      'DRAFT';

  if not found then
    raise exception
      'Service listing lifecycle changed concurrently.'
      using errcode = '40001';
  end if;


  -- -------------------------------------------------------
  -- Record entitlement history.
  --
  -- M1 already provides:
  --
  -- UNIQUE(provider_id)
  -- WHERE source_type = FIRST_LISTING_FREE
  --
  -- so the database remains the final exactly-once guard.
  -- -------------------------------------------------------

  insert into
    public.service_listing_publication_periods (
      service_listing_id,
      provider_id,
      source_type,
      publication_action,
      service_listing_payment_id,
      duration_seconds,
      starts_at,
      ends_at,
      applied_at
    )

  values (
    p_listing_id,
    p_provider_id,
    'FIRST_LISTING_FREE',
    'INITIAL_PUBLICATION',
    null,
    v_duration_seconds,
    v_now,
    v_ends_at,
    v_now
  )

  returning id
  into v_period_id;


  return query
  select
    true,
    p_listing_id,
    v_period_id,
    v_now,
    v_ends_at;
end;
$function$;


revoke all
on function
  public.claim_first_free_service_listing_publication(
    uuid,
    uuid,
    boolean,
    integer
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.claim_first_free_service_listing_publication(
    uuid,
    uuid,
    boolean,
    integer
  )
to service_role;


-- =========================================================
-- 4. EXPIRE DUE SERVICE LISTINGS
--
-- ACTIVE / PAUSED listings whose publication time has
-- elapsed become EXPIRED.
--
-- Public discovery is already protected by:
--
-- status = ACTIVE
-- AND expires_at > statement_timestamp()
--
-- so stale rows cannot become publicly discoverable even
-- before this reconciliation runs.
--
-- BLOCKED listings remain BLOCKED.
-- Their expiration is interpreted from expires_at when
-- moderation later decides the correct restoration state.
-- =========================================================

create or replace function
  public.expire_due_service_listings()
returns integer
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_affected integer;

  v_now timestamptz :=
    statement_timestamp();
begin
  update public.service_listings
  set
    status =
      'EXPIRED',

    updated_at =
      v_now

  where
    status in (
      'ACTIVE',
      'PAUSED'
    )

    and expires_at is not null

    and expires_at <=
      v_now;

  get diagnostics
    v_affected =
      row_count;

  return v_affected;
end;
$function$;


revoke all
on function
  public.expire_due_service_listings()
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.expire_due_service_listings()
to service_role;


commit;