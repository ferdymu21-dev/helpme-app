begin;


-- =========================================================
-- SERVICE REQUEST CORE
--
-- Browser users receive no direct CRUD privilege on
-- public.service_requests.
--
-- All participant identity is derived from auth.uid()
-- through require_current_service_actor().
--
-- M11 remains the trusted application boundary for
-- Customer / Provider Service Request operations.
-- =========================================================


-- =========================================================
-- 1. CREATE SERVICE REQUEST
--
-- Customer identity:
--   auth.uid()
--
-- Provider identity:
--   derived from the selected Service Listing.
--
-- Browser input therefore cannot impersonate either side.
--
-- A request can only be created against a Service Listing
-- that is currently public/discoverable:
--
-- - ACTIVE
-- - not expired
-- - Provider not banned
-- - Provider not under an active suspension
--
-- Listing mode:
--   ONLINE  -> request must be ONLINE
--   OFFLINE -> request must be OFFLINE
--   BOTH    -> Customer chooses ONLINE or OFFLINE
--
-- The database partial unique index remains authoritative
-- for one live request per Customer + Service Listing.
-- =========================================================

create or replace function
  public.create_service_request(
    p_listing_id uuid,
    p_request_description text,
    p_needed_at timestamptz,
    p_service_mode text,
    p_location_name text,
    p_budget bigint
  )
returns uuid
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_customer_id uuid;

  v_provider_id uuid;

  v_listing_mode text;

  v_location_name text;

  v_request_id uuid;
begin
  v_customer_id :=
    public.require_current_service_actor();

  if p_listing_id is null then
    raise exception
      'Service Listing identity is required.'
      using errcode = '22023';
  end if;

  if
    p_request_description is null
    or btrim(
      p_request_description
    ) = ''
  then
    raise exception
      'Service Request description is required.'
      using errcode = '22023';
  end if;

  if p_needed_at is null then
    raise exception
      'Service Request needed time is required.'
      using errcode = '22023';
  end if;

  if
    p_service_mode is null
    or p_service_mode not in (
      'ONLINE',
      'OFFLINE'
    )
  then
    raise exception
      'Service Request mode is invalid.'
      using errcode = '22023';
  end if;

  if
    p_budget is not null
    and p_budget <= 0
  then
    raise exception
      'Service Request budget must be greater than zero.'
      using errcode = '22023';
  end if;

  select
    sl.provider_id,
    sl.service_mode
  into
    v_provider_id,
    v_listing_mode
  from public.service_listings as sl

  join public.users as u
    on u.id =
      sl.provider_id

  where
    sl.id =
      p_listing_id

    and sl.status =
      'ACTIVE'

    and sl.expires_at >
      statement_timestamp()

    and not coalesce(
      u.is_banned,
      false
    )

    and not (
      coalesce(
        u.is_suspended,
        false
      )
      and (
        u.suspended_until is null
        or u.suspended_until >
          statement_timestamp()
      )
    )

  for share of sl, u;

  if not found then
    raise exception
      'Service Listing is not available.'
      using errcode = 'P0002';
  end if;

  if v_customer_id = v_provider_id then
    raise exception
      'Provider cannot request their own Service Listing.'
      using errcode = '42501';
  end if;

  if not (
    (
      v_listing_mode = 'ONLINE'
      and p_service_mode = 'ONLINE'
    )
    or
    (
      v_listing_mode = 'OFFLINE'
      and p_service_mode = 'OFFLINE'
    )
    or
    (
      v_listing_mode = 'BOTH'
      and p_service_mode in (
        'ONLINE',
        'OFFLINE'
      )
    )
  ) then
    raise exception
      'Selected Service Request mode is not available for this Service Listing.'
      using errcode = '22023';
  end if;

  if p_service_mode = 'OFFLINE' then
    if
      p_location_name is null
      or btrim(
        p_location_name
      ) = ''
    then
      raise exception
        'Location is required for an offline Service Request.'
        using errcode = '22023';
    end if;

    v_location_name :=
      btrim(
        p_location_name
      );
  else
    v_location_name :=
      null;
  end if;

  begin
    insert into public.service_requests (
      service_listing_id,
      customer_id,
      provider_id,
      request_description,
      needed_at,
      service_mode,
      location_name,
      budget,
      status
    )
    values (
      p_listing_id,
      v_customer_id,
      v_provider_id,
      btrim(
        p_request_description
      ),
      p_needed_at,
      p_service_mode,
      v_location_name,
      p_budget,
      'PENDING_PROVIDER'
    )
    returning id
    into v_request_id;

  exception
    when unique_violation then
      raise exception
        'A live Service Request already exists for this Service Listing.'
        using errcode = '23505';
  end;

  return v_request_id;
