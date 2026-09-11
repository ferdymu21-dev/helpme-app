begin;

set local lock_timeout = '10s';
set local statement_timeout = '60s';


-- =========================================================
-- HELPME JASA
-- M3 — ADDITIONAL CONSTRAINTS & INDEXES
--
-- Forward-only migration.
--
-- This migration contains only stable declarative
-- invariants and supporting indexes.
--
-- Transactional workflow rules that require:
-- - actor authorization
-- - row locking
-- - current time
-- - aggregate validation
-- - cross-row lifecycle transitions
--
-- are intentionally deferred to trusted RPCs.
-- =========================================================


-- =========================================================
-- 1. SERVICE REQUEST PARTICIPANT / LIFECYCLE INVARIANTS
-- =========================================================

-- Required so an agreement can prove that proposed_by
-- is the Provider belonging to this exact Service Request.

alter table public.service_requests
  add constraint service_requests_id_provider_unique
  unique (
    id,
    provider_id
  );


-- cancelled_by, when present, must be one of the two
-- actual transaction participants.

alter table public.service_requests
  add constraint service_requests_cancelled_by_participant_check
  check (
    cancelled_by is null
    or cancelled_by = customer_id
    or cancelled_by = provider_id
  );


-- Forward lifecycle timestamps must exist once a request
-- has reached or passed the corresponding stage.
--
-- CANCELLED may legitimately retain earlier progress
-- timestamps, therefore it is not included here.

alter table public.service_requests
  add constraint service_requests_required_progress_timestamps_check
  check (
    (
      status not in (
        'AGREED',
        'IN_PROGRESS',
        'SUBMITTED',
        'COMPLETED'
      )
      or agreed_at is not null
    )
    and
    (
      status not in (
        'IN_PROGRESS',
        'SUBMITTED',
        'COMPLETED'
      )
      or started_at is not null
    )
    and
    (
      status not in (
        'SUBMITTED',
        'COMPLETED'
      )
      or submitted_at is not null
    )
  );


-- If lifecycle timestamps exist, their chronological
-- order must remain valid.

alter table public.service_requests
  add constraint service_requests_progress_timestamp_order_check
  check (
    (
      agreed_at is null
      or started_at is null
      or started_at >= agreed_at
    )
    and
    (
      started_at is null
      or submitted_at is null
      or submitted_at >= started_at
    )
    and
    (
      submitted_at is null
      or completed_at is null
      or completed_at >= submitted_at
    )
  );


-- DECLINED is terminal. Decline-specific fields must not
-- leak into unrelated request states.

alter table public.service_requests
  add constraint service_requests_declined_fields_strict_check
  check (
    status = 'DECLINED'
    or (
      declined_at is null
      and declined_reason is null
    )
  );


-- CANCELLED is terminal. Cancellation-specific fields must
-- not exist on unrelated request states.

alter table public.service_requests
  add constraint service_requests_cancelled_fields_strict_check
  check (
    status = 'CANCELLED'
    or (
      cancelled_at is null
      and cancelled_by is null
      and cancellation_reason is null
    )
  );


-- =========================================================
-- 2. SERVICE AGREEMENT INVARIANTS
-- =========================================================

-- Provider proposal identity is enforced in the database.
--
-- proposed_by cannot be an arbitrary HelpMe user:
-- they must be the Provider of this exact Service Request.

alter table public.service_agreements
  add constraint service_agreements_proposed_by_provider_fkey
  foreign key (
    service_request_id,
    proposed_by
  )
  references public.service_requests (
    id,
    provider_id
  );


-- Version 1 begins the lineage.
-- Later versions must point to a predecessor belonging
-- to the same request. M1 already enforces same-request FK.

alter table public.service_agreements
  add constraint service_agreements_version_lineage_check
  check (
    (
      version = 1
      and supersedes_agreement_id is null
    )
    or
    (
      version > 1
      and supersedes_agreement_id is not null
    )
  );


-- Agreement outcome timestamps must match its state.
--
-- SUPERSEDED agreements were previously approved, so
-- approved_at intentionally remains populated.

alter table public.service_agreements
  add constraint service_agreements_state_timestamps_strict_check
  check (
    (
      status = 'PROPOSED'
      and approved_at is null
      and rejected_at is null
      and rejection_reason is null
      and superseded_at is null
    )
    or
    (
      status = 'APPROVED'
      and approved_at is not null
      and rejected_at is null
      and rejection_reason is null
      and superseded_at is null
    )
    or
    (
      status = 'REJECTED'
      and approved_at is null
      and rejected_at is not null
      and rejection_reason is not null
      and btrim(rejection_reason) <> ''
      and superseded_at is null
    )
    or
    (
      status = 'SUPERSEDED'
      and approved_at is not null
      and rejected_at is null
      and rejection_reason is null
      and superseded_at is not null
    )
  );


-- =========================================================
-- 3. OFF-PLATFORM PAYMENT ACKNOWLEDGEMENT INVARIANTS
-- =========================================================

-- Every acknowledgement attempt has one clear result.
--
-- A new report after PAYMENT_ISSUE is represented by a
-- NEW attempt row, not by rewriting the old attempt.

alter table public.service_payment_acknowledgements
  add constraint service_payment_ack_state_strict_check
  check (
    (
      status = 'CUSTOMER_REPORTED_PAID'
      and provider_confirmed_at is null
      and issue_reported_at is null
      and issue_reason is null
    )
    or
    (
      status = 'PROVIDER_CONFIRMED'
      and provider_confirmed_at is not null
      and issue_reported_at is null
      and issue_reason is null
    )
    or
    (
      status = 'PAYMENT_ISSUE'
      and provider_confirmed_at is null
      and issue_reported_at is not null
      and issue_reason is not null
      and btrim(issue_reason) <> ''
    )
  );


