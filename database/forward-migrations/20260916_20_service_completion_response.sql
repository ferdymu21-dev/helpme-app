-- =========================================================
-- M20: SERVICE COMPLETION CUSTOMER RESPONSE
-- =========================================================
--
-- Adds:
-- - participant-safe latest completion submission read
-- - Customer revision request
-- - Customer completion acceptance
-- - Provider notifications for both response branches
--
-- Revision:
--   request SUBMITTED -> IN_PROGRESS
--   submission SUBMITTED -> REVISION_REQUESTED
--
-- Acceptance:
--   request SUBMITTED -> COMPLETED
--   submission SUBMITTED -> ACCEPTED
-- =========================================================


-- =========================================================
-- 1. PARTICIPANT-SAFE LATEST COMPLETION READ
-- =========================================================

create function public.get_my_latest_service_completion_submission(
  p_request_id uuid
)
returns table (
  id uuid,
  service_request_id uuid,
  service_agreement_id uuid,
  submission_no integer,
  provider_note text,
  proof_storage_path text,
  status text,
  submitted_at timestamptz,
  customer_responded_at timestamptz,
  revision_reason text,
  revision_requested_at timestamptz,
  accepted_at timestamptz
)
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  v_actor_id uuid;
begin
  v_actor_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  return query
  select
    scs.id,
    scs.service_request_id,
    scs.service_agreement_id,
    scs.submission_no,
    scs.provider_note,
    scs.proof_storage_path,
    scs.status,
    scs.submitted_at,
    scs.customer_responded_at,
    scs.revision_reason,
    scs.revision_requested_at,
    scs.accepted_at

  from public.service_completion_submissions as scs

  join public.service_requests as sr
    on sr.id =
      scs.service_request_id

  where
    scs.service_request_id =
      p_request_id

    and (
      sr.customer_id =
        v_actor_id

      or sr.provider_id =
        v_actor_id
    )

  order by
    scs.submission_no desc

  limit 1;
end;
$function$;


-- =========================================================
-- 2. CUSTOMER REQUESTS REVISION
-- =========================================================

create function public.request_service_completion_revision(
  p_request_id uuid,
  p_revision_reason text
)
returns uuid
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_customer_id uuid;

  v_request_status text;

  v_submission_id uuid;

  v_revision_reason text;

  v_now timestamptz :=
    statement_timestamp();
begin
  v_customer_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  v_revision_reason :=
    btrim(
      coalesce(
        p_revision_reason,
        ''
      )
    );

  if v_revision_reason = '' then
    raise exception
      'Revision reason is required.'
      using errcode = '22023';
  end if;

  select
    sr.status

  into
    v_request_status

  from public.service_requests as sr

  where
    sr.id =
      p_request_id

    and sr.customer_id =
      v_customer_id

  for update;

  if not found then
    raise exception
      'Service Request was not found.'
      using errcode = 'P0002';
  end if;

  if v_request_status <> 'SUBMITTED' then
    raise exception
      'Revision cannot be requested from the current Service Request state.'
      using errcode = '42501';
  end if;

  select
    scs.id

  into
    v_submission_id

  from public.service_completion_submissions as scs

  where
    scs.service_request_id =
      p_request_id

    and scs.status =
      'SUBMITTED'

  order by
    scs.submission_no desc

  limit 1

  for update;

  if not found then
    raise exception
      'An active completion submission is required.'
      using errcode = '42501';
  end if;

  update public.service_completion_submissions
  set
    status =
      'REVISION_REQUESTED',

    customer_responded_at =
      v_now,

    revision_reason =
      v_revision_reason,

    revision_requested_at =
      v_now

  where
    id =
      v_submission_id

    and status =
      'SUBMITTED';

  if not found then
    raise exception
      'Completion submission changed concurrently.'
      using errcode = '40001';
  end if;

  update public.service_requests
  set
    status =
      'IN_PROGRESS',

    updated_at =
      v_now

  where
    id =
      p_request_id

    and customer_id =
      v_customer_id

    and status =
      'SUBMITTED';

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return p_request_id;
end;
$function$;


-- =========================================================
-- 3. CUSTOMER ACCEPTS COMPLETION
-- =========================================================

create function public.accept_service_completion(
  p_request_id uuid
)
returns uuid
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_customer_id uuid;

  v_request_status text;

  v_submission_id uuid;

  v_agreement_id uuid;

  v_now timestamptz :=
    statement_timestamp();
