-- F16 security hardening:
-- Restore the browser-role table ACL contract established by M1.
--
-- Direct browser access to Service listing storage tables must
-- remain closed. Public/provider reads are exposed only through
-- the explicitly granted SECURITY DEFINER RPC boundary.

alter table public.service_listings
  enable row level security;

alter table public.service_listing_images
  enable row level security;

revoke all
on table public.service_listings
from anon, authenticated;

revoke all
on table public.service_listing_images
from anon, authenticated;