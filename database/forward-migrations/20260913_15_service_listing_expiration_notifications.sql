begin;

-- =========================================================
-- F12 — SERVICE LISTING EXPIRATION NOTIFICATION
-- =========================================================
--
-- Notification creation is database-authoritative.
--
-- This trigger represents publication expiration only.
--
-- It intentionally requires:
--
-- OLD.status IN (ACTIVE, PAUSED)
-- NEW.status = EXPIRED
-- NEW.expires_at <= statement_timestamp()
--
-- This prevents PAYMENT_PENDING -> EXPIRED payment lifecycle
-- transitions from being misclassified as publication expiry.
--
-- Notification dedupe is scoped to the publication period,
-- not only to the listing, so a later renewal can produce
-- its own expiration notification.
--
-- M2 already provides:
-- - notifications.service_listing_id
-- - notifications.dedupe_key
-- - UNIQUE(user_id, dedupe_key)
-- - browser protection for Service notification context.
-- =========================================================

create or replace function
  public.notify_service_listing_expiration()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_publication_period_id uuid;

  v_dedupe_key text;
begin
  if
    old.status not in (
      'ACTIVE',
      'PAUSED'
    )
    or new.status <> 'EXPIRED'
  then
    return new;
  end if;

  if
    new.expires_at is null
    or new.expires_at >
      statement_timestamp()
  then
    return new;
  end if;

  select
    pp.id
  into
    v_publication_period_id
  from
    public.service_listing_publication_periods as pp
  where
    pp.service_listing_id =
      new.id

    and pp.provider_id =
      new.provider_id

    and pp.ends_at =
      new.expires_at
  order by
    pp.applied_at desc,
    pp.created_at desc,
    pp.id desc
  limit 1;

  if
    v_publication_period_id is null
  then
    return new;
  end if;

  v_dedupe_key :=
    'service-listing-publication:' ||
    v_publication_period_id::text ||
    ':expired';

  insert into public.notifications (
    user_id,
    title,
    message,
    type,
    category,
    is_read,
    redirect_url,
    service_listing_id,
    dedupe_key
  )
  values (
    new.provider_id,
    'Masa tayang jasa berakhir',
    'Masa tayang jasamu telah berakhir. Perpanjang publikasi agar jasa tampil kembali.',
    'SERVICE_LISTING_EXPIRED',
    'SERVICE',
    false,
    '/my-services/' ||
      new.id::text ||
      '/preview',
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
  service_listing_expiration_notification_trigger
on public.service_listings;


create trigger
  service_listing_expiration_notification_trigger
after update of status
on public.service_listings
for each row
execute function
  public.notify_service_listing_expiration();


-- Trigger function is not a browser-callable API.

revoke all
on function
  public.notify_service_listing_expiration()
from public,
     anon,
     authenticated;


commit;