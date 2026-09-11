begin;

set local lock_timeout = '10s';
set local statement_timeout = '60s';


-- =========================================================
-- HELPME JASA
-- M4B — PROVIDER SERVICE LISTING LIFECYCLE
--
-- Depends on:
-- M1  Service Marketplace Core
-- M4A require_current_service_actor()
--
-- Provider-authorized lifecycle operations:
-- - pause
-- - resume
-- - archive
--
-- Publication / entitlement / renewal remains outside
-- this migration and will be implemented in M4C.
-- =========================================================


-- =========================================================
-- 1. PAUSE SERVICE LISTING
--
-- ACTIVE -> PAUSED
--
-- Pause never modifies publication duration.
-- expires_at continues running while paused.
--
-- Repeating pause on an already PAUSED, non-expired
-- listing is intentionally idempotent.
-- =========================================================

create or replace function
  public.pause_service_listing(
    p_listing_id uuid
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

  v_expires_at timestamptz;

  v_now timestamptz :=
    statement_timestamp();
begin
  v_provider_id :=
    public.require_current_service_actor();

  select
    sl.status,
    sl.expires_at
  into
    v_status,
    v_expires_at
  from public.service_listings as sl
  where
    sl.id = p_listing_id
    and sl.provider_id =
      v_provider_id
  for update;

  if not found then
    raise exception
      'Service listing was not found.'
      using errcode = 'P0002';
  end if;

  if v_status not in (
    'ACTIVE',
    'PAUSED'
  ) then
    raise exception
      'Service listing cannot be paused in its current state.'
      using errcode = '55000';
  end if;

  if
    v_expires_at is null
    or v_expires_at <= v_now
  then
    raise exception
      'Service listing publication period has expired.'
      using errcode = '55000';
  end if;

  if v_status = 'PAUSED' then
    return p_listing_id;
  end if;

  update public.service_listings
  set
    status = 'PAUSED',
    paused_at = v_now,
    updated_at = v_now
  where
    id = p_listing_id
    and provider_id =
      v_provider_id
    and status = 'ACTIVE';

  if not found then
    raise exception
      'Service listing lifecycle changed concurrently.'
      using errcode = '40001';
  end if;

  return p_listing_id;
end;
$function$;


revoke all
on function
  public.pause_service_listing(
    uuid
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.pause_service_listing(
    uuid
  )
to authenticated;


-- =========================================================
-- 2. RESUME SERVICE LISTING
--
-- PAUSED -> ACTIVE
--
-- Resume is allowed only while the original publication
-- period is still active.
--
-- It does NOT extend expires_at.
--
-- Repeating resume on an already ACTIVE, non-expired
-- listing is intentionally idempotent.
-- =========================================================

create or replace function
  public.resume_service_listing(
    p_listing_id uuid
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

  v_expires_at timestamptz;

  v_now timestamptz :=
    statement_timestamp();
begin
  v_provider_id :=
    public.require_current_service_actor();

  select
    sl.status,
    sl.expires_at
  into
    v_status,
    v_expires_at
  from public.service_listings as sl
  where
    sl.id = p_listing_id
    and sl.provider_id =
      v_provider_id
  for update;

  if not found then
    raise exception
      'Service listing was not found.'
      using errcode = 'P0002';
  end if;

  if v_status not in (
    'ACTIVE',
    'PAUSED'
  ) then
    raise exception
      'Service listing cannot be resumed in its current state.'
      using errcode = '55000';
  end if;

  if
    v_expires_at is null
    or v_expires_at <= v_now
  then
    raise exception
      'Service listing publication period has expired.'
      using errcode = '55000';
  end if;

  if v_status = 'ACTIVE' then
    return p_listing_id;
  end if;

  update public.service_listings
  set
    status = 'ACTIVE',
    paused_at = null,
    updated_at = v_now
  where
    id = p_listing_id
    and provider_id =
      v_provider_id
    and status = 'PAUSED';

  if not found then
    raise exception
      'Service listing lifecycle changed concurrently.'
      using errcode = '40001';
  end if;

  return p_listing_id;
end;
$function$;


revoke all
on function
  public.resume_service_listing(
    uuid
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.resume_service_listing(
    uuid
  )
to authenticated;


-- =========================================================
-- 3. ARCHIVE SERVICE LISTING
--
-- Allowed:
-- ACTIVE
-- PAUSED
-- EXPIRED
--
-- Not allowed:
-- DRAFT
-- PAYMENT_PENDING
-- BLOCKED
--
-- ARCHIVED is terminal and repeated archive calls are
-- intentionally idempotent.
--
-- Publication / request / payment history is retained.
-- =========================================================

create or replace function
  public.archive_service_listing(
    p_listing_id uuid
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

  v_now timestamptz :=
    statement_timestamp();
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
    and sl.provider_id =
      v_provider_id
  for update;

  if not found then
    raise exception
      'Service listing was not found.'
      using errcode = 'P0002';
  end if;

  if v_status = 'ARCHIVED' then
    return p_listing_id;
  end if;

  if v_status = 'BLOCKED' then
    raise exception
      'Blocked Service listings cannot be archived by the Provider.'
      using errcode = '42501';
  end if;

  if v_status not in (
    'ACTIVE',
    'PAUSED',
    'EXPIRED'
  ) then
    raise exception
      'Service listing cannot be archived in its current state.'
      using errcode = '55000';
  end if;

  update public.service_listings
  set
    status = 'ARCHIVED',
    archived_at = v_now,
    updated_at = v_now
  where
    id = p_listing_id
    and provider_id =
      v_provider_id
    and status in (
      'ACTIVE',
      'PAUSED',
      'EXPIRED'
    );

  if not found then
    raise exception
      'Service listing lifecycle changed concurrently.'
      using errcode = '40001';
  end if;

  return p_listing_id;
end;
$function$;


revoke all
on function
  public.archive_service_listing(
    uuid
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.archive_service_listing(
    uuid
  )
to authenticated;


commit;