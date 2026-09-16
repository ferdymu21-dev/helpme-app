-- =========================================================
-- M19: SERVICE REQUEST COMPLETION SUBMISSION
-- =========================================================
--
-- Adds the authoritative Provider transition:
--
--   IN_PROGRESS -> SUBMITTED
--
-- Completion proof storage is intentionally not accepted
-- from the browser in this phase. proof_storage_path remains
-- NULL until an authorized Service completion media flow
-- exists.
-- =========================================================


create function public.submit_service_request_work(
  p_request_id uuid,
  p_provider_note text
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

  v_submission_no integer;

  v_submission_id uuid;

  v_provider_note text;

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

  v_provider_note :=
    btrim(
      coalesce(
        p_provider_note,
        ''
      )
    );

  if v_provider_note = '' then
    raise exception
      'Provider completion note is required.'
      using errcode = '22023';
  end if;

  -- Request is the authoritative lifecycle lock.

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

  if v_request_status <> 'IN_PROGRESS' then
    raise exception
      'Work cannot be submitted from the current Service Request state.'
      using errcode = '42501';
  end if;

  -- Submission must remain attached to the currently
  -- approved Agreement.

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
      'An approved Agreement is required before work can be submitted.'
      using errcode = '42501';
  end if;

  -- Request locking serializes submission numbering for
  -- one Service Request.

  select
    coalesce(
      max(scs.submission_no),
      0
    ) + 1

  into
    v_submission_no

  from public.service_completion_submissions as scs

  where
    scs.service_request_id =
      p_request_id;

  insert into public.service_completion_submissions (
    service_request_id,
    service_agreement_id,
    submission_no,
    provider_note,
    proof_storage_path,
    status,
    submitted_at
  )
  values (
    p_request_id,
    v_agreement_id,
    v_submission_no,
    v_provider_note,
    null,
    'SUBMITTED',
    v_now
  )
  returning id
  into v_submission_id;

  update public.service_requests
  set
    status =
      'SUBMITTED',

    submitted_at =
      v_now,

    updated_at =
      v_now

  where
    id =
      p_request_id

    and provider_id =
      v_provider_id

    and status =
      'IN_PROGRESS';

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return p_request_id;
end;
$function$;


-- =========================================================
-- COMPLETION SUBMISSION NOTIFICATION
-- =========================================================
--
-- Notification identity is based on the immutable
-- completion submission row so later resubmissions can
-- generate their own notification.
-- =========================================================

create function public.notify_service_completion_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_customer_id uuid;
begin
  if new.status <> 'SUBMITTED' then
    return new;
  end if;

  select
    sr.customer_id

  into
    v_customer_id

  from public.service_requests as sr

  where
    sr.id =
      new.service_request_id;

  if not found then
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
    v_customer_id,
    'Hasil pekerjaan dikirim',
    'Penyedia mengirim hasil pekerjaan untuk kamu periksa.',
    'SERVICE_COMPLETION_SUBMITTED',
    'SERVICE',
    false,
    '/service-requests/' ||
      new.service_request_id::text,
    new.service_request_id,
    'service-completion:' ||
      new.id::text ||
      ':submitted'
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
  service_completion_submission_notification_trigger
on public.service_completion_submissions;


create trigger
  service_completion_submission_notification_trigger
after insert
on public.service_completion_submissions
for each row
execute function
  public.notify_service_completion_submission();


-- =========================================================
-- FUNCTION ACL
-- =========================================================

revoke all
on function public.submit_service_request_work(
  uuid,
  text
)
from public;

revoke all
on function public.submit_service_request_work(
  uuid,
  text
)
from anon;

grant execute
on function public.submit_service_request_work(
  uuid,
  text
)
to authenticated;

grant execute
on function public.submit_service_request_work(
  uuid,
  text
)
to service_role;