begin;

-- =========================================================
-- HELPME JASA
-- M1 — CORE SERVICE DOMAIN TABLES
--
-- Forward-only migration.
-- Production database remains the schema source of truth.
--
-- This migration intentionally does NOT yet:
-- - alter shared Task tables
-- - create Service RPCs
-- - create Storage buckets
-- - integrate Midtrans
-- - expose public Service discovery
-- =========================================================


-- =========================================================
-- 1. SERVICE LISTINGS
-- =========================================================

create table public.service_listings (
  id uuid
    primary key
    default gen_random_uuid(),

  provider_id uuid
    not null
    references public.users(id),

  title text
    not null,

  category text
    not null,

  description text
    not null,

  deliverables text
    not null,

  customer_preparation text,

  price_from bigint
    not null,

  is_negotiable boolean
    not null
    default false,

  service_mode text
    not null,

  location_name text,

  status text
    not null
    default 'DRAFT',

  published_at timestamptz,

  activated_at timestamptz,

  expires_at timestamptz,

  paused_at timestamptz,

  blocked_at timestamptz,

  blocked_reason text,

  blocked_from_status text,

  archived_at timestamptz,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint service_listings_title_not_blank_check
    check (btrim(title) <> ''),

  constraint service_listings_category_not_blank_check
    check (btrim(category) <> ''),

  constraint service_listings_description_not_blank_check
    check (btrim(description) <> ''),

  constraint service_listings_deliverables_not_blank_check
    check (btrim(deliverables) <> ''),

  constraint service_listings_price_from_positive_check
    check (price_from > 0),

  constraint service_listings_mode_check
    check (
      service_mode in (
        'ONLINE',
        'OFFLINE',
        'BOTH'
      )
    ),

  constraint service_listings_location_check
    check (
      (
        service_mode = 'ONLINE'
        and (
          location_name is null
          or btrim(location_name) <> ''
        )
      )
      or
      (
        service_mode in (
          'OFFLINE',
          'BOTH'
        )
        and location_name is not null
        and btrim(location_name) <> ''
      )
    ),

  constraint service_listings_status_check
    check (
      status in (
        'DRAFT',
        'PAYMENT_PENDING',
        'ACTIVE',
        'PAUSED',
        'EXPIRED',
        'BLOCKED',
        'ARCHIVED'
      )
    ),

  constraint service_listings_blocked_from_status_check
    check (
      blocked_from_status is null
      or blocked_from_status in (
        'ACTIVE',
        'PAUSED',
        'EXPIRED'
      )
    ),

  constraint service_listings_block_state_check
    check (
      (
        status = 'BLOCKED'
        and blocked_at is not null
        and blocked_reason is not null
        and btrim(blocked_reason) <> ''
        and blocked_from_status is not null
      )
      or
      (
        status <> 'BLOCKED'
        and blocked_at is null
        and blocked_reason is null
        and blocked_from_status is null
      )
    ),

  constraint service_listings_draft_state_check
    check (
      status <> 'DRAFT'
      or (
        published_at is null
        and activated_at is null
        and expires_at is null
      )
    ),

  constraint service_listings_publication_state_check
    check (
      status not in (
        'ACTIVE',
        'PAUSED',
        'EXPIRED',
        'BLOCKED',
        'ARCHIVED'
      )
      or (
        published_at is not null
        and activated_at is not null
        and expires_at is not null
      )
    ),

  constraint service_listings_publication_time_check
    check (
      (
        activated_at is null
        and expires_at is null
      )
      or (
        activated_at is not null
        and expires_at is not null
        and expires_at > activated_at
      )
    ),

  constraint service_listings_published_activation_time_check
    check (
      published_at is null
      or activated_at is null
      or published_at <= activated_at
    ),

  constraint service_listings_archived_state_check
    check (
      (
        status = 'ARCHIVED'
        and archived_at is not null
        and published_at is not null
      )
      or
      (
        status <> 'ARCHIVED'
        and archived_at is null
      )
    ),

  constraint service_listings_id_provider_unique
    unique (
      id,
      provider_id
    )
);


-- =========================================================
-- 2. SERVICE LISTING IMAGES
-- =========================================================

