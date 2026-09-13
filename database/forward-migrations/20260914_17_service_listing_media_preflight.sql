begin;

-- =========================================================
-- M17 - Service Listing media upload preflight
--
-- Purpose:
--   Prevent service-role Storage writes before ownership,
--   Provider access, and editable-listing checks have passed.
--
-- Security:
--   - Browser roles cannot execute this RPC.
--   - Server service derives Provider identity from the
--     authenticated route before invoking this RPC.
--   - Existing M8 metadata RPCs remain the final authority
--     after Storage upload to protect against state races.
-- =========================================================

create or replace function
  public.assert_service_listing_media_upload_target(
    p_listing_id uuid,
    p_provider_id uuid
  )
returns text
language plpgsql
volatile
security definer
set search_path to ''
as $function$
begin
  return
    public.require_editable_service_listing_media_target(
      p_listing_id,
      p_provider_id
    );
end;
$function$;


revoke all
on function
  public.assert_service_listing_media_upload_target(
    uuid,
    uuid
  )
from PUBLIC, anon, authenticated, service_role;


grant execute
on function
  public.assert_service_listing_media_upload_target(
    uuid,
    uuid
  )
to service_role;

commit;