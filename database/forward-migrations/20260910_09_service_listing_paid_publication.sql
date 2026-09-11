begin;


-- =========================================================
-- F7 / M9
-- SERVICE LISTING PAID PUBLICATION FOUNDATION
--
-- Forward-only migration.
--
-- Provides:
-- - Early-renewal lifecycle snapshot
-- - Atomic paid publication reservation
-- - CREATING -> PENDING checkout finalization
-- - Authoritative payment status application
-- - Exactly-once paid publication application
-- - Late PAID correction
-- - Archive protection while checkout is nonterminal
--
-- This migration intentionally does NOT:
-- - create Midtrans transactions
-- - expose browser table access
-- - trust browser-provided publication fees
-- - implement payment UI
-- =========================================================


-- =========================================================
-- 1. EARLY-RENEWAL STATUS SNAPSHOT
--
-- renewal_base_expires_at already snapshots the expiry
-- boundary from which an EARLY_RENEWAL extends.
--
-- renewal_base_status preserves whether the listing was
-- ACTIVE or PAUSED when that renewal was reserved.
--
-- This matters when the old publication expires while
-- the payment session is still open.
-- =========================================================

alter table
  public.service_listing_payments
add column
  renewal_base_status text;


alter table
  public.service_listing_payments
add constraint
  service_listing_payments_renewal_base_status_check
check (
  (
    publication_action =
      'EARLY_RENEWAL'

    and renewal_base_status in (
      'ACTIVE',
      'PAUSED'
    )
  )
  or
  (
    publication_action <>
      'EARLY_RENEWAL'

    and renewal_base_status
      is null
  )
);


-- =========================================================
-- 2. RESERVE PAID SERVICE LISTING PUBLICATION
--
-- Trusted backend primitive.
--
-- IMPORTANT:
--
-- FIRST_LISTING_FREE must be attempted separately through
-- claim_first_free_service_listing_publication().
--
-- The application calls this paid primitive only when:
-- - first-free is unavailable, or
-- - this operation is a renewal.
--
-- The Provider-scoped advisory lock serializes:
-- - live-slot decisions
-- - publication decisions
-- - payment reservations
--
-- A payment row is created BEFORE the Midtrans network call.
--
-- State:
--
-- INITIAL_PUBLICATION:
--   DRAFT -> PAYMENT_PENDING
--
-- EXPIRED_RENEWAL:
--   EXPIRED/effectively-expired -> PAYMENT_PENDING
--
-- EARLY_RENEWAL:
--   ACTIVE/PAUSED remains ACTIVE/PAUSED
--
-- Existing CREATING/PENDING checkout is returned instead
-- of creating a second payment.
-- =========================================================

create or replace function
  public.reserve_service_listing_publication_payment(
    p_listing_id uuid,
    p_provider_id uuid,
    p_order_id text,
    p_amount bigint,
    p_publication_duration_seconds integer,
    p_max_reserved_slots integer
  )
returns table (
  created boolean,
  payment_id uuid,
  payment_status text,
  publication_action text,
  midtrans_order_id text,
  snap_token text,
  payment_url text,
  payment_expires_at timestamptz,
  renewal_base_expires_at timestamptz
)
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_now timestamptz :=
    statement_timestamp();

  v_status text;

  v_expires_at timestamptz;

  v_full_name text;

  v_username text;

  v_is_banned boolean;

  v_is_suspended boolean;

  v_suspended_until timestamptz;

  v_reserved_slots integer;

  v_action text;

  v_renewal_base_expires_at
    timestamptz;

  v_renewal_base_status text;

  v_existing_payment_id uuid;

  v_existing_payment_status text;

  v_existing_action text;

  v_existing_order_id text;

  v_existing_snap_token text;

  v_existing_payment_url text;

  v_existing_payment_expires_at
    timestamptz;

  v_existing_renewal_base
    timestamptz;

  v_payment_id uuid;
