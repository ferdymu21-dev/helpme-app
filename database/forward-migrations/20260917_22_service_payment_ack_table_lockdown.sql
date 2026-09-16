begin;

-- =========================================================
-- M22 — SERVICE PAYMENT ACKNOWLEDGEMENT TABLE LOCKDOWN
-- =========================================================
--
-- Browser-facing access must remain RPC-only.
--
-- The staging baseline currently contains explicit table
-- privileges for anon/authenticated even though RLS has no
-- browser policies. Reassert the intended defense-in-depth
-- boundary here without changing M21.
-- =========================================================

alter table public.service_payment_acknowledgements
  enable row level security;

revoke all
on table public.service_payment_acknowledgements
from anon, authenticated;

commit;