end;
$function$;


revoke all
on function
  public.create_service_request(
    uuid,
    text,
    timestamptz,
    text,
    text,
    bigint
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.create_service_request(
    uuid,
    text,
    timestamptz,
    text,
    text,
    bigint
  )
to authenticated;

-- =========================================================
-- 2. PARTICIPANT-SAFE SERVICE REQUEST DETAIL
--
-- Only the Customer or Provider belonging to the exact
-- Service Request may retrieve it.
--
-- Historical requests remain readable even when the
-- Service Listing itself is no longer public.
--
-- No private account fields are projected.
-- =========================================================

create or replace function
  public.get_my_service_request_detail(
    p_request_id uuid
  )
returns table (
  id uuid,
  service_listing_id uuid,
  customer_id uuid,
  provider_id uuid,
  request_description text,
  needed_at timestamptz,
  service_mode text,
  location_name text,
  budget bigint,
  status text,
  agreed_at timestamptz,
  started_at timestamptz,
  submitted_at timestamptz,
  completed_at timestamptz,
  declined_at timestamptz,
  declined_reason text,
  cancelled_at timestamptz,
  cancelled_by uuid,
  cancellation_reason text,
  created_at timestamptz,
  updated_at timestamptz,
  listing_title text,
  listing_category text,
  listing_cover_storage_path text,
  customer_full_name text,
  customer_username text,
  customer_avatar_url text,
  provider_full_name text,
  provider_username text,
  provider_avatar_url text,
  provider_verification_status text
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
    sr.id,
    sr.service_listing_id,
    sr.customer_id,
    sr.provider_id,
    sr.request_description,
    sr.needed_at,
    sr.service_mode,
    sr.location_name,
    sr.budget,
    sr.status,
    sr.agreed_at,
    sr.started_at,
    sr.submitted_at,
    sr.completed_at,
    sr.declined_at,
    sr.declined_reason,
    sr.cancelled_at,
    sr.cancelled_by,
    sr.cancellation_reason,
    sr.created_at,
    sr.updated_at,
    sl.title,
    sl.category,
    cover.storage_path,
    customer.full_name,
    customer.username,
    customer.avatar_url,
    provider.full_name,
    provider.username,
    provider.avatar_url,
    provider.verification_status

  from public.service_requests as sr

  join public.service_listings as sl
    on sl.id =
      sr.service_listing_id

  join public.users as customer
    on customer.id =
      sr.customer_id

  join public.users as provider
    on provider.id =
      sr.provider_id

  left join lateral (
    select
      sli.storage_path
    from public.service_listing_images as sli
    where
      sli.service_listing_id =
        sr.service_listing_id
      and sli.kind =
        'COVER'
    order by
      sli.sort_order,
      sli.created_at,
      sli.id
    limit 1
  ) as cover
    on true

  where
    sr.id =
      p_request_id

    and (
      sr.customer_id =
        v_actor_id
      or sr.provider_id =
        v_actor_id
    );
end;
$function$;


revoke all
on function
  public.get_my_service_request_detail(
    uuid
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.get_my_service_request_detail(
    uuid
  )
to authenticated;


-- =========================================================
-- 3. CUSTOMER SERVICE REQUEST LIST
--
-- Customer sees only requests where auth.uid() is the
-- authoritative customer_id.
--
-- Optional status filtering is database validated.
-- Pagination:
--   page default      = 1
--   page size default = 20
--   page size max     = 50
-- =========================================================

create or replace function
  public.get_my_customer_service_requests(
    p_page integer default 1,
    p_page_size integer default 20,
    p_status text default null
  )
returns table (
  id uuid,
  service_listing_id uuid,
  customer_id uuid,
  provider_id uuid,
  request_description text,
  needed_at timestamptz,
  service_mode text,
  location_name text,
  budget bigint,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  listing_title text,
  listing_category text,
  listing_cover_storage_path text,
  provider_full_name text,
  provider_username text,
  provider_avatar_url text,
  provider_verification_status text,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  v_customer_id uuid;

  v_page integer :=
    greatest(
      coalesce(
        p_page,
        1
      ),
      1
    );

  v_page_size integer :=
    least(
      greatest(
        coalesce(
          p_page_size,
          20
        ),
        1
      ),
      50
    );

  v_status text :=
    nullif(
      btrim(
        p_status
      ),
      ''
    );
begin
  v_customer_id :=
    public.require_current_service_actor();

  if
    v_status is not null
    and v_status not in (
      'PENDING_PROVIDER',
      'NEGOTIATING',
      'AGREEMENT_PENDING',
      'AGREED',
      'IN_PROGRESS',
      'SUBMITTED',
      'COMPLETED',
      'DECLINED',
      'CANCELLED'
    )
  then
    raise exception
      'Service Request status filter is invalid.'
      using errcode = '22023';
  end if;

  return query
  select
    sr.id,
    sr.service_listing_id,
    sr.customer_id,
    sr.provider_id,
    sr.request_description,
    sr.needed_at,
    sr.service_mode,
    sr.location_name,
    sr.budget,
    sr.status,
    sr.created_at,
    sr.updated_at,
    sl.title,
    sl.category,
    cover.storage_path,
    provider.full_name,
    provider.username,
    provider.avatar_url,
    provider.verification_status,
    count(*) over()::bigint

  from public.service_requests as sr

  join public.service_listings as sl
    on sl.id =
      sr.service_listing_id

  join public.users as provider
    on provider.id =
      sr.provider_id

  left join lateral (
    select
      sli.storage_path
    from public.service_listing_images as sli
    where
      sli.service_listing_id =
        sr.service_listing_id
      and sli.kind =
        'COVER'
    order by
      sli.sort_order,
      sli.created_at,
      sli.id
    limit 1
  ) as cover
    on true

  where
    sr.customer_id =
      v_customer_id

    and (
      v_status is null
      or sr.status =
        v_status
    )

  order by
    sr.created_at desc,
    sr.id desc

  limit v_page_size

  offset (
    (
      v_page - 1
    )
    * v_page_size
  );
end;
$function$;


revoke all
on function
  public.get_my_customer_service_requests(
    integer,
    integer,
    text
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.get_my_customer_service_requests(
    integer,
    integer,
    text
  )
to authenticated;


-- =========================================================
-- 4. PROVIDER SERVICE REQUEST LIST
--
-- Provider sees only requests where auth.uid() is the
-- authoritative provider_id.
--
-- No Customer email, phone, or other private account
-- fields are projected.
-- =========================================================

create or replace function
  public.get_my_provider_service_requests(
    p_page integer default 1,
    p_page_size integer default 20,
    p_status text default null
  )
returns table (
  id uuid,
  service_listing_id uuid,
  customer_id uuid,
  provider_id uuid,
  request_description text,
  needed_at timestamptz,
  service_mode text,
  location_name text,
  budget bigint,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  listing_title text,
  listing_category text,
  listing_cover_storage_path text,
  customer_full_name text,
  customer_username text,
  customer_avatar_url text,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  v_provider_id uuid;

  v_page integer :=
    greatest(
      coalesce(
        p_page,
        1
      ),
      1
    );

  v_page_size integer :=
    least(
      greatest(
        coalesce(
          p_page_size,
          20
        ),
        1
      ),
      50
    );

  v_status text :=
    nullif(
      btrim(
        p_status
      ),
      ''
    );
begin
  v_provider_id :=
    public.require_current_service_actor();

  if
    v_status is not null
    and v_status not in (
      'PENDING_PROVIDER',
      'NEGOTIATING',
      'AGREEMENT_PENDING',
      'AGREED',
      'IN_PROGRESS',
      'SUBMITTED',
      'COMPLETED',
      'DECLINED',
      'CANCELLED'
    )
  then
    raise exception
      'Service Request status filter is invalid.'
      using errcode = '22023';
  end if;

  return query
  select
    sr.id,
    sr.service_listing_id,
    sr.customer_id,
    sr.provider_id,
    sr.request_description,
    sr.needed_at,
    sr.service_mode,
    sr.location_name,
    sr.budget,
    sr.status,
    sr.created_at,
    sr.updated_at,
    sl.title,
    sl.category,
    cover.storage_path,
    customer.full_name,
    customer.username,
    customer.avatar_url,
    count(*) over()::bigint

  from public.service_requests as sr

  join public.service_listings as sl
    on sl.id =
      sr.service_listing_id

  join public.users as customer
    on customer.id =
      sr.customer_id

  left join lateral (
    select
      sli.storage_path
    from public.service_listing_images as sli
    where
      sli.service_listing_id =
        sr.service_listing_id
      and sli.kind =
        'COVER'
    order by
      sli.sort_order,
      sli.created_at,
      sli.id
    limit 1
  ) as cover
    on true

  where
    sr.provider_id =
      v_provider_id

    and (
      v_status is null
      or sr.status =
        v_status
    )

  order by
    sr.created_at desc,
    sr.id desc

  limit v_page_size

  offset (
    (
      v_page - 1
    )
    * v_page_size
  );
end;
$function$;


revoke all
on function
  public.get_my_provider_service_requests(
    integer,
    integer,
    text
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.get_my_provider_service_requests(
    integer,
    integer,
    text
  )
to authenticated;

-- =========================================================
-- 5. BEGIN SERVICE REQUEST NEGOTIATION
--
-- Provider only.
--
-- PENDING_PROVIDER -> NEGOTIATING
--
-- Agreement creation belongs to a later authoritative
-- operation and is intentionally not performed here.
-- =========================================================

create or replace function
  public.begin_service_request_negotiation(
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

  v_status text;
begin
  v_provider_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  select
    sr.status
  into
    v_status
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

  if v_status <> 'PENDING_PROVIDER' then
    raise exception
      'Service Request cannot begin negotiation from its current state.'
      using errcode = '42501';
  end if;

  update public.service_requests
  set
    status =
      'NEGOTIATING',

    updated_at =
      statement_timestamp()

  where
    id =
      p_request_id
    and provider_id =
      v_provider_id
    and status =
      'PENDING_PROVIDER';

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return p_request_id;
end;
$function$;


revoke all
on function
  public.begin_service_request_negotiation(
    uuid
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.begin_service_request_negotiation(
    uuid
  )
to authenticated;


-- =========================================================
-- 6. DECLINE SERVICE REQUEST
--
-- Provider only.
--
-- Allowed:
--   PENDING_PROVIDER -> DECLINED
--   NEGOTIATING      -> DECLINED
--
-- Once an Agreement proposal exists, Agreement-aware
-- operations own the next transitions.
-- =========================================================

create or replace function
  public.decline_service_request(
    p_request_id uuid,
    p_reason text
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

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  if
    p_reason is null
    or btrim(
      p_reason
    ) = ''
  then
    raise exception
      'Decline reason is required.'
      using errcode = '22023';
  end if;

  select
    sr.status
  into
    v_status
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

  if v_status not in (
    'PENDING_PROVIDER',
    'NEGOTIATING'
  ) then
    raise exception
      'Service Request cannot be declined from its current state.'
      using errcode = '42501';
  end if;

  update public.service_requests
  set
    status =
      'DECLINED',

    declined_at =
      v_now,

    declined_reason =
      btrim(
        p_reason
      ),

    updated_at =
      v_now

  where
    id =
      p_request_id
    and provider_id =
      v_provider_id
    and status in (
      'PENDING_PROVIDER',
      'NEGOTIATING'
    );

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return p_request_id;
end;
$function$;


revoke all
on function
  public.decline_service_request(
    uuid,
    text
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.decline_service_request(
    uuid,
    text
  )
to authenticated;


-- =========================================================
-- 7. CANCEL EARLY SERVICE REQUEST
--
-- Customer only.
--
-- Allowed:
--   PENDING_PROVIDER -> CANCELLED
--   NEGOTIATING      -> CANCELLED
--
-- Cancellation after Agreement proposal belongs to the
-- Agreement-aware lifecycle and is intentionally excluded
-- from this early Request operation.
-- =========================================================

create or replace function
  public.cancel_service_request(
    p_request_id uuid,
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

  v_status text;

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

  if
    p_reason is null
    or btrim(
      p_reason
    ) = ''
  then
    raise exception
      'Cancellation reason is required.'
      using errcode = '22023';
  end if;

  select
    sr.status
  into
    v_status
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

  if v_status not in (
    'PENDING_PROVIDER',
    'NEGOTIATING'
  ) then
    raise exception
      'Service Request cannot be cancelled from its current state.'
      using errcode = '42501';
  end if;

  update public.service_requests
  set
    status =
      'CANCELLED',

    cancelled_at =
      v_now,

    cancelled_by =
      v_customer_id,

    cancellation_reason =
      btrim(
        p_reason
      ),

    updated_at =
      v_now

  where
    id =
      p_request_id
    and customer_id =
      v_customer_id
    and status in (
      'PENDING_PROVIDER',
      'NEGOTIATING'
    );

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return p_request_id;
end;
$function$;


revoke all
on function
  public.cancel_service_request(
    uuid,
    text
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.cancel_service_request(
    uuid,
    text
  )
to authenticated;


commit;