begin
  if
    p_listing_id is null
    or p_provider_id is null
  then
    raise exception
      'Service listing and Provider IDs are required.'
      using errcode = '22023';
  end if;


  if
    p_order_id is null
    or btrim(p_order_id) = ''
  then
    raise exception
      'Midtrans order ID is required.'
      using errcode = '22023';
  end if;


  if
    p_amount is null
    or p_amount <= 0
  then
    raise exception
      'Service listing publication amount must be positive.'
      using errcode = '22023';
  end if;


  if
    p_publication_duration_seconds
      <> 2592000
  then
    raise exception
      'Service listing publication duration must be exactly 2592000 seconds.'
      using errcode = '22023';
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
  -- Lock and authorize the listing.
  -- -------------------------------------------------------

  select
    sl.status,
    sl.expires_at

  into
    v_status,
    v_expires_at

  from public.service_listings
    as sl

  where
    sl.id =
      p_listing_id

    and sl.provider_id =
      p_provider_id

  for update;


  if not found then
    raise exception
      'Service listing was not found.'
      using errcode = 'P0002';
  end if;


  -- -------------------------------------------------------
  -- Account + minimum HelpMe Jasa profile.
  --
  -- Mirrors M4C:
  -- - full_name required
  -- - username required
  -- - banned denied
  -- - active suspension denied
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

  from public.users
    as u

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
  -- COVER remains mandatory for every publication flow.
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
  -- Idempotent checkout reservation.
  --
  -- Return an already-existing nonterminal payment.
  --
  -- The M1 partial unique index remains the final DB guard.
  -- -------------------------------------------------------

  select
    slp.id,
    slp.payment_status,
    slp.publication_action,
    slp.midtrans_order_id,
    slp.snap_token,
    slp.payment_url,
    slp.payment_expires_at,
    slp.renewal_base_expires_at

  into
    v_existing_payment_id,
    v_existing_payment_status,
    v_existing_action,
    v_existing_order_id,
    v_existing_snap_token,
    v_existing_payment_url,
    v_existing_payment_expires_at,
    v_existing_renewal_base

  from public.service_listing_payments
    as slp

  where
    slp.service_listing_id =
      p_listing_id

    and slp.provider_id =
      p_provider_id

    and slp.payment_status in (
      'CREATING',
      'PENDING'
    )

  order by
    slp.created_at desc

  limit 1

  for update;


  if found then
    return query
    select
      false,
      v_existing_payment_id,
      v_existing_payment_status,
      v_existing_action,
      v_existing_order_id,
      v_existing_snap_token,
      v_existing_payment_url,
      v_existing_payment_expires_at,
      v_existing_renewal_base;

    return;
  end if;


  -- -------------------------------------------------------
  -- Determine authoritative publication action.
  --
  -- ACTIVE/PAUSED rows whose expires_at already elapsed
  -- are treated as EXPIRED_RENEWAL even if the scheduler
  -- has not normalized the row yet.
  -- -------------------------------------------------------

  case
    when
      v_status =
        'DRAFT'
    then
      v_action :=
        'INITIAL_PUBLICATION';


    when
      v_status =
        'EXPIRED'
    then
      v_action :=
        'EXPIRED_RENEWAL';


    when
      v_status in (
        'ACTIVE',
        'PAUSED'
      )
      and v_expires_at
        is not null
      and v_expires_at >
        v_now
    then
      v_action :=
        'EARLY_RENEWAL';

      v_renewal_base_expires_at :=
        v_expires_at;

      v_renewal_base_status :=
        v_status;


    when
      v_status in (
        'ACTIVE',
        'PAUSED'
      )
      and v_expires_at
        is not null
      and v_expires_at <=
        v_now
    then
      v_action :=
        'EXPIRED_RENEWAL';


    when
      v_status =
        'PAYMENT_PENDING'
    then
      raise exception
        'Service listing is waiting for a publication payment but no nonterminal payment record was found.'
        using errcode = '55000';


    when
      v_status =
        'BLOCKED'
    then
      raise exception
        'Blocked Service listings cannot start publication payments.'
        using errcode = '42501';


    when
      v_status =
        'ARCHIVED'
    then
      raise exception
        'Archived Service listings cannot start publication payments.'
        using errcode = '55000';


    else
      raise exception
        'Service listing cannot start publication payment in its current state.'
        using errcode = '55000';
  end case;


  -- -------------------------------------------------------
  -- New slot required:
  --
  -- INITIAL_PUBLICATION
  -- EXPIRED_RENEWAL
  --
  -- EARLY_RENEWAL already occupies its existing slot and
  -- must not consume a second slot.
  -- -------------------------------------------------------

  if
    v_action in (
      'INITIAL_PUBLICATION',
      'EXPIRED_RENEWAL'
    )
  then
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
  end if;


  -- -------------------------------------------------------
  -- Create DB reservation BEFORE Midtrans network call.
  -- -------------------------------------------------------

  insert into
    public.service_listing_payments (
      service_listing_id,
      provider_id,
      publication_action,
      amount,
      currency,
      publication_duration_seconds,
      payment_status,
      midtrans_order_id,
      renewal_base_expires_at,
      renewal_base_status,
      created_at,
      updated_at
    )

  values (
    p_listing_id,
    p_provider_id,
    v_action,
    p_amount,
    'IDR',
    p_publication_duration_seconds,
    'CREATING',
    btrim(p_order_id),
    v_renewal_base_expires_at,
    v_renewal_base_status,
    v_now,
    v_now
  )

  returning
    id
  into
    v_payment_id;


  -- -------------------------------------------------------
  -- Reserve a live slot for initial/expired publication.
  --
  -- EARLY_RENEWAL keeps the listing ACTIVE or PAUSED.
  -- -------------------------------------------------------

  if
    v_action in (
      'INITIAL_PUBLICATION',
      'EXPIRED_RENEWAL'
    )
  then
    update
      public.service_listings

    set
      status =
        'PAYMENT_PENDING',

      paused_at =
        null,

      updated_at =
        v_now

    where
      id =
        p_listing_id

      and provider_id =
        p_provider_id;


    if not found then
      raise exception
        'Service listing lifecycle changed concurrently.'
        using errcode = '40001';
    end if;
  end if;


  return query
  select
    true,
    v_payment_id,
    'CREATING'::text,
    v_action,
    btrim(p_order_id),
    null::text,
    null::text,
    null::timestamptz,
    v_renewal_base_expires_at;
