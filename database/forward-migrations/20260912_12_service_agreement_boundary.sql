begin;

-- =========================================================
-- M12: SERVICE REQUEST -> AGREEMENT BOUNDARY
-- =========================================================
--
-- Browser authority:
--   none over service_agreements / payment steps tables.
--
-- Trusted RPC authority:
--   Provider:
--     NEGOTIATING -> AGREEMENT_PENDING through proposal.
--
--   Customer:
--     AGREEMENT_PENDING -> AGREED through approval.
--     AGREEMENT_PENDING -> NEGOTIATING through rejection.
--
-- Agreement versions are append-only during this boundary.
-- A rejected proposal remains REJECTED; the next proposal
-- points to it as its predecessor.
--
-- SUPERSEDED is intentionally outside this migration.
-- =========================================================


-- =========================================================
-- 1. PROVIDER PROPOSES AGREEMENT
-- =========================================================

create function public.propose_service_agreement(
  p_request_id uuid,
  p_scope text,
  p_deliverables text,
  p_total_price bigint,
  p_deadline timestamptz,
  p_revision_terms text,
  p_payment_plan_type text,
  p_payment_steps jsonb,
  p_notes text default null
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

  v_scope text :=
    nullif(
      btrim(
        p_scope
      ),
      ''
    );

  v_deliverables text :=
    nullif(
      btrim(
        p_deliverables
      ),
      ''
    );

  v_revision_terms text :=
    nullif(
      btrim(
        p_revision_terms
      ),
      ''
    );

  v_payment_plan_type text :=
    nullif(
      upper(
        btrim(
          p_payment_plan_type
        )
      ),
      ''
    );

  v_notes text :=
    nullif(
      btrim(
        p_notes
      ),
      ''
    );

  v_previous_agreement_id uuid;

  v_previous_version integer;

  v_previous_status text;

  v_next_version integer;

  v_agreement_id uuid;

  v_step jsonb;

  v_sequence_no integer;

  v_step_label text;

  v_step_amount_numeric numeric;

  v_step_amount bigint;

  v_step_trigger_type text;

  v_step_trigger_note text;

  v_total_step_amount numeric :=
    0;
begin
  v_provider_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  if v_scope is null then
    raise exception
      'Agreement scope is required.'
      using errcode = '22023';
  end if;

  if v_deliverables is null then
    raise exception
      'Agreement deliverables are required.'
      using errcode = '22023';
  end if;

  if
    p_total_price is null
    or p_total_price <= 0
  then
    raise exception
      'Agreement total price must be positive.'
      using errcode = '22023';
  end if;

  if p_deadline is null then
    raise exception
      'Agreement deadline is required.'
      using errcode = '22023';
  end if;

  if v_revision_terms is null then
    raise exception
      'Agreement revision terms are required.'
      using errcode = '22023';
  end if;

  if
    v_payment_plan_type is null
    or v_payment_plan_type not in (
      'AFTER_COMPLETION',
      'DEPOSIT_FINAL',
      'MILESTONES',
      'FULL_UPFRONT'
    )
  then
    raise exception
      'Agreement payment plan type is invalid.'
      using errcode = '22023';
  end if;

  if
    p_payment_steps is null
    or jsonb_typeof(
      p_payment_steps
    ) <> 'array'
    or jsonb_array_length(
      p_payment_steps
    ) = 0
  then
    raise exception
      'Agreement payment steps are required.'
      using errcode = '22023';
  end if;

  -- Serialize all lifecycle changes for this Request.
  --
  -- Provider identity comes from auth context and the
  -- Service Request itself, never from the browser.

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

  if v_request_status <> 'NEGOTIATING' then
    raise exception
      'Agreement cannot be proposed from the current Service Request state.'
      using errcode = '42501';
  end if;

  -- The Request row lock serializes version allocation,
  -- so the browser never chooses version or predecessor.

  select
    sa.id,
    sa.version,
    sa.status

  into
    v_previous_agreement_id,
    v_previous_version,
    v_previous_status

  from public.service_agreements as sa

  where
    sa.service_request_id =
      p_request_id

  order by
    sa.version desc

  limit 1;

  if found then
    if v_previous_status <> 'REJECTED' then
      raise exception
        'A new Agreement version cannot be proposed while the previous Agreement is still active.'
        using errcode = '42501';
    end if;

    if v_previous_version >= 2147483647 then
      raise exception
        'Agreement version limit has been reached.'
        using errcode = '22003';
    end if;

    v_next_version :=
      v_previous_version +
      1;
  else
    v_previous_agreement_id :=
      null;

    v_next_version :=
      1;
  end if;

  insert into public.service_agreements (
    service_request_id,
    version,
    supersedes_agreement_id,
    scope,
    deliverables,
    total_price,
    prior_confirmed_amount,
    deadline,
    revision_terms,
    payment_plan_type,
    notes,
    status,
    proposed_by
  )
  values (
    p_request_id,
    v_next_version,
    v_previous_agreement_id,
    v_scope,
    v_deliverables,
    p_total_price,
    0,
    p_deadline,
    v_revision_terms,
    v_payment_plan_type,
    v_notes,
    'PROPOSED',
    v_provider_id
  )
  returning
    id

  into
    v_agreement_id;

  -- sequence_no is database-derived from array order.
  --
  -- Browser cannot choose arbitrary sequence numbers.

  for
    v_step,
    v_sequence_no
  in
    select
      step.value,
      step.ordinality::integer

    from jsonb_array_elements(
      p_payment_steps
    )
    with ordinality as step(
      value,
      ordinality
    )
  loop
    if jsonb_typeof(
      v_step
    ) <> 'object'
    then
      raise exception
        'Agreement payment step is invalid.'
        using errcode = '22023';
    end if;

    v_step_label :=
      nullif(
        btrim(
          v_step ->> 'label'
        ),
        ''
      );

    if v_step_label is null then
      raise exception
        'Agreement payment step label is required.'
        using errcode = '22023';
    end if;

    if
      not (
        v_step ? 'amount'
      )
      or jsonb_typeof(
        v_step -> 'amount'
      ) <> 'number'
    then
      raise exception
        'Agreement payment step amount is invalid.'
        using errcode = '22023';
    end if;

    v_step_amount_numeric :=
      (
        v_step ->> 'amount'
      )::numeric;

    if
      v_step_amount_numeric <= 0
      or trunc(
        v_step_amount_numeric
      ) <> v_step_amount_numeric
      or v_step_amount_numeric > 9223372036854775807
    then
      raise exception
        'Agreement payment step amount is invalid.'
        using errcode = '22023';
    end if;

    v_step_amount :=
      v_step_amount_numeric::bigint;

    v_step_trigger_type :=
      nullif(
        upper(
          btrim(
            v_step ->> 'trigger_type'
          )
        ),
        ''
      );

    if
      v_step_trigger_type is null
      or v_step_trigger_type not in (
        'UPFRONT',
        'BEFORE_START',
        'MILESTONE',
        'ON_SUBMISSION',
        'AFTER_COMPLETION',
        'CUSTOM'
      )
    then
      raise exception
        'Agreement payment step trigger type is invalid.'
        using errcode = '22023';
    end if;

    v_step_trigger_note :=
      nullif(
        btrim(
          v_step ->> 'trigger_note'
        ),
        ''
      );

    if
      v_step_trigger_type = 'CUSTOM'
      and v_step_trigger_note is null
    then
      raise exception
        'Custom payment step trigger note is required.'
        using errcode = '22023';
    end if;

    insert into public.service_agreement_payment_steps (
      service_agreement_id,
      sequence_no,
      label,
      amount,
      trigger_type,
      trigger_note
    )
    values (
      v_agreement_id,
      v_sequence_no,
      v_step_label,
      v_step_amount,
      v_step_trigger_type,
      v_step_trigger_note
    );

    v_total_step_amount :=
      v_total_step_amount +
      v_step_amount_numeric;
  end loop;

  if
    v_total_step_amount <>
      p_total_price::numeric
  then
    raise exception
      'Agreement payment steps must equal the total price.'
      using errcode = '22023';
  end if;

  update public.service_requests
  set
    status =
      'AGREEMENT_PENDING',

    updated_at =
      statement_timestamp()

  where
    id =
      p_request_id

    and provider_id =
      v_provider_id

    and status =
      'NEGOTIATING';

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return v_agreement_id;
end;
$function$;


-- =========================================================
-- 2. PARTICIPANT-SAFE AGREEMENT HISTORY
-- =========================================================

create function public.get_my_service_request_agreements(
  p_request_id uuid
)
returns table (
  id uuid,
  service_request_id uuid,
  version integer,
  supersedes_agreement_id uuid,
  scope text,
  deliverables text,
  total_price bigint,
  prior_confirmed_amount bigint,
  deadline timestamptz,
  revision_terms text,
  payment_plan_type text,
  notes text,
  status text,
  proposed_by uuid,
  approved_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text,
  superseded_at timestamptz,
  created_at timestamptz,
  payment_steps jsonb
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
    sa.id,
    sa.service_request_id,
    sa.version,
    sa.supersedes_agreement_id,
    sa.scope,
    sa.deliverables,
    sa.total_price,
    sa.prior_confirmed_amount,
    sa.deadline,
    sa.revision_terms,
    sa.payment_plan_type,
    sa.notes,
    sa.status,
    sa.proposed_by,
    sa.approved_at,
    sa.rejected_at,
    sa.rejection_reason,
    sa.superseded_at,
    sa.created_at,

    coalesce(
      steps.payment_steps,
      '[]'::jsonb
    )

  from public.service_agreements as sa

  join public.service_requests as sr
    on sr.id =
      sa.service_request_id

  left join lateral (
    select
      jsonb_agg(
        jsonb_build_object(
          'id',
          ps.id,

          'sequence_no',
          ps.sequence_no,

          'label',
          ps.label,

          'amount',
          ps.amount::text,

          'trigger_type',
          ps.trigger_type,

          'trigger_note',
          ps.trigger_note,

          'created_at',
          ps.created_at
        )

        order by
          ps.sequence_no
      ) as payment_steps

    from public.service_agreement_payment_steps as ps

    where
      ps.service_agreement_id =
        sa.id
  ) as steps
    on true

  where
    sa.service_request_id =
      p_request_id

    and (
      sr.customer_id =
        v_actor_id

      or sr.provider_id =
        v_actor_id
    )

  order by
    sa.version desc;
end;
$function$;


-- =========================================================
-- 3. CUSTOMER APPROVES PROPOSAL
-- =========================================================

create function public.approve_service_agreement(
  p_agreement_id uuid
)
returns uuid
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_customer_id uuid;

  v_request_id uuid;

  v_request_status text;

  v_agreement_status text;

  v_now timestamptz :=
    statement_timestamp();
begin
  v_customer_id :=
    public.require_current_service_actor();

  if p_agreement_id is null then
    raise exception
      'Agreement identity is required.'
      using errcode = '22023';
  end if;

  select
    sa.service_request_id

  into
    v_request_id

  from public.service_agreements as sa

  where
    sa.id =
      p_agreement_id;

  if not found then
    raise exception
      'Agreement was not found.'
      using errcode = 'P0002';
  end if;

  -- Lock the Request first. Every M12 mutation follows
  -- the same lock order to minimize deadlock risk.

  select
    sr.status

  into
    v_request_status

  from public.service_requests as sr

  where
    sr.id =
      v_request_id

    and sr.customer_id =
      v_customer_id

  for update;

  if not found then
    raise exception
      'Agreement was not found.'
      using errcode = 'P0002';
  end if;

  if v_request_status <> 'AGREEMENT_PENDING' then
    raise exception
      'Agreement cannot be approved from the current Service Request state.'
      using errcode = '42501';
  end if;

  select
    sa.status

  into
    v_agreement_status

  from public.service_agreements as sa

  where
    sa.id =
      p_agreement_id

    and sa.service_request_id =
      v_request_id

  for update;

  if not found then
    raise exception
      'Agreement was not found.'
      using errcode = 'P0002';
  end if;

  if v_agreement_status <> 'PROPOSED' then
    raise exception
      'Only a proposed Agreement can be approved.'
      using errcode = '42501';
  end if;

  update public.service_agreements
  set
    status =
      'APPROVED',

    approved_at =
      v_now

  where
    id =
      p_agreement_id

    and service_request_id =
      v_request_id

    and status =
      'PROPOSED';

  if not found then
    raise exception
      'Agreement changed concurrently.'
      using errcode = '40001';
  end if;

  update public.service_requests
  set
    status =
      'AGREED',

    agreed_at =
      v_now,

    updated_at =
      v_now

  where
    id =
      v_request_id

    and customer_id =
      v_customer_id

    and status =
      'AGREEMENT_PENDING';

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return p_agreement_id;
end;
$function$;


-- =========================================================
-- 4. CUSTOMER REJECTS PROPOSAL
-- =========================================================

create function public.reject_service_agreement(
  p_agreement_id uuid,
  p_reason text
)
returns uuid
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_customer_id uuid;

  v_request_id uuid;

  v_request_status text;

  v_agreement_status text;

  v_reason text :=
    nullif(
      btrim(
        p_reason
      ),
      ''
    );

  v_now timestamptz :=
    statement_timestamp();
begin
  v_customer_id :=
    public.require_current_service_actor();

  if p_agreement_id is null then
    raise exception
      'Agreement identity is required.'
      using errcode = '22023';
  end if;

  if v_reason is null then
    raise exception
      'Agreement rejection reason is required.'
      using errcode = '22023';
  end if;

  select
    sa.service_request_id

  into
    v_request_id

  from public.service_agreements as sa

  where
    sa.id =
      p_agreement_id;

  if not found then
    raise exception
      'Agreement was not found.'
      using errcode = 'P0002';
  end if;

  select
    sr.status

  into
    v_request_status

  from public.service_requests as sr

  where
    sr.id =
      v_request_id

    and sr.customer_id =
      v_customer_id

  for update;

  if not found then
    raise exception
      'Agreement was not found.'
      using errcode = 'P0002';
  end if;

  if v_request_status <> 'AGREEMENT_PENDING' then
    raise exception
      'Agreement cannot be rejected from the current Service Request state.'
      using errcode = '42501';
  end if;

  select
    sa.status

  into
    v_agreement_status

  from public.service_agreements as sa

  where
    sa.id =
      p_agreement_id

    and sa.service_request_id =
      v_request_id

  for update;

  if not found then
    raise exception
      'Agreement was not found.'
      using errcode = 'P0002';
  end if;

  if v_agreement_status <> 'PROPOSED' then
    raise exception
      'Only a proposed Agreement can be rejected.'
      using errcode = '42501';
  end if;

  update public.service_agreements
  set
    status =
      'REJECTED',

    rejected_at =
      v_now,

    rejection_reason =
      v_reason

  where
    id =
      p_agreement_id

    and service_request_id =
      v_request_id

    and status =
      'PROPOSED';

  if not found then
    raise exception
      'Agreement changed concurrently.'
      using errcode = '40001';
  end if;

  update public.service_requests
  set
    status =
      'NEGOTIATING',

    updated_at =
      v_now

  where
    id =
      v_request_id

    and customer_id =
      v_customer_id

    and status =
      'AGREEMENT_PENDING';

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return p_agreement_id;
end;
$function$;


-- =========================================================
-- 5. RPC EXECUTION ACL
-- =========================================================

revoke all
on function public.propose_service_agreement(
  uuid,
  text,
  text,
  bigint,
  timestamptz,
  text,
  text,
  jsonb,
  text
)
from public;

revoke all
on function public.propose_service_agreement(
  uuid,
  text,
  text,
  bigint,
  timestamptz,
  text,
  text,
  jsonb,
  text
)
from anon;

grant execute
on function public.propose_service_agreement(
  uuid,
  text,
  text,
  bigint,
  timestamptz,
  text,
  text,
  jsonb,
  text
)
to authenticated;

grant execute
on function public.propose_service_agreement(
  uuid,
  text,
  text,
  bigint,
  timestamptz,
  text,
  text,
  jsonb,
  text
)
to service_role;


revoke all
on function public.get_my_service_request_agreements(
  uuid
)
from public;

revoke all
on function public.get_my_service_request_agreements(
  uuid
)
from anon;

grant execute
on function public.get_my_service_request_agreements(
  uuid
)
to authenticated;

grant execute
on function public.get_my_service_request_agreements(
  uuid
)
to service_role;


revoke all
on function public.approve_service_agreement(
  uuid
)
from public;

revoke all
on function public.approve_service_agreement(
  uuid
)
from anon;

grant execute
on function public.approve_service_agreement(
  uuid
)
to authenticated;

grant execute
on function public.approve_service_agreement(
  uuid
)
to service_role;


revoke all
on function public.reject_service_agreement(
  uuid,
  text
)
from public;

revoke all
on function public.reject_service_agreement(
  uuid,
  text
)
from anon;

grant execute
on function public.reject_service_agreement(
  uuid,
  text
)
to authenticated;

grant execute
on function public.reject_service_agreement(
  uuid,
  text
)
to service_role;

commit;
