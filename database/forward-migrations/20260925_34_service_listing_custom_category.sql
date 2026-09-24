begin;

-- =========================================================
-- M34 - Service Listing custom category persistence
--
-- Adds nullable custom_category storage for the canonical
-- "Lainnya" category without changing existing callers.
--
-- Backward compatibility:
--   - existing create/update RPC signatures remain intact
--   - new overloads accept p_custom_category
--   - provider detail keeps the same input signature and
--     adds one nullable result column
--   - no existing category data is rewritten
-- =========================================================

alter table public.service_listings
  add column if not exists custom_category text;

-- ---------------------------------------------------------
-- Create draft overload with custom category support.
-- ---------------------------------------------------------
create or replace function public.create_service_listing_draft(
  p_title text,
  p_category text,
  p_custom_category text,
  p_description text,
  p_deliverables text,
  p_customer_preparation text,
  p_price_from bigint,
  p_is_negotiable boolean,
  p_service_mode text,
  p_location_name text
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_provider_id uuid;
  v_listing_id uuid;
  v_custom_category text;
begin
  v_provider_id :=
    public.require_current_service_actor();

  v_custom_category :=
    case
      when btrim(p_category) = 'Lainnya'
      then nullif(
        btrim(p_custom_category),
        ''
      )
      else null
    end;

  if
    btrim(p_category) = 'Lainnya'
    and v_custom_category is null
  then
    raise exception
      'Jenis jasa lainnya wajib diisi.'
      using errcode = '22023';
  end if;

  insert into public.service_listings (
    provider_id,
    title,
    category,
    custom_category,
    description,
    deliverables,
    customer_preparation,
    price_from,
    is_negotiable,
    service_mode,
    location_name,
    status
  )
  values (
    v_provider_id,
    btrim(p_title),
    btrim(p_category),
    v_custom_category,
    btrim(p_description),
    btrim(p_deliverables),
    nullif(
      btrim(p_customer_preparation),
      ''
    ),
    p_price_from,
    p_is_negotiable,
    p_service_mode,
    nullif(
      btrim(p_location_name),
      ''
    ),
    'DRAFT'
  )
  returning id
  into v_listing_id;

  return v_listing_id;
end;
$function$;

revoke all on function public.create_service_listing_draft(
  text,
  text,
  text,
  text,
  text,
  text,
  bigint,
  boolean,
  text,
  text
) from public;

grant execute on function public.create_service_listing_draft(
  text,
  text,
  text,
  text,
  text,
  text,
  bigint,
  boolean,
  text,
  text
) to authenticated;

-- ---------------------------------------------------------
-- Update overload with custom category support.
-- ---------------------------------------------------------
create or replace function public.update_service_listing(
  p_listing_id uuid,
  p_title text,
  p_category text,
  p_custom_category text,
  p_description text,
  p_deliverables text,
  p_customer_preparation text,
  p_price_from bigint,
  p_is_negotiable boolean,
  p_service_mode text,
  p_location_name text
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_provider_id uuid;
  v_status text;
  v_custom_category text;
begin
  v_provider_id :=
    public.require_current_service_actor();

  select
    sl.status
  into
    v_status
  from public.service_listings as sl
  where
    sl.id = p_listing_id
    and sl.provider_id = v_provider_id
  for update;

  if not found then
    raise exception
      'Service listing was not found.'
      using errcode = 'P0002';
  end if;

  if v_status in (
    'BLOCKED',
    'ARCHIVED'
  ) then
    raise exception
      'Service listing cannot be edited in its current state.'
      using errcode = '42501';
  end if;

  v_custom_category :=
    case
      when btrim(p_category) = 'Lainnya'
      then nullif(
        btrim(p_custom_category),
        ''
      )
      else null
    end;

  if
    btrim(p_category) = 'Lainnya'
    and v_custom_category is null
  then
    raise exception
      'Jenis jasa lainnya wajib diisi.'
      using errcode = '22023';
  end if;

  update public.service_listings
  set
    title =
      btrim(p_title),

    category =
      btrim(p_category),

    custom_category =
      v_custom_category,

    description =
      btrim(p_description),

    deliverables =
      btrim(p_deliverables),

    customer_preparation =
      nullif(
        btrim(
          p_customer_preparation
        ),
        ''
      ),

    price_from =
      p_price_from,

    is_negotiable =
      p_is_negotiable,

    service_mode =
      p_service_mode,

    location_name =
      nullif(
        btrim(
          p_location_name
        ),
        ''
      ),

    updated_at =
      statement_timestamp()

  where
    id = p_listing_id
    and provider_id = v_provider_id;

  return p_listing_id;
end;
$function$;

revoke all on function public.update_service_listing(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  bigint,
  boolean,
  text,
  text
) from public;

grant execute on function public.update_service_listing(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  bigint,
  boolean,
  text,
  text
) to authenticated;

-- ---------------------------------------------------------
-- Provider detail needs custom_category for Edit form
-- round-trip. The input signature stays unchanged.
-- ---------------------------------------------------------
drop function public.get_my_service_listing_detail(uuid);

create function public.get_my_service_listing_detail(
  p_listing_id uuid
)
returns table(
  id uuid,
  title text,
  category text,
  custom_category text,
  description text,
  deliverables text,
  customer_preparation text,
  price_from bigint,
  is_negotiable boolean,
  service_mode text,
  location_name text,
  status text,
  published_at timestamp with time zone,
  activated_at timestamp with time zone,
  expires_at timestamp with time zone,
  paused_at timestamp with time zone,
  blocked_at timestamp with time zone,
  blocked_reason text,
  blocked_from_status text,
  archived_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  cover_storage_path text
)
language sql
stable
security definer
set search_path to ''
as $function$
  select
    sl.id,
    sl.title,
    sl.category,
    sl.custom_category,
    sl.description,
    sl.deliverables,
    sl.customer_preparation,
    sl.price_from,
    sl.is_negotiable,
    sl.service_mode,
    sl.location_name,
    sl.status,
    sl.published_at,
    sl.activated_at,
    sl.expires_at,
    sl.paused_at,
    sl.blocked_at,
    sl.blocked_reason,
    sl.blocked_from_status,
    sl.archived_at,
    sl.created_at,
    sl.updated_at,
    cover.storage_path
      as cover_storage_path
  from public.service_listings as sl
  left join lateral (
    select
      sli.storage_path
    from public.service_listing_images as sli
    where
      sli.service_listing_id = sl.id
      and sli.kind = 'COVER'
    limit 1
  ) as cover
    on true
  where
    sl.id = p_listing_id
    and sl.provider_id = auth.uid();
$function$;

revoke all on function public.get_my_service_listing_detail(uuid)
  from public;

grant execute on function public.get_my_service_listing_detail(uuid)
  to authenticated;

commit;