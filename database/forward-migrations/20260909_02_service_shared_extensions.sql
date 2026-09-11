begin;

set local lock_timeout = '10s';
set local statement_timeout = '60s';


-- =========================================================
-- HELPME JASA
-- M2 — SHARED DOMAIN EXTENSIONS
--
-- Forward-only migration.
--
-- Extends existing production tables without replacing
-- the existing Task / Review / Report / Notification
-- architecture.
--
-- Compatibility security is applied in the SAME
-- transaction so new Service columns are never exposed
-- to legacy browser mutation paths without guards.
-- =========================================================


-- =========================================================
-- 1. CONVERSATIONS
--
-- Existing:
-- Task conversation:
--   task_id != null
--   service_request_id = null
--
-- New:
-- Service conversation:
--   task_id = null
--   service_request_id != null
--
-- Service:
-- owner_id  = Customer
-- helper_id = Provider
-- =========================================================

alter table public.conversations
  alter column task_id
  drop not null;


alter table public.conversations
  add column service_request_id uuid;


alter table public.conversations
  add constraint conversations_context_xor_check
  check (
    (
      task_id is not null
      and service_request_id is null
    )
    or
    (
      task_id is null
      and service_request_id is not null
    )
  );


alter table public.conversations
  add constraint conversations_service_request_participants_fkey
  foreign key (
    service_request_id,
    owner_id,
    helper_id
  )
  references public.service_requests (
    id,
    customer_id,
    provider_id
  );


alter table public.conversations
  add constraint conversations_service_request_unique
  unique (
    service_request_id
  );


-- Legacy browser UPDATE is intentionally Task-only.
--
-- Existing Task Chat still directly maintains:
-- - last_message
-- - last_message_at
-- - owner_unread_count
-- - helper_unread_count
--
-- Service Chat will use trusted atomic operations.

drop policy
  "Users can update own conversations"
on public.conversations;


create policy
  "Users can update own conversations"
on public.conversations
for update
to authenticated
using (
  service_request_id is null
  and (
    auth.uid() = owner_id
    or auth.uid() = helper_id
  )
)
with check (
  service_request_id is null
  and (
    auth.uid() = owner_id
    or auth.uid() = helper_id
  )
);


-- Existing column-scoped UPDATE grants are preserved.
--
-- authenticated still has UPDATE only on:
-- last_message
-- last_message_at
-- owner_unread_count
-- helper_unread_count
--
-- service_request_id receives no authenticated
-- UPDATE privilege.


-- =========================================================
-- 2. REVIEWS
--
-- Existing Task reviews remain compatible.
--
-- Service review:
-- customer -> provider
-- exactly one review per completed Service Request.
--
-- Legacy direct browser INSERT stays available for Task
-- temporarily, but cannot create Service reviews.
-- =========================================================

alter table public.reviews
  alter column task_id
  drop not null;


alter table public.reviews
  add column service_request_id uuid;


alter table public.reviews
  add constraint reviews_context_xor_check
  check (
    (
      task_id is not null
      and service_request_id is null
    )
    or
    (
      task_id is null
      and service_request_id is not null
    )
  );


alter table public.reviews
  add constraint reviews_service_request_participants_fkey
  foreign key (
    service_request_id,
    reviewer_id,
    reviewee_id
  )
  references public.service_requests (
    id,
    customer_id,
    provider_id
  );


alter table public.reviews
  add constraint reviews_service_request_unique
  unique (
    service_request_id
  );


-- Remove table-wide INSERT so the newly added
-- service_request_id does not automatically become
-- writable from the browser.

revoke insert
on table public.reviews
from authenticated;


-- Preserve exactly the legacy Task Review INSERT surface.

grant insert (
  id,
  task_id,
  reviewer_id,
  reviewee_id,
  rating,
  comment,
  created_at
)
on table public.reviews
to authenticated;


drop policy
  "Allow authenticated insert reviews"
on public.reviews;


create policy
  "Allow authenticated insert reviews"
on public.reviews
for insert
to authenticated
with check (
  auth.uid() = reviewer_id
  and service_request_id is null
);


-- Service reviews will later be submitted through
-- an authoritative trusted operation.


-- =========================================================
-- 3. REPORTS
--
-- Existing reports may be:
-- - Task report       => task_id != null
-- - User report       => task_id = null
--
-- Service Listing report:
-- - service_listing_id != null
-- - task_id = null
-- - reported_user_id must match listing provider
--
-- We intentionally do NOT alter existing duplicate
-- semantics in this migration.
-- =========================================================

