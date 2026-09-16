begin;

-- =========================================================
-- M23 — SERVICE PAYMENT NOTIFICATION DEDUPE FIX
-- =========================================================
--
-- M21 used ON CONFLICT (dedupe_key), but notifications
-- dedupe is enforced by the partial unique index:
--
--   UNIQUE (user_id, dedupe_key)
--   WHERE dedupe_key IS NOT NULL
--
-- Re-align the Service payment notification trigger with the
-- established notification dedupe contract used by M14-M20.
-- =========================================================

create or replace function
  public.notify_service_payment_acknowledgement_change()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_request_id uuid;

  v_customer_id uuid;

  v_provider_id uuid;

  v_recipient_id uuid;

  v_title text;

  v_message text;

  v_type text;

  v_dedupe_suffix text;
begin
  if
    tg_op = 'INSERT'
    and new.status =
      'CUSTOMER_REPORTED_PAID'
  then
    v_type :=
      'SERVICE_PAYMENT_REPORTED';

    v_title :=
      'Pembayaran dilaporkan';

    v_message :=
      'Customer melaporkan pembayaran untuk kamu periksa.';

    v_dedupe_suffix :=
      'reported';

  elsif
    tg_op = 'UPDATE'
    and old.status =
      'CUSTOMER_REPORTED_PAID'
    and new.status =
      'PROVIDER_CONFIRMED'
  then
    v_type :=
      'SERVICE_PAYMENT_CONFIRMED';

    v_title :=
      'Pembayaran dikonfirmasi';

    v_message :=
      'Penyedia telah mengonfirmasi pembayaranmu.';

    v_dedupe_suffix :=
      'confirmed';

  elsif
    tg_op = 'UPDATE'
    and old.status =
      'CUSTOMER_REPORTED_PAID'
    and new.status =
      'PAYMENT_ISSUE'
  then
    v_type :=
      'SERVICE_PAYMENT_ISSUE';

    v_title :=
      'Ada masalah pembayaran';

    v_message :=
      'Penyedia melaporkan masalah pada pembayaranmu.';

    v_dedupe_suffix :=
      'issue';

  else
    return new;
  end if;

  select
    sr.id,
    sr.customer_id,
    sr.provider_id

  into
    v_request_id,
    v_customer_id,
    v_provider_id

  from public.service_agreements as sa

  join public.service_requests as sr
    on sr.id =
      sa.service_request_id

  where
    sa.id =
      new.service_agreement_id;

  if not found then
    raise exception
      'Service payment notification Request was not found.'
      using errcode = 'P0002';
  end if;

  if
    new.status =
      'CUSTOMER_REPORTED_PAID'
  then
    v_recipient_id :=
      v_provider_id;
  else
    v_recipient_id :=
      v_customer_id;
  end if;

  insert into public.notifications (
    user_id,
    title,
    message,
    type,
    category,
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
    '/service-requests/' ||
      v_request_id::text,
    v_request_id,
    'service-payment:' ||
      new.id::text ||
      ':' ||
      v_dedupe_suffix
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


revoke all
on function public.notify_service_payment_acknowledgement_change()
from public;

revoke all
on function public.notify_service_payment_acknowledgement_change()
from anon;

revoke all
on function public.notify_service_payment_acknowledgement_change()
from authenticated;


commit;
