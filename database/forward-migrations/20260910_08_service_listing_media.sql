begin;


-- =========================================================
-- HELPME JASA
-- SERVICE LISTING MEDIA FOUNDATION
--
-- Storage:
--   service-media is publicly readable because published
--   Service Listing images are public marketplace media.
--
-- Browser users receive NO direct Storage write policy
-- from this migration.
--
-- Upload/delete operations are performed only by trusted
-- server code using the service role.
--
-- Metadata:
--   service_listing_images remains inaccessible through
--   direct browser table mutation.
--
-- Provider-owned reads use a self-authenticated RPC.
-- Trusted metadata writes use service_role-only RPCs.
-- =========================================================


-- =========================================================
-- 1. SERVICE MEDIA BUCKET
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'service-media',
  'service-media',
  true,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]::text[]
)
on conflict (id)
do update
set
  name =
    excluded.name,

  public =
    excluded.public,

  file_size_limit =
    excluded.file_size_limit,

  allowed_mime_types =
    excluded.allowed_mime_types;


-- =========================================================
-- 2. INTERNAL MEDIA TARGET VALIDATOR
--
-- Called only from trusted metadata mutation RPCs.
--
-- It:
--   - validates Provider account state
--   - verifies ownership
--   - locks the Service Listing
--   - mirrors editable lifecycle restrictions
--
-- BLOCKED / ARCHIVED listings cannot have their media
-- changed by the Provider.
-- =========================================================

create or replace function
  public.require_editable_service_listing_media_target(
    p_listing_id uuid,
    p_provider_id uuid
  )
returns text
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_status text;

  v_is_banned boolean;

  v_is_suspended boolean;

  v_suspended_until timestamptz;
begin
  select
    u.is_banned,
    u.is_suspended,
    u.suspended_until
  into
    v_is_banned,
    v_is_suspended,
    v_suspended_until
  from public.users as u
  where
    u.id = p_provider_id;

  if not found then
    raise exception
      'Service Provider was not found.'
      using errcode = 'P0002';
  end if;

  if coalesce(
    v_is_banned,
    false
  ) then
    raise exception
      'Service Provider is banned.'
      using errcode = '42501';
  end if;

  if
    coalesce(
      v_is_suspended,
      false
    )
    and (
      v_suspended_until is null
      or v_suspended_until >
        statement_timestamp()
    )
  then
    raise exception
      'Service Provider is suspended.'
      using errcode = '42501';
  end if;

  select
    sl.status
  into
    v_status
  from public.service_listings as sl
  where
    sl.id = p_listing_id
    and sl.provider_id =
      p_provider_id
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
      'Service listing media cannot be edited in its current state.'
      using errcode = '42501';
  end if;

  return v_status;
end;
$function$;


revoke all
on function
  public.require_editable_service_listing_media_target(
    uuid,
    uuid
  )
from PUBLIC, anon, authenticated, service_role;


-- =========================================================
-- 3. PROVIDER-OWNED MEDIA READ
--
-- Safe self-authenticated read used by Edit / Preview.
-- No Provider ID is accepted from the caller.
-- =========================================================

create or replace function
  public.get_my_service_listing_media(
    p_listing_id uuid
  )
returns table (
  id uuid,
  service_listing_id uuid,
  storage_path text,
  kind text,
  sort_order integer,
  created_at timestamptz
)
language sql
stable
security definer
set search_path to ''
as $function$
  select
    sli.id,
    sli.service_listing_id,
    sli.storage_path,
    sli.kind,
    sli.sort_order,
    sli.created_at
  from public.service_listing_images as sli

  join public.service_listings as sl
    on sl.id =
      sli.service_listing_id

  where
    sli.service_listing_id =
      p_listing_id

    and sl.provider_id =
      auth.uid()

  order by
    case
      when sli.kind = 'COVER'
        then 0
      else 1
    end,
    sli.sort_order,
    sli.created_at,
    sli.id;
$function$;