alter table public.reports
  add column service_listing_id uuid;


alter table public.reports
  add constraint reports_content_context_check
  check (
    not (
      task_id is not null
      and service_listing_id is not null
    )
  );


alter table public.reports
  add constraint reports_service_listing_target_required_check
  check (
    service_listing_id is null
    or reported_user_id is not null
  );


alter table public.reports
  add constraint reports_service_listing_target_fkey
  foreign key (
    service_listing_id,
    reported_user_id
  )
  references public.service_listings (
    id,
    provider_id
  );


create index reports_service_listing_id_idx
on public.reports (
  service_listing_id
)
where service_listing_id is not null;


-- Prevent new Service column from inheriting the
-- existing browser INSERT surface.

revoke insert
on table public.reports
from authenticated;


-- Preserve existing Task/User Report browser INSERT
-- columns exactly.

grant insert (
  id,
  reporter_id,
  task_id,
  reason,
  status,
  created_at,
  reported_user_id,
  description,
  reviewed_at,
  admin_notes
)
on table public.reports
to authenticated;


drop policy
  users_can_create_reports
on public.reports;


create policy
  users_can_create_reports
on public.reports
for insert
to authenticated
with check (
  reporter_id = auth.uid()
  and service_listing_id is null
);


-- Service Listing reports will use a trusted
-- server/RPC path later.
--
-- Existing admin UPDATE behavior is intentionally
-- preserved.


-- =========================================================
-- 4. NOTIFICATIONS
--
-- New Service contexts:
-- - service_listing_id
-- - service_request_id
--
-- dedupe_key is server-controlled and must never
-- be writable by legacy authenticated browser paths.
--
-- Existing Task/Campaign notification behavior is
-- retained.
-- =========================================================

alter table public.notifications
  add column service_listing_id uuid
    references public.service_listings(id)
    on delete set null;


alter table public.notifications
  add column service_request_id uuid
    references public.service_requests(id)
    on delete set null;


alter table public.notifications
  add column dedupe_key text;


alter table public.notifications
  add constraint notifications_primary_context_check
  check (
    (
      case
        when task_id is not null
          then 1
        else 0
      end
      +
      case
        when service_listing_id is not null
          then 1
        else 0
      end
      +
      case
        when service_request_id is not null
          then 1
        else 0
      end
    ) <= 1
  );


alter table public.notifications
  add constraint notifications_dedupe_key_not_blank_check
  check (
    dedupe_key is null
    or btrim(dedupe_key) <> ''
  );


create unique index
  notifications_user_dedupe_unique_idx
on public.notifications (
  user_id,
  dedupe_key
)
where dedupe_key is not null;


create index
  notifications_service_listing_idx
on public.notifications (
  service_listing_id
)
where service_listing_id is not null;


create index
  notifications_service_request_idx
on public.notifications (
  service_request_id
)
where service_request_id is not null;


-- ---------------------------------------------------------
-- Notification INSERT compatibility
-- ---------------------------------------------------------
--
-- Remove table-wide INSERT because otherwise future/new
-- Service columns automatically become browser writable.

revoke insert
on table public.notifications
from authenticated;


-- Preserve the complete pre-M2 INSERT column surface,
-- but intentionally exclude:
--
-- service_listing_id
-- service_request_id
-- dedupe_key

grant insert (
  id,
  user_id,
  title,
  message,
  type,
  is_read,
  created_at,
  task_id,
  redirect_url,
  category,
  campaign_id,
  image_url
)
on table public.notifications
to authenticated;


drop policy
  "Users insert own notifications"
on public.notifications;


create policy
  "Users insert own notifications"
on public.notifications
for insert
to authenticated
with check (
  auth.uid() = user_id
  and service_listing_id is null
  and service_request_id is null
  and dedupe_key is null
);


-- ---------------------------------------------------------
-- Notification UPDATE hardening
-- ---------------------------------------------------------
--
-- Source inspection confirmed that the normal browser
-- mutation only needs is_read.
--
-- Remove broad UPDATE privilege and replace it with
-- column-level UPDATE(is_read).

revoke update
on table public.notifications
from authenticated;


grant update (
  is_read
)
on table public.notifications
to authenticated;


-- Existing ownership RLS policy remains:
--
-- auth.uid() = user_id
--
-- Therefore a user can only mark their own
-- notification as read.


commit;