end;
$function$;


revoke all
on function
  public.reserve_service_listing_publication_payment(
    uuid,
    uuid,
    text,
    bigint,
    integer,
    integer
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.reserve_service_listing_publication_payment(
    uuid,
    uuid,
    text,
    bigint,
    integer,
    integer
  )
to service_role;


-- =========================================================
-- 3. FINALIZE MIDTRANS CHECKOUT
--
-- Called only AFTER createTransaction() succeeds.
--
-- It attaches the server-created Midtrans checkout data
-- and moves:
--
-- CREATING -> PENDING
--
-- Repeated finalization of an already-PENDING row is a
-- no-op, allowing safe server retry.
-- =========================================================

create or replace function
  public.finalize_service_listing_payment_checkout(
    p_payment_id uuid,
    p_provider_id uuid,
    p_snap_token text,
    p_payment_url text,
    p_payment_expires_at timestamptz
  )
returns boolean
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_now timestamptz :=
    statement_timestamp();

  v_status text;
begin
  if
    p_payment_id is null
    or p_provider_id is null
  then
    raise exception
      'Service listing payment and Provider IDs are required.'
      using errcode = '22023';
  end if;


  if
    p_snap_token is null
    or btrim(p_snap_token) = ''
  then
    raise exception
      'Midtrans Snap token is required.'
      using errcode = '22023';
  end if;


  if
    p_payment_url is null
    or btrim(p_payment_url) = ''
  then
    raise exception
      'Midtrans payment URL is required.'
      using errcode = '22023';
  end if;


  if
    p_payment_expires_at is null
    or p_payment_expires_at <=
      v_now
  then
    raise exception
      'Payment expiry must be in the future.'
      using errcode = '22023';
  end if;


  select
    slp.payment_status

  into
    v_status

  from public.service_listing_payments
    as slp

  where
    slp.id =
      p_payment_id

    and slp.provider_id =
      p_provider_id

  for update;


  if not found then
    raise exception
      'Service listing payment was not found.'
      using errcode = 'P0002';
  end if;


  if
    v_status =
      'PENDING'
  then
    return false;
  end if;


  if
    v_status <>
      'CREATING'
  then
    raise exception
      'Service listing payment checkout cannot be finalized in its current state.'
      using errcode = '55000';
  end if;


  update
    public.service_listing_payments

  set
    snap_token =
      btrim(p_snap_token),

    payment_url =
      btrim(p_payment_url),

    payment_expires_at =
      p_payment_expires_at,

    payment_status =
      'PENDING',

    updated_at =
      v_now

  where
    id =
      p_payment_id

    and provider_id =
      p_provider_id

    and payment_status =
      'CREATING';


  if not found then
    raise exception
      'Service listing payment lifecycle changed concurrently.'
      using errcode = '40001';
  end if;


  return true;
end;
$function$;


revoke all
on function
  public.finalize_service_listing_payment_checkout(
    uuid,
    uuid,
    text,
    text,
    timestamptz
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.finalize_service_listing_payment_checkout(
    uuid,
    uuid,
    text,
    text,
    timestamptz
  )
to service_role;

-- =========================================================
-- 4. FAIL SERVICE LISTING PAYMENT CREATION
--
-- Trusted backend cleanup primitive.
--
-- Used only when the application knows that Midtrans
-- checkout creation did NOT successfully create a payable
-- transaction.
--
-- It releases a CREATING reservation:
--
-- INITIAL_PUBLICATION:
--   PAYMENT_PENDING -> DRAFT
--
-- EXPIRED_RENEWAL:
--   PAYMENT_PENDING -> EXPIRED
--
-- EARLY_RENEWAL:
--   listing lifecycle remains unchanged
--
-- IMPORTANT:
--
-- Do not use this function for an ambiguous network error
-- where Midtrans may actually have created the transaction.
-- That case must be reconciled by Order ID first.
-- =========================================================

create or replace function
  public.fail_service_listing_payment_creation(
    p_payment_id uuid,
    p_provider_id uuid
  )
returns boolean
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_now timestamptz :=
    statement_timestamp();

  v_listing_id uuid;

  v_publication_action text;

  v_payment_status text;

  v_listing_status text;
begin
  if
    p_payment_id is null
    or p_provider_id is null
  then
    raise exception
      'Service listing payment and Provider IDs are required.'
      using errcode = '22023';
  end if;


  -- -------------------------------------------------------
  -- Keep the same publication lock order used by the
  -- reservation/application primitives.
  -- -------------------------------------------------------

  perform
    public.lock_service_provider_publication(
      p_provider_id
    );


  -- -------------------------------------------------------
  -- Obtain listing identity without taking the payment
  -- row lock before the listing row lock.
  -- -------------------------------------------------------

  select
    slp.service_listing_id

  into
    v_listing_id

  from public.service_listing_payments
    as slp

  where
    slp.id =
      p_payment_id

    and slp.provider_id =
      p_provider_id;


  if not found then
    raise exception
      'Service listing payment was not found.'
      using errcode = 'P0002';
  end if;


  -- -------------------------------------------------------
  -- Canonical lock order:
  --
  -- Provider advisory lock
  -- -> listing row
  -- -> payment row
  -- -------------------------------------------------------

  select
    sl.status

  into
    v_listing_status

  from public.service_listings
    as sl

  where
    sl.id =
      v_listing_id

    and sl.provider_id =
      p_provider_id

  for update;


  if not found then
    raise exception
      'Service listing for payment was not found.'
      using errcode = 'P0002';
  end if;


  select
    slp.publication_action,
    slp.payment_status

  into
    v_publication_action,
    v_payment_status

  from public.service_listing_payments
    as slp

  where
    slp.id =
      p_payment_id

    and slp.provider_id =
      p_provider_id

    and slp.service_listing_id =
      v_listing_id

  for update;


  if not found then
    raise exception
      'Service listing payment lifecycle changed concurrently.'
      using errcode = '40001';
  end if;


  /*
   * Already finalized/reconciled payment must never be
   * downgraded because a stale application request reports
   * creation failure.
   */
  if
    v_payment_status <>
      'CREATING'
  then
    return false;
  end if;


  update
    public.service_listing_payments

  set
    payment_status =
      'FAILED',

    midtrans_transaction_id =
      null,

    payment_method =
      null,

    snap_token =
      null,

    payment_url =
      null,

    payment_expires_at =
      null,

    paid_at =
      null,

    failed_at =
      v_now,

    cancelled_at =
      null,

    expired_at =
      null,

    publication_applied_at =
      null,

    updated_at =
      v_now

  where
    id =
      p_payment_id

    and provider_id =
      p_provider_id

    and payment_status =
      'CREATING';


  if not found then
    return false;
  end if;


  -- -------------------------------------------------------
  -- Release any new-slot reservation.
  -- -------------------------------------------------------

  if
    v_publication_action =
      'INITIAL_PUBLICATION'

    and v_listing_status =
      'PAYMENT_PENDING'
  then
    update
      public.service_listings

    set
      status =
        'DRAFT',

      published_at =
        null,

      activated_at =
        null,

      expires_at =
        null,

      paused_at =
        null,

      archived_at =
        null,

      updated_at =
        v_now

    where
      id =
        v_listing_id

      and provider_id =
        p_provider_id;


  elsif
    v_publication_action =
      'EXPIRED_RENEWAL'

    and v_listing_status =
      'PAYMENT_PENDING'
  then
    update
      public.service_listings

    set
      status =
        'EXPIRED',

      paused_at =
        null,

      updated_at =
        v_now

    where
      id =
        v_listing_id

      and provider_id =
        p_provider_id;
  end if;


  /*
   * EARLY_RENEWAL intentionally performs no listing
   * transition because ACTIVE/PAUSED was never replaced
   * by PAYMENT_PENDING.
   */

  return true;
end;
$function$;


revoke all
on function
  public.fail_service_listing_payment_creation(
    uuid,
    uuid
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.fail_service_listing_payment_creation(
    uuid,
    uuid
  )
to service_role;

-- =========================================================
-- 5. APPLY AUTHORITATIVE SERVICE LISTING PAYMENT STATUS
--
-- Trusted canonical transition primitive used by:
-- - webhook
-- - status reconciliation
-- - lifecycle reconciliation
--
-- PAID has highest priority.
--
-- Authoritative PAID may correct:
-- - CREATING
-- - PENDING
-- - FAILED
-- - CANCELLED
-- - EXPIRED
--
-- Once publication_applied_at exists, duplicate PAID is
-- a no-op.
--
-- Non-PAID terminal states may transition only from:
-- - CREATING
-- - PENDING
--
-- Payment transition + publication period + listing
-- lifecycle are committed atomically.
-- =========================================================

create or replace function
  public.apply_service_listing_payment_status(
    p_order_id text,
    p_payment_status text,
    p_transaction_id text,
    p_payment_method text,
    p_paid_at timestamptz,
    p_expired_at timestamptz
  )
returns table (
  transitioned boolean,
  payment_id uuid,
  provider_id uuid,
  service_listing_id uuid,
  payment_status text,
  publication_applied boolean,
  publication_period_id uuid,
  publication_ends_at timestamptz,
  listing_status text
)
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_now timestamptz :=
    statement_timestamp();

  v_payment_id uuid;

  v_provider_id uuid;

  v_listing_id uuid;

  v_current_payment_status text;

  v_action text;

  v_duration_seconds integer;

  v_renewal_base_expires_at
    timestamptz;

  v_renewal_base_status text;

  v_existing_paid_at timestamptz;

  v_publication_applied_at
    timestamptz;

  v_listing_status text;

  v_listing_published_at
    timestamptz;

  v_listing_activated_at
    timestamptz;

  v_listing_expires_at
    timestamptz;

  v_listing_paused_at
    timestamptz;

  v_paid_at timestamptz;

  v_application_time
    timestamptz;

  v_period_id uuid;

  v_starts_at timestamptz;

  v_ends_at timestamptz;

  v_target_status text;
begin
  if
    p_order_id is null
    or btrim(p_order_id) = ''
  then
    raise exception
      'Midtrans order ID is required.'
      using errcode = '22023';
  end if;


  if
    p_payment_status not in (
      'PENDING',
      'PAID',
      'FAILED',
      'CANCELLED',
      'EXPIRED'
    )
  then
    raise exception
      'Unsupported Service listing payment status.'
      using errcode = '22023';
  end if;


  -- -------------------------------------------------------
  -- First lookup obtains Provider scope without taking a
  -- lock in the opposite order used by reservation.
  --
  -- Canonical lock order:
  --
  -- provider advisory lock
  -- -> service listing row
  -- -> service listing payment row
  --
  -- This avoids listing/payment lock-order inversion.
  -- -------------------------------------------------------

  select
    slp.id,
    slp.provider_id,
    slp.service_listing_id

  into
    v_payment_id,
    v_provider_id,
    v_listing_id

  from public.service_listing_payments
    as slp

  where
    slp.midtrans_order_id =
      btrim(p_order_id);


  if not found then
    raise exception
      'Service listing payment was not found.'
      using errcode = 'P0002';
  end if;


  perform
    public.lock_service_provider_publication(
      v_provider_id
    );


  select
    sl.status,
    sl.published_at,
    sl.activated_at,
    sl.expires_at,
    sl.paused_at

  into
    v_listing_status,
    v_listing_published_at,
    v_listing_activated_at,
    v_listing_expires_at,
    v_listing_paused_at

  from public.service_listings
    as sl

  where
    sl.id =
      v_listing_id

    and sl.provider_id =
      v_provider_id

  for update;


  if not found then
    raise exception
      'Service listing for payment was not found.'
      using errcode = 'P0002';
  end if;


  select
    slp.id,
    slp.payment_status,
    slp.publication_action,
    slp.publication_duration_seconds,
    slp.renewal_base_expires_at,
    slp.renewal_base_status,
    slp.paid_at,
    slp.publication_applied_at

  into
    v_payment_id,
    v_current_payment_status,
    v_action,
    v_duration_seconds,
    v_renewal_base_expires_at,
    v_renewal_base_status,
    v_existing_paid_at,
    v_publication_applied_at

  from public.service_listing_payments
    as slp

  where
    slp.midtrans_order_id =
      btrim(p_order_id)

    and slp.provider_id =
      v_provider_id

    and slp.service_listing_id =
      v_listing_id

  for update;


  if not found then
    raise exception
      'Service listing payment lifecycle changed concurrently.'
      using errcode = '40001';
  end if;


  -- -------------------------------------------------------
  -- PENDING from webhook does not create a new local
  -- transition.
  --
  -- CREATING -> PENDING is exclusively finalized by
  -- finalize_service_listing_payment_checkout(), because
  -- PENDING requires the authoritative checkout expiry.
  -- -------------------------------------------------------

  if
    p_payment_status =
      'PENDING'
  then
    return query
    select
      false,
      v_payment_id,
      v_provider_id,
      v_listing_id,
      v_current_payment_status,
      v_publication_applied_at
        is not null,
      null::uuid,
      null::timestamptz,
      v_listing_status;

    return;
  end if;


  -- =====================================================
  -- NON-PAID TERMINAL
  -- =====================================================

  if
    p_payment_status <>
      'PAID'
  then
    if
      v_current_payment_status not in (
        'CREATING',
        'PENDING'
      )
    then
      return query
      select
        false,
        v_payment_id,
        v_provider_id,
        v_listing_id,
        v_current_payment_status,
        false,
        null::uuid,
        null::timestamptz,
        v_listing_status;

      return;
    end if;


    update
      public.service_listing_payments

    set
      payment_status =
        p_payment_status,

      midtrans_transaction_id =
        case
          when
            p_transaction_id is not null
            and btrim(p_transaction_id) <> ''
          then
            btrim(p_transaction_id)

          else
            midtrans_transaction_id
        end,

      payment_method =
        case
          when
            p_payment_method is not null
            and btrim(p_payment_method) <> ''
          then
            btrim(p_payment_method)

          else
            payment_method
        end,

      paid_at =
        null,

      failed_at =
        case
          when
            p_payment_status =
              'FAILED'
          then
            v_now

          else
            null
        end,

      cancelled_at =
        case
          when
            p_payment_status =
              'CANCELLED'
          then
            v_now

          else
            null
        end,

      expired_at =
        case
          when
            p_payment_status =
              'EXPIRED'
          then
            coalesce(
              p_expired_at,
              v_now
            )

          else
            null
        end,

      publication_applied_at =
        null,

      updated_at =
        v_now

    where
      id =
        v_payment_id

      and payment_status in (
        'CREATING',
        'PENDING'
      );


    if not found then
      return query
      select
        false,
        v_payment_id,
        v_provider_id,
        v_listing_id,
        v_current_payment_status,
        false,
        null::uuid,
        null::timestamptz,
        v_listing_status;

      return;
    end if;


    -- -----------------------------------------------------
    -- Release slot reservation when initial/expired
    -- publication payment terminates without PAID.
    -- -----------------------------------------------------

    if
      v_action =
        'INITIAL_PUBLICATION'

      and v_listing_status =
        'PAYMENT_PENDING'
    then
      update
        public.service_listings

      set
        status =
          'DRAFT',

        published_at =
          null,

        activated_at =
          null,

        expires_at =
          null,

        paused_at =
          null,

        archived_at =
          null,

        updated_at =
          v_now

      where
        id =
          v_listing_id

        and provider_id =
          v_provider_id;


      v_listing_status :=
        'DRAFT';


    elsif
      v_action =
        'EXPIRED_RENEWAL'

      and v_listing_status =
        'PAYMENT_PENDING'
    then
      update
        public.service_listings

      set
        status =
          'EXPIRED',

        paused_at =
          null,

        updated_at =
          v_now

      where
        id =
          v_listing_id

        and provider_id =
          v_provider_id;


      v_listing_status :=
        'EXPIRED';
    end if;


    return query
    select
      true,
      v_payment_id,
      v_provider_id,
      v_listing_id,
      p_payment_status,
      false,
      null::uuid,
      null::timestamptz,
      v_listing_status;

    return;
  end if;


  -- =====================================================
  -- PAID
  -- =====================================================

  if
    p_transaction_id is null
    or btrim(p_transaction_id) = ''
    or p_payment_method is null
    or btrim(p_payment_method) = ''
  then
    raise exception
      'Successful Midtrans Service listing payment requires transaction ID and payment method.'
      using errcode = '22023';
  end if;


  -- -------------------------------------------------------
  -- Fully applied duplicate PAID.
  -- -------------------------------------------------------

  if
    v_current_payment_status =
      'PAID'

    and v_publication_applied_at
      is not null
  then
    select
      pp.id,
      pp.ends_at

    into
      v_period_id,
      v_ends_at

    from public.service_listing_publication_periods
      as pp

    where
      pp.service_listing_payment_id =
        v_payment_id;


    return query
    select
      false,
      v_payment_id,
      v_provider_id,
      v_listing_id,
      'PAID'::text,
      true,
      v_period_id,
      v_ends_at,
      v_listing_status;

    return;
  end if;


  v_paid_at :=
    coalesce(
      p_paid_at,
      v_existing_paid_at,
      v_now
    );


  /*
   * publication_applied_at must never be earlier than
   * paid_at due to the M1 consistency constraint.
   *
   * greatest() also tolerates small provider/server
   * clock differences.
   */
  v_application_time :=
    greatest(
      v_now,
      v_paid_at
    );


  -- -------------------------------------------------------
  -- PAID has highest priority.
  --
  -- Clear obsolete terminal timestamps atomically so M3
  -- strict-state constraints remain satisfied.
  -- -------------------------------------------------------

  update
    public.service_listing_payments

  set
    payment_status =
      'PAID',

    midtrans_transaction_id =
      btrim(p_transaction_id),

    payment_method =
      btrim(p_payment_method),

    paid_at =
      v_paid_at,

    failed_at =
      null,

    cancelled_at =
      null,

    expired_at =
      null,

    updated_at =
      v_now

  where
    id =
      v_payment_id

    and payment_status <>
      'PAID';


  -- -------------------------------------------------------
  -- Calculate exact purchased publication period.
  -- -------------------------------------------------------

  if
    v_action =
      'EARLY_RENEWAL'
  then
    if
      v_renewal_base_expires_at
        is null

      or v_renewal_base_status
        not in (
          'ACTIVE',
          'PAUSED'
        )
    then
      raise exception
        'Early renewal payment does not contain a valid renewal base.'
        using errcode = '23514';
    end if;


    v_starts_at :=
      v_renewal_base_expires_at;

  elsif
    v_action in (
      'INITIAL_PUBLICATION',
      'EXPIRED_RENEWAL'
    )
  then
    v_starts_at :=
      v_now;

  else
    raise exception
      'Service listing payment publication action is invalid.'
      using errcode = '23514';
  end if;


  v_ends_at :=
    v_starts_at
    +
    v_duration_seconds
      * interval '1 second';


  -- -------------------------------------------------------
  -- Existing publication period is reused defensively.
  --
  -- Normal execution reaches this block only once because
  -- the payment row is locked and M1 also has a unique
  -- partial index on service_listing_payment_id.
  -- -------------------------------------------------------

  select
    pp.id,
    pp.starts_at,
    pp.ends_at

  into
    v_period_id,
    v_starts_at,
    v_ends_at

  from public.service_listing_publication_periods
    as pp

  where
    pp.service_listing_payment_id =
      v_payment_id;


  if not found then
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
        applied_at,
        created_at
      )

    values (
      v_listing_id,
      v_provider_id,
      'PAYMENT',
      v_action,
      v_payment_id,
      v_duration_seconds,
      v_starts_at,
      v_ends_at,
      v_application_time,
      v_now
    )

    returning
      id
    into
      v_period_id;
  end if;


  -- =====================================================
  -- APPLY LISTING ENTITLEMENT
  -- =====================================================

  if
    v_action =
      'INITIAL_PUBLICATION'
  then
    /*
     * INITIAL publication normally originates from
     * PAYMENT_PENDING or a DRAFT restored after an earlier
     * local terminal result.
     */
    update
      public.service_listings

    set
      status =
        'ACTIVE',

      published_at =
        coalesce(
          published_at,
          v_now
        ),

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
        v_listing_id

      and provider_id =
        v_provider_id;


    v_target_status :=
      'ACTIVE';


  elsif
    v_action =
      'EXPIRED_RENEWAL'
  then
    /*
     * Late PAID must not resurrect a listing that the
     * Provider archived after a prior local terminal result.
     *
     * A BLOCKED listing also stays BLOCKED. Its restoration
     * target becomes ACTIVE because this paid renewal has
     * created a fresh valid publication period.
     */
    if
      v_listing_status =
        'ARCHIVED'
    then
      update
        public.service_listings

      set
        activated_at =
          v_now,

        expires_at =
          v_ends_at,

        paused_at =
          null,

        updated_at =
          v_now

      where
        id =
          v_listing_id

        and provider_id =
          v_provider_id;


      v_target_status :=
        'ARCHIVED';


    elsif
      v_listing_status =
        'BLOCKED'
    then
      update
        public.service_listings

      set
        activated_at =
          v_now,

        expires_at =
          v_ends_at,

        paused_at =
          null,

        blocked_from_status =
          'ACTIVE',

        updated_at =
          v_now

      where
        id =
          v_listing_id

        and provider_id =
          v_provider_id;


      v_target_status :=
        'BLOCKED';


    else
      update
        public.service_listings

      set
        status =
          'ACTIVE',

        published_at =
          coalesce(
            published_at,
            v_now
          ),

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
          v_listing_id

        and provider_id =
          v_provider_id;


      v_target_status :=
        'ACTIVE';
    end if;


  elsif
    v_action =
      'EARLY_RENEWAL'
  then
    /*
     * Preserve current moderation/archive state.
     *
     * If the old publication expired while checkout was
     * open, restore the ACTIVE/PAUSED state captured when
     * the renewal was reserved.
     */
    if
      v_listing_status =
        'ARCHIVED'
    then
      update
        public.service_listings

      set
        expires_at =
          v_ends_at,

        updated_at =
          v_now

      where
        id =
          v_listing_id

        and provider_id =
          v_provider_id;


      v_target_status :=
        'ARCHIVED';


    elsif
      v_listing_status =
        'BLOCKED'
    then
      update
        public.service_listings

      set
        expires_at =
          v_ends_at,

        blocked_from_status =
          v_renewal_base_status,

        updated_at =
          v_now

      where
        id =
          v_listing_id

        and provider_id =
          v_provider_id;


      v_target_status :=
        'BLOCKED';


    elsif
      v_listing_status =
        'EXPIRED'
    then
      update
        public.service_listings

      set
        status =
          v_renewal_base_status,

        expires_at =
          v_ends_at,

        paused_at =
          case
            when
              v_renewal_base_status =
                'PAUSED'
            then
              v_now

            else
              null
          end,

        archived_at =
          null,

        updated_at =
          v_now

      where
        id =
          v_listing_id

        and provider_id =
          v_provider_id;


      v_target_status :=
        v_renewal_base_status;


    elsif
      v_listing_status in (
        'ACTIVE',
        'PAUSED'
      )
    then
      update
        public.service_listings

      set
        expires_at =
          v_ends_at,

        updated_at =
          v_now

      where
        id =
          v_listing_id

        and provider_id =
          v_provider_id;


      v_target_status :=
        v_listing_status;


    else
      raise exception
        'Early renewal cannot be applied to the current Service listing lifecycle.'
        using errcode = '55000';
    end if;
  end if;


  -- -------------------------------------------------------
  -- Final exactly-once marker.
  --
  -- Payment state, period creation, listing entitlement,
  -- and this marker are all part of this same transaction.
  -- -------------------------------------------------------

  update
    public.service_listing_payments

  set
    publication_applied_at =
      v_application_time,

    updated_at =
      v_now

  where
    id =
      v_payment_id

    and publication_applied_at
      is null;


  return query
  select
    true,
    v_payment_id,
    v_provider_id,
    v_listing_id,
    'PAID'::text,
    true,
    v_period_id,
    v_ends_at,
    v_target_status;
end;
$function$;


revoke all
on function
  public.apply_service_listing_payment_status(
    text,
    text,
    text,
    text,
    timestamptz,
    timestamptz
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.apply_service_listing_payment_status(
    text,
    text,
    text,
    text,
    timestamptz,
    timestamptz
  )
to service_role;


-- =========================================================
-- 6. ARCHIVE SAFETY
--
-- Forward-only replacement of M4B archive behavior.
--
-- Preserve existing semantics, but prevent Provider archive
-- while a Service listing publication payment is CREATING
-- or PENDING.
--
-- This prevents an EARLY_RENEWAL checkout from being
-- detached from its listing lifecycle while payment is
-- still payable.
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

  from public.service_listings
    as sl

  where
    sl.id =
      p_listing_id

    and sl.provider_id =
      v_provider_id

  for update;


  if not found then
    raise exception
      'Service listing was not found.'
      using errcode = 'P0002';
  end if;


  if
    v_status =
      'ARCHIVED'
  then
    return p_listing_id;
  end if;


  if
    v_status =
      'BLOCKED'
  then
    raise exception
      'Blocked Service listings cannot be archived by the Provider.'
      using errcode = '42501';
  end if;


  if exists (
    select 1

    from public.service_listing_payments
      as slp

    where
      slp.service_listing_id =
        p_listing_id

      and slp.provider_id =
        v_provider_id

      and slp.payment_status in (
        'CREATING',
        'PENDING'
      )
  ) then
    raise exception
      'Service listing cannot be archived while a publication payment is in progress.'
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
      'Service listing cannot be archived in its current state.'
      using errcode = '55000';
  end if;


  update
    public.service_listings

  set
    status =
      'ARCHIVED',

    archived_at =
      v_now,

    updated_at =
      v_now

  where
    id =
      p_listing_id

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