revoke all
on function
  public.get_my_service_listing_media(
    uuid
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.get_my_service_listing_media(
    uuid
  )
to authenticated;


-- =========================================================
-- 4. SET / REPLACE COVER
--
-- Trusted server only.
--
-- Storage path must follow:
--
--   <provider>/<listing>/cover/<random>.<ext>
--
-- Existing COVER metadata is replaced transactionally.
-- The previous Storage path is returned so trusted server
-- code can remove the obsolete object after DB success.
-- =========================================================

create or replace function
  public.set_service_listing_cover(
    p_listing_id uuid,
    p_provider_id uuid,
    p_storage_path text
  )
returns table (
  image_id uuid,
  replaced_storage_path text
)
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_expected_prefix text;

  v_replaced_storage_path text;

  v_image_id uuid;
begin
  perform
    public.require_editable_service_listing_media_target(
      p_listing_id,
      p_provider_id
    );

  if
    p_storage_path is null
    or btrim(
      p_storage_path
    ) = ''
  then
    raise exception
      'Service listing media path is required.'
      using errcode = '22023';
  end if;

  v_expected_prefix :=
    p_provider_id::text
    || '/'
    || p_listing_id::text
    || '/cover/';

  if not (
    p_storage_path like
      v_expected_prefix || '%'
  ) then
    raise exception
      'Service listing cover path is invalid.'
      using errcode = '22023';
  end if;

  select
    sli.storage_path
  into
    v_replaced_storage_path
  from public.service_listing_images as sli
  where
    sli.service_listing_id =
      p_listing_id
    and sli.kind = 'COVER'
  for update;

  delete from
    public.service_listing_images
  where
    service_listing_id =
      p_listing_id
    and kind = 'COVER';

  insert into
    public.service_listing_images (
      service_listing_id,
      storage_path,
      kind,
      sort_order
    )
  values (
    p_listing_id,
    p_storage_path,
    'COVER',
    0
  )
  returning
    id
  into
    v_image_id;

  return query
  select
    v_image_id,
    v_replaced_storage_path;
end;
$function$;


revoke all
on function
  public.set_service_listing_cover(
    uuid,
    uuid,
    text
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.set_service_listing_cover(
    uuid,
    uuid,
    text
  )
to service_role;


-- =========================================================
-- 5. ADD PORTFOLIO IMAGE
--
-- Trusted server only.
--
-- The database selects the first available sort slot
-- between 0 and 4.
--
-- The browser therefore cannot bypass the maximum-five
-- portfolio rule by supplying its own sort order.
-- =========================================================

create or replace function
  public.add_service_listing_portfolio_image(
    p_listing_id uuid,
    p_provider_id uuid,
    p_storage_path text
  )
returns table (
  image_id uuid,
  sort_order integer
)
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_expected_prefix text;

  v_sort_order integer;

  v_image_id uuid;
begin
  perform
    public.require_editable_service_listing_media_target(
      p_listing_id,
      p_provider_id
    );

  if
    p_storage_path is null
    or btrim(
      p_storage_path
    ) = ''
  then
    raise exception
      'Service listing media path is required.'
      using errcode = '22023';
  end if;

  v_expected_prefix :=
    p_provider_id::text
    || '/'
    || p_listing_id::text
    || '/portfolio/';

  if not (
    p_storage_path like
      v_expected_prefix || '%'
  ) then
    raise exception
      'Service listing portfolio path is invalid.'
      using errcode = '22023';
  end if;

  select
    candidate.sort_order
  into
    v_sort_order
  from (
    values
      (0),
      (1),
      (2),
      (3),
      (4)
  ) as candidate(
    sort_order
  )
  where not exists (
    select
      1
    from public.service_listing_images
      as sli
    where
      sli.service_listing_id =
        p_listing_id
      and sli.kind =
        'PORTFOLIO'
      and sli.sort_order =
        candidate.sort_order
  )
  order by
    candidate.sort_order
  limit 1;

  if v_sort_order is null then
    raise exception
      'Service listing portfolio image limit has been reached.'
      using errcode = '54000';
  end if;

  insert into
    public.service_listing_images (
      service_listing_id,
      storage_path,
      kind,
      sort_order
    )
  values (
    p_listing_id,
    p_storage_path,
    'PORTFOLIO',
    v_sort_order
  )
  returning
    id
  into
    v_image_id;

  return query
  select
    v_image_id,
    v_sort_order;
end;
$function$;


revoke all
on function
  public.add_service_listing_portfolio_image(
    uuid,
    uuid,
    text
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.add_service_listing_portfolio_image(
    uuid,
    uuid,
    text
  )
to service_role;


-- =========================================================
-- 6. DELETE SERVICE LISTING IMAGE
--
-- Trusted server only.
--
-- Metadata is removed transactionally and the Storage path
-- is returned so trusted server code can remove the object.
--
-- COVER may be removed while the listing is editable.
-- Publication will independently require a COVER.
-- =========================================================

create or replace function
  public.delete_service_listing_image(
    p_listing_id uuid,
    p_provider_id uuid,
    p_image_id uuid
  )
returns table (
  storage_path text,
  kind text
)
language plpgsql
volatile
security definer
set search_path to ''
as $function$
declare
  v_storage_path text;

  v_kind text;
begin
  perform
    public.require_editable_service_listing_media_target(
      p_listing_id,
      p_provider_id
    );

  select
    sli.storage_path,
    sli.kind
  into
    v_storage_path,
    v_kind
  from public.service_listing_images
    as sli
  where
    sli.id =
      p_image_id
    and sli.service_listing_id =
      p_listing_id
  for update;

  if not found then
    raise exception
      'Service listing image was not found.'
      using errcode = 'P0002';
  end if;

  delete from
    public.service_listing_images
  where
    id = p_image_id
    and service_listing_id =
      p_listing_id;

  if not found then
    raise exception
      'Service listing image changed concurrently.'
      using errcode = '40001';
  end if;

  return query
  select
    v_storage_path,
    v_kind;
end;
$function$;


revoke all
on function
  public.delete_service_listing_image(
    uuid,
    uuid,
    uuid
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.delete_service_listing_image(
    uuid,
    uuid,
    uuid
  )
to service_role;


commit;