create table public.service_listing_images (
  id uuid
    primary key
    default gen_random_uuid(),

  service_listing_id uuid
    not null
    references public.service_listings(id)
    on delete cascade,

  storage_path text
    not null
    unique,

  kind text
    not null,

  sort_order integer
    not null,

  created_at timestamptz
    not null
    default now(),

  constraint service_listing_images_path_not_blank_check
    check (
      btrim(storage_path) <> ''
    ),

  constraint service_listing_images_kind_check
    check (
      kind in (
        'COVER',
        'PORTFOLIO'
      )
    ),

  constraint service_listing_images_sort_order_check
    check (
      (
        kind = 'COVER'
        and sort_order = 0
      )
      or
      (
        kind = 'PORTFOLIO'
        and sort_order between 0 and 4
      )
    ),

  constraint service_listing_images_position_unique
    unique (
      service_listing_id,
      kind,
      sort_order
    )
);


create unique index
  service_listing_images_one_cover_idx
on public.service_listing_images (
  service_listing_id
)
where kind = 'COVER';


-- =========================================================
-- 3. SERVICE REQUESTS
-- =========================================================

create table public.service_requests (
  id uuid
    primary key
    default gen_random_uuid(),

  service_listing_id uuid
    not null,

  customer_id uuid
    not null
    references public.users(id),

  provider_id uuid
    not null
    references public.users(id),

  request_description text
    not null,

  needed_at timestamptz
    not null,

  service_mode text
    not null,

  location_name text,

  budget bigint,

  status text
    not null
    default 'PENDING_PROVIDER',

  agreed_at timestamptz,

  started_at timestamptz,

  submitted_at timestamptz,

  completed_at timestamptz,

  declined_at timestamptz,

  declined_reason text,

  cancelled_at timestamptz,

  cancelled_by uuid
    references public.users(id),

  cancellation_reason text,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint service_requests_listing_provider_fkey
    foreign key (
      service_listing_id,
      provider_id
    )
    references public.service_listings (
      id,
      provider_id
    ),

  constraint service_requests_description_not_blank_check
    check (
      btrim(request_description) <> ''
    ),

  constraint service_requests_mode_check
    check (
      service_mode in (
        'ONLINE',
        'OFFLINE'
      )
    ),

  constraint service_requests_location_check
    check (
      (
        service_mode = 'ONLINE'
        and (
          location_name is null
          or btrim(location_name) <> ''
        )
      )
      or
      (
        service_mode = 'OFFLINE'
        and location_name is not null
        and btrim(location_name) <> ''
      )
    ),

  constraint service_requests_budget_positive_check
    check (
      budget is null
      or budget > 0
    ),

  constraint service_requests_customer_provider_check
    check (
      customer_id <> provider_id
    ),

  constraint service_requests_status_check
    check (
      status in (
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
    ),

  constraint service_requests_declined_state_check
    check (
      status <> 'DECLINED'
      or (
        declined_at is not null
        and declined_reason is not null
        and btrim(declined_reason) <> ''
      )
    ),

  constraint service_requests_cancelled_state_check
    check (
      status <> 'CANCELLED'
      or (
        cancelled_at is not null
        and cancelled_by is not null
        and cancellation_reason is not null
        and btrim(cancellation_reason) <> ''
      )
    ),

  constraint service_requests_completed_state_check
    check (
      status <> 'COMPLETED'
      or completed_at is not null
    ),

  constraint service_requests_id_participants_unique
    unique (
      id,
      customer_id,
      provider_id
    )
);


create unique index
  service_requests_one_live_request_idx
on public.service_requests (
  service_listing_id,
  customer_id
)
where status in (
  'PENDING_PROVIDER',
  'NEGOTIATING',
  'AGREEMENT_PENDING',
  'AGREED',
  'IN_PROGRESS',
  'SUBMITTED'
);


-- =========================================================
-- 4. SERVICE AGREEMENTS
-- =========================================================

create table public.service_agreements (
  id uuid
    primary key
    default gen_random_uuid(),

  service_request_id uuid
    not null
    references public.service_requests(id),

  version integer
    not null,

  supersedes_agreement_id uuid,

  scope text
    not null,

  deliverables text
    not null,

  total_price bigint
    not null,

  prior_confirmed_amount bigint
    not null
    default 0,

  deadline timestamptz
    not null,

  revision_terms text
    not null,

  payment_plan_type text
    not null,

  notes text,

  status text
    not null
    default 'PROPOSED',

  proposed_by uuid
    not null
    references public.users(id),

  approved_at timestamptz,

  rejected_at timestamptz,

  rejection_reason text,

  superseded_at timestamptz,

  created_at timestamptz
    not null
    default now(),

  constraint service_agreements_version_positive_check
    check (
      version > 0
    ),

  constraint service_agreements_scope_not_blank_check
    check (
      btrim(scope) <> ''
    ),

  constraint service_agreements_deliverables_not_blank_check
    check (
      btrim(deliverables) <> ''
    ),

  constraint service_agreements_total_price_positive_check
    check (
      total_price > 0
    ),

  constraint service_agreements_prior_confirmed_amount_check
    check (
      prior_confirmed_amount >= 0
      and prior_confirmed_amount <= total_price
    ),

  constraint service_agreements_revision_terms_not_blank_check
    check (
      btrim(revision_terms) <> ''
    ),

  constraint service_agreements_payment_plan_type_check
    check (
      payment_plan_type in (
        'AFTER_COMPLETION',
        'DEPOSIT_FINAL',
        'MILESTONES',
        'FULL_UPFRONT'
      )
    ),

  constraint service_agreements_status_check
    check (
      status in (
        'PROPOSED',
        'APPROVED',
        'REJECTED',
        'SUPERSEDED'
      )
    ),

  constraint service_agreements_not_self_supersede_check
    check (
      supersedes_agreement_id is null
      or supersedes_agreement_id <> id
    ),

  constraint service_agreements_approved_state_check
    check (
      status <> 'APPROVED'
      or approved_at is not null
    ),

  constraint service_agreements_rejected_state_check
    check (
      status <> 'REJECTED'
      or (
        rejected_at is not null
        and rejection_reason is not null
        and btrim(rejection_reason) <> ''
      )
    ),

  constraint service_agreements_superseded_state_check
    check (
      status <> 'SUPERSEDED'
      or superseded_at is not null
    ),

  constraint service_agreements_request_version_unique
    unique (
      service_request_id,
      version
    ),

    constraint service_agreements_id_request_unique
    unique (
      id,
      service_request_id
    ),

  constraint service_agreements_supersedes_same_request_fkey
    foreign key (
      supersedes_agreement_id,
      service_request_id
    )
    references public.service_agreements (
      id,
      service_request_id
    )
);


create unique index
  service_agreements_one_proposed_idx
on public.service_agreements (
  service_request_id
)
where status = 'PROPOSED';


create unique index
  service_agreements_one_approved_idx
on public.service_agreements (
  service_request_id
)
where status = 'APPROVED';


-- =========================================================
-- 5. SERVICE AGREEMENT PAYMENT STEPS
-- =========================================================

create table public.service_agreement_payment_steps (
  id uuid
    primary key
    default gen_random_uuid(),

  service_agreement_id uuid
    not null
    references public.service_agreements(id),

  sequence_no integer
    not null,

  label text
    not null,

  amount bigint
    not null,

  trigger_type text
    not null,

  trigger_note text,

  created_at timestamptz
    not null
    default now(),

  constraint service_agreement_payment_steps_sequence_positive_check
    check (
      sequence_no > 0
    ),

  constraint service_agreement_payment_steps_label_not_blank_check
    check (
      btrim(label) <> ''
    ),

  constraint service_agreement_payment_steps_amount_positive_check
    check (
      amount > 0
    ),

  constraint service_agreement_payment_steps_trigger_type_check
    check (
      trigger_type in (
        'UPFRONT',
        'BEFORE_START',
        'MILESTONE',
        'ON_SUBMISSION',
        'AFTER_COMPLETION',
        'CUSTOM'
      )
    ),

  constraint service_agreement_payment_steps_custom_note_check
    check (
      trigger_type <> 'CUSTOM'
      or (
        trigger_note is not null
        and btrim(trigger_note) <> ''
      )
    ),

  constraint service_agreement_payment_steps_sequence_unique
    unique (
      service_agreement_id,
      sequence_no
    ),

  constraint service_agreement_payment_steps_id_agreement_unique
    unique (
      id,
      service_agreement_id
    )
);


-- =========================================================
-- 6. SERVICE PAYMENT ACKNOWLEDGEMENTS
-- =========================================================

create table public.service_payment_acknowledgements (
  id uuid
    primary key
    default gen_random_uuid(),

  payment_step_id uuid
    not null,

  service_agreement_id uuid
    not null,

  attempt_no integer
    not null,

  status text
    not null
    default 'CUSTOMER_REPORTED_PAID',

  customer_note text,

  proof_storage_path text
    unique,

  customer_reported_at timestamptz
    not null
    default now(),

  provider_confirmed_at timestamptz,

  issue_reported_at timestamptz,

  issue_reason text,

  provider_note text,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint service_payment_ack_step_agreement_fkey
    foreign key (
      payment_step_id,
      service_agreement_id
    )
    references public.service_agreement_payment_steps (
      id,
      service_agreement_id
    ),

  constraint service_payment_ack_attempt_positive_check
    check (
      attempt_no > 0
    ),

  constraint service_payment_ack_status_check
    check (
      status in (
        'CUSTOMER_REPORTED_PAID',
        'PROVIDER_CONFIRMED',
        'PAYMENT_ISSUE'
      )
    ),

  constraint service_payment_ack_confirmed_state_check
    check (
      status <> 'PROVIDER_CONFIRMED'
      or provider_confirmed_at is not null
    ),

  constraint service_payment_ack_issue_state_check
    check (
      status <> 'PAYMENT_ISSUE'
      or (
        issue_reported_at is not null
        and issue_reason is not null
        and btrim(issue_reason) <> ''
      )
    ),

  constraint service_payment_ack_attempt_unique
    unique (
      payment_step_id,
      attempt_no
    ),

  constraint service_payment_ack_id_agreement_unique
    unique (
      id,
      service_agreement_id
    )
);


create unique index
  service_payment_ack_one_pending_idx
on public.service_payment_acknowledgements (
  payment_step_id
)
where status = 'CUSTOMER_REPORTED_PAID';


create unique index
  service_payment_ack_one_confirmed_idx
on public.service_payment_acknowledgements (
  payment_step_id
)
where status = 'PROVIDER_CONFIRMED';


-- =========================================================
-- 7. SERVICE COMPLETION SUBMISSIONS
-- =========================================================

create table public.service_completion_submissions (
  id uuid
    primary key
    default gen_random_uuid(),

  service_request_id uuid
    not null
    references public.service_requests(id),

  service_agreement_id uuid
    not null,

  submission_no integer
    not null,

  provider_note text
    not null,

  proof_storage_path text
    unique,

  status text
    not null
    default 'SUBMITTED',

  submitted_at timestamptz
    not null
    default now(),

  customer_responded_at timestamptz,

  revision_reason text,

  revision_requested_at timestamptz,

  accepted_at timestamptz,

  created_at timestamptz
    not null
    default now(),

  constraint service_completion_agreement_request_fkey
    foreign key (
      service_agreement_id,
      service_request_id
    )
    references public.service_agreements (
      id,
      service_request_id
    ),

  constraint service_completion_submission_positive_check
    check (
      submission_no > 0
    ),

  constraint service_completion_provider_note_not_blank_check
    check (
      btrim(provider_note) <> ''
    ),

  constraint service_completion_status_check
    check (
      status in (
        'SUBMITTED',
        'REVISION_REQUESTED',
        'ACCEPTED'
      )
    ),

  constraint service_completion_revision_state_check
    check (
      status <> 'REVISION_REQUESTED'
      or (
        customer_responded_at is not null
        and revision_requested_at is not null
        and revision_reason is not null
        and btrim(revision_reason) <> ''
      )
    ),

  constraint service_completion_accepted_state_check
    check (
      status <> 'ACCEPTED'
      or (
        customer_responded_at is not null
        and accepted_at is not null
      )
    ),

  constraint service_completion_submission_unique
    unique (
      service_request_id,
      submission_no
    ),

  constraint service_completion_id_request_unique
    unique (
      id,
      service_request_id
    )
);


create unique index
  service_completion_one_submitted_idx
on public.service_completion_submissions (
  service_request_id
)
where status = 'SUBMITTED';


-- =========================================================
-- 8. SERVICE DISPUTES
-- =========================================================

create table public.service_disputes (
  id uuid
    primary key
    default gen_random_uuid(),

  service_request_id uuid
    not null
    references public.service_requests(id),

  service_agreement_id uuid
    not null,

  opened_by uuid
    not null
    references public.users(id),

  opened_from_request_status text
    not null,

  reason_code text
    not null,

  description text
    not null,

  completion_submission_id uuid,

  payment_acknowledgement_id uuid,

  status text
    not null
    default 'OPEN',

  opened_at timestamptz
    not null
    default now(),

  review_started_at timestamptz,

  withdrawn_at timestamptz,

  withdrawal_reason text,

  resolution_code text,

  resolution_summary text,

  admin_notes text,

  resolved_by uuid
    references public.users(id),

  resolved_at timestamptz,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint service_disputes_agreement_request_fkey
    foreign key (
      service_agreement_id,
      service_request_id
    )
    references public.service_agreements (
      id,
      service_request_id
    ),

  constraint service_disputes_completion_request_fkey
    foreign key (
      completion_submission_id,
      service_request_id
    )
    references public.service_completion_submissions (
      id,
      service_request_id
    ),

  constraint service_disputes_payment_ack_agreement_fkey
    foreign key (
      payment_acknowledgement_id,
      service_agreement_id
    )
    references public.service_payment_acknowledgements (
      id,
      service_agreement_id
    ),

  constraint service_disputes_opened_from_status_check
    check (
      opened_from_request_status in (
        'AGREED',
        'IN_PROGRESS',
        'SUBMITTED',
        'COMPLETED',
        'CANCELLED'
      )
    ),

  constraint service_disputes_reason_code_check
    check (
      reason_code in (
        'WORK_NOT_DELIVERED',
        'WORK_NOT_AS_AGREED',
        'DEADLINE_ISSUE',
        'PAYMENT_ISSUE',
        'CANCELLATION_ISSUE',
        'CONDUCT_ISSUE',
        'OTHER'
      )
    ),

  constraint service_disputes_description_not_blank_check
    check (
      btrim(description) <> ''
    ),

  constraint service_disputes_status_check
    check (
      status in (
        'OPEN',
        'UNDER_REVIEW',
        'RESOLVED',
        'WITHDRAWN'
      )
    ),

  constraint service_disputes_resolution_code_check
    check (
      resolution_code is null
      or resolution_code in (
        'PROVIDER_VIOLATION',
        'CUSTOMER_VIOLATION',
        'MUTUAL_RESOLUTION',
        'SUBJECTIVE_QUALITY_DISAGREEMENT',
        'PAYMENT_DISAGREEMENT',
        'NO_VIOLATION',
        'INSUFFICIENT_EVIDENCE'
      )
    ),

  constraint service_disputes_under_review_state_check
    check (
      status <> 'UNDER_REVIEW'
      or review_started_at is not null
    ),

  constraint service_disputes_withdrawn_state_check
    check (
      status <> 'WITHDRAWN'
      or withdrawn_at is not null
    ),

  constraint service_disputes_resolved_state_check
    check (
      status <> 'RESOLVED'
      or (
        resolved_at is not null
        and resolved_by is not null
        and resolution_code is not null
        and resolution_summary is not null
        and btrim(resolution_summary) <> ''
      )
    )
);


create unique index
  service_disputes_one_active_idx
on public.service_disputes (
  service_request_id
)
where status in (
  'OPEN',
  'UNDER_REVIEW'
);


-- =========================================================
-- 9. SERVICE LISTING PAYMENTS
-- =========================================================

create table public.service_listing_payments (
  id uuid
    primary key
    default gen_random_uuid(),

  service_listing_id uuid
    not null,

  provider_id uuid
    not null
    references public.users(id),

  publication_action text
    not null,

  amount bigint
    not null,

  currency text
    not null
    default 'IDR',

  publication_duration_seconds integer
    not null,

  payment_status text
    not null
    default 'CREATING',

  midtrans_order_id text
    not null
    unique,

  midtrans_transaction_id text
    unique,

  payment_method text,

  snap_token text,

  payment_url text,

  payment_expires_at timestamptz,

  renewal_base_expires_at timestamptz,

  paid_at timestamptz,

  failed_at timestamptz,

  cancelled_at timestamptz,

  expired_at timestamptz,

  publication_applied_at timestamptz,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint service_listing_payments_listing_provider_fkey
    foreign key (
      service_listing_id,
      provider_id
    )
    references public.service_listings (
      id,
      provider_id
    ),

  constraint service_listing_payments_action_check
    check (
      publication_action in (
        'INITIAL_PUBLICATION',
        'EXPIRED_RENEWAL',
        'EARLY_RENEWAL'
      )
    ),

  constraint service_listing_payments_amount_positive_check
    check (
      amount > 0
    ),

  constraint service_listing_payments_currency_check
    check (
      currency = 'IDR'
    ),

  constraint service_listing_payments_duration_positive_check
    check (
      publication_duration_seconds > 0
    ),

  constraint service_listing_payments_status_check
    check (
      payment_status in (
        'CREATING',
        'PENDING',
        'PAID',
        'FAILED',
        'CANCELLED',
        'EXPIRED'
      )
    ),

  constraint service_listing_payments_renewal_base_check
    check (
      (
        publication_action = 'EARLY_RENEWAL'
        and renewal_base_expires_at is not null
      )
      or
      (
        publication_action <> 'EARLY_RENEWAL'
        and renewal_base_expires_at is null
      )
    ),

  constraint service_listing_payments_paid_state_check
    check (
      payment_status <> 'PAID'
      or paid_at is not null
    ),

  constraint service_listing_payments_failed_state_check
    check (
      payment_status <> 'FAILED'
      or failed_at is not null
    ),

  constraint service_listing_payments_cancelled_state_check
    check (
      payment_status <> 'CANCELLED'
      or cancelled_at is not null
    ),

  constraint service_listing_payments_expired_state_check
    check (
      payment_status <> 'EXPIRED'
      or expired_at is not null
    ),

  constraint service_listing_payments_publication_applied_check
    check (
      publication_applied_at is null
      or (
        payment_status = 'PAID'
        and paid_at is not null
        and publication_applied_at >= paid_at
      )
    ),

  constraint service_listing_payments_application_identity_unique
    unique (
      id,
      service_listing_id,
      provider_id,
      publication_action
    )
);


create unique index
  service_listing_payments_one_nonterminal_idx
on public.service_listing_payments (
  service_listing_id
)
where payment_status in (
  'CREATING',
  'PENDING'
);


-- =========================================================
-- 10. SERVICE LISTING PUBLICATION PERIODS
-- =========================================================

create table public.service_listing_publication_periods (
  id uuid
    primary key
    default gen_random_uuid(),

  service_listing_id uuid
    not null,

  provider_id uuid
    not null,

  source_type text
    not null,

  publication_action text
    not null,

  service_listing_payment_id uuid,

  duration_seconds integer
    not null,

  starts_at timestamptz
    not null,

  ends_at timestamptz
    not null,

  applied_at timestamptz
    not null
    default now(),

  created_at timestamptz
    not null
    default now(),

  constraint service_listing_periods_listing_provider_fkey
    foreign key (
      service_listing_id,
      provider_id
    )
    references public.service_listings (
      id,
      provider_id
    ),

  constraint service_listing_periods_payment_fkey
    foreign key (
      service_listing_payment_id,
      service_listing_id,
      provider_id,
      publication_action
    )
    references public.service_listing_payments (
      id,
      service_listing_id,
      provider_id,
      publication_action
    ),

  constraint service_listing_periods_source_type_check
    check (
      source_type in (
        'FIRST_LISTING_FREE',
        'PAYMENT'
      )
    ),

  constraint service_listing_periods_action_check
    check (
      publication_action in (
        'INITIAL_PUBLICATION',
        'EXPIRED_RENEWAL',
        'EARLY_RENEWAL'
      )
    ),

  constraint service_listing_periods_duration_positive_check
    check (
      duration_seconds > 0
    ),

  constraint service_listing_periods_time_check
    check (
      ends_at > starts_at
    ),

  constraint service_listing_periods_exact_duration_check
    check (
      ends_at =
        starts_at
        + duration_seconds
          * interval '1 second'
    ),

  constraint service_listing_periods_source_payment_check
    check (
      (
        source_type = 'FIRST_LISTING_FREE'
        and publication_action = 'INITIAL_PUBLICATION'
        and service_listing_payment_id is null
      )
      or
      (
        source_type = 'PAYMENT'
        and service_listing_payment_id is not null
      )
    )
);


create unique index
  service_listing_periods_payment_once_idx
on public.service_listing_publication_periods (
  service_listing_payment_id
)
where service_listing_payment_id is not null;


create unique index
  service_listing_periods_first_free_once_idx
on public.service_listing_publication_periods (
  provider_id
)
where source_type = 'FIRST_LISTING_FREE';


-- =========================================================
-- BASE QUERY INDEXES
-- =========================================================

create index service_listings_provider_created_idx
on public.service_listings (
  provider_id,
  created_at desc
);


create index service_listings_provider_status_created_idx
on public.service_listings (
  provider_id,
  status,
  created_at desc
);


create index service_listings_active_created_idx
on public.service_listings (
  created_at desc
)
where status = 'ACTIVE';


create index service_listings_active_category_created_idx
on public.service_listings (
  category,
  created_at desc
)
where status = 'ACTIVE';


create index service_listings_active_mode_created_idx
on public.service_listings (
  service_mode,
  created_at desc
)
where status = 'ACTIVE';


create index service_listings_expiry_idx
on public.service_listings (
  expires_at
)
where status in (
  'ACTIVE',
  'PAUSED'
);


create index service_listings_live_slot_idx
on public.service_listings (
  provider_id,
  status,
  expires_at
);


create index service_requests_provider_status_created_idx
on public.service_requests (
  provider_id,
  status,
  created_at desc
);


create index service_requests_customer_status_created_idx
on public.service_requests (
  customer_id,
  status,
  created_at desc
);


create index service_requests_listing_created_idx
on public.service_requests (
  service_listing_id,
  created_at desc
);


create index service_requests_status_updated_idx
on public.service_requests (
  status,
  updated_at desc
);


create index service_agreements_request_version_idx
on public.service_agreements (
  service_request_id,
  version desc
);


create index service_disputes_status_opened_idx
on public.service_disputes (
  status,
  opened_at
);


create index service_disputes_request_opened_idx
on public.service_disputes (
  service_request_id,
  opened_at desc
);


create index service_listing_payments_provider_created_idx
on public.service_listing_payments (
  provider_id,
  created_at desc
);


create index service_listing_payments_listing_created_idx
on public.service_listing_payments (
  service_listing_id,
  created_at desc
);


create index service_listing_payments_status_expiry_idx
on public.service_listing_payments (
  payment_status,
  payment_expires_at
);


create index service_listing_payments_creating_created_idx
on public.service_listing_payments (
  created_at
)
where payment_status = 'CREATING';


create index service_listing_payments_provider_listing_pending_idx
on public.service_listing_payments (
  provider_id,
  service_listing_id
)
where payment_status in (
  'CREATING',
  'PENDING'
);


create index service_listing_periods_listing_starts_idx
on public.service_listing_publication_periods (
  service_listing_id,
  starts_at desc
);


create index service_listing_periods_provider_created_idx
on public.service_listing_publication_periods (
  provider_id,
  created_at desc
);


create index service_listing_periods_ends_idx
on public.service_listing_publication_periods (
  ends_at
);


-- =========================================================
-- RLS FOUNDATION
--
-- New Service tables are locked immediately.
-- Browser access is added explicitly later.
-- =========================================================

alter table public.service_listings
  enable row level security;

alter table public.service_listing_images
  enable row level security;

alter table public.service_requests
  enable row level security;

alter table public.service_agreements
  enable row level security;

alter table public.service_agreement_payment_steps
  enable row level security;

alter table public.service_payment_acknowledgements
  enable row level security;

alter table public.service_completion_submissions
  enable row level security;

alter table public.service_disputes
  enable row level security;

alter table public.service_listing_payments
  enable row level security;

alter table public.service_listing_publication_periods
  enable row level security;


-- Explicitly remove browser-facing privileges that may
-- otherwise be inherited from Supabase default privileges.

revoke all
on table public.service_listings
from anon, authenticated;

revoke all
on table public.service_listing_images
from anon, authenticated;

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
on table public.service_payment_acknowledgements
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


-- service_role remains the trusted backend role.

grant all
on table public.service_listings
to service_role;

grant all
on table public.service_listing_images
to service_role;

grant all
on table public.service_requests
to service_role;

grant all
on table public.service_agreements
to service_role;

grant all
on table public.service_agreement_payment_steps
to service_role;

grant all
on table public.service_payment_acknowledgements
to service_role;

grant all
on table public.service_completion_submissions
to service_role;

grant all
on table public.service_disputes
to service_role;

grant all
on table public.service_listing_payments
to service_role;

grant all
on table public.service_listing_publication_periods
to service_role;


commit;