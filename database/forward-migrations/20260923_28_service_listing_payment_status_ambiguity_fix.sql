-- =========================================================
-- M28 - Service Listing Payment Status Ambiguity Fix
-- =========================================================
--
-- Fixes ambiguous PL/pgSQL references to payment_status in
-- apply_service_listing_payment_status().
--
-- The function RETURNS TABLE includes payment_status, while
-- service_listing_payments also contains payment_status.
-- Two UPDATE predicates previously referenced the name
-- without table qualification, causing PostgreSQL to raise:
--
--   column reference "payment_status" is ambiguous
--
-- This forward migration preserves the M9 lifecycle logic
-- and qualifies only those two table-column predicates.
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

      and public.service_listing_payments.payment_status in (
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

    and public.service_listing_payments.payment_status <>
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