begin
  v_customer_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  select
    sr.status

  into
    v_request_status

  from public.service_requests as sr

  where
    sr.id =
      p_request_id

    and sr.customer_id =
      v_customer_id

  for update;

  if not found then
    raise exception
      'Service Request was not found.'
      using errcode = 'P0002';
  end if;

  if v_request_status <> 'SUBMITTED' then
    raise exception
      'Completion cannot be accepted from the current Service Request state.'
      using errcode = '42501';
  end if;

  select
    scs.id,
    scs.service_agreement_id

  into
    v_submission_id,
    v_agreement_id

  from public.service_completion_submissions as scs

  where
    scs.service_request_id =
      p_request_id

    and scs.status =
      'SUBMITTED'

  order by
    scs.submission_no desc

  limit 1

  for update;

  if not found then
    raise exception
      'An active completion submission is required.'
      using errcode = '42501';
  end if;

  perform 1
  from public.service_agreements as sa
  where
    sa.id =
      v_agreement_id

    and sa.service_request_id =
      p_request_id

    and sa.status =
      'APPROVED';

  if not found then
    raise exception
      'An approved Agreement is required before completion.'
      using errcode = '42501';
  end if;

  if exists (
    select 1

    from public.service_agreement_payment_steps as saps

    where
      saps.service_agreement_id =
        v_agreement_id

      and saps.trigger_type in (
        'UPFRONT',
        'BEFORE_START',
        'MILESTONE',
        'ON_SUBMISSION'
      )

      and not exists (
        select 1

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
      'Required pre-completion payment has not been confirmed.'
      using errcode = '42501';
  end if;

  update public.service_completion_submissions
  set
    status =
      'ACCEPTED',

    customer_responded_at =
      v_now,

    accepted_at =
      v_now

  where
    id =
      v_submission_id

    and status =
      'SUBMITTED';

  if not found then
    raise exception
      'Completion submission changed concurrently.'
      using errcode = '40001';
  end if;

  update public.service_requests
  set
    status =
      'COMPLETED',

    completed_at =
      v_now,

    updated_at =
      v_now

  where
    id =
      p_request_id

    and customer_id =
      v_customer_id

    and status =
      'SUBMITTED';

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return p_request_id;
end;
$function$;


-- =========================================================
-- 4. PROVIDER NOTIFICATION FOR CUSTOMER RESPONSE
-- =========================================================

create function public.notify_service_completion_response()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_provider_id uuid;

  v_title text;

  v_message text;

  v_type text;

  v_dedupe_key text;
begin
  if
    old.status = 'SUBMITTED'
    and new.status = 'REVISION_REQUESTED'
  then
    v_title :=
      'Revisi diminta';

    v_message :=
      'Customer meminta revisi pada hasil pekerjaanmu.';

    v_type :=
      'SERVICE_COMPLETION_REVISION_REQUESTED';

    v_dedupe_key :=
      'service-completion:' ||
      new.id::text ||
      ':revision-requested';

  elsif
    old.status = 'SUBMITTED'
    and new.status = 'ACCEPTED'
  then
    v_title :=
      'Hasil pekerjaan diterima';

    v_message :=
      'Customer menerima hasil pekerjaanmu.';

    v_type :=
      'SERVICE_COMPLETION_ACCEPTED';

    v_dedupe_key :=
      'service-completion:' ||
      new.id::text ||
      ':accepted';

  else
    return new;
  end if;

  select
    sr.provider_id

  into
    v_provider_id

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
    v_provider_id,
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
  service_completion_response_notification_trigger
on public.service_completion_submissions;


create trigger
  service_completion_response_notification_trigger
after update of status
on public.service_completion_submissions
for each row
execute function
  public.notify_service_completion_response();


-- =========================================================
-- 5. ACL
-- =========================================================

revoke all
on function public.get_my_latest_service_completion_submission(
  uuid
)
from public, anon, authenticated, service_role;

grant execute
on function public.get_my_latest_service_completion_submission(
  uuid
)
to authenticated;


revoke all
on function public.request_service_completion_revision(
  uuid,
  text
)
from public, anon, authenticated, service_role;

grant execute
on function public.request_service_completion_revision(
  uuid,
  text
)
to authenticated, service_role;


revoke all
on function public.accept_service_completion(
  uuid
)
from public, anon, authenticated, service_role;

grant execute
on function public.accept_service_completion(
  uuid
)
to authenticated, service_role;