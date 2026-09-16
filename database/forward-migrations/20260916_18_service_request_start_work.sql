-- =========================================================
-- M18: SERVICE REQUEST START WORK
-- =========================================================
--
-- Adds the authoritative Provider transition:
--
--   AGREED -> IN_PROGRESS
--
-- Pre-start payment steps fail closed:
--   UPFRONT
--   BEFORE_START
--
-- Each such step must have a PROVIDER_CONFIRMED
-- acknowledgement before work may begin.
-- =========================================================


create function public.start_service_request_work(
  p_request_id uuid
)
returns uuid
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_provider_id uuid;

  v_request_status text;

  v_agreement_id uuid;

  v_now timestamptz :=
    statement_timestamp();
begin
  v_provider_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  -- Request is locked first to keep lifecycle mutations
  -- on the same lock ordering convention.

  select
    sr.status

  into
    v_request_status

  from public.service_requests as sr

  where
    sr.id =
      p_request_id

    and sr.provider_id =
      v_provider_id

  for update;

  if not found then
    raise exception
      'Service Request was not found.'
      using errcode = 'P0002';
  end if;

  if v_request_status <> 'AGREED' then
    raise exception
      'Work cannot be started from the current Service Request state.'
      using errcode = '42501';
  end if;

  -- An approved Agreement is authoritative for the work
  -- that the Provider is about to start.

  select
    sa.id

  into
    v_agreement_id

  from public.service_agreements as sa

  where
    sa.service_request_id =
      p_request_id

    and sa.status =
      'APPROVED'

  order by
    sa.version desc

  limit 1

  for update;

  if not found then
    raise exception
      'An approved Agreement is required before work can start.'
      using errcode = '42501';
  end if;

  -- Fail closed for payment steps that must be completed
  -- before work starts.
  --
  -- AFTER_COMPLETION, ON_SUBMISSION, MILESTONE, and CUSTOM
  -- do not automatically block this transition.

  if exists (
    select
      1

    from public.service_agreement_payment_steps as saps

    where
      saps.service_agreement_id =
        v_agreement_id

      and saps.trigger_type in (
        'UPFRONT',
        'BEFORE_START'
      )

      and not exists (
        select
          1

        from public.service_payment_acknowledgements as spa

        where
          spa.payment_step_id =
            saps.id

          and spa.service_agreement_id =
            v_agreement_id

          and spa.status =
            'PROVIDER_CONFIRMED'
      )
  ) then
    raise exception
      'Required pre-start payment has not been confirmed.'
      using errcode = '42501';
  end if;

  update public.service_requests
  set
    status =
      'IN_PROGRESS',

    started_at =
      v_now,

    updated_at =
      v_now

  where
    id =
      p_request_id

    and provider_id =
      v_provider_id

    and status =
      'AGREED';

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return p_request_id;
end;
$function$;


-- =========================================================
-- REQUEST LIFECYCLE NOTIFICATION
-- =========================================================

create or replace function
  public.notify_service_request_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_recipient_id uuid;

  v_title text;

  v_message text;

  v_type text;

  v_dedupe_key text;
begin
  if tg_op = 'INSERT' then
    if new.status <> 'PENDING_PROVIDER' then
      return new;
    end if;

    v_recipient_id :=
      new.provider_id;

    v_title :=
      'Permintaan jasa baru';

    v_message :=
      'Seseorang mengirim permintaan untuk jasamu.';

    v_type :=
      'SERVICE_REQUEST_CREATED';

    v_dedupe_key :=
      'service-request:' ||
      new.id::text ||
      ':created';

  elsif tg_op = 'UPDATE' then
    if
      old.status = 'PENDING_PROVIDER'
      and new.status = 'NEGOTIATING'
    then
      v_recipient_id :=
        new.customer_id;

      v_title :=
        'Penyedia merespons';

      v_message :=
        'Penyedia mulai membahas permintaan jasamu.';

      v_type :=
        'SERVICE_REQUEST_NEGOTIATING';

      v_dedupe_key :=
        'service-request:' ||
        new.id::text ||
        ':negotiating';

    elsif
      old.status = 'AGREED'
      and new.status = 'IN_PROGRESS'
    then
      v_recipient_id :=
        new.customer_id;

      v_title :=
        'Pekerjaan dimulai';

      v_message :=
        'Penyedia mulai mengerjakan permintaan jasamu.';

      v_type :=
        'SERVICE_REQUEST_IN_PROGRESS';

      v_dedupe_key :=
        'service-request:' ||
        new.id::text ||
        ':in-progress';

    elsif
      old.status in (
        'PENDING_PROVIDER',
        'NEGOTIATING'
      )
      and new.status = 'DECLINED'
    then
      v_recipient_id :=
        new.customer_id;

      v_title :=
        'Permintaan jasa ditolak';

      v_message :=
        'Penyedia tidak dapat menerima permintaan jasamu.';

      v_type :=
        'SERVICE_REQUEST_DECLINED';

      v_dedupe_key :=
        'service-request:' ||
        new.id::text ||
        ':declined';

    elsif
      old.status in (
        'PENDING_PROVIDER',
        'NEGOTIATING'
      )
      and new.status = 'CANCELLED'
    then
      v_recipient_id :=
        new.provider_id;

      v_title :=
        'Permintaan jasa dibatalkan';

      v_message :=
        'Pelanggan membatalkan permintaan jasa.';

      v_type :=
        'SERVICE_REQUEST_CANCELLED';

      v_dedupe_key :=
        'service-request:' ||
        new.id::text ||
        ':cancelled';

    else
      return new;
    end if;

  else
    return new;
  end if;

  insert into public.notifications (
    user_id,
    title,
    message,
    type,
    category,
    is_read,
    redirect_url,
    service_request_id,
    dedupe_key
  )
  values (
    v_recipient_id,
    v_title,
    v_message,
    v_type,
    'SERVICE',
    false,
    '/service-requests/' ||
      new.id::text,
    new.id,
    v_dedupe_key
  )
  on conflict (
    user_id,
    dedupe_key
  )
  where
    dedupe_key is not null
  do nothing;

  return new;
end;
$function$;


-- =========================================================
-- FUNCTION ACL
-- =========================================================

revoke all
on function public.start_service_request_work(
  uuid
)
from public;

revoke all
on function public.start_service_request_work(
  uuid
)
from anon;

grant execute
on function public.start_service_request_work(
  uuid
)
to authenticated;

grant execute
on function public.start_service_request_work(
  uuid
)
to service_role;