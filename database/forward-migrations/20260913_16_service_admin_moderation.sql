begin;

-- =========================================================
-- HelpMe Jasa
-- M16 â€” Service admin moderation + listing report authority
-- =========================================================
--
-- Scope:
-- 1. Trusted Service Listing report creation.
-- 2. Atomic admin BLOCK moderation.
-- 3. Expiry-aware admin UNBLOCK moderation.
--
-- Deliberately out of scope:
-- - Admin read models.
-- - Service Request lifecycle mutation.
-- - Payment mutation.
-- - Existing legacy report grants/policies.
--
-- M1-M15 remain immutable.
-- =========================================================


-- =========================================================
-- 1. SERVICE LISTING REPORT CREATION
-- =========================================================
--
-- Browser users must NOT INSERT service_listing_id directly
-- into public.reports.
--
-- Identity is derived from auth.uid().
-- Provider identity is derived from the listing itself.
-- =========================================================

create or replace function
  public.create_service_listing_report(
    p_service_listing_id uuid,
    p_reason text,
    p_description text default null
  )
returns uuid
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_reporter_id uuid;
  v_provider_id uuid;
  v_report_id uuid;
  v_reason text;
  v_description text;
begin
  v_reporter_id :=
    auth.uid();

  if
    v_reporter_id is null
  then
    raise exception
      'UNAUTHORIZED'
      using errcode = '42501';
  end if;


  if
    p_service_listing_id is null
  then
    raise exception
      'SERVICE_LISTING_ID_REQUIRED'
      using errcode = '22004';
  end if;


  v_reason :=
    nullif(
      pg_catalog.btrim(
        p_reason
      ),
      ''
    );

  if
    v_reason is null
  then
    raise exception
      'REPORT_REASON_REQUIRED'
      using errcode = '22023';
  end if;


  if
    v_reason not in (
      'SPAM',
      'SCAM',
      'FAKE_TASK',
      'INAPPROPRIATE',
      'HARASSMENT',
      'OTHER'
    )
  then
    raise exception
      'INVALID_REPORT_REASON'
      using errcode = '22023';
  end if;


  v_description :=
    nullif(
      pg_catalog.btrim(
        pg_catalog.coalesce(
          p_description,
          ''
        )
      ),
      ''
    );


  select
    sl.provider_id
  into
    v_provider_id
  from
    public.service_listings as sl
  where
    sl.id =
      p_service_listing_id
    and sl.status =
      'ACTIVE'
    and sl.expires_at >
      pg_catalog.statement_timestamp();


  if
    not found
  then
    raise exception
      'SERVICE_LISTING_NOT_REPORTABLE'
      using errcode = 'P0002';
  end if;


  if
    v_provider_id =
      v_reporter_id
  then
    raise exception
      'CANNOT_REPORT_OWN_SERVICE_LISTING'
      using errcode = '22023';
  end if;


  /*
   * Serialize pending-report creation for this exact
   * reporter/listing pair without changing the historical
   * reports table duplicate semantics.
   */
  perform
    pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(
        v_reporter_id::text
          || ':'
          || p_service_listing_id::text,
        0
      )
    );


  if exists (
    select
      1
    from
      public.reports as r
    where
      r.reporter_id =
        v_reporter_id
      and r.service_listing_id =
        p_service_listing_id
      and r.status =
        'PENDING'
  )
  then
    raise exception
      'SERVICE_LISTING_REPORT_ALREADY_PENDING'
      using errcode = '23505';
  end if;


  insert into
    public.reports (
      reporter_id,
      reported_user_id,
      task_id,
      service_listing_id,
      reason,
      description,
      status
    )
  values (
    v_reporter_id,
    v_provider_id,
    null,
    p_service_listing_id,
    v_reason,
    v_description,
    'PENDING'
  )
  returning
    id
  into
    v_report_id;


  return
    v_report_id;
end;
$$;


revoke all
on function
  public.create_service_listing_report(
    uuid,
    text,
    text
  )
from
  public,
  anon,
  authenticated,
  service_role;


grant execute
on function
  public.create_service_listing_report(
    uuid,
    text,
    text
  )
to
  authenticated;


-- =========================================================
-- 2. ADMIN BLOCK SERVICE LISTING
-- =========================================================
--
-- Only an already-published lifecycle state may be blocked:
-- ACTIVE / PAUSED / EXPIRED.
--
-- Browser admin is not granted EXECUTE.
-- Server API must first call requireAdmin(), then invoke this
-- function through the server-only service-role boundary.
-- =========================================================

create or replace function
  public.admin_block_service_listing(
    p_service_listing_id uuid,
    p_reason text
  )
