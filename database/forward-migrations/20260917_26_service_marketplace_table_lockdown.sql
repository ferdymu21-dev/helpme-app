-- F16 security hardening:
-- Restore the browser-role table ACL contract established by M1
-- for the remaining Service Marketplace tables.
--
-- Browser clients must access these resources through the
-- explicitly granted RPC boundary, not direct table privileges.

alter table public.service_requests
  enable row level security;

alter table public.service_agreements
  enable row level security;

alter table public.service_agreement_payment_steps
  enable row level security;

alter table public.service_completion_submissions
  enable row level security;

alter table public.service_disputes
  enable row level security;

alter table public.service_listing_payments
  enable row level security;

alter table public.service_listing_publication_periods
  enable row level security;

revoke all
on table public.service_requests
from anon, authenticated;

revoke all
on table public.service_agreements
from anon, authenticated;

revoke all
on table public.service_agreement_payment_steps
from anon, authenticated;

revoke all
on table public.service_completion_submissions
from anon, authenticated;

revoke all
on table public.service_disputes
from anon, authenticated;

revoke all
on table public.service_listing_payments
from anon, authenticated;

revoke all
on table public.service_listing_publication_periods
from anon, authenticated;