-- Provider response cannot chronologically precede the
-- Customer's payment report.

alter table public.service_payment_acknowledgements
  add constraint service_payment_ack_response_time_check
  check (
    (
      provider_confirmed_at is null
      or provider_confirmed_at >= customer_reported_at
    )
    and
    (
      issue_reported_at is null
      or issue_reported_at >= customer_reported_at
    )
  );


-- =========================================================
-- 4. COMPLETION SUBMISSION INVARIANTS
-- =========================================================

-- A submission has exactly one lifecycle shape.
--
-- Revision history is represented by subsequent submission
-- rows rather than mixing ACCEPTED and revision metadata
-- in one row.

alter table public.service_completion_submissions
  add constraint service_completion_state_strict_check
  check (
    (
      status = 'SUBMITTED'
      and customer_responded_at is null
      and revision_reason is null
      and revision_requested_at is null
      and accepted_at is null
    )
    or
    (
      status = 'REVISION_REQUESTED'
      and customer_responded_at is not null
      and revision_reason is not null
      and btrim(revision_reason) <> ''
      and revision_requested_at is not null
      and accepted_at is null
    )
    or
    (
      status = 'ACCEPTED'
      and customer_responded_at is not null
      and revision_reason is null
      and revision_requested_at is null
      and accepted_at is not null
    )
  );


alter table public.service_completion_submissions
  add constraint service_completion_response_time_check
  check (
    (
      customer_responded_at is null
      or customer_responded_at >= submitted_at
    )
    and
    (
      revision_requested_at is null
      or revision_requested_at >= submitted_at
    )
    and
    (
      accepted_at is null
      or accepted_at >= submitted_at
    )
  );


-- =========================================================
-- 5. DISPUTE STATE INVARIANTS
-- =========================================================

-- Dispute state-specific metadata must remain coherent.
--
-- review_started_at may remain populated when a dispute
-- is later WITHDRAWN or RESOLVED because it represents
-- historical review activity.

alter table public.service_disputes
  add constraint service_disputes_state_strict_check
  check (
    (
      status = 'OPEN'
      and review_started_at is null
      and withdrawn_at is null
      and withdrawal_reason is null
      and resolution_code is null
      and resolution_summary is null
      and resolved_by is null
      and resolved_at is null
    )
    or
    (
      status = 'UNDER_REVIEW'
      and review_started_at is not null
      and withdrawn_at is null
      and withdrawal_reason is null
      and resolution_code is null
      and resolution_summary is null
      and resolved_by is null
      and resolved_at is null
    )
    or
    (
      status = 'WITHDRAWN'
      and withdrawn_at is not null
      and resolution_code is null
      and resolution_summary is null
      and resolved_by is null
      and resolved_at is null
    )
    or
    (
      status = 'RESOLVED'
      and withdrawn_at is null
      and withdrawal_reason is null
      and resolution_code is not null
      and resolved_by is not null
      and resolved_at is not null
      and resolution_summary is not null
      and btrim(resolution_summary) <> ''
    )
  );


-- =========================================================
-- 6. SERVICE LISTING PAYMENT STATE INVARIANTS
-- =========================================================

-- Local payment state has exactly one terminal outcome.
--
-- A verified PAID reconciliation may correct an earlier
-- local terminal result, but the trusted transaction must
-- clear the obsolete terminal timestamp when doing so.

alter table public.service_listing_payments
  add constraint service_listing_payments_state_strict_check
  check (
    (
      payment_status = 'CREATING'
      and paid_at is null
      and failed_at is null
      and cancelled_at is null
      and expired_at is null
      and publication_applied_at is null
    )
    or
    (
      payment_status = 'PENDING'
      and payment_expires_at is not null
      and paid_at is null
      and failed_at is null
      and cancelled_at is null
      and expired_at is null
      and publication_applied_at is null
    )
    or
    (
      payment_status = 'PAID'
      and paid_at is not null
      and failed_at is null
      and cancelled_at is null
      and expired_at is null
    )
    or
    (
      payment_status = 'FAILED'
      and paid_at is null
      and failed_at is not null
      and cancelled_at is null
      and expired_at is null
      and publication_applied_at is null
    )
    or
    (
      payment_status = 'CANCELLED'
      and paid_at is null
      and failed_at is null
      and cancelled_at is not null
      and expired_at is null
      and publication_applied_at is null
    )
    or
    (
      payment_status = 'EXPIRED'
      and paid_at is null
      and failed_at is null
      and cancelled_at is null
      and expired_at is not null
      and publication_applied_at is null
    )
  );


-- =========================================================
-- 7. SUPPORTING INDEXES
--
-- These indexes support:
-- - foreign-key validation
-- - agreement lineage
-- - agreement payment history
-- - completion lookup
-- - dispute evidence lookup
--
-- They intentionally avoid now()-based predicates.
-- =========================================================

create index service_agreements_supersedes_idx
on public.service_agreements (
  supersedes_agreement_id
)
where supersedes_agreement_id is not null;


create index service_agreements_proposed_by_idx
on public.service_agreements (
  proposed_by
);


create index service_payment_ack_agreement_created_idx
on public.service_payment_acknowledgements (
  service_agreement_id,
  created_at desc
);


create index service_completion_agreement_request_idx
on public.service_completion_submissions (
  service_agreement_id,
  service_request_id
);


create index service_disputes_agreement_request_idx
on public.service_disputes (
  service_agreement_id,
  service_request_id
);


create index service_disputes_payment_ack_agreement_idx
on public.service_disputes (
  payment_acknowledgement_id,
  service_agreement_id
)
where payment_acknowledgement_id is not null;


commit;