begin;

-- =========================================================
-- F10.H — SERVICE REQUEST NOTIFICATIONS
-- =========================================================
--
-- Notification creation is database-authoritative.
--
-- Browser clients never choose:
-- - recipient
-- - notification type
-- - Service Request context
-- - lifecycle transition
-- - dedupe key
--
-- M2 already provides:
-- - notifications.service_request_id
-- - notifications.dedupe_key
-- - UNIQUE(user_id, dedupe_key)
-- - browser protection for Service notification context.
--
-- Request lifecycle notifications:
--   INSERT PENDING_PROVIDER
--     -> Provider
--
--   PENDING_PROVIDER -> NEGOTIATING
--     -> Customer
--
--   PENDING_PROVIDER / NEGOTIATING -> DECLINED
--     -> Customer
--
--   PENDING_PROVIDER / NEGOTIATING -> CANCELLED
--     -> Provider
--
-- Agreement lifecycle notifications:
--   PROPOSED
--     -> Customer
--
--   PROPOSED -> APPROVED
--     -> Provider
--
--   PROPOSED -> REJECTED
--     -> Provider
--
-- Agreement events use agreement identity in dedupe_key so
-- later Agreement versions can create their own notifications.
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


drop trigger if exists
  service_request_notification_trigger
on public.service_requests;


create trigger
  service_request_notification_trigger
after insert
or update of status
on public.service_requests
for each row
execute function
  public.notify_service_request_lifecycle();


create or replace function
  public.notify_service_agreement_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_customer_id uuid;

  v_provider_id uuid;

  v_recipient_id uuid;

  v_title text;

  v_message text;

  v_type text;

  v_dedupe_key text;
begin
  select
    sr.customer_id,
    sr.provider_id
  into
    v_customer_id,
    v_provider_id
  from public.service_requests as sr
  where
    sr.id =
      new.service_request_id;

  if not found then
    raise exception
      'Service Request for Agreement notification was not found.'
      using errcode = '23503';
  end if;

  if tg_op = 'INSERT' then
    if new.status <> 'PROPOSED' then
      return new;
    end if;

    v_recipient_id :=
      v_customer_id;

    v_title :=
      'Proposal kesepakatan baru';

    v_message :=
      'Penyedia mengirim proposal kesepakatan untuk permintaan jasamu.';

    v_type :=
      'SERVICE_AGREEMENT_PROPOSED';

    v_dedupe_key :=
      'service-agreement:' ||
      new.id::text ||
      ':proposed';

  elsif tg_op = 'UPDATE' then
    if
      old.status = 'PROPOSED'
      and new.status = 'APPROVED'
    then
      v_recipient_id :=
        v_provider_id;

      v_title :=
        'Kesepakatan disetujui';

      v_message :=
        'Pelanggan menyetujui proposal kesepakatanmu.';

      v_type :=
        'SERVICE_AGREEMENT_APPROVED';

      v_dedupe_key :=
        'service-agreement:' ||
        new.id::text ||
        ':approved';

    elsif
      old.status = 'PROPOSED'
      and new.status = 'REJECTED'
    then
      v_recipient_id :=
        v_provider_id;

      v_title :=
        'Proposal perlu dibahas lagi';

      v_message :=
        'Pelanggan menolak proposal dan permintaan kembali ke tahap negosiasi.';

      v_type :=
        'SERVICE_AGREEMENT_REJECTED';

      v_dedupe_key :=
        'service-agreement:' ||
        new.id::text ||
        ':rejected';

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
      new.service_request_id::text,
    new.service_request_id,
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


drop trigger if exists
  service_agreement_notification_trigger
on public.service_agreements;


create trigger
  service_agreement_notification_trigger
after insert
or update of status
on public.service_agreements
for each row
execute function
  public.notify_service_agreement_lifecycle();


-- Trigger functions are not browser-callable APIs.
--
-- Trigger execution continues through the table trigger;
-- browser roles receive no direct EXECUTE authority.

revoke all
on function
  public.notify_service_request_lifecycle()
from public,
     anon,
     authenticated;


revoke all
on function
  public.notify_service_agreement_lifecycle()
from public,
     anon,
     authenticated;


commit;