returns table (
  service_listing_id uuid,
  status text,
  blocked_at timestamptz,
  blocked_reason text,
  blocked_from_status text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_status text;
  v_reason text;
  v_now timestamptz;
begin
  if
    p_service_listing_id is null
  then
    raise exception
      'SERVICE_LISTING_ID_REQUIRED'
      using errcode = '22004';
  end if;


  v_reason :=
    nullif(
      pg_catalog.btrim(
        p_reason
      ),
      ''
    );

  if
    v_reason is null
  then
    raise exception
      'BLOCK_REASON_REQUIRED'
      using errcode = '22023';
  end if;


  v_now :=
    pg_catalog.statement_timestamp();


  select
    sl.status
  into
    v_status
  from
    public.service_listings as sl
  where
    sl.id =
      p_service_listing_id
  for update;


  if
    not found
  then
    raise exception
      'SERVICE_LISTING_NOT_FOUND'
      using errcode = 'P0002';
  end if;


  if
    v_status =
      'BLOCKED'
  then
    raise exception
      'SERVICE_LISTING_ALREADY_BLOCKED'
      using errcode = '55000';
  end if;


  if
    v_status not in (
      'ACTIVE',
      'PAUSED',
      'EXPIRED'
    )
  then
    raise exception
      'SERVICE_LISTING_CANNOT_BE_BLOCKED_FROM_%',
      v_status
      using errcode = '55000';
  end if;


  update
    public.service_listings
  set
    status =
      'BLOCKED',

    blocked_at =
      v_now,

    blocked_reason =
      v_reason,

    blocked_from_status =
      v_status,

    updated_at =
      v_now
  where
    id =
      p_service_listing_id;


  return query
  select
    sl.id,
    sl.status,
    sl.blocked_at,
    sl.blocked_reason,
    sl.blocked_from_status,
    sl.expires_at
  from
    public.service_listings as sl
  where
    sl.id =
      p_service_listing_id;
end;
$$;


revoke all
on function
  public.admin_block_service_listing(
    uuid,
    text
  )
from
  public,
  anon,
  authenticated,
  service_role;


grant execute
on function
  public.admin_block_service_listing(
    uuid,
    text
  )
to
  service_role;


-- =========================================================
-- 3. ADMIN UNBLOCK SERVICE LISTING
-- =========================================================
--
-- Restoration is expiry-aware.
--
-- Example:
--
-- ACTIVE -> BLOCKED
-- publication expires while still blocked
-- UNBLOCK -> EXPIRED
--
-- It must never resurrect expired publication time.
-- =========================================================

create or replace function
  public.admin_unblock_service_listing(
    p_service_listing_id uuid
  )
returns table (
  service_listing_id uuid,
  status text,
  blocked_at timestamptz,
  blocked_reason text,
  blocked_from_status text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_status text;
  v_blocked_from_status text;
  v_expires_at timestamptz;
  v_paused_at timestamptz;
  v_target_status text;
  v_now timestamptz;
begin
  if
    p_service_listing_id is null
  then
    raise exception
      'SERVICE_LISTING_ID_REQUIRED'
      using errcode = '22004';
  end if;


  v_now :=
    pg_catalog.statement_timestamp();


  select
    sl.status,
    sl.blocked_from_status,
    sl.expires_at,
    sl.paused_at
  into
    v_status,
    v_blocked_from_status,
    v_expires_at,
    v_paused_at
  from
    public.service_listings as sl
  where
    sl.id =
      p_service_listing_id
  for update;


  if
    not found
  then
    raise exception
      'SERVICE_LISTING_NOT_FOUND'
      using errcode = 'P0002';
  end if;


  if
    v_status <>
      'BLOCKED'
  then
    raise exception
      'SERVICE_LISTING_NOT_BLOCKED'
      using errcode = '55000';
  end if;


  if
    v_blocked_from_status not in (
      'ACTIVE',
      'PAUSED',
      'EXPIRED'
    )
  then
    raise exception
      'INVALID_BLOCKED_FROM_STATUS'
      using errcode = '55000';
  end if;


  if
    v_expires_at is null
  then
    raise exception
      'BLOCKED_SERVICE_LISTING_MISSING_EXPIRY'
      using errcode = '55000';
  end if;


  if
    v_expires_at <=
      v_now
  then
    v_target_status :=
      'EXPIRED';

  elsif
    v_blocked_from_status =
      'EXPIRED'
  then
    v_target_status :=
      'EXPIRED';

  else
    v_target_status :=
      v_blocked_from_status;
  end if;


  update
    public.service_listings
  set
    status =
      v_target_status,

    paused_at =
      case
        when
          v_target_status =
            'PAUSED'
        then
          pg_catalog.coalesce(
            v_paused_at,
            v_now
          )

        else
          null
      end,

    blocked_at =
      null,

    blocked_reason =
      null,

    blocked_from_status =
      null,

    updated_at =
      v_now
  where
    id =
      p_service_listing_id;


  return query
  select
    sl.id,
    sl.status,
    sl.blocked_at,
    sl.blocked_reason,
    sl.blocked_from_status,
    sl.expires_at
  from
    public.service_listings as sl
  where
    sl.id =
      p_service_listing_id;
end;
$$;


revoke all
on function
  public.admin_unblock_service_listing(
    uuid
  )
from
  public,
  anon,
  authenticated,
  service_role;


grant execute
on function
  public.admin_unblock_service_listing(
    uuid
  )
to
  service_role;


commit;