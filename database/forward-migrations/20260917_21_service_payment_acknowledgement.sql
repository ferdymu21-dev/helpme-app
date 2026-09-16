begin;

-- =========================================================
-- M21 Ã¢â‚¬â€ SERVICE PAYMENT ACKNOWLEDGEMENT LIFECYCLE
-- =========================================================
--
-- Off-platform Service payments remain acknowledgement-based.
--
-- Customer:
--   reports that a payment step has been paid.
--
-- Provider:
--   either confirms the payment or reports an issue.
--
-- A retry after PAYMENT_ISSUE creates a NEW acknowledgement
-- attempt row. Historical attempts are never rewritten into
-- new attempts.
--
-- Browser table access remains closed. All participant access
-- is mediated through SECURITY DEFINER RPCs.
-- =========================================================


-- =========================================================
-- 1. PARTICIPANT-SAFE ACKNOWLEDGEMENT HISTORY
-- =========================================================

create function public.get_my_service_payment_acknowledgements(
  p_request_id uuid
)
returns table (
  id uuid,
  payment_step_id uuid,
  service_agreement_id uuid,
  attempt_no integer,
  status text,
  customer_note text,
  customer_reported_at timestamptz,
  provider_confirmed_at timestamptz,
  issue_reported_at timestamptz,
  issue_reason text,
  provider_note text,
  created_at timestamptz,
  updated_at timestamptz
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
    spa.id,
    spa.payment_step_id,
    spa.service_agreement_id,
    spa.attempt_no,
    spa.status,
    spa.customer_note,
    spa.customer_reported_at,
    spa.provider_confirmed_at,
    spa.issue_reported_at,
    spa.issue_reason,
    spa.provider_note,
    spa.created_at,
    spa.updated_at

  from public.service_payment_acknowledgements as spa

  join public.service_agreement_payment_steps as ps
    on ps.id =
      spa.payment_step_id
    and ps.service_agreement_id =
      spa.service_agreement_id

  join public.service_agreements as sa
    on sa.id =
      spa.service_agreement_id

  join public.service_requests as sr
    on sr.id =
      sa.service_request_id

  where
    sr.id =
      p_request_id

    and (
      sr.customer_id =
        v_actor_id

      or sr.provider_id =
        v_actor_id
    )

  order by
    ps.sequence_no,
    spa.attempt_no;
end;
$function$;


-- =========================================================
-- 2. CUSTOMER REPORTS PAYMENT
-- =========================================================

create function public.report_service_payment_paid(
  p_payment_step_id uuid,
  p_customer_note text default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_actor_id uuid;

  v_agreement_id uuid;

  v_request_id uuid;

  v_customer_id uuid;

  v_agreement_status text;

  v_request_status text;

  v_trigger_type text;

  v_customer_note text :=
    nullif(
      btrim(
        p_customer_note
      ),
      ''
    );

  v_attempt_no integer;

  v_acknowledgement_id uuid;

  v_now timestamptz :=
    statement_timestamp();
begin
  v_actor_id :=
    public.require_current_service_actor();

  if p_payment_step_id is null then
    raise exception
      'Service payment step identity is required.'
      using errcode = '22023';
  end if;

  -- Serialize acknowledgement creation per payment step.
  --
  -- Agreement / Request identity and Customer ownership are
  -- derived from authoritative database relations, never
  -- from browser-provided participant identifiers.

  select
    ps.service_agreement_id,
    sa.service_request_id,
    sr.customer_id,
    sa.status,
    sr.status,
    ps.trigger_type

  into
    v_agreement_id,
    v_request_id,
    v_customer_id,
    v_agreement_status,
    v_request_status,
    v_trigger_type

  from public.service_agreement_payment_steps as ps

  join public.service_agreements as sa
    on sa.id =
      ps.service_agreement_id

  join public.service_requests as sr
    on sr.id =
      sa.service_request_id

  where
    ps.id =
      p_payment_step_id

  for update of ps, sa, sr;

  if not found then
    raise exception
      'Service payment step was not found.'
      using errcode = 'P0002';
  end if;

  if v_customer_id <> v_actor_id then
    raise exception
      'Only the Customer can report this Service payment.'
      using errcode = '42501';
  end if;

  if v_agreement_status <> 'APPROVED' then
    raise exception
      'Service Agreement is not approved.'
      using errcode = '55000';
  end if;

  -- Trigger eligibility is enforced on the server.
  --
  -- UPFRONT / BEFORE_START:
  --   available after the Agreement becomes active.
  --
  -- MILESTONE:
  --   work must already be in progress or later.
  --
  -- CUSTOM:
  --   exact timing remains human-defined by trigger_note, so
  --   the server only requires the agreed lifecycle or later.
  --
  -- ON_SUBMISSION:
  --   result must have been submitted (or already completed).
  --
  -- AFTER_COMPLETION:
  --   Request must be fully completed.

  if
    v_trigger_type in (
      'UPFRONT',
      'BEFORE_START',
      'CUSTOM'
    )
    and v_request_status not in (
      'AGREED',
      'IN_PROGRESS',
      'SUBMITTED',
      'COMPLETED'
    )
  then
    raise exception
      'This Service payment step is not available yet.'
      using errcode = '55000';
  end if;

  if
    v_trigger_type = 'MILESTONE'
    and v_request_status not in (
      'IN_PROGRESS',
      'SUBMITTED',
      'COMPLETED'
    )
  then
    raise exception
      'This Service payment milestone is not available yet.'
      using errcode = '55000';
  end if;

  if
    v_trigger_type = 'ON_SUBMISSION'
    and v_request_status not in (
      'SUBMITTED',
      'COMPLETED'
    )
  then
    raise exception
      'This Service payment step is not available yet.'
      using errcode = '55000';
  end if;

  if
    v_trigger_type = 'AFTER_COMPLETION'
    and v_request_status <> 'COMPLETED'
  then
    raise exception
      'This Service payment step is available after completion.'
      using errcode = '55000';
  end if;

  if exists (
    select 1
    from public.service_payment_acknowledgements as spa
    where
      spa.payment_step_id =
        p_payment_step_id
      and spa.status =
        'PROVIDER_CONFIRMED'
  ) then
    raise exception
      'This Service payment has already been confirmed.'
      using errcode = '55000';
  end if;

  if exists (
    select 1
    from public.service_payment_acknowledgements as spa
    where
      spa.payment_step_id =
        p_payment_step_id
      and spa.status =
        'CUSTOMER_REPORTED_PAID'
  ) then
    raise exception
      'This Service payment is already awaiting Provider confirmation.'
      using errcode = '55000';
  end if;

  select
    coalesce(
      max(
        spa.attempt_no
      ),
      0
    ) + 1

  into
    v_attempt_no

  from public.service_payment_acknowledgements as spa

  where
    spa.payment_step_id =
      p_payment_step_id;

  insert into public.service_payment_acknowledgements (
    payment_step_id,
    service_agreement_id,
    attempt_no,
    status,
    customer_note,
    customer_reported_at,
    created_at,
    updated_at
  )
  values (
    p_payment_step_id,
    v_agreement_id,
    v_attempt_no,
    'CUSTOMER_REPORTED_PAID',
    v_customer_note,
    v_now,
    v_now,
    v_now
  )
  returning
    id
  into
    v_acknowledgement_id;

  return
    v_acknowledgement_id;
end;
$function$;


-- =========================================================
-- 3. PROVIDER CONFIRMS PAYMENT
-- =========================================================

create function public.confirm_service_payment(
  p_acknowledgement_id uuid,
  p_provider_note text default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_actor_id uuid;

  v_provider_id uuid;

  v_status text;

  v_provider_note text :=
    nullif(
      btrim(
        p_provider_note
      ),
      ''
    );

  v_now timestamptz :=
    statement_timestamp();
begin
  v_actor_id :=
    public.require_current_service_actor();

  if p_acknowledgement_id is null then
    raise exception
      'Service payment acknowledgement identity is required.'
      using errcode = '22023';
  end if;

  select
    sr.provider_id,
    spa.status

  into
    v_provider_id,
    v_status

  from public.service_payment_acknowledgements as spa

  join public.service_agreements as sa
    on sa.id =
      spa.service_agreement_id

  join public.service_requests as sr
    on sr.id =
      sa.service_request_id

  where
    spa.id =
      p_acknowledgement_id

  for update of spa, sa, sr;

  if not found then
    raise exception
      'Service payment acknowledgement was not found.'
      using errcode = 'P0002';
  end if;

  if v_provider_id <> v_actor_id then
    raise exception
      'Only the Provider can confirm this Service payment.'
      using errcode = '42501';
  end if;

  if v_status <> 'CUSTOMER_REPORTED_PAID' then
    raise exception
      'This Service payment acknowledgement is no longer awaiting confirmation.'
      using errcode = '55000';
  end if;

  update public.service_payment_acknowledgements
  set
    status =
      'PROVIDER_CONFIRMED',

    provider_confirmed_at =
      v_now,

    issue_reported_at =
      null,

    issue_reason =
      null,

    provider_note =
      v_provider_note,

    updated_at =
      v_now

  where
    id =
      p_acknowledgement_id
    and status =
      'CUSTOMER_REPORTED_PAID';

  if not found then
    raise exception
      'Service payment acknowledgement changed concurrently.'
      using errcode = '40001';
  end if;

  return
    p_acknowledgement_id;
end;
$function$;


-- =========================================================
-- 4. PROVIDER REPORTS PAYMENT ISSUE
-- =========================================================

create function public.report_service_payment_issue(
  p_acknowledgement_id uuid,
  p_issue_reason text,
  p_provider_note text default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_actor_id uuid;

  v_provider_id uuid;

  v_status text;

  v_issue_reason text :=
    nullif(
      btrim(
        p_issue_reason
      ),
      ''
    );

  v_provider_note text :=
    nullif(
      btrim(
        p_provider_note
      ),
      ''
    );

  v_now timestamptz :=
    statement_timestamp();
begin
  v_actor_id :=
    public.require_current_service_actor();

  if p_acknowledgement_id is null then
    raise exception
      'Service payment acknowledgement identity is required.'
      using errcode = '22023';
  end if;

  if v_issue_reason is null then
    raise exception
      'Service payment issue reason is required.'
      using errcode = '22023';
  end if;

  select
    sr.provider_id,
    spa.status

  into
    v_provider_id,
    v_status

  from public.service_payment_acknowledgements as spa

  join public.service_agreements as sa
    on sa.id =
      spa.service_agreement_id

  join public.service_requests as sr
    on sr.id =
      sa.service_request_id

  where
    spa.id =
      p_acknowledgement_id

  for update of spa, sa, sr;

  if not found then
    raise exception
      'Service payment acknowledgement was not found.'
      using errcode = 'P0002';
  end if;

  if v_provider_id <> v_actor_id then
    raise exception
      'Only the Provider can report an issue for this Service payment.'
      using errcode = '42501';
  end if;

  if v_status <> 'CUSTOMER_REPORTED_PAID' then
    raise exception
      'This Service payment acknowledgement is no longer awaiting confirmation.'
      using errcode = '55000';
  end if;

  update public.service_payment_acknowledgements
  set
    status =
      'PAYMENT_ISSUE',

    provider_confirmed_at =
      null,

    issue_reported_at =
      v_now,

    issue_reason =
      v_issue_reason,

    provider_note =
      v_provider_note,

    updated_at =
      v_now

  where
    id =
      p_acknowledgement_id
    and status =
      'CUSTOMER_REPORTED_PAID';

  if not found then
    raise exception
      'Service payment acknowledgement changed concurrently.'
      using errcode = '40001';
  end if;

  return
    p_acknowledgement_id;
end;
$function$;


-- =========================================================
-- 5. PAYMENT ACKNOWLEDGEMENT NOTIFICATIONS
-- =========================================================

create function public.notify_service_payment_acknowledgement_change()
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
  -- Ignore state shapes not owned by this lifecycle trigger.

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
    dedupe_key
  )
  do nothing;

  return new;
end;
$function$;


drop trigger if exists
  service_payment_acknowledgement_notification_trigger
on public.service_payment_acknowledgements;


create trigger
  service_payment_acknowledgement_notification_trigger
after insert or update of status
on public.service_payment_acknowledgements
for each row
execute function
  public.notify_service_payment_acknowledgement_change();


-- =========================================================
-- 6. FUNCTION PRIVILEGES
-- =========================================================

revoke all
on function public.get_my_service_payment_acknowledgements(
  uuid
)
from public;

revoke all
on function public.get_my_service_payment_acknowledgements(
  uuid
)
from anon;

grant execute
on function public.get_my_service_payment_acknowledgements(
  uuid
)
to authenticated;


revoke all
on function public.report_service_payment_paid(
  uuid,
  text
)
from public;

revoke all
on function public.report_service_payment_paid(
  uuid,
  text
)
from anon;

grant execute
on function public.report_service_payment_paid(
  uuid,
  text
)
to authenticated;

grant execute
on function public.report_service_payment_paid(
  uuid,
  text
)
to service_role;


revoke all
on function public.confirm_service_payment(
  uuid,
  text
)
from public;

revoke all
on function public.confirm_service_payment(
  uuid,
  text
)
from anon;

grant execute
on function public.confirm_service_payment(
  uuid,
  text
)
to authenticated;

grant execute
on function public.confirm_service_payment(
  uuid,
  text
)
to service_role;


revoke all
on function public.report_service_payment_issue(
  uuid,
  text,
  text
)
from public;

revoke all
on function public.report_service_payment_issue(
  uuid,
  text,
  text
)
from anon;

grant execute
on function public.report_service_payment_issue(
  uuid,
  text,
  text
)
to authenticated;

grant execute
on function public.report_service_payment_issue(
  uuid,
  text,
  text
)
to service_role;


-- Trigger function is not a browser-callable API.

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
