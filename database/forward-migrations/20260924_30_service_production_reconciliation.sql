-- HelpMe Service Marketplace
-- M30 Production Reconciliation
--
-- Generated for F17 Production Rollout.
--
-- IMPORTANT:
-- Do NOT replay migrations M1-M29 blindly.
-- Production already contains a partial Service schema.
--
-- Production preflight baseline:
-- 90E1DAAEB1CCCE08C6F3BB33C16B039B6D43BD1C85C543C1F0FB4810633ADF7C


-- =========================================================
-- Missing columns
-- =========================================================

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS
  service_request_id uuid;

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS
  dedupe_key text;

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS
  service_listing_id uuid;

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS
  service_request_id uuid;

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS
  service_listing_id uuid;

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS
  service_request_id uuid;

ALTER TABLE public.service_listing_payments
  ADD COLUMN IF NOT EXISTS
  renewal_base_status text;


-- Existing task flow must also support service context.

ALTER TABLE public.conversations
  ALTER COLUMN task_id
  DROP NOT NULL;

ALTER TABLE public.reviews
  ALTER COLUMN task_id
  DROP NOT NULL;


-- =========================================================
-- Missing constraints
-- =========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'conversations'
      AND con.conname = 'conversations_service_request_unique'
  ) THEN
    ALTER TABLE public.conversations
      ADD CONSTRAINT conversations_service_request_unique
      UNIQUE (service_request_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'reviews'
      AND con.conname = 'reviews_service_request_unique'
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_service_request_unique
      UNIQUE (service_request_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'service_requests'
      AND con.conname = 'service_requests_id_provider_unique'
  ) THEN
    ALTER TABLE public.service_requests
      ADD CONSTRAINT service_requests_id_provider_unique
      UNIQUE (id, provider_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'conversations'
      AND con.conname = 'conversations_context_xor_check'
  ) THEN
    ALTER TABLE public.conversations
      ADD CONSTRAINT conversations_context_xor_check
      CHECK (task_id IS NOT NULL AND service_request_id IS NULL OR task_id IS NULL AND service_request_id IS NOT NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'conversations'
      AND con.conname = 'conversations_service_request_participants_fkey'
  ) THEN
    ALTER TABLE public.conversations
      ADD CONSTRAINT conversations_service_request_participants_fkey
      FOREIGN KEY (service_request_id, owner_id, helper_id) REFERENCES service_requests(id, customer_id, provider_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'notifications'
      AND con.conname = 'notifications_dedupe_key_not_blank_check'
  ) THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_dedupe_key_not_blank_check
      CHECK (dedupe_key IS NULL OR btrim(dedupe_key) <> ''::text);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'notifications'
      AND con.conname = 'notifications_primary_context_check'
  ) THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_primary_context_check
      CHECK ((
CASE
    WHEN task_id IS NOT NULL THEN 1
    ELSE 0
END +
CASE
    WHEN service_listing_id IS NOT NULL THEN 1
    ELSE 0
END +
CASE
    WHEN service_request_id IS NOT NULL THEN 1
    ELSE 0
END) <= 1);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'notifications'
      AND con.conname = 'notifications_service_listing_id_fkey'
  ) THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_service_listing_id_fkey
      FOREIGN KEY (service_listing_id) REFERENCES service_listings(id) ON DELETE SET NULL;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'notifications'
      AND con.conname = 'notifications_service_request_id_fkey'
  ) THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_service_request_id_fkey
      FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE SET NULL;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'reports'
      AND con.conname = 'reports_content_context_check'
  ) THEN
    ALTER TABLE public.reports
      ADD CONSTRAINT reports_content_context_check
      CHECK (NOT (task_id IS NOT NULL AND service_listing_id IS NOT NULL));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'reports'
      AND con.conname = 'reports_service_listing_target_fkey'
  ) THEN
    ALTER TABLE public.reports
      ADD CONSTRAINT reports_service_listing_target_fkey
      FOREIGN KEY (service_listing_id, reported_user_id) REFERENCES service_listings(id, provider_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'reports'
      AND con.conname = 'reports_service_listing_target_required_check'
  ) THEN
    ALTER TABLE public.reports
      ADD CONSTRAINT reports_service_listing_target_required_check
      CHECK (service_listing_id IS NULL OR reported_user_id IS NOT NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'reviews'
      AND con.conname = 'reviews_context_xor_check'
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_context_xor_check
      CHECK (task_id IS NOT NULL AND service_request_id IS NULL OR task_id IS NULL AND service_request_id IS NOT NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'reviews'
      AND con.conname = 'reviews_service_request_participants_fkey'
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_service_request_participants_fkey
      FOREIGN KEY (service_request_id, reviewer_id, reviewee_id) REFERENCES service_requests(id, customer_id, provider_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'service_agreements'
      AND con.conname = 'service_agreements_proposed_by_provider_fkey'
  ) THEN
    ALTER TABLE public.service_agreements
      ADD CONSTRAINT service_agreements_proposed_by_provider_fkey
      FOREIGN KEY (service_request_id, proposed_by) REFERENCES service_requests(id, provider_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'service_agreements'
      AND con.conname = 'service_agreements_state_timestamps_strict_check'
  ) THEN
    ALTER TABLE public.service_agreements
      ADD CONSTRAINT service_agreements_state_timestamps_strict_check
      CHECK (status = 'PROPOSED'::text AND approved_at IS NULL AND rejected_at IS NULL AND rejection_reason IS NULL AND superseded_at IS NULL OR status = 'APPROVED'::text AND approved_at IS NOT NULL AND rejected_at IS NULL AND rejection_reason IS NULL AND superseded_at IS NULL OR status = 'REJECTED'::text AND approved_at IS NULL AND rejected_at IS NOT NULL AND rejection_reason IS NOT NULL AND btrim(rejection_reason) <> ''::text AND superseded_at IS NULL OR status = 'SUPERSEDED'::text AND approved_at IS NOT NULL AND rejected_at IS NULL AND rejection_reason IS NULL AND superseded_at IS NOT NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'service_agreements'
      AND con.conname = 'service_agreements_version_lineage_check'
  ) THEN
    ALTER TABLE public.service_agreements
      ADD CONSTRAINT service_agreements_version_lineage_check
      CHECK (version = 1 AND supersedes_agreement_id IS NULL OR version > 1 AND supersedes_agreement_id IS NOT NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'service_completion_submissions'
      AND con.conname = 'service_completion_response_time_check'
  ) THEN
    ALTER TABLE public.service_completion_submissions
      ADD CONSTRAINT service_completion_response_time_check
      CHECK ((customer_responded_at IS NULL OR customer_responded_at >= submitted_at) AND (revision_requested_at IS NULL OR revision_requested_at >= submitted_at) AND (accepted_at IS NULL OR accepted_at >= submitted_at));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'service_completion_submissions'
      AND con.conname = 'service_completion_state_strict_check'
  ) THEN
    ALTER TABLE public.service_completion_submissions
      ADD CONSTRAINT service_completion_state_strict_check
      CHECK (status = 'SUBMITTED'::text AND customer_responded_at IS NULL AND revision_reason IS NULL AND revision_requested_at IS NULL AND accepted_at IS NULL OR status = 'REVISION_REQUESTED'::text AND customer_responded_at IS NOT NULL AND revision_reason IS NOT NULL AND btrim(revision_reason) <> ''::text AND revision_requested_at IS NOT NULL AND accepted_at IS NULL OR status = 'ACCEPTED'::text AND customer_responded_at IS NOT NULL AND revision_reason IS NULL AND revision_requested_at IS NULL AND accepted_at IS NOT NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'service_disputes'
      AND con.conname = 'service_disputes_state_strict_check'
  ) THEN
    ALTER TABLE public.service_disputes
      ADD CONSTRAINT service_disputes_state_strict_check
      CHECK (status = 'OPEN'::text AND review_started_at IS NULL AND withdrawn_at IS NULL AND withdrawal_reason IS NULL AND resolution_code IS NULL AND resolution_summary IS NULL AND resolved_by IS NULL AND resolved_at IS NULL OR status = 'UNDER_REVIEW'::text AND review_started_at IS NOT NULL AND withdrawn_at IS NULL AND withdrawal_reason IS NULL AND resolution_code IS NULL AND resolution_summary IS NULL AND resolved_by IS NULL AND resolved_at IS NULL OR status = 'WITHDRAWN'::text AND withdrawn_at IS NOT NULL AND resolution_code IS NULL AND resolution_summary IS NULL AND resolved_by IS NULL AND resolved_at IS NULL OR status = 'RESOLVED'::text AND withdrawn_at IS NULL AND withdrawal_reason IS NULL AND resolution_code IS NOT NULL AND resolved_by IS NOT NULL AND resolved_at IS NOT NULL AND resolution_summary IS NOT NULL AND btrim(resolution_summary) <> ''::text);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'service_listing_payments'
      AND con.conname = 'service_listing_payments_renewal_base_status_check'
  ) THEN
    ALTER TABLE public.service_listing_payments
      ADD CONSTRAINT service_listing_payments_renewal_base_status_check
      CHECK (publication_action = 'EARLY_RENEWAL'::text AND (renewal_base_status = ANY (ARRAY['ACTIVE'::text, 'PAUSED'::text])) OR publication_action <> 'EARLY_RENEWAL'::text AND renewal_base_status IS NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'service_listing_payments'
      AND con.conname = 'service_listing_payments_state_strict_check'
  ) THEN
    ALTER TABLE public.service_listing_payments
      ADD CONSTRAINT service_listing_payments_state_strict_check
      CHECK (payment_status = 'CREATING'::text AND paid_at IS NULL AND failed_at IS NULL AND cancelled_at IS NULL AND expired_at IS NULL AND publication_applied_at IS NULL OR payment_status = 'PENDING'::text AND payment_expires_at IS NOT NULL AND paid_at IS NULL AND failed_at IS NULL AND cancelled_at IS NULL AND expired_at IS NULL AND publication_applied_at IS NULL OR payment_status = 'PAID'::text AND paid_at IS NOT NULL AND failed_at IS NULL AND cancelled_at IS NULL AND expired_at IS NULL OR payment_status = 'FAILED'::text AND paid_at IS NULL AND failed_at IS NOT NULL AND cancelled_at IS NULL AND expired_at IS NULL AND publication_applied_at IS NULL OR payment_status = 'CANCELLED'::text AND paid_at IS NULL AND failed_at IS NULL AND cancelled_at IS NOT NULL AND expired_at IS NULL AND publication_applied_at IS NULL OR payment_status = 'EXPIRED'::text AND paid_at IS NULL AND failed_at IS NULL AND cancelled_at IS NULL AND expired_at IS NOT NULL AND publication_applied_at IS NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'service_payment_acknowledgements'
      AND con.conname = 'service_payment_ack_response_time_check'
  ) THEN
    ALTER TABLE public.service_payment_acknowledgements
      ADD CONSTRAINT service_payment_ack_response_time_check
      CHECK ((provider_confirmed_at IS NULL OR provider_confirmed_at >= customer_reported_at) AND (issue_reported_at IS NULL OR issue_reported_at >= customer_reported_at));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'service_payment_acknowledgements'
      AND con.conname = 'service_payment_ack_state_strict_check'
  ) THEN
    ALTER TABLE public.service_payment_acknowledgements
      ADD CONSTRAINT service_payment_ack_state_strict_check
      CHECK (status = 'CUSTOMER_REPORTED_PAID'::text AND provider_confirmed_at IS NULL AND issue_reported_at IS NULL AND issue_reason IS NULL OR status = 'PROVIDER_CONFIRMED'::text AND provider_confirmed_at IS NOT NULL AND issue_reported_at IS NULL AND issue_reason IS NULL OR status = 'PAYMENT_ISSUE'::text AND provider_confirmed_at IS NULL AND issue_reported_at IS NOT NULL AND issue_reason IS NOT NULL AND btrim(issue_reason) <> ''::text);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'service_requests'
      AND con.conname = 'service_requests_cancelled_by_participant_check'
  ) THEN
    ALTER TABLE public.service_requests
      ADD CONSTRAINT service_requests_cancelled_by_participant_check
      CHECK (cancelled_by IS NULL OR cancelled_by = customer_id OR cancelled_by = provider_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'service_requests'
      AND con.conname = 'service_requests_cancelled_fields_strict_check'
  ) THEN
    ALTER TABLE public.service_requests
      ADD CONSTRAINT service_requests_cancelled_fields_strict_check
      CHECK (status = 'CANCELLED'::text OR cancelled_at IS NULL AND cancelled_by IS NULL AND cancellation_reason IS NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'service_requests'
      AND con.conname = 'service_requests_declined_fields_strict_check'
  ) THEN
    ALTER TABLE public.service_requests
      ADD CONSTRAINT service_requests_declined_fields_strict_check
      CHECK (status = 'DECLINED'::text OR declined_at IS NULL AND declined_reason IS NULL);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'service_requests'
      AND con.conname = 'service_requests_progress_timestamp_order_check'
  ) THEN
    ALTER TABLE public.service_requests
      ADD CONSTRAINT service_requests_progress_timestamp_order_check
      CHECK ((agreed_at IS NULL OR started_at IS NULL OR started_at >= agreed_at) AND (started_at IS NULL OR submitted_at IS NULL OR submitted_at >= started_at) AND (submitted_at IS NULL OR completed_at IS NULL OR completed_at >= submitted_at));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS con
    JOIN pg_class AS c
      ON c.oid = con.conrelid
    JOIN pg_namespace AS n
      ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname = 'service_requests'
      AND con.conname = 'service_requests_required_progress_timestamps_check'
  ) THEN
    ALTER TABLE public.service_requests
      ADD CONSTRAINT service_requests_required_progress_timestamps_check
      CHECK (((status <> ALL (ARRAY['AGREED'::text, 'IN_PROGRESS'::text, 'SUBMITTED'::text, 'COMPLETED'::text])) OR agreed_at IS NOT NULL) AND ((status <> ALL (ARRAY['IN_PROGRESS'::text, 'SUBMITTED'::text, 'COMPLETED'::text])) OR started_at IS NOT NULL) AND ((status <> ALL (ARRAY['SUBMITTED'::text, 'COMPLETED'::text])) OR submitted_at IS NOT NULL));
  END IF;
END
$$;

-- =========================================================
-- Missing standalone indexes
-- =========================================================

CREATE INDEX IF NOT EXISTS notifications_service_listing_idx ON public.notifications USING btree (service_listing_id) WHERE (service_listing_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS notifications_service_request_idx ON public.notifications USING btree (service_request_id) WHERE (service_request_id IS NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS notifications_user_dedupe_unique_idx ON public.notifications USING btree (user_id, dedupe_key) WHERE (dedupe_key IS NOT NULL);
CREATE INDEX IF NOT EXISTS reports_service_listing_id_idx ON public.reports USING btree (service_listing_id) WHERE (service_listing_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS service_agreements_proposed_by_idx ON public.service_agreements USING btree (proposed_by);
CREATE INDEX IF NOT EXISTS service_agreements_supersedes_idx ON public.service_agreements USING btree (supersedes_agreement_id) WHERE (supersedes_agreement_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS service_completion_agreement_request_idx ON public.service_completion_submissions USING btree (service_agreement_id, service_request_id);
CREATE INDEX IF NOT EXISTS service_disputes_agreement_request_idx ON public.service_disputes USING btree (service_agreement_id, service_request_id);
CREATE INDEX IF NOT EXISTS service_disputes_payment_ack_agreement_idx ON public.service_disputes USING btree (payment_acknowledgement_id, service_agreement_id) WHERE (payment_acknowledgement_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS service_payment_ack_agreement_created_idx ON public.service_payment_acknowledgements USING btree (service_agreement_id, created_at DESC);


-- =========================================================
-- Missing functions / RPC
-- =========================================================
CREATE OR REPLACE FUNCTION public.accept_service_completion(p_request_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_customer_id uuid;

  v_request_status text;

  v_submission_id uuid;

  v_agreement_id uuid;

  v_now timestamptz :=
    statement_timestamp();
begin
  v_customer_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  select
    sr.status

  into
    v_request_status

  from public.service_requests as sr

  where
    sr.id =
      p_request_id

    and sr.customer_id =
      v_customer_id

  for update;

  if not found then
    raise exception
      'Service Request was not found.'
      using errcode = 'P0002';
  end if;

  if v_request_status <> 'SUBMITTED' then
    raise exception
      'Completion cannot be accepted from the current Service Request state.'
      using errcode = '42501';
  end if;

  select
    scs.id,
    scs.service_agreement_id

  into
    v_submission_id,
    v_agreement_id

  from public.service_completion_submissions as scs

  where
    scs.service_request_id =
      p_request_id

    and scs.status =
      'SUBMITTED'

  order by
    scs.submission_no desc

  limit 1

  for update;

  if not found then
    raise exception
      'An active completion submission is required.'
      using errcode = '42501';
  end if;

  perform 1
  from public.service_agreements as sa
  where
    sa.id =
      v_agreement_id

    and sa.service_request_id =
      p_request_id

    and sa.status =
      'APPROVED';

  if not found then
    raise exception
      'An approved Agreement is required before completion.'
      using errcode = '42501';
  end if;

  if exists (
    select 1

    from public.service_agreement_payment_steps as saps

    where
      saps.service_agreement_id =
        v_agreement_id

      and saps.trigger_type in (
        'UPFRONT',
        'BEFORE_START',
        'MILESTONE',
        'ON_SUBMISSION'
      )

      and not exists (
        select 1

        from public.service_payment_acknowledgements as spa

        where
          spa.payment_step_id =
            saps.id

          and spa.service_agreement_id =
            v_agreement_id

          and spa.status =
            'PROVIDER_CONFIRMED'
      )
  ) then
    raise exception
      'Required pre-completion payment has not been confirmed.'
      using errcode = '42501';
  end if;

  update public.service_completion_submissions
  set
    status =
      'ACCEPTED',

    customer_responded_at =
      v_now,

    accepted_at =
      v_now

  where
    id =
      v_submission_id

    and status =
      'SUBMITTED';

  if not found then
    raise exception
      'Completion submission changed concurrently.'
      using errcode = '40001';
  end if;

  update public.service_requests
  set
    status =
      'COMPLETED',

    completed_at =
      v_now,

    updated_at =
      v_now

  where
    id =
      p_request_id

    and customer_id =
      v_customer_id

    and status =
      'SUBMITTED';

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return p_request_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.add_service_listing_portfolio_image(p_listing_id uuid, p_provider_id uuid, p_storage_path text)
 RETURNS TABLE(image_id uuid, sort_order integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

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

$function$
;
CREATE OR REPLACE FUNCTION public.admin_block_service_listing(p_service_listing_id uuid, p_reason text)
 RETURNS TABLE(service_listing_id uuid, status text, blocked_at timestamp with time zone, blocked_reason text, blocked_from_status text, expires_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_status text;
  v_reason text;
  v_now timestamptz;
begin
  if
    p_service_listing_id is null
  then
    raise exception
      'SERVICE_LISTING_ID_REQUIRED'
      using errcode = '22004';
  end if;


  v_reason :=
    nullif(
      pg_catalog.btrim(
        p_reason
      ),
      ''
    );

  if
    v_reason is null
  then
    raise exception
      'BLOCK_REASON_REQUIRED'
      using errcode = '22023';
  end if;


  v_now :=
    pg_catalog.statement_timestamp();


  select
    sl.status
  into
    v_status
  from
    public.service_listings as sl
  where
    sl.id =
      p_service_listing_id
  for update;


  if
    not found
  then
    raise exception
      'SERVICE_LISTING_NOT_FOUND'
      using errcode = 'P0002';
  end if;


  if
    v_status =
      'BLOCKED'
  then
    raise exception
      'SERVICE_LISTING_ALREADY_BLOCKED'
      using errcode = '55000';
  end if;


  if
    v_status not in (
      'ACTIVE',
      'PAUSED',
      'EXPIRED'
    )
  then
    raise exception
      'SERVICE_LISTING_CANNOT_BE_BLOCKED_FROM_%',
      v_status
      using errcode = '55000';
  end if;


  update
    public.service_listings
  set
    status =
      'BLOCKED',

    blocked_at =
      v_now,

    blocked_reason =
      v_reason,

    blocked_from_status =
      v_status,

    updated_at =
      v_now
  where
    id =
      p_service_listing_id;


  return query
  select
    sl.id,
    sl.status,
    sl.blocked_at,
    sl.blocked_reason,
    sl.blocked_from_status,
    sl.expires_at
  from
    public.service_listings as sl
  where
    sl.id =
      p_service_listing_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.admin_unblock_service_listing(p_service_listing_id uuid)
 RETURNS TABLE(service_listing_id uuid, status text, blocked_at timestamp with time zone, blocked_reason text, blocked_from_status text, expires_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare

  v_status text;

  v_blocked_from_status text;

  v_expires_at timestamptz;

  v_paused_at timestamptz;

  v_target_status text;

  v_now timestamptz;

begin

  if

    p_service_listing_id is null

  then

    raise exception

      'SERVICE_LISTING_ID_REQUIRED'

      using errcode = '22004';

  end if;





  v_now :=

    pg_catalog.statement_timestamp();





  select

    sl.status,

    sl.blocked_from_status,

    sl.expires_at,

    sl.paused_at

  into

    v_status,

    v_blocked_from_status,

    v_expires_at,

    v_paused_at

  from

    public.service_listings as sl

  where

    sl.id =

      p_service_listing_id

  for update;





  if

    not found

  then

    raise exception

      'SERVICE_LISTING_NOT_FOUND'

      using errcode = 'P0002';

  end if;





  if

    v_status <>

      'BLOCKED'

  then

    raise exception

      'SERVICE_LISTING_NOT_BLOCKED'

      using errcode = '55000';

  end if;





  if

    v_blocked_from_status not in (

      'ACTIVE',

      'PAUSED',

      'EXPIRED'

    )

  then

    raise exception

      'INVALID_BLOCKED_FROM_STATUS'

      using errcode = '55000';

  end if;





  if

    v_expires_at is null

  then

    raise exception

      'BLOCKED_SERVICE_LISTING_MISSING_EXPIRY'

      using errcode = '55000';

  end if;





  if

    v_expires_at <=

      v_now

  then

    v_target_status :=

      'EXPIRED';



  elsif

    v_blocked_from_status =

      'EXPIRED'

  then

    v_target_status :=

      'EXPIRED';



  else

    v_target_status :=

      v_blocked_from_status;

  end if;





  update

    public.service_listings

  set

    status =

      v_target_status,



    paused_at =

      case

        when

          v_target_status =

            'PAUSED'

        then

          coalesce(

            v_paused_at,

            v_now

          )



        else

          null

      end,



    blocked_at =

      null,



    blocked_reason =

      null,



    blocked_from_status =

      null,



    updated_at =

      v_now

  where

    id =

      p_service_listing_id;





  return query

  select

    sl.id,

    sl.status,

    sl.blocked_at,

    sl.blocked_reason,

    sl.blocked_from_status,

    sl.expires_at

  from

    public.service_listings as sl

  where

    sl.id =

      p_service_listing_id;

end;

$function$
;
CREATE OR REPLACE FUNCTION public.apply_service_listing_payment_status(p_order_id text, p_payment_status text, p_transaction_id text, p_payment_method text, p_paid_at timestamp with time zone, p_expired_at timestamp with time zone)
 RETURNS TABLE(transitioned boolean, payment_id uuid, provider_id uuid, service_listing_id uuid, payment_status text, publication_applied boolean, publication_period_id uuid, publication_ends_at timestamp with time zone, listing_status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare

  v_now timestamptz :=

    statement_timestamp();



  v_payment_id uuid;



  v_provider_id uuid;



  v_listing_id uuid;



  v_current_payment_status text;



  v_action text;



  v_duration_seconds integer;



  v_renewal_base_expires_at

    timestamptz;



  v_renewal_base_status text;



  v_existing_paid_at timestamptz;



  v_publication_applied_at

    timestamptz;



  v_listing_status text;



  v_listing_published_at

    timestamptz;



  v_listing_activated_at

    timestamptz;



  v_listing_expires_at

    timestamptz;



  v_listing_paused_at

    timestamptz;



  v_paid_at timestamptz;



  v_application_time

    timestamptz;



  v_period_id uuid;



  v_starts_at timestamptz;



  v_ends_at timestamptz;



  v_target_status text;

begin

  if

    p_order_id is null

    or btrim(p_order_id) = ''

  then

    raise exception

      'Midtrans order ID is required.'

      using errcode = '22023';

  end if;





  if

    p_payment_status not in (

      'PENDING',

      'PAID',

      'FAILED',

      'CANCELLED',

      'EXPIRED'

    )

  then

    raise exception

      'Unsupported Service listing payment status.'

      using errcode = '22023';

  end if;





  -- -------------------------------------------------------

  -- First lookup obtains Provider scope without taking a

  -- lock in the opposite order used by reservation.

  --

  -- Canonical lock order:

  --

  -- provider advisory lock

  -- -> service listing row

  -- -> service listing payment row

  --

  -- This avoids listing/payment lock-order inversion.

  -- -------------------------------------------------------



  select

    slp.id,

    slp.provider_id,

    slp.service_listing_id



  into

    v_payment_id,

    v_provider_id,

    v_listing_id



  from public.service_listing_payments

    as slp



  where

    slp.midtrans_order_id =

      btrim(p_order_id);





  if not found then

    raise exception

      'Service listing payment was not found.'

      using errcode = 'P0002';

  end if;





  perform

    public.lock_service_provider_publication(

      v_provider_id

    );





  select

    sl.status,

    sl.published_at,

    sl.activated_at,

    sl.expires_at,

    sl.paused_at



  into

    v_listing_status,

    v_listing_published_at,

    v_listing_activated_at,

    v_listing_expires_at,

    v_listing_paused_at



  from public.service_listings

    as sl



  where

    sl.id =

      v_listing_id



    and sl.provider_id =

      v_provider_id



  for update;





  if not found then

    raise exception

      'Service listing for payment was not found.'

      using errcode = 'P0002';

  end if;





  select

    slp.id,

    slp.payment_status,

    slp.publication_action,

    slp.publication_duration_seconds,

    slp.renewal_base_expires_at,

    slp.renewal_base_status,

    slp.paid_at,

    slp.publication_applied_at



  into

    v_payment_id,

    v_current_payment_status,

    v_action,

    v_duration_seconds,

    v_renewal_base_expires_at,

    v_renewal_base_status,

    v_existing_paid_at,

    v_publication_applied_at



  from public.service_listing_payments

    as slp



  where

    slp.midtrans_order_id =

      btrim(p_order_id)



    and slp.provider_id =

      v_provider_id



    and slp.service_listing_id =

      v_listing_id



  for update;





  if not found then

    raise exception

      'Service listing payment lifecycle changed concurrently.'

      using errcode = '40001';

  end if;





  -- -------------------------------------------------------

  -- PENDING from webhook does not create a new local

  -- transition.

  --

  -- CREATING -> PENDING is exclusively finalized by

  -- finalize_service_listing_payment_checkout(), because

  -- PENDING requires the authoritative checkout expiry.

  -- -------------------------------------------------------



  if

    p_payment_status =

      'PENDING'

  then

    return query

    select

      false,

      v_payment_id,

      v_provider_id,

      v_listing_id,

      v_current_payment_status,

      v_publication_applied_at

        is not null,

      null::uuid,

      null::timestamptz,

      v_listing_status;



    return;

  end if;





  -- =====================================================

  -- NON-PAID TERMINAL

  -- =====================================================



  if

    p_payment_status <>

      'PAID'

  then

    if

      v_current_payment_status not in (

        'CREATING',

        'PENDING'

      )

    then

      return query

      select

        false,

        v_payment_id,

        v_provider_id,

        v_listing_id,

        v_current_payment_status,

        false,

        null::uuid,

        null::timestamptz,

        v_listing_status;



      return;

    end if;





    update

      public.service_listing_payments



    set

      payment_status =

        p_payment_status,



      midtrans_transaction_id =

        case

          when

            p_transaction_id is not null

            and btrim(p_transaction_id) <> ''

          then

            btrim(p_transaction_id)



          else

            midtrans_transaction_id

        end,



      payment_method =

        case

          when

            p_payment_method is not null

            and btrim(p_payment_method) <> ''

          then

            btrim(p_payment_method)



          else

            payment_method

        end,



      paid_at =

        null,



      failed_at =

        case

          when

            p_payment_status =

              'FAILED'

          then

            v_now



          else

            null

        end,



      cancelled_at =

        case

          when

            p_payment_status =

              'CANCELLED'

          then

            v_now



          else

            null

        end,



      expired_at =

        case

          when

            p_payment_status =

              'EXPIRED'

          then

            coalesce(

              p_expired_at,

              v_now

            )



          else

            null

        end,



      publication_applied_at =

        null,



      updated_at =

        v_now



    where

      id =

        v_payment_id



      and public.service_listing_payments.payment_status in (

        'CREATING',

        'PENDING'

      );





    if not found then

      return query

      select

        false,

        v_payment_id,

        v_provider_id,

        v_listing_id,

        v_current_payment_status,

        false,

        null::uuid,

        null::timestamptz,

        v_listing_status;



      return;

    end if;





    -- -----------------------------------------------------

    -- Release slot reservation when initial/expired

    -- publication payment terminates without PAID.

    -- -----------------------------------------------------



    if

      v_action =

        'INITIAL_PUBLICATION'



      and v_listing_status =

        'PAYMENT_PENDING'

    then

      update

        public.service_listings



      set

        status =

          'DRAFT',



        published_at =

          null,



        activated_at =

          null,



        expires_at =

          null,



        paused_at =

          null,



        archived_at =

          null,



        updated_at =

          v_now



      where

        id =

          v_listing_id



        and provider_id =

          v_provider_id;





      v_listing_status :=

        'DRAFT';





    elsif

      v_action =

        'EXPIRED_RENEWAL'



      and v_listing_status =

        'PAYMENT_PENDING'

    then

      update

        public.service_listings



      set

        status =

          'EXPIRED',



        paused_at =

          null,



        updated_at =

          v_now



      where

        id =

          v_listing_id



        and provider_id =

          v_provider_id;





      v_listing_status :=

        'EXPIRED';

    end if;





    return query

    select

      true,

      v_payment_id,

      v_provider_id,

      v_listing_id,

      p_payment_status,

      false,

      null::uuid,

      null::timestamptz,

      v_listing_status;



    return;

  end if;





  -- =====================================================

  -- PAID

  -- =====================================================



  if

    p_transaction_id is null

    or btrim(p_transaction_id) = ''

    or p_payment_method is null

    or btrim(p_payment_method) = ''

  then

    raise exception

      'Successful Midtrans Service listing payment requires transaction ID and payment method.'

      using errcode = '22023';

  end if;





  -- -------------------------------------------------------

  -- Fully applied duplicate PAID.

  -- -------------------------------------------------------



  if

    v_current_payment_status =

      'PAID'



    and v_publication_applied_at

      is not null

  then

    select

      pp.id,

      pp.ends_at



    into

      v_period_id,

      v_ends_at



    from public.service_listing_publication_periods

      as pp



    where

      pp.service_listing_payment_id =

        v_payment_id;





    return query

    select

      false,

      v_payment_id,

      v_provider_id,

      v_listing_id,

      'PAID'::text,

      true,

      v_period_id,

      v_ends_at,

      v_listing_status;



    return;

  end if;





  v_paid_at :=

    coalesce(

      p_paid_at,

      v_existing_paid_at,

      v_now

    );





  /*

   * publication_applied_at must never be earlier than

   * paid_at due to the M1 consistency constraint.

   *

   * greatest() also tolerates small provider/server

   * clock differences.

   */

  v_application_time :=

    greatest(

      v_now,

      v_paid_at

    );





  -- -------------------------------------------------------

  -- PAID has highest priority.

  --

  -- Clear obsolete terminal timestamps atomically so M3

  -- strict-state constraints remain satisfied.

  -- -------------------------------------------------------



  update

    public.service_listing_payments



  set

    payment_status =

      'PAID',



    midtrans_transaction_id =

      btrim(p_transaction_id),



    payment_method =

      btrim(p_payment_method),



    paid_at =

      v_paid_at,



    failed_at =

      null,



    cancelled_at =

      null,



    expired_at =

      null,



    updated_at =

      v_now



  where

    id =

      v_payment_id



    and public.service_listing_payments.payment_status <>

      'PAID';





  -- -------------------------------------------------------

  -- Calculate exact purchased publication period.

  -- -------------------------------------------------------



  if

    v_action =

      'EARLY_RENEWAL'

  then

    if

      v_renewal_base_expires_at

        is null



      or v_renewal_base_status

        not in (

          'ACTIVE',

          'PAUSED'

        )

    then

      raise exception

        'Early renewal payment does not contain a valid renewal base.'

        using errcode = '23514';

    end if;





    v_starts_at :=

      v_renewal_base_expires_at;



  elsif

    v_action in (

      'INITIAL_PUBLICATION',

      'EXPIRED_RENEWAL'

    )

  then

    v_starts_at :=

      v_now;



  else

    raise exception

      'Service listing payment publication action is invalid.'

      using errcode = '23514';

  end if;





  v_ends_at :=

    v_starts_at

    +

    v_duration_seconds

      * interval '1 second';





  -- -------------------------------------------------------

  -- Existing publication period is reused defensively.

  --

  -- Normal execution reaches this block only once because

  -- the payment row is locked and M1 also has a unique

  -- partial index on service_listing_payment_id.

  -- -------------------------------------------------------



  select

    pp.id,

    pp.starts_at,

    pp.ends_at



  into

    v_period_id,

    v_starts_at,

    v_ends_at



  from public.service_listing_publication_periods

    as pp



  where

    pp.service_listing_payment_id =

      v_payment_id;





  if not found then

    insert into

      public.service_listing_publication_periods (

        service_listing_id,

        provider_id,

        source_type,

        publication_action,

        service_listing_payment_id,

        duration_seconds,

        starts_at,

        ends_at,

        applied_at,

        created_at

      )



    values (

      v_listing_id,

      v_provider_id,

      'PAYMENT',

      v_action,

      v_payment_id,

      v_duration_seconds,

      v_starts_at,

      v_ends_at,

      v_application_time,

      v_now

    )



    returning

      id

    into

      v_period_id;

  end if;





  -- =====================================================

  -- APPLY LISTING ENTITLEMENT

  -- =====================================================



  if

    v_action =

      'INITIAL_PUBLICATION'

  then

    /*

     * INITIAL publication normally originates from

     * PAYMENT_PENDING or a DRAFT restored after an earlier

     * local terminal result.

     */

    update

      public.service_listings



    set

      status =

        'ACTIVE',



      published_at =

        coalesce(

          published_at,

          v_now

        ),



      activated_at =

        v_now,



      expires_at =

        v_ends_at,



      paused_at =

        null,



      blocked_at =

        null,



      blocked_reason =

        null,



      blocked_from_status =

        null,



      archived_at =

        null,



      updated_at =

        v_now



    where

      id =

        v_listing_id



      and provider_id =

        v_provider_id;





    v_target_status :=

      'ACTIVE';





  elsif

    v_action =

      'EXPIRED_RENEWAL'

  then

    /*

     * Late PAID must not resurrect a listing that the

     * Provider archived after a prior local terminal result.

     *

     * A BLOCKED listing also stays BLOCKED. Its restoration

     * target becomes ACTIVE because this paid renewal has

     * created a fresh valid publication period.

     */

    if

      v_listing_status =

        'ARCHIVED'

    then

      update

        public.service_listings



      set

        activated_at =

          v_now,



        expires_at =

          v_ends_at,



        paused_at =

          null,



        updated_at =

          v_now



      where

        id =

          v_listing_id



        and provider_id =

          v_provider_id;





      v_target_status :=

        'ARCHIVED';





    elsif

      v_listing_status =

        'BLOCKED'

    then

      update

        public.service_listings



      set

        activated_at =

          v_now,



        expires_at =

          v_ends_at,



        paused_at =

          null,



        blocked_from_status =

          'ACTIVE',



        updated_at =

          v_now



      where

        id =

          v_listing_id



        and provider_id =

          v_provider_id;





      v_target_status :=

        'BLOCKED';





    else

      update

        public.service_listings



      set

        status =

          'ACTIVE',



        published_at =

          coalesce(

            published_at,

            v_now

          ),



        activated_at =

          v_now,



        expires_at =

          v_ends_at,



        paused_at =

          null,



        blocked_at =

          null,



        blocked_reason =

          null,



        blocked_from_status =

          null,



        archived_at =

          null,



        updated_at =

          v_now



      where

        id =

          v_listing_id



        and provider_id =

          v_provider_id;





      v_target_status :=

        'ACTIVE';

    end if;





  elsif

    v_action =

      'EARLY_RENEWAL'

  then

    /*

     * Preserve current moderation/archive state.

     *

     * If the old publication expired while checkout was

     * open, restore the ACTIVE/PAUSED state captured when

     * the renewal was reserved.

     */

    if

      v_listing_status =

        'ARCHIVED'

    then

      update

        public.service_listings



      set

        expires_at =

          v_ends_at,



        updated_at =

          v_now



      where

        id =

          v_listing_id



        and provider_id =

          v_provider_id;





      v_target_status :=

        'ARCHIVED';





    elsif

      v_listing_status =

        'BLOCKED'

    then

      update

        public.service_listings



      set

        expires_at =

          v_ends_at,



        blocked_from_status =

          v_renewal_base_status,



        updated_at =

          v_now



      where

        id =

          v_listing_id



        and provider_id =

          v_provider_id;





      v_target_status :=

        'BLOCKED';





    elsif

      v_listing_status =

        'EXPIRED'

    then

      update

        public.service_listings



      set

        status =

          v_renewal_base_status,



        expires_at =

          v_ends_at,



        paused_at =

          case

            when

              v_renewal_base_status =

                'PAUSED'

            then

              v_now



            else

              null

          end,



        archived_at =

          null,



        updated_at =

          v_now



      where

        id =

          v_listing_id



        and provider_id =

          v_provider_id;





      v_target_status :=

        v_renewal_base_status;





    elsif

      v_listing_status in (

        'ACTIVE',

        'PAUSED'

      )

    then

      update

        public.service_listings



      set

        expires_at =

          v_ends_at,



        updated_at =

          v_now



      where

        id =

          v_listing_id



        and provider_id =

          v_provider_id;





      v_target_status :=

        v_listing_status;





    else

      raise exception

        'Early renewal cannot be applied to the current Service listing lifecycle.'

        using errcode = '55000';

    end if;

  end if;





  -- -------------------------------------------------------

  -- Final exactly-once marker.

  --

  -- Payment state, period creation, listing entitlement,

  -- and this marker are all part of this same transaction.

  -- -------------------------------------------------------



  update

    public.service_listing_payments



  set

    publication_applied_at =

      v_application_time,



    updated_at =

      v_now



  where

    id =

      v_payment_id



    and publication_applied_at

      is null;





  return query

  select

    true,

    v_payment_id,

    v_provider_id,

    v_listing_id,

    'PAID'::text,

    true,

    v_period_id,

    v_ends_at,

    v_target_status;

end;

$function$
;
CREATE OR REPLACE FUNCTION public.approve_service_agreement(p_agreement_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_customer_id uuid;

  v_request_id uuid;

  v_request_status text;

  v_agreement_status text;

  v_now timestamptz :=
    statement_timestamp();
begin
  v_customer_id :=
    public.require_current_service_actor();

  if p_agreement_id is null then
    raise exception
      'Agreement identity is required.'
      using errcode = '22023';
  end if;

  select
    sa.service_request_id

  into
    v_request_id

  from public.service_agreements as sa

  where
    sa.id =
      p_agreement_id;

  if not found then
    raise exception
      'Agreement was not found.'
      using errcode = 'P0002';
  end if;

  -- Lock the Request first. Every M12 mutation follows
  -- the same lock order to minimize deadlock risk.

  select
    sr.status

  into
    v_request_status

  from public.service_requests as sr

  where
    sr.id =
      v_request_id

    and sr.customer_id =
      v_customer_id

  for update;

  if not found then
    raise exception
      'Agreement was not found.'
      using errcode = 'P0002';
  end if;

  if v_request_status <> 'AGREEMENT_PENDING' then
    raise exception
      'Agreement cannot be approved from the current Service Request state.'
      using errcode = '42501';
  end if;

  select
    sa.status

  into
    v_agreement_status

  from public.service_agreements as sa

  where
    sa.id =
      p_agreement_id

    and sa.service_request_id =
      v_request_id

  for update;

  if not found then
    raise exception
      'Agreement was not found.'
      using errcode = 'P0002';
  end if;

  if v_agreement_status <> 'PROPOSED' then
    raise exception
      'Only a proposed Agreement can be approved.'
      using errcode = '42501';
  end if;

  update public.service_agreements
  set
    status =
      'APPROVED',

    approved_at =
      v_now

  where
    id =
      p_agreement_id

    and service_request_id =
      v_request_id

    and status =
      'PROPOSED';

  if not found then
    raise exception
      'Agreement changed concurrently.'
      using errcode = '40001';
  end if;

  update public.service_requests
  set
    status =
      'AGREED',

    agreed_at =
      v_now,

    updated_at =
      v_now

  where
    id =
      v_request_id

    and customer_id =
      v_customer_id

    and status =
      'AGREEMENT_PENDING';

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return p_agreement_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.archive_service_listing(p_listing_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare

  v_provider_id uuid;



  v_status text;



  v_now timestamptz :=

    statement_timestamp();

begin

  v_provider_id :=

    public.require_current_service_actor();





  select

    sl.status



  into

    v_status



  from public.service_listings

    as sl



  where

    sl.id =

      p_listing_id



    and sl.provider_id =

      v_provider_id



  for update;





  if not found then

    raise exception

      'Service listing was not found.'

      using errcode = 'P0002';

  end if;





  if

    v_status =

      'ARCHIVED'

  then

    return p_listing_id;

  end if;





  if

    v_status =

      'BLOCKED'

  then

    raise exception

      'Blocked Service listings cannot be archived by the Provider.'

      using errcode = '42501';

  end if;





  if exists (

    select 1



    from public.service_listing_payments

      as slp



    where

      slp.service_listing_id =

        p_listing_id



      and slp.provider_id =

        v_provider_id



      and slp.payment_status in (

        'CREATING',

        'PENDING'

      )

  ) then

    raise exception

      'Service listing cannot be archived while a publication payment is in progress.'

      using errcode = '55000';

  end if;





  if

    v_status not in (

      'ACTIVE',

      'PAUSED',

      'EXPIRED'

    )

  then

    raise exception

      'Service listing cannot be archived in its current state.'

      using errcode = '55000';

  end if;





  update

    public.service_listings



  set

    status =

      'ARCHIVED',



    archived_at =

      v_now,



    updated_at =

      v_now



  where

    id =

      p_listing_id



    and provider_id =

      v_provider_id



    and status in (

      'ACTIVE',

      'PAUSED',

      'EXPIRED'

    );





  if not found then

    raise exception

      'Service listing lifecycle changed concurrently.'

      using errcode = '40001';

  end if;





  return p_listing_id;

end;

$function$
;
CREATE OR REPLACE FUNCTION public.assert_service_listing_media_upload_target(p_listing_id uuid, p_provider_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  return
    public.require_editable_service_listing_media_target(
      p_listing_id,
      p_provider_id
    );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.begin_service_request_negotiation(p_request_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_provider_id uuid;

  v_status text;
begin
  v_provider_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  select
    sr.status
  into
    v_status
  from public.service_requests as sr
  where
    sr.id =
      p_request_id
    and sr.provider_id =
      v_provider_id
  for update;

  if not found then
    raise exception
      'Service Request was not found.'
      using errcode = 'P0002';
  end if;

  if v_status <> 'PENDING_PROVIDER' then
    raise exception
      'Service Request cannot begin negotiation from its current state.'
      using errcode = '42501';
  end if;

  update public.service_requests
  set
    status =
      'NEGOTIATING',

    updated_at =
      statement_timestamp()

  where
    id =
      p_request_id
    and provider_id =
      v_provider_id
    and status =
      'PENDING_PROVIDER';

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return p_request_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.cancel_service_request(p_request_id uuid, p_reason text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_customer_id uuid;

  v_status text;

  v_now timestamptz :=
    statement_timestamp();
begin
  v_customer_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  if
    p_reason is null
    or btrim(
      p_reason
    ) = ''
  then
    raise exception
      'Cancellation reason is required.'
      using errcode = '22023';
  end if;

  select
    sr.status
  into
    v_status
  from public.service_requests as sr
  where
    sr.id =
      p_request_id
    and sr.customer_id =
      v_customer_id
  for update;

  if not found then
    raise exception
      'Service Request was not found.'
      using errcode = 'P0002';
  end if;

  if v_status not in (
    'PENDING_PROVIDER',
    'NEGOTIATING'
  ) then
    raise exception
      'Service Request cannot be cancelled from its current state.'
      using errcode = '42501';
  end if;

  update public.service_requests
  set
    status =
      'CANCELLED',

    cancelled_at =
      v_now,

    cancelled_by =
      v_customer_id,

    cancellation_reason =
      btrim(
        p_reason
      ),

    updated_at =
      v_now

  where
    id =
      p_request_id
    and customer_id =
      v_customer_id
    and status in (
      'PENDING_PROVIDER',
      'NEGOTIATING'
    );

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return p_request_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.claim_first_free_service_listing_publication(p_listing_id uuid, p_provider_id uuid, p_first_free_enabled boolean, p_max_reserved_slots integer)
 RETURNS TABLE(activated boolean, listing_id uuid, publication_period_id uuid, starts_at timestamp with time zone, ends_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare

  v_status text;



  v_full_name text;



  v_username text;



  v_is_banned boolean;



  v_is_suspended boolean;



  v_suspended_until timestamptz;



  v_reserved_slots integer;



  v_period_id uuid;



  v_now timestamptz :=

    statement_timestamp();



  v_duration_seconds integer :=

    2592000;



  v_ends_at timestamptz;

begin

  if p_listing_id is null then

    raise exception

      'Service Listing identity is required.'

      using errcode = '22004';

  end if;



    if p_provider_id is null then

    raise exception

      'Service Provider identity is required.'

      using errcode = '22004';

  end if;





  if p_first_free_enabled is null then

    raise exception

      'First-free publication configuration is required.'

      using errcode = '22004';

  end if;





  if

    p_max_reserved_slots is null

    or p_max_reserved_slots < 1

  then

    raise exception

      'Maximum reserved Service listing slots must be at least 1.'

      using errcode = '22023';

  end if;





  -- -------------------------------------------------------

  -- Serialize all publication decisions for this Provider.

  -- -------------------------------------------------------



  perform

    public.lock_service_provider_publication(

      p_provider_id

    );





  -- -------------------------------------------------------

  -- Lock and authorize the exact Service Listing.

  -- -------------------------------------------------------



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





  -- FIRST_LISTING_FREE is only an INITIAL publication.

  --

  -- Renewal of EXPIRED/ACTIVE/PAUSED listings belongs to

  -- the paid publication flow.



    if v_status <> 'DRAFT' then

    raise exception

      'Only a draft Service listing can use first publication entitlement.'

      using errcode = '55000';

  end if;





  -- -------------------------------------------------------

  -- FIRST_LISTING_FREE is a configurable promotion.

  --

  -- When disabled, this primitive does not consume any

  -- entitlement. The trusted backend may continue into

  -- the paid publication flow.

  -- -------------------------------------------------------



  if not p_first_free_enabled then

    return query

    select

      false,

      p_listing_id,

      null::uuid,

      null::timestamptz,

      null::timestamptz;



    return;

  end if;





  -- -------------------------------------------------------

  -- Account + minimum profile gate.

  --

  -- Minimum HelpMe Jasa profile:

  -- - full_name

  -- - username

  --

  -- Avatar, bio, profile location, and KTP verification

  -- are intentionally optional.

  -- -------------------------------------------------------



  select

    u.full_name,

    u.username,

    coalesce(

      u.is_banned,

      false

    ),

    coalesce(

      u.is_suspended,

      false

    ),

    u.suspended_until



  into

    v_full_name,

    v_username,

    v_is_banned,

    v_is_suspended,

    v_suspended_until



  from public.users as u



  where

    u.id =

      p_provider_id;



  if not found then

    raise exception

      'Service Provider profile was not found.'

      using errcode = 'P0002';

  end if;





  if v_is_banned then

    raise exception

      'Account is not allowed to publish Service listings.'

      using errcode = '42501';

  end if;





  if

    v_is_suspended

    and (

      v_suspended_until is null

      or v_suspended_until >

        v_now

    )

  then

    raise exception

      'Account is temporarily restricted from publishing Service listings.'

      using errcode = '42501';

  end if;





  if

    v_full_name is null

    or btrim(v_full_name) = ''

    or v_username is null

    or btrim(v_username) = ''

  then

    raise exception

      'Complete full name and username before publishing a Service listing.'

      using errcode = '23514';

  end if;





  -- -------------------------------------------------------

  -- COVER is mandatory before publication.

  -- -------------------------------------------------------



  if not exists (

    select 1



    from public.service_listing_images

      as sli



    where

      sli.service_listing_id =

        p_listing_id



      and sli.kind =

        'COVER'

  ) then

    raise exception

      'A Service listing cover image is required before publication.'

      using errcode = '23514';

  end if;





  -- -------------------------------------------------------

  -- Provider live-slot capacity.

  --

  -- Advisory lock makes count + activation atomic against

  -- all correctly implemented Service publication paths.

  -- -------------------------------------------------------



  v_reserved_slots :=

    public.count_service_provider_reserved_slots(

      p_provider_id,

      v_now

    );





    if

    v_reserved_slots >=

      p_max_reserved_slots

  then

    raise exception

      'Maximum reserved Service listing slots reached.'

      using errcode = '54000';

  end if;





  -- -------------------------------------------------------

  -- FIRST LISTING means FIRST SUCCESSFUL PUBLICATION.

  --

  -- Checking only source_type = FIRST_LISTING_FREE would

  -- incorrectly allow:

  --

  -- PAYMENT publication first

  -- then free publication later.

  --

  -- Therefore ANY previous publication period makes the

  -- first-free entitlement unavailable.

  -- -------------------------------------------------------



  if exists (

    select 1



    from public.service_listing_publication_periods

      as pp



    where

      pp.provider_id =

        p_provider_id

  ) then

    return query

    select

      false,

      p_listing_id,

      null::uuid,

      null::timestamptz,

      null::timestamptz;



    return;

  end if;





  -- -------------------------------------------------------

  -- Exact publication duration:

  --

  -- 30 * 24 * 60 * 60 = 2,592,000 seconds.

  -- -------------------------------------------------------



  v_ends_at :=

    v_now

    +

    v_duration_seconds

      * interval '1 second';





  -- -------------------------------------------------------

  -- Activate the listing.

  -- -------------------------------------------------------



  update public.service_listings

  set

    status =

      'ACTIVE',



    published_at =

      v_now,



    activated_at =

      v_now,



    expires_at =

      v_ends_at,



    paused_at =

      null,



    blocked_at =

      null,



    blocked_reason =

      null,



    blocked_from_status =

      null,



    archived_at =

      null,



    updated_at =

      v_now



  where

    id =

      p_listing_id



    and provider_id =

      p_provider_id



    and status =

      'DRAFT';



  if not found then

    raise exception

      'Service listing lifecycle changed concurrently.'

      using errcode = '40001';

  end if;





  -- -------------------------------------------------------

  -- Record entitlement history.

  --

  -- M1 already provides:

  --

  -- UNIQUE(provider_id)

  -- WHERE source_type = FIRST_LISTING_FREE

  --

  -- so the database remains the final exactly-once guard.

  -- -------------------------------------------------------



  insert into

    public.service_listing_publication_periods (

      service_listing_id,

      provider_id,

      source_type,

      publication_action,

      service_listing_payment_id,

      duration_seconds,

      starts_at,

      ends_at,

      applied_at

    )



  values (

    p_listing_id,

    p_provider_id,

    'FIRST_LISTING_FREE',

    'INITIAL_PUBLICATION',

    null,

    v_duration_seconds,

    v_now,

    v_ends_at,

    v_now

  )



  returning id

  into v_period_id;





  return query

  select

    true,

    p_listing_id,

    v_period_id,

    v_now,

    v_ends_at;

end;

$function$
;
CREATE OR REPLACE FUNCTION public.confirm_service_payment(p_acknowledgement_id uuid, p_provider_note text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_actor_id uuid;

  v_provider_id uuid;

  v_status text;

  v_provider_note text :=
    nullif(
      btrim(
        p_provider_note
      ),
      ''
    );

  v_now timestamptz :=
    statement_timestamp();
begin
  v_actor_id :=
    public.require_current_service_actor();

  if p_acknowledgement_id is null then
    raise exception
      'Service payment acknowledgement identity is required.'
      using errcode = '22023';
  end if;

  select
    sr.provider_id,
    spa.status

  into
    v_provider_id,
    v_status

  from public.service_payment_acknowledgements as spa

  join public.service_agreements as sa
    on sa.id =
      spa.service_agreement_id

  join public.service_requests as sr
    on sr.id =
      sa.service_request_id

  where
    spa.id =
      p_acknowledgement_id

  for update of spa, sa, sr;

  if not found then
    raise exception
      'Service payment acknowledgement was not found.'
      using errcode = 'P0002';
  end if;

  if v_provider_id <> v_actor_id then
    raise exception
      'Only the Provider can confirm this Service payment.'
      using errcode = '42501';
  end if;

  if v_status <> 'CUSTOMER_REPORTED_PAID' then
    raise exception
      'This Service payment acknowledgement is no longer awaiting confirmation.'
      using errcode = '55000';
  end if;

  update public.service_payment_acknowledgements
  set
    status =
      'PROVIDER_CONFIRMED',

    provider_confirmed_at =
      v_now,

    issue_reported_at =
      null,

    issue_reason =
      null,

    provider_note =
      v_provider_note,

    updated_at =
      v_now

  where
    id =
      p_acknowledgement_id
    and status =
      'CUSTOMER_REPORTED_PAID';

  if not found then
    raise exception
      'Service payment acknowledgement changed concurrently.'
      using errcode = '40001';
  end if;

  return
    p_acknowledgement_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.count_service_provider_reserved_slots(p_provider_id uuid, p_at timestamp with time zone)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$

  select

    count(*)::integer



  from public.service_listings as sl



  where

    sl.provider_id =

      p_provider_id



    and (

      (

        sl.status in (

          'ACTIVE',

          'PAUSED',

          'BLOCKED'

        )



        and sl.expires_at is not null



        and sl.expires_at >

          p_at

      )



      or sl.status =

        'PAYMENT_PENDING'

    );

$function$
;
CREATE OR REPLACE FUNCTION public.create_service_listing_draft(p_title text, p_category text, p_description text, p_deliverables text, p_customer_preparation text, p_price_from bigint, p_is_negotiable boolean, p_service_mode text, p_location_name text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare

  v_provider_id uuid;



  v_listing_id uuid;

begin

  v_provider_id :=

    public.require_current_service_actor();



  insert into public.service_listings (

    provider_id,

    title,

    category,

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

$function$
;
CREATE OR REPLACE FUNCTION public.create_service_listing_report(p_service_listing_id uuid, p_reason text, p_description text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare

  v_reporter_id uuid;

  v_provider_id uuid;

  v_report_id uuid;

  v_reason text;

  v_description text;

begin

  v_reporter_id :=

    auth.uid();



  if

    v_reporter_id is null

  then

    raise exception

      'UNAUTHORIZED'

      using errcode = '42501';

  end if;





  if

    p_service_listing_id is null

  then

    raise exception

      'SERVICE_LISTING_ID_REQUIRED'

      using errcode = '22004';

  end if;





  v_reason :=

    nullif(

      pg_catalog.btrim(

        p_reason

      ),

      ''

    );



  if

    v_reason is null

  then

    raise exception

      'REPORT_REASON_REQUIRED'

      using errcode = '22023';

  end if;





  if

    v_reason not in (

      'SPAM',

      'SCAM',

      'FAKE_TASK',

      'INAPPROPRIATE',

      'HARASSMENT',

      'OTHER'

    )

  then

    raise exception

      'INVALID_REPORT_REASON'

      using errcode = '22023';

  end if;





  v_description :=

    nullif(

      pg_catalog.btrim(

        coalesce(

          p_description,

          ''

        )

      ),

      ''

    );





  select

    sl.provider_id

  into

    v_provider_id

  from

    public.service_listings as sl

  where

    sl.id =

      p_service_listing_id

    and sl.status =

      'ACTIVE'

    and sl.expires_at >

      pg_catalog.statement_timestamp();





  if

    not found

  then

    raise exception

      'SERVICE_LISTING_NOT_REPORTABLE'

      using errcode = 'P0002';

  end if;





  if

    v_provider_id =

      v_reporter_id

  then

    raise exception

      'CANNOT_REPORT_OWN_SERVICE_LISTING'

      using errcode = '22023';

  end if;





  /*

   * Serialize pending-report creation for this exact

   * reporter/listing pair without changing the historical

   * reports table duplicate semantics.

   */

  perform

    pg_catalog.pg_advisory_xact_lock(

      pg_catalog.hashtextextended(

        v_reporter_id::text

          || ':'

          || p_service_listing_id::text,

        0

      )

    );





  if exists (

    select

      1

    from

      public.reports as r

    where

      r.reporter_id =

        v_reporter_id

      and r.service_listing_id =

        p_service_listing_id

      and r.status =

        'PENDING'

  )

  then

    raise exception

      'SERVICE_LISTING_REPORT_ALREADY_PENDING'

      using errcode = '23505';

  end if;





  insert into

    public.reports (

      reporter_id,

      reported_user_id,

      task_id,

      service_listing_id,

      reason,

      description,

      status

    )

  values (

    v_reporter_id,

    v_provider_id,

    null,

    p_service_listing_id,

    v_reason,

    v_description,

    'PENDING'

  )

  returning

    id

  into

    v_report_id;





  return

    v_report_id;

end;

$function$
;
CREATE OR REPLACE FUNCTION public.create_service_request(p_listing_id uuid, p_request_description text, p_needed_at timestamp with time zone, p_service_mode text, p_location_name text, p_budget bigint)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_customer_id uuid;

  v_provider_id uuid;

  v_listing_mode text;

  v_location_name text;

  v_request_id uuid;
begin
  v_customer_id :=
    public.require_current_service_actor();

  if p_listing_id is null then
    raise exception
      'Service Listing identity is required.'
      using errcode = '22023';
  end if;

  if
    p_request_description is null
    or btrim(
      p_request_description
    ) = ''
  then
    raise exception
      'Service Request description is required.'
      using errcode = '22023';
  end if;

  if p_needed_at is null then
    raise exception
      'Service Request needed time is required.'
      using errcode = '22023';
  end if;

  if
    p_service_mode is null
    or p_service_mode not in (
      'ONLINE',
      'OFFLINE'
    )
  then
    raise exception
      'Service Request mode is invalid.'
      using errcode = '22023';
  end if;

  if
    p_budget is not null
    and p_budget <= 0
  then
    raise exception
      'Service Request budget must be greater than zero.'
      using errcode = '22023';
  end if;

  select
    sl.provider_id,
    sl.service_mode
  into
    v_provider_id,
    v_listing_mode
  from public.service_listings as sl

  join public.users as u
    on u.id =
      sl.provider_id

  where
    sl.id =
      p_listing_id

    and sl.status =
      'ACTIVE'

    and sl.expires_at >
      statement_timestamp()

    and not coalesce(
      u.is_banned,
      false
    )

    and not (
      coalesce(
        u.is_suspended,
        false
      )
      and (
        u.suspended_until is null
        or u.suspended_until >
          statement_timestamp()
      )
    )

  for share of sl, u;

  if not found then
    raise exception
      'Service Listing is not available.'
      using errcode = 'P0002';
  end if;

  if v_customer_id = v_provider_id then
    raise exception
      'Provider cannot request their own Service Listing.'
      using errcode = '42501';
  end if;

  if not (
    (
      v_listing_mode = 'ONLINE'
      and p_service_mode = 'ONLINE'
    )
    or
    (
      v_listing_mode = 'OFFLINE'
      and p_service_mode = 'OFFLINE'
    )
    or
    (
      v_listing_mode = 'BOTH'
      and p_service_mode in (
        'ONLINE',
        'OFFLINE'
      )
    )
  ) then
    raise exception
      'Selected Service Request mode is not available for this Service Listing.'
      using errcode = '22023';
  end if;

  if p_service_mode = 'OFFLINE' then
    if
      p_location_name is null
      or btrim(
        p_location_name
      ) = ''
    then
      raise exception
        'Location is required for an offline Service Request.'
        using errcode = '22023';
    end if;

    v_location_name :=
      btrim(
        p_location_name
      );
  else
    v_location_name :=
      null;
  end if;

  begin
    insert into public.service_requests (
      service_listing_id,
      customer_id,
      provider_id,
      request_description,
      needed_at,
      service_mode,
      location_name,
      budget,
      status
    )
    values (
      p_listing_id,
      v_customer_id,
      v_provider_id,
      btrim(
        p_request_description
      ),
      p_needed_at,
      p_service_mode,
      v_location_name,
      p_budget,
      'PENDING_PROVIDER'
    )
    returning id
    into v_request_id;

  exception
    when unique_violation then
      raise exception
        'A live Service Request already exists for this Service Listing.'
        using errcode = '23505';
  end;

  return v_request_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.decline_service_request(p_request_id uuid, p_reason text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_provider_id uuid;

  v_status text;

  v_now timestamptz :=
    statement_timestamp();
begin
  v_provider_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  if
    p_reason is null
    or btrim(
      p_reason
    ) = ''
  then
    raise exception
      'Decline reason is required.'
      using errcode = '22023';
  end if;

  select
    sr.status
  into
    v_status
  from public.service_requests as sr
  where
    sr.id =
      p_request_id
    and sr.provider_id =
      v_provider_id
  for update;

  if not found then
    raise exception
      'Service Request was not found.'
      using errcode = 'P0002';
  end if;

  if v_status not in (
    'PENDING_PROVIDER',
    'NEGOTIATING'
  ) then
    raise exception
      'Service Request cannot be declined from its current state.'
      using errcode = '42501';
  end if;

  update public.service_requests
  set
    status =
      'DECLINED',

    declined_at =
      v_now,

    declined_reason =
      btrim(
        p_reason
      ),

    updated_at =
      v_now

  where
    id =
      p_request_id
    and provider_id =
      v_provider_id
    and status in (
      'PENDING_PROVIDER',
      'NEGOTIATING'
    );

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return p_request_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.delete_service_listing_draft(p_listing_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare

  v_provider_id uuid;



  v_status text;

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



  if v_status <> 'DRAFT' then

    raise exception

      'Only draft Service listings can be deleted.'

      using errcode = '42501';

  end if;



  if exists (

    select 1

    from public.service_requests as sr

    where sr.service_listing_id =

      p_listing_id

  ) then

    raise exception

      'Service listing already has transaction history.'

      using errcode = '23503';

  end if;



  if exists (

    select 1

    from public.service_listing_payments as sp

    where sp.service_listing_id =

      p_listing_id

  ) then

    raise exception

      'Service listing already has payment history.'

      using errcode = '23503';

  end if;



  if exists (

    select 1

    from public.service_listing_publication_periods as pp

    where pp.service_listing_id =

      p_listing_id

  ) then

    raise exception

      'Service listing already has publication history.'

      using errcode = '23503';

  end if;



  delete from public.service_listings

  where

    id = p_listing_id

    and provider_id = v_provider_id

    and status = 'DRAFT';



  if not found then

    raise exception

      'Service listing could not be deleted.'

      using errcode = '40001';

  end if;



  return true;

end;

$function$
;
CREATE OR REPLACE FUNCTION public.delete_service_listing_image(p_listing_id uuid, p_provider_id uuid, p_image_id uuid)
 RETURNS TABLE(storage_path text, kind text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

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

$function$
;
CREATE OR REPLACE FUNCTION public.ensure_service_request_conversation(p_request_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_actor_id uuid;

  v_customer_id uuid;

  v_provider_id uuid;

  v_request_status text;

  v_conversation_id uuid;
begin
  v_actor_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  select
    sr.customer_id,
    sr.provider_id,
    sr.status

  into
    v_customer_id,
    v_provider_id,
    v_request_status

  from public.service_requests as sr

  where
    sr.id =
      p_request_id

    and (
      sr.customer_id =
        v_actor_id

      or sr.provider_id =
        v_actor_id
    )

  for update;

  if not found then
    raise exception
      'Service Request was not found.'
      using errcode = 'P0002';
  end if;

  -- An existing Service conversation remains available
  -- as participant history even after terminal lifecycle.

  select
    c.id

  into
    v_conversation_id

  from public.conversations as c

  where
    c.service_request_id =
      p_request_id

    and c.task_id is null

    and c.owner_id =
      v_customer_id

    and c.helper_id =
      v_provider_id;

  if found then
    return v_conversation_id;
  end if;

  -- No conversation may be created before negotiation
  -- or for a Request that already ended without one.

  if v_request_status not in (
    'NEGOTIATING',
    'AGREEMENT_PENDING',
    'AGREED',
    'IN_PROGRESS',
    'SUBMITTED'
  ) then
    raise exception
      'Chat is not available for the current Service Request state.'
      using errcode = '42501';
  end if;

  insert into public.conversations (
    task_id,
    service_request_id,
    owner_id,
    helper_id
  )
  values (
    null,
    p_request_id,
    v_customer_id,
    v_provider_id
  )
  on conflict (
    service_request_id
  )
  do nothing
  returning
    id

  into
    v_conversation_id;

  -- Defense-in-depth for an unexpected concurrent creator.
  --
  -- The Service Request row lock already serializes
  -- normal RPC callers, while the unique constraint from
  -- M2 guarantees one Service conversation per Request.

  if v_conversation_id is null then
    select
      c.id

    into
      v_conversation_id

    from public.conversations as c

    where
      c.service_request_id =
        p_request_id

      and c.task_id is null

      and c.owner_id =
        v_customer_id

      and c.helper_id =
        v_provider_id;
  end if;

  if v_conversation_id is null then
    raise exception
      'Service conversation changed concurrently.'
      using errcode = '40001';
  end if;

  return v_conversation_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.expire_due_service_listings()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare

  v_affected integer;



  v_now timestamptz :=

    statement_timestamp();

begin

  update public.service_listings

  set

    status =

      'EXPIRED',



    updated_at =

      v_now



  where

    status in (

      'ACTIVE',

      'PAUSED'

    )



    and expires_at is not null



    and expires_at <=

      v_now;



  get diagnostics

    v_affected =

      row_count;



  return v_affected;

end;

$function$
;
CREATE OR REPLACE FUNCTION public.fail_service_listing_payment_creation(p_payment_id uuid, p_provider_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare

  v_now timestamptz :=

    statement_timestamp();



  v_listing_id uuid;



  v_publication_action text;



  v_payment_status text;



  v_listing_status text;

begin

  if

    p_payment_id is null

    or p_provider_id is null

  then

    raise exception

      'Service listing payment and Provider IDs are required.'

      using errcode = '22023';

  end if;





  -- -------------------------------------------------------

  -- Keep the same publication lock order used by the

  -- reservation/application primitives.

  -- -------------------------------------------------------



  perform

    public.lock_service_provider_publication(

      p_provider_id

    );





  -- -------------------------------------------------------

  -- Obtain listing identity without taking the payment

  -- row lock before the listing row lock.

  -- -------------------------------------------------------



  select

    slp.service_listing_id



  into

    v_listing_id



  from public.service_listing_payments

    as slp



  where

    slp.id =

      p_payment_id



    and slp.provider_id =

      p_provider_id;





  if not found then

    raise exception

      'Service listing payment was not found.'

      using errcode = 'P0002';

  end if;





  -- -------------------------------------------------------

  -- Canonical lock order:

  --

  -- Provider advisory lock

  -- -> listing row

  -- -> payment row

  -- -------------------------------------------------------



  select

    sl.status



  into

    v_listing_status



  from public.service_listings

    as sl



  where

    sl.id =

      v_listing_id



    and sl.provider_id =

      p_provider_id



  for update;





  if not found then

    raise exception

      'Service listing for payment was not found.'

      using errcode = 'P0002';

  end if;





  select

    slp.publication_action,

    slp.payment_status



  into

    v_publication_action,

    v_payment_status



  from public.service_listing_payments

    as slp



  where

    slp.id =

      p_payment_id



    and slp.provider_id =

      p_provider_id



    and slp.service_listing_id =

      v_listing_id



  for update;





  if not found then

    raise exception

      'Service listing payment lifecycle changed concurrently.'

      using errcode = '40001';

  end if;





  /*

   * Already finalized/reconciled payment must never be

   * downgraded because a stale application request reports

   * creation failure.

   */

  if

    v_payment_status <>

      'CREATING'

  then

    return false;

  end if;





  update

    public.service_listing_payments



  set

    payment_status =

      'FAILED',



    midtrans_transaction_id =

      null,



    payment_method =

      null,



    snap_token =

      null,



    payment_url =

      null,



    payment_expires_at =

      null,



    paid_at =

      null,



    failed_at =

      v_now,



    cancelled_at =

      null,



    expired_at =

      null,



    publication_applied_at =

      null,



    updated_at =

      v_now



  where

    id =

      p_payment_id



    and provider_id =

      p_provider_id



    and payment_status =

      'CREATING';





  if not found then

    return false;

  end if;





  -- -------------------------------------------------------

  -- Release any new-slot reservation.

  -- -------------------------------------------------------



  if

    v_publication_action =

      'INITIAL_PUBLICATION'



    and v_listing_status =

      'PAYMENT_PENDING'

  then

    update

      public.service_listings



    set

      status =

        'DRAFT',



      published_at =

        null,



      activated_at =

        null,



      expires_at =

        null,



      paused_at =

        null,



      archived_at =

        null,



      updated_at =

        v_now



    where

      id =

        v_listing_id



      and provider_id =

        p_provider_id;





  elsif

    v_publication_action =

      'EXPIRED_RENEWAL'



    and v_listing_status =

      'PAYMENT_PENDING'

  then

    update

      public.service_listings



    set

      status =

        'EXPIRED',



      paused_at =

        null,



      updated_at =

        v_now



    where

      id =

        v_listing_id



      and provider_id =

        p_provider_id;

  end if;





  /*

   * EARLY_RENEWAL intentionally performs no listing

   * transition because ACTIVE/PAUSED was never replaced

   * by PAYMENT_PENDING.

   */



  return true;

end;

$function$
;
CREATE OR REPLACE FUNCTION public.finalize_service_listing_payment_checkout(p_payment_id uuid, p_provider_id uuid, p_snap_token text, p_payment_url text, p_payment_expires_at timestamp with time zone)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare

  v_now timestamptz :=

    statement_timestamp();



  v_status text;

begin

  if

    p_payment_id is null

    or p_provider_id is null

  then

    raise exception

      'Service listing payment and Provider IDs are required.'

      using errcode = '22023';

  end if;





  if

    p_snap_token is null

    or btrim(p_snap_token) = ''

  then

    raise exception

      'Midtrans Snap token is required.'

      using errcode = '22023';

  end if;





  if

    p_payment_url is null

    or btrim(p_payment_url) = ''

  then

    raise exception

      'Midtrans payment URL is required.'

      using errcode = '22023';

  end if;





  if

    p_payment_expires_at is null

    or p_payment_expires_at <=

      v_now

  then

    raise exception

      'Payment expiry must be in the future.'

      using errcode = '22023';

  end if;





  select

    slp.payment_status



  into

    v_status



  from public.service_listing_payments

    as slp



  where

    slp.id =

      p_payment_id



    and slp.provider_id =

      p_provider_id



  for update;





  if not found then

    raise exception

      'Service listing payment was not found.'

      using errcode = 'P0002';

  end if;





  if

    v_status =

      'PENDING'

  then

    return false;

  end if;





  if

    v_status <>

      'CREATING'

  then

    raise exception

      'Service listing payment checkout cannot be finalized in its current state.'

      using errcode = '55000';

  end if;





  update

    public.service_listing_payments



  set

    snap_token =

      btrim(p_snap_token),



    payment_url =

      btrim(p_payment_url),



    payment_expires_at =

      p_payment_expires_at,



    payment_status =

      'PENDING',



    updated_at =

      v_now



  where

    id =

      p_payment_id



    and provider_id =

      p_provider_id



    and payment_status =

      'CREATING';





  if not found then

    raise exception

      'Service listing payment lifecycle changed concurrently.'

      using errcode = '40001';

  end if;





  return true;

end;

$function$
;
CREATE OR REPLACE FUNCTION public.get_my_customer_service_requests(p_page integer DEFAULT 1, p_page_size integer DEFAULT 20, p_status text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, service_listing_id uuid, customer_id uuid, provider_id uuid, request_description text, needed_at timestamp with time zone, service_mode text, location_name text, budget bigint, status text, created_at timestamp with time zone, updated_at timestamp with time zone, listing_title text, listing_category text, listing_cover_storage_path text, provider_full_name text, provider_username text, provider_avatar_url text, provider_verification_status text, total_count bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_customer_id uuid;

  v_page integer :=
    greatest(
      coalesce(
        p_page,
        1
      ),
      1
    );

  v_page_size integer :=
    least(
      greatest(
        coalesce(
          p_page_size,
          20
        ),
        1
      ),
      50
    );

  v_status text :=
    nullif(
      btrim(
        p_status
      ),
      ''
    );
begin
  v_customer_id :=
    public.require_current_service_actor();

  if
    v_status is not null
    and v_status not in (
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
  then
    raise exception
      'Service Request status filter is invalid.'
      using errcode = '22023';
  end if;

  return query
  select
    sr.id,
    sr.service_listing_id,
    sr.customer_id,
    sr.provider_id,
    sr.request_description,
    sr.needed_at,
    sr.service_mode,
    sr.location_name,
    sr.budget,
    sr.status,
    sr.created_at,
    sr.updated_at,
    sl.title,
    sl.category,
    cover.storage_path,
    provider.full_name,
    provider.username,
    provider.avatar_url,
    provider.verification_status,
    count(*) over()::bigint

  from public.service_requests as sr

  join public.service_listings as sl
    on sl.id =
      sr.service_listing_id

  join public.users as provider
    on provider.id =
      sr.provider_id

  left join lateral (
    select
      sli.storage_path
    from public.service_listing_images as sli
    where
      sli.service_listing_id =
        sr.service_listing_id
      and sli.kind =
        'COVER'
    order by
      sli.sort_order,
      sli.created_at,
      sli.id
    limit 1
  ) as cover
    on true

  where
    sr.customer_id =
      v_customer_id

    and (
      v_status is null
      or sr.status =
        v_status
    )

  order by
    sr.created_at desc,
    sr.id desc

  limit v_page_size

  offset (
    (
      v_page - 1
    )
    * v_page_size
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_my_latest_service_completion_submission(p_request_id uuid)
 RETURNS TABLE(id uuid, service_request_id uuid, service_agreement_id uuid, submission_no integer, provider_note text, proof_storage_path text, status text, submitted_at timestamp with time zone, customer_responded_at timestamp with time zone, revision_reason text, revision_requested_at timestamp with time zone, accepted_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_actor_id uuid;
begin
  v_actor_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  return query
  select
    scs.id,
    scs.service_request_id,
    scs.service_agreement_id,
    scs.submission_no,
    scs.provider_note,
    scs.proof_storage_path,
    scs.status,
    scs.submitted_at,
    scs.customer_responded_at,
    scs.revision_reason,
    scs.revision_requested_at,
    scs.accepted_at

  from public.service_completion_submissions as scs

  join public.service_requests as sr
    on sr.id =
      scs.service_request_id

  where
    scs.service_request_id =
      p_request_id

    and (
      sr.customer_id =
        v_actor_id

      or sr.provider_id =
        v_actor_id
    )

  order by
    scs.submission_no desc

  limit 1;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_my_provider_service_requests(p_page integer DEFAULT 1, p_page_size integer DEFAULT 20, p_status text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, service_listing_id uuid, customer_id uuid, provider_id uuid, request_description text, needed_at timestamp with time zone, service_mode text, location_name text, budget bigint, status text, created_at timestamp with time zone, updated_at timestamp with time zone, listing_title text, listing_category text, listing_cover_storage_path text, customer_full_name text, customer_username text, customer_avatar_url text, total_count bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_provider_id uuid;

  v_page integer :=
    greatest(
      coalesce(
        p_page,
        1
      ),
      1
    );

  v_page_size integer :=
    least(
      greatest(
        coalesce(
          p_page_size,
          20
        ),
        1
      ),
      50
    );

  v_status text :=
    nullif(
      btrim(
        p_status
      ),
      ''
    );
begin
  v_provider_id :=
    public.require_current_service_actor();

  if
    v_status is not null
    and v_status not in (
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
  then
    raise exception
      'Service Request status filter is invalid.'
      using errcode = '22023';
  end if;

  return query
  select
    sr.id,
    sr.service_listing_id,
    sr.customer_id,
    sr.provider_id,
    sr.request_description,
    sr.needed_at,
    sr.service_mode,
    sr.location_name,
    sr.budget,
    sr.status,
    sr.created_at,
    sr.updated_at,
    sl.title,
    sl.category,
    cover.storage_path,
    customer.full_name,
    customer.username,
    customer.avatar_url,
    count(*) over()::bigint

  from public.service_requests as sr

  join public.service_listings as sl
    on sl.id =
      sr.service_listing_id

  join public.users as customer
    on customer.id =
      sr.customer_id

  left join lateral (
    select
      sli.storage_path
    from public.service_listing_images as sli
    where
      sli.service_listing_id =
        sr.service_listing_id
      and sli.kind =
        'COVER'
    order by
      sli.sort_order,
      sli.created_at,
      sli.id
    limit 1
  ) as cover
    on true

  where
    sr.provider_id =
      v_provider_id

    and (
      v_status is null
      or sr.status =
        v_status
    )

  order by
    sr.created_at desc,
    sr.id desc

  limit v_page_size

  offset (
    (
      v_page - 1
    )
    * v_page_size
  );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_my_service_listing_detail(p_listing_id uuid)
 RETURNS TABLE(id uuid, title text, category text, description text, deliverables text, customer_preparation text, price_from bigint, is_negotiable boolean, service_mode text, location_name text, status text, published_at timestamp with time zone, activated_at timestamp with time zone, expires_at timestamp with time zone, paused_at timestamp with time zone, blocked_at timestamp with time zone, blocked_reason text, blocked_from_status text, archived_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone, cover_storage_path text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$

  select

    sl.id,

    sl.title,

    sl.category,

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

      sli.service_listing_id =

        sl.id

      and sli.kind = 'COVER'

    limit 1

  ) as cover

    on true



  where

    sl.id =

      p_listing_id



    and sl.provider_id =

      auth.uid();

$function$
;
CREATE OR REPLACE FUNCTION public.get_my_service_listing_media(p_listing_id uuid)
 RETURNS TABLE(id uuid, service_listing_id uuid, storage_path text, kind text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$

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

$function$
;
CREATE OR REPLACE FUNCTION public.get_my_service_listing_status_counts()
 RETURNS TABLE(total_count bigint, active_count bigint, draft_count bigint, payment_pending_count bigint, paused_count bigint, expired_count bigint, blocked_count bigint, archived_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select
    count(*)::bigint
      as total_count,

    count(*) filter (
      where sl.status = 'ACTIVE'
    )::bigint
      as active_count,

    count(*) filter (
      where sl.status = 'DRAFT'
    )::bigint
      as draft_count,

    count(*) filter (
      where sl.status = 'PAYMENT_PENDING'
    )::bigint
      as payment_pending_count,

    count(*) filter (
      where sl.status = 'PAUSED'
    )::bigint
      as paused_count,

    count(*) filter (
      where sl.status = 'EXPIRED'
    )::bigint
      as expired_count,

    count(*) filter (
      where sl.status = 'BLOCKED'
    )::bigint
      as blocked_count,

    count(*) filter (
      where sl.status = 'ARCHIVED'
    )::bigint
      as archived_count

  from public.service_listings as sl

  where
    sl.provider_id =
      auth.uid();
$function$
;
CREATE OR REPLACE FUNCTION public.get_my_service_listings(p_page integer DEFAULT 1, p_page_size integer DEFAULT 20)
 RETURNS TABLE(id uuid, title text, category text, description text, deliverables text, customer_preparation text, price_from bigint, is_negotiable boolean, service_mode text, location_name text, status text, published_at timestamp with time zone, activated_at timestamp with time zone, expires_at timestamp with time zone, paused_at timestamp with time zone, blocked_at timestamp with time zone, blocked_reason text, blocked_from_status text, archived_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone, cover_storage_path text, total_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$

  select

    sl.id,

    sl.title,

    sl.category,

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

      as cover_storage_path,



    count(*) over()

      as total_count



  from public.service_listings as sl



  left join lateral (

    select

      sli.storage_path

    from public.service_listing_images as sli

    where

      sli.service_listing_id =

        sl.id

      and sli.kind = 'COVER'

    limit 1

  ) as cover

    on true



  where

    sl.provider_id =

      auth.uid()



  order by

    sl.created_at desc,

    sl.id desc



  limit

    greatest(

      1,

      least(

        coalesce(

          p_page_size,

          20

        ),

        50

      )

    )



    offset (

    (

      greatest(

        coalesce(

          p_page,

          1

        ),

        1

      )::bigint - 1

    )

    *

    greatest(

      1,

      least(

        coalesce(

          p_page_size,

          20

        ),

        50

      )

    )::bigint

  );

$function$
;
CREATE OR REPLACE FUNCTION public.get_my_service_listings_by_status(p_page integer DEFAULT 1, p_page_size integer DEFAULT 20, p_status text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, title text, category text, description text, deliverables text, customer_preparation text, price_from bigint, is_negotiable boolean, service_mode text, location_name text, status text, published_at timestamp with time zone, activated_at timestamp with time zone, expires_at timestamp with time zone, paused_at timestamp with time zone, blocked_at timestamp with time zone, blocked_reason text, blocked_from_status text, archived_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone, cover_storage_path text, total_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select
    sl.id,
    sl.title,
    sl.category,
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
      as cover_storage_path,

    count(*) over()
      as total_count

  from public.service_listings as sl

  left join lateral (
    select
      sli.storage_path
    from public.service_listing_images as sli
    where
      sli.service_listing_id =
        sl.id
      and sli.kind = 'COVER'
    limit 1
  ) as cover
    on true

  where
    sl.provider_id =
      auth.uid()

    and (
      p_status is null
      or sl.status = p_status
    )

  order by
    sl.created_at desc,
    sl.id desc

  limit
    greatest(
      1,
      least(
        coalesce(
          p_page_size,
          20
        ),
        50
      )
    )

  offset (
    (
      greatest(
        coalesce(
          p_page,
          1
        ),
        1
      )::bigint - 1
    )
    *
    greatest(
      1,
      least(
        coalesce(
          p_page_size,
          20
        ),
        50
      )
    )::bigint
  );
$function$
;
CREATE OR REPLACE FUNCTION public.get_my_service_payment_acknowledgements(p_request_id uuid)
 RETURNS TABLE(id uuid, payment_step_id uuid, service_agreement_id uuid, attempt_no integer, status text, customer_note text, customer_reported_at timestamp with time zone, provider_confirmed_at timestamp with time zone, issue_reported_at timestamp with time zone, issue_reason text, provider_note text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_actor_id uuid;
begin
  v_actor_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  return query
  select
    spa.id,
    spa.payment_step_id,
    spa.service_agreement_id,
    spa.attempt_no,
    spa.status,
    spa.customer_note,
    spa.customer_reported_at,
    spa.provider_confirmed_at,
    spa.issue_reported_at,
    spa.issue_reason,
    spa.provider_note,
    spa.created_at,
    spa.updated_at

  from public.service_payment_acknowledgements as spa

  join public.service_agreement_payment_steps as ps
    on ps.id =
      spa.payment_step_id
    and ps.service_agreement_id =
      spa.service_agreement_id

  join public.service_agreements as sa
    on sa.id =
      spa.service_agreement_id

  join public.service_requests as sr
    on sr.id =
      sa.service_request_id

  where
    sr.id =
      p_request_id

    and (
      sr.customer_id =
        v_actor_id

      or sr.provider_id =
        v_actor_id
    )

  order by
    ps.sequence_no,
    spa.attempt_no;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_my_service_request_agreements(p_request_id uuid)
 RETURNS TABLE(id uuid, service_request_id uuid, version integer, supersedes_agreement_id uuid, scope text, deliverables text, total_price bigint, prior_confirmed_amount bigint, deadline timestamp with time zone, revision_terms text, payment_plan_type text, notes text, status text, proposed_by uuid, approved_at timestamp with time zone, rejected_at timestamp with time zone, rejection_reason text, superseded_at timestamp with time zone, created_at timestamp with time zone, payment_steps jsonb)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_actor_id uuid;
begin
  v_actor_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  return query
  select
    sa.id,
    sa.service_request_id,
    sa.version,
    sa.supersedes_agreement_id,
    sa.scope,
    sa.deliverables,
    sa.total_price,
    sa.prior_confirmed_amount,
    sa.deadline,
    sa.revision_terms,
    sa.payment_plan_type,
    sa.notes,
    sa.status,
    sa.proposed_by,
    sa.approved_at,
    sa.rejected_at,
    sa.rejection_reason,
    sa.superseded_at,
    sa.created_at,

    coalesce(
      steps.payment_steps,
      '[]'::jsonb
    )

  from public.service_agreements as sa

  join public.service_requests as sr
    on sr.id =
      sa.service_request_id

  left join lateral (
    select
      jsonb_agg(
        jsonb_build_object(
          'id',
          ps.id,

          'sequence_no',
          ps.sequence_no,

          'label',
          ps.label,

          'amount',
          ps.amount::text,

          'trigger_type',
          ps.trigger_type,

          'trigger_note',
          ps.trigger_note,

          'created_at',
          ps.created_at
        )

        order by
          ps.sequence_no
      ) as payment_steps

    from public.service_agreement_payment_steps as ps

    where
      ps.service_agreement_id =
        sa.id
  ) as steps
    on true

  where
    sa.service_request_id =
      p_request_id

    and (
      sr.customer_id =
        v_actor_id

      or sr.provider_id =
        v_actor_id
    )

  order by
    sa.version desc;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_my_service_request_detail(p_request_id uuid)
 RETURNS TABLE(id uuid, service_listing_id uuid, customer_id uuid, provider_id uuid, request_description text, needed_at timestamp with time zone, service_mode text, location_name text, budget bigint, status text, agreed_at timestamp with time zone, started_at timestamp with time zone, submitted_at timestamp with time zone, completed_at timestamp with time zone, declined_at timestamp with time zone, declined_reason text, cancelled_at timestamp with time zone, cancelled_by uuid, cancellation_reason text, created_at timestamp with time zone, updated_at timestamp with time zone, listing_title text, listing_category text, listing_cover_storage_path text, customer_full_name text, customer_username text, customer_avatar_url text, provider_full_name text, provider_username text, provider_avatar_url text, provider_verification_status text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_actor_id uuid;
begin
  v_actor_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  return query
  select
    sr.id,
    sr.service_listing_id,
    sr.customer_id,
    sr.provider_id,
    sr.request_description,
    sr.needed_at,
    sr.service_mode,
    sr.location_name,
    sr.budget,
    sr.status,
    sr.agreed_at,
    sr.started_at,
    sr.submitted_at,
    sr.completed_at,
    sr.declined_at,
    sr.declined_reason,
    sr.cancelled_at,
    sr.cancelled_by,
    sr.cancellation_reason,
    sr.created_at,
    sr.updated_at,
    sl.title,
    sl.category,
    cover.storage_path,
    customer.full_name,
    customer.username,
    customer.avatar_url,
    provider.full_name,
    provider.username,
    provider.avatar_url,
    provider.verification_status

  from public.service_requests as sr

  join public.service_listings as sl
    on sl.id =
      sr.service_listing_id

  join public.users as customer
    on customer.id =
      sr.customer_id

  join public.users as provider
    on provider.id =
      sr.provider_id

  left join lateral (
    select
      sli.storage_path
    from public.service_listing_images as sli
    where
      sli.service_listing_id =
        sr.service_listing_id
      and sli.kind =
        'COVER'
    order by
      sli.sort_order,
      sli.created_at,
      sli.id
    limit 1
  ) as cover
    on true

  where
    sr.id =
      p_request_id

    and (
      sr.customer_id =
        v_actor_id
      or sr.provider_id =
        v_actor_id
    );
end;
$function$
;
CREATE OR REPLACE FUNCTION public.get_public_service_listing_detail(p_listing_id uuid)
 RETURNS TABLE(id uuid, provider_id uuid, title text, category text, description text, deliverables text, customer_preparation text, price_from bigint, is_negotiable boolean, service_mode text, location_name text, published_at timestamp with time zone, created_at timestamp with time zone, expires_at timestamp with time zone, cover_storage_path text, provider_full_name text, provider_username text, provider_avatar_url text, provider_rating numeric, provider_total_reviews integer, provider_verification_status text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$

  select

    sl.id,

    sl.provider_id,

    sl.title,

    sl.category,

    sl.description,

    sl.deliverables,

    sl.customer_preparation,

    sl.price_from,

    sl.is_negotiable,

    sl.service_mode,

    sl.location_name,

    sl.published_at,

    sl.created_at,

    sl.expires_at,



    cover.storage_path

      as cover_storage_path,



    u.full_name

      as provider_full_name,



    u.username

      as provider_username,



    u.avatar_url

      as provider_avatar_url,



    u.rating

      as provider_rating,



    u.total_reviews

      as provider_total_reviews,



    u.verification_status

      as provider_verification_status



  from public.service_listings as sl



  join public.users as u

    on u.id = sl.provider_id



  left join lateral (

    select

      sli.storage_path

    from public.service_listing_images as sli

    where

      sli.service_listing_id =

        sl.id

      and sli.kind = 'COVER'

    limit 1

  ) as cover

    on true



  where

    sl.id = p_listing_id



    and sl.status = 'ACTIVE'



    and sl.expires_at >

      statement_timestamp()



    and not coalesce(

      u.is_banned,

      false

    )



    and not (

      coalesce(

        u.is_suspended,

        false

      )

      and (

        u.suspended_until is null

        or u.suspended_until >

          statement_timestamp()

      )

    );

$function$
;
CREATE OR REPLACE FUNCTION public.get_public_service_listing_media(p_listing_id uuid)
 RETURNS TABLE(id uuid, service_listing_id uuid, storage_path text, kind text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
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

  join public.users as u
    on u.id =
      sl.provider_id

  where
    sli.service_listing_id =
      p_listing_id

    and sli.kind in (
      'COVER',
      'PORTFOLIO'
    )

    and sl.status =
      'ACTIVE'

    and sl.expires_at >
      statement_timestamp()

    and not coalesce(
      u.is_banned,
      false
    )

    and not (
      coalesce(
        u.is_suspended,
        false
      )
      and (
        u.suspended_until is null
        or u.suspended_until >
          statement_timestamp()
      )
    )

  order by
    case
      when sli.kind = 'COVER'
        then 0
      else 1
    end,
    sli.sort_order,
    sli.created_at,
    sli.id;
$function$
;
CREATE OR REPLACE FUNCTION public.get_public_service_listings(p_page integer DEFAULT 1, p_page_size integer DEFAULT 20, p_category text DEFAULT NULL::text, p_service_mode text DEFAULT NULL::text, p_search text DEFAULT NULL::text, p_provider_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, provider_id uuid, title text, category text, description text, price_from bigint, is_negotiable boolean, service_mode text, location_name text, created_at timestamp with time zone, expires_at timestamp with time zone, cover_storage_path text, provider_full_name text, provider_username text, provider_avatar_url text, provider_rating numeric, provider_total_reviews integer, provider_verification_status text, total_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$

  select

    sl.id,

    sl.provider_id,

    sl.title,

    sl.category,

    sl.description,

    sl.price_from,

    sl.is_negotiable,

    sl.service_mode,

    sl.location_name,

    sl.created_at,

    sl.expires_at,



    cover.storage_path

      as cover_storage_path,



    u.full_name

      as provider_full_name,



    u.username

      as provider_username,



    u.avatar_url

      as provider_avatar_url,



    u.rating

      as provider_rating,



    u.total_reviews

      as provider_total_reviews,



    u.verification_status

      as provider_verification_status,



    count(*) over()

      as total_count



  from public.service_listings as sl



  join public.users as u

    on u.id = sl.provider_id



  left join lateral (

    select

      sli.storage_path

    from public.service_listing_images as sli

    where

      sli.service_listing_id =

        sl.id

      and sli.kind = 'COVER'

    limit 1

  ) as cover

    on true



  where

    sl.status = 'ACTIVE'



    and sl.expires_at >

      statement_timestamp()



    and not coalesce(

      u.is_banned,

      false

    )



    and not (

      coalesce(

        u.is_suspended,

        false

      )

      and (

        u.suspended_until is null

        or u.suspended_until >

          statement_timestamp()

      )

    )



    and (

      p_provider_id is null

      or sl.provider_id =

        p_provider_id

    )



    and (

      p_category is null

      or btrim(p_category) = ''

      or sl.category =

        p_category

    )



    and (

      p_service_mode is null

      or btrim(p_service_mode) = ''

      or sl.service_mode =

        p_service_mode

      or (

        p_service_mode in (

          'ONLINE',

          'OFFLINE'

        )

        and sl.service_mode =

          'BOTH'

      )

    )



    and (

      p_search is null

      or btrim(p_search) = ''

      or sl.title ilike

        '%' || btrim(p_search) || '%'

      or sl.description ilike

        '%' || btrim(p_search) || '%'

      or sl.category ilike

        '%' || btrim(p_search) || '%'

      or coalesce(

        sl.location_name,

        ''

      ) ilike

        '%' || btrim(p_search) || '%'

    )



  order by

    sl.created_at desc,

    sl.id desc



  limit

    greatest(

      1,

      least(

        coalesce(

          p_page_size,

          20

        ),

        50

      )

    )



    offset (

    (

      greatest(

        coalesce(

          p_page,

          1

        ),

        1

      )::bigint - 1

    )

    *

    greatest(

      1,

      least(

        coalesce(

          p_page_size,

          20

        ),

        50

      )

    )::bigint

  );

$function$
;
CREATE OR REPLACE FUNCTION public.lock_service_provider_publication(p_provider_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

begin

  if p_provider_id is null then

    raise exception

      'Service Provider identity is required.'

      using errcode = '22004';

  end if;



  perform

    pg_catalog.pg_advisory_xact_lock(

      pg_catalog.hashtextextended(

        p_provider_id::text,

        843746291::bigint

      )

    );

end;

$function$
;
CREATE OR REPLACE FUNCTION public.mark_service_request_conversation_read(p_conversation_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_actor_id uuid;

  v_owner_id uuid;

  v_helper_id uuid;
begin
  v_actor_id :=
    public.require_current_service_actor();

  if p_conversation_id is null then
    raise exception
      'Conversation identity is required.'
      using errcode = '22023';
  end if;

  select
    c.owner_id,
    c.helper_id

  into
    v_owner_id,
    v_helper_id

  from public.conversations as c

  where
    c.id =
      p_conversation_id

    and c.task_id is null

    and c.service_request_id is not null

    and (
      c.owner_id =
        v_actor_id

      or c.helper_id =
        v_actor_id
    )

  for update;

  if not found then
    raise exception
      'Service conversation was not found.'
      using errcode = 'P0002';
  end if;

  if v_actor_id =
    v_owner_id
  then
    update public.conversations
    set
      owner_unread_count =
        0
    where
      id =
        p_conversation_id;
  elsif v_actor_id =
    v_helper_id
  then
    update public.conversations
    set
      helper_unread_count =
        0
    where
      id =
        p_conversation_id;
  else
    raise exception
      'Service conversation was not found.'
      using errcode = 'P0002';
  end if;

  return p_conversation_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.notify_service_agreement_lifecycle()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_customer_id uuid;

  v_provider_id uuid;

  v_recipient_id uuid;

  v_title text;

  v_message text;

  v_type text;

  v_dedupe_key text;
begin
  select
    sr.customer_id,
    sr.provider_id
  into
    v_customer_id,
    v_provider_id
  from public.service_requests as sr
  where
    sr.id =
      new.service_request_id;

  if not found then
    raise exception
      'Service Request for Agreement notification was not found.'
      using errcode = '23503';
  end if;

  if tg_op = 'INSERT' then
    if new.status <> 'PROPOSED' then
      return new;
    end if;

    v_recipient_id :=
      v_customer_id;

    v_title :=
      'Proposal kesepakatan baru';

    v_message :=
      'Penyedia mengirim proposal kesepakatan untuk permintaan jasamu.';

    v_type :=
      'SERVICE_AGREEMENT_PROPOSED';

    v_dedupe_key :=
      'service-agreement:' ||
      new.id::text ||
      ':proposed';

  elsif tg_op = 'UPDATE' then
    if
      old.status = 'PROPOSED'
      and new.status = 'APPROVED'
    then
      v_recipient_id :=
        v_provider_id;

      v_title :=
        'Kesepakatan disetujui';

      v_message :=
        'Pelanggan menyetujui proposal kesepakatanmu.';

      v_type :=
        'SERVICE_AGREEMENT_APPROVED';

      v_dedupe_key :=
        'service-agreement:' ||
        new.id::text ||
        ':approved';

    elsif
      old.status = 'PROPOSED'
      and new.status = 'REJECTED'
    then
      v_recipient_id :=
        v_provider_id;

      v_title :=
        'Proposal perlu dibahas lagi';

      v_message :=
        'Pelanggan menolak proposal dan permintaan kembali ke tahap negosiasi.';

      v_type :=
        'SERVICE_AGREEMENT_REJECTED';

      v_dedupe_key :=
        'service-agreement:' ||
        new.id::text ||
        ':rejected';

    else
      return new;
    end if;

  else
    return new;
  end if;

  insert into public.notifications (
    user_id,
    title,
    message,
    type,
    category,
    is_read,
    redirect_url,
    service_request_id,
    dedupe_key
  )
  values (
    v_recipient_id,
    v_title,
    v_message,
    v_type,
    'SERVICE',
    false,
    '/service-requests/' ||
      new.service_request_id::text,
    new.service_request_id,
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
$function$
;
CREATE OR REPLACE FUNCTION public.notify_service_completion_response()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_provider_id uuid;

  v_title text;

  v_message text;

  v_type text;

  v_dedupe_key text;
begin
  if
    old.status = 'SUBMITTED'
    and new.status = 'REVISION_REQUESTED'
  then
    v_title :=
      'Revisi diminta';

    v_message :=
      'Customer meminta revisi pada hasil pekerjaanmu.';

    v_type :=
      'SERVICE_COMPLETION_REVISION_REQUESTED';

    v_dedupe_key :=
      'service-completion:' ||
      new.id::text ||
      ':revision-requested';

  elsif
    old.status = 'SUBMITTED'
    and new.status = 'ACCEPTED'
  then
    v_title :=
      'Hasil pekerjaan diterima';

    v_message :=
      'Customer menerima hasil pekerjaanmu.';

    v_type :=
      'SERVICE_COMPLETION_ACCEPTED';

    v_dedupe_key :=
      'service-completion:' ||
      new.id::text ||
      ':accepted';

  else
    return new;
  end if;

  select
    sr.provider_id

  into
    v_provider_id

  from public.service_requests as sr

  where
    sr.id =
      new.service_request_id;

  if not found then
    return new;
  end if;

  insert into public.notifications (
    user_id,
    title,
    message,
    type,
    category,
    is_read,
    redirect_url,
    service_request_id,
    dedupe_key
  )
  values (
    v_provider_id,
    v_title,
    v_message,
    v_type,
    'SERVICE',
    false,
    '/service-requests/' ||
      new.service_request_id::text,
    new.service_request_id,
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
$function$
;
CREATE OR REPLACE FUNCTION public.notify_service_completion_submission()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_customer_id uuid;
begin
  if new.status <> 'SUBMITTED' then
    return new;
  end if;

  select
    sr.customer_id

  into
    v_customer_id

  from public.service_requests as sr

  where
    sr.id =
      new.service_request_id;

  if not found then
    return new;
  end if;

  insert into public.notifications (
    user_id,
    title,
    message,
    type,
    category,
    is_read,
    redirect_url,
    service_request_id,
    dedupe_key
  )
  values (
    v_customer_id,
    'Hasil pekerjaan dikirim',
    'Penyedia mengirim hasil pekerjaan untuk kamu periksa.',
    'SERVICE_COMPLETION_SUBMITTED',
    'SERVICE',
    false,
    '/service-requests/' ||
      new.service_request_id::text,
    new.service_request_id,
    'service-completion:' ||
      new.id::text ||
      ':submitted'
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
$function$
;
CREATE OR REPLACE FUNCTION public.notify_service_listing_expiration()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$
;
CREATE OR REPLACE FUNCTION public.notify_service_payment_acknowledgement_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_request_id uuid;

  v_customer_id uuid;

  v_provider_id uuid;

  v_recipient_id uuid;

  v_title text;

  v_message text;

  v_type text;

  v_dedupe_suffix text;
begin
  if
    tg_op = 'INSERT'
    and new.status =
      'CUSTOMER_REPORTED_PAID'
  then
    v_type :=
      'SERVICE_PAYMENT_REPORTED';

    v_title :=
      'Pembayaran dilaporkan';

    v_message :=
      'Customer melaporkan pembayaran untuk kamu periksa.';

    v_dedupe_suffix :=
      'reported';

  elsif
    tg_op = 'UPDATE'
    and old.status =
      'CUSTOMER_REPORTED_PAID'
    and new.status =
      'PROVIDER_CONFIRMED'
  then
    v_type :=
      'SERVICE_PAYMENT_CONFIRMED';

    v_title :=
      'Pembayaran dikonfirmasi';

    v_message :=
      'Penyedia telah mengonfirmasi pembayaranmu.';

    v_dedupe_suffix :=
      'confirmed';

  elsif
    tg_op = 'UPDATE'
    and old.status =
      'CUSTOMER_REPORTED_PAID'
    and new.status =
      'PAYMENT_ISSUE'
  then
    v_type :=
      'SERVICE_PAYMENT_ISSUE';

    v_title :=
      'Ada masalah pembayaran';

    v_message :=
      'Penyedia melaporkan masalah pada pembayaranmu.';

    v_dedupe_suffix :=
      'issue';

  else
    return new;
  end if;

  select
    sr.id,
    sr.customer_id,
    sr.provider_id

  into
    v_request_id,
    v_customer_id,
    v_provider_id

  from public.service_agreements as sa

  join public.service_requests as sr
    on sr.id =
      sa.service_request_id

  where
    sa.id =
      new.service_agreement_id;

  if not found then
    raise exception
      'Service payment notification Request was not found.'
      using errcode = 'P0002';
  end if;

  if
    new.status =
      'CUSTOMER_REPORTED_PAID'
  then
    v_recipient_id :=
      v_provider_id;
  else
    v_recipient_id :=
      v_customer_id;
  end if;

  insert into public.notifications (
    user_id,
    title,
    message,
    type,
    category,
    redirect_url,
    service_request_id,
    dedupe_key
  )
  values (
    v_recipient_id,
    v_title,
    v_message,
    v_type,
    'SERVICE',
    '/service-requests/' ||
      v_request_id::text,
    v_request_id,
    'service-payment:' ||
      new.id::text ||
      ':' ||
      v_dedupe_suffix
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
$function$
;
CREATE OR REPLACE FUNCTION public.notify_service_request_lifecycle()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_recipient_id uuid;

  v_title text;

  v_message text;

  v_type text;

  v_dedupe_key text;
begin
  if tg_op = 'INSERT' then
    if new.status <> 'PENDING_PROVIDER' then
      return new;
    end if;

    v_recipient_id :=
      new.provider_id;

    v_title :=
      'Permintaan jasa baru';

    v_message :=
      'Seseorang mengirim permintaan untuk jasamu.';

    v_type :=
      'SERVICE_REQUEST_CREATED';

    v_dedupe_key :=
      'service-request:' ||
      new.id::text ||
      ':created';

  elsif tg_op = 'UPDATE' then
    if
      old.status = 'PENDING_PROVIDER'
      and new.status = 'NEGOTIATING'
    then
      v_recipient_id :=
        new.customer_id;

      v_title :=
        'Penyedia merespons';

      v_message :=
        'Penyedia mulai membahas permintaan jasamu.';

      v_type :=
        'SERVICE_REQUEST_NEGOTIATING';

      v_dedupe_key :=
        'service-request:' ||
        new.id::text ||
        ':negotiating';

    elsif
      old.status = 'AGREED'
      and new.status = 'IN_PROGRESS'
    then
      v_recipient_id :=
        new.customer_id;

      v_title :=
        'Pekerjaan dimulai';

      v_message :=
        'Penyedia mulai mengerjakan permintaan jasamu.';

      v_type :=
        'SERVICE_REQUEST_IN_PROGRESS';

      v_dedupe_key :=
        'service-request:' ||
        new.id::text ||
        ':in-progress';

    elsif
      old.status in (
        'PENDING_PROVIDER',
        'NEGOTIATING'
      )
      and new.status = 'DECLINED'
    then
      v_recipient_id :=
        new.customer_id;

      v_title :=
        'Permintaan jasa ditolak';

      v_message :=
        'Penyedia tidak dapat menerima permintaan jasamu.';

      v_type :=
        'SERVICE_REQUEST_DECLINED';

      v_dedupe_key :=
        'service-request:' ||
        new.id::text ||
        ':declined';

    elsif
      old.status in (
        'PENDING_PROVIDER',
        'NEGOTIATING'
      )
      and new.status = 'CANCELLED'
    then
      v_recipient_id :=
        new.provider_id;

      v_title :=
        'Permintaan jasa dibatalkan';

      v_message :=
        'Pelanggan membatalkan permintaan jasa.';

      v_type :=
        'SERVICE_REQUEST_CANCELLED';

      v_dedupe_key :=
        'service-request:' ||
        new.id::text ||
        ':cancelled';

    else
      return new;
    end if;

  else
    return new;
  end if;

  insert into public.notifications (
    user_id,
    title,
    message,
    type,
    category,
    is_read,
    redirect_url,
    service_request_id,
    dedupe_key
  )
  values (
    v_recipient_id,
    v_title,
    v_message,
    v_type,
    'SERVICE',
    false,
    '/service-requests/' ||
      new.id::text,
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
$function$
;
CREATE OR REPLACE FUNCTION public.pause_service_listing(p_listing_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare

  v_provider_id uuid;



  v_status text;



  v_expires_at timestamptz;



  v_now timestamptz :=

    statement_timestamp();

begin

  v_provider_id :=

    public.require_current_service_actor();



  select

    sl.status,

    sl.expires_at

  into

    v_status,

    v_expires_at

  from public.service_listings as sl

  where

    sl.id = p_listing_id

    and sl.provider_id =

      v_provider_id

  for update;



  if not found then

    raise exception

      'Service listing was not found.'

      using errcode = 'P0002';

  end if;



  if v_status not in (

    'ACTIVE',

    'PAUSED'

  ) then

    raise exception

      'Service listing cannot be paused in its current state.'

      using errcode = '55000';

  end if;



  if

    v_expires_at is null

    or v_expires_at <= v_now

  then

    raise exception

      'Service listing publication period has expired.'

      using errcode = '55000';

  end if;



  if v_status = 'PAUSED' then

    return p_listing_id;

  end if;



  update public.service_listings

  set

    status = 'PAUSED',

    paused_at = v_now,

    updated_at = v_now

  where

    id = p_listing_id

    and provider_id =

      v_provider_id

    and status = 'ACTIVE';



  if not found then

    raise exception

      'Service listing lifecycle changed concurrently.'

      using errcode = '40001';

  end if;



  return p_listing_id;

end;

$function$
;
CREATE OR REPLACE FUNCTION public.propose_service_agreement(p_request_id uuid, p_scope text, p_deliverables text, p_total_price bigint, p_deadline timestamp with time zone, p_revision_terms text, p_payment_plan_type text, p_payment_steps jsonb, p_notes text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_provider_id uuid;

  v_request_status text;

  v_scope text :=
    nullif(
      btrim(
        p_scope
      ),
      ''
    );

  v_deliverables text :=
    nullif(
      btrim(
        p_deliverables
      ),
      ''
    );

  v_revision_terms text :=
    nullif(
      btrim(
        p_revision_terms
      ),
      ''
    );

  v_payment_plan_type text :=
    nullif(
      upper(
        btrim(
          p_payment_plan_type
        )
      ),
      ''
    );

  v_notes text :=
    nullif(
      btrim(
        p_notes
      ),
      ''
    );

  v_previous_agreement_id uuid;

  v_previous_version integer;

  v_previous_status text;

  v_next_version integer;

  v_agreement_id uuid;

  v_step jsonb;

  v_sequence_no integer;

  v_step_label text;

  v_step_amount_numeric numeric;

  v_step_amount bigint;

  v_step_trigger_type text;

  v_step_trigger_note text;

  v_total_step_amount numeric :=
    0;
begin
  v_provider_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  if v_scope is null then
    raise exception
      'Agreement scope is required.'
      using errcode = '22023';
  end if;

  if v_deliverables is null then
    raise exception
      'Agreement deliverables are required.'
      using errcode = '22023';
  end if;

  if
    p_total_price is null
    or p_total_price <= 0
  then
    raise exception
      'Agreement total price must be positive.'
      using errcode = '22023';
  end if;

  if p_deadline is null then
    raise exception
      'Agreement deadline is required.'
      using errcode = '22023';
  end if;

  if v_revision_terms is null then
    raise exception
      'Agreement revision terms are required.'
      using errcode = '22023';
  end if;

  if
    v_payment_plan_type is null
    or v_payment_plan_type not in (
      'AFTER_COMPLETION',
      'DEPOSIT_FINAL',
      'MILESTONES',
      'FULL_UPFRONT'
    )
  then
    raise exception
      'Agreement payment plan type is invalid.'
      using errcode = '22023';
  end if;

  if
    p_payment_steps is null
    or jsonb_typeof(
      p_payment_steps
    ) <> 'array'
    or jsonb_array_length(
      p_payment_steps
    ) = 0
  then
    raise exception
      'Agreement payment steps are required.'
      using errcode = '22023';
  end if;

  -- Serialize all lifecycle changes for this Request.
  --
  -- Provider identity comes from auth context and the
  -- Service Request itself, never from the browser.

  select
    sr.status

  into
    v_request_status

  from public.service_requests as sr

  where
    sr.id =
      p_request_id

    and sr.provider_id =
      v_provider_id

  for update;

  if not found then
    raise exception
      'Service Request was not found.'
      using errcode = 'P0002';
  end if;

  if v_request_status <> 'NEGOTIATING' then
    raise exception
      'Agreement cannot be proposed from the current Service Request state.'
      using errcode = '42501';
  end if;

  -- The Request row lock serializes version allocation,
  -- so the browser never chooses version or predecessor.

  select
    sa.id,
    sa.version,
    sa.status

  into
    v_previous_agreement_id,
    v_previous_version,
    v_previous_status

  from public.service_agreements as sa

  where
    sa.service_request_id =
      p_request_id

  order by
    sa.version desc

  limit 1;

  if found then
    if v_previous_status <> 'REJECTED' then
      raise exception
        'A new Agreement version cannot be proposed while the previous Agreement is still active.'
        using errcode = '42501';
    end if;

    if v_previous_version >= 2147483647 then
      raise exception
        'Agreement version limit has been reached.'
        using errcode = '22003';
    end if;

    v_next_version :=
      v_previous_version +
      1;
  else
    v_previous_agreement_id :=
      null;

    v_next_version :=
      1;
  end if;

  insert into public.service_agreements (
    service_request_id,
    version,
    supersedes_agreement_id,
    scope,
    deliverables,
    total_price,
    prior_confirmed_amount,
    deadline,
    revision_terms,
    payment_plan_type,
    notes,
    status,
    proposed_by
  )
  values (
    p_request_id,
    v_next_version,
    v_previous_agreement_id,
    v_scope,
    v_deliverables,
    p_total_price,
    0,
    p_deadline,
    v_revision_terms,
    v_payment_plan_type,
    v_notes,
    'PROPOSED',
    v_provider_id
  )
  returning
    id

  into
    v_agreement_id;

  -- sequence_no is database-derived from array order.
  --
  -- Browser cannot choose arbitrary sequence numbers.

  for
    v_step,
    v_sequence_no
  in
    select
      step.value,
      step.ordinality::integer

    from jsonb_array_elements(
      p_payment_steps
    )
    with ordinality as step(
      value,
      ordinality
    )
  loop
    if jsonb_typeof(
      v_step
    ) <> 'object'
    then
      raise exception
        'Agreement payment step is invalid.'
        using errcode = '22023';
    end if;

    v_step_label :=
      nullif(
        btrim(
          v_step ->> 'label'
        ),
        ''
      );

    if v_step_label is null then
      raise exception
        'Agreement payment step label is required.'
        using errcode = '22023';
    end if;

    if
      not (
        v_step ? 'amount'
      )
      or jsonb_typeof(
        v_step -> 'amount'
      ) <> 'number'
    then
      raise exception
        'Agreement payment step amount is invalid.'
        using errcode = '22023';
    end if;

    v_step_amount_numeric :=
      (
        v_step ->> 'amount'
      )::numeric;

    if
      v_step_amount_numeric <= 0
      or trunc(
        v_step_amount_numeric
      ) <> v_step_amount_numeric
      or v_step_amount_numeric > 9223372036854775807
    then
      raise exception
        'Agreement payment step amount is invalid.'
        using errcode = '22023';
    end if;

    v_step_amount :=
      v_step_amount_numeric::bigint;

    v_step_trigger_type :=
      nullif(
        upper(
          btrim(
            v_step ->> 'trigger_type'
          )
        ),
        ''
      );

    if
      v_step_trigger_type is null
      or v_step_trigger_type not in (
        'UPFRONT',
        'BEFORE_START',
        'MILESTONE',
        'ON_SUBMISSION',
        'AFTER_COMPLETION',
        'CUSTOM'
      )
    then
      raise exception
        'Agreement payment step trigger type is invalid.'
        using errcode = '22023';
    end if;

    v_step_trigger_note :=
      nullif(
        btrim(
          v_step ->> 'trigger_note'
        ),
        ''
      );

    if
      v_step_trigger_type = 'CUSTOM'
      and v_step_trigger_note is null
    then
      raise exception
        'Custom payment step trigger note is required.'
        using errcode = '22023';
    end if;

    insert into public.service_agreement_payment_steps (
      service_agreement_id,
      sequence_no,
      label,
      amount,
      trigger_type,
      trigger_note
    )
    values (
      v_agreement_id,
      v_sequence_no,
      v_step_label,
      v_step_amount,
      v_step_trigger_type,
      v_step_trigger_note
    );

    v_total_step_amount :=
      v_total_step_amount +
      v_step_amount_numeric;
  end loop;

  if
    v_total_step_amount <>
      p_total_price::numeric
  then
    raise exception
      'Agreement payment steps must equal the total price.'
      using errcode = '22023';
  end if;

  update public.service_requests
  set
    status =
      'AGREEMENT_PENDING',

    updated_at =
      statement_timestamp()

  where
    id =
      p_request_id

    and provider_id =
      v_provider_id

    and status =
      'NEGOTIATING';

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return v_agreement_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.reject_service_agreement(p_agreement_id uuid, p_reason text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_customer_id uuid;

  v_request_id uuid;

  v_request_status text;

  v_agreement_status text;

  v_reason text :=
    nullif(
      btrim(
        p_reason
      ),
      ''
    );

  v_now timestamptz :=
    statement_timestamp();
begin
  v_customer_id :=
    public.require_current_service_actor();

  if p_agreement_id is null then
    raise exception
      'Agreement identity is required.'
      using errcode = '22023';
  end if;

  if v_reason is null then
    raise exception
      'Agreement rejection reason is required.'
      using errcode = '22023';
  end if;

  select
    sa.service_request_id

  into
    v_request_id

  from public.service_agreements as sa

  where
    sa.id =
      p_agreement_id;

  if not found then
    raise exception
      'Agreement was not found.'
      using errcode = 'P0002';
  end if;

  select
    sr.status

  into
    v_request_status

  from public.service_requests as sr

  where
    sr.id =
      v_request_id

    and sr.customer_id =
      v_customer_id

  for update;

  if not found then
    raise exception
      'Agreement was not found.'
      using errcode = 'P0002';
  end if;

  if v_request_status <> 'AGREEMENT_PENDING' then
    raise exception
      'Agreement cannot be rejected from the current Service Request state.'
      using errcode = '42501';
  end if;

  select
    sa.status

  into
    v_agreement_status

  from public.service_agreements as sa

  where
    sa.id =
      p_agreement_id

    and sa.service_request_id =
      v_request_id

  for update;

  if not found then
    raise exception
      'Agreement was not found.'
      using errcode = 'P0002';
  end if;

  if v_agreement_status <> 'PROPOSED' then
    raise exception
      'Only a proposed Agreement can be rejected.'
      using errcode = '42501';
  end if;

  update public.service_agreements
  set
    status =
      'REJECTED',

    rejected_at =
      v_now,

    rejection_reason =
      v_reason

  where
    id =
      p_agreement_id

    and service_request_id =
      v_request_id

    and status =
      'PROPOSED';

  if not found then
    raise exception
      'Agreement changed concurrently.'
      using errcode = '40001';
  end if;

  update public.service_requests
  set
    status =
      'NEGOTIATING',

    updated_at =
      v_now

  where
    id =
      v_request_id

    and customer_id =
      v_customer_id

    and status =
      'AGREEMENT_PENDING';

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return p_agreement_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.report_service_payment_issue(p_acknowledgement_id uuid, p_issue_reason text, p_provider_note text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_actor_id uuid;

  v_provider_id uuid;

  v_status text;

  v_issue_reason text :=
    nullif(
      btrim(
        p_issue_reason
      ),
      ''
    );

  v_provider_note text :=
    nullif(
      btrim(
        p_provider_note
      ),
      ''
    );

  v_now timestamptz :=
    statement_timestamp();
begin
  v_actor_id :=
    public.require_current_service_actor();

  if p_acknowledgement_id is null then
    raise exception
      'Service payment acknowledgement identity is required.'
      using errcode = '22023';
  end if;

  if v_issue_reason is null then
    raise exception
      'Service payment issue reason is required.'
      using errcode = '22023';
  end if;

  select
    sr.provider_id,
    spa.status

  into
    v_provider_id,
    v_status

  from public.service_payment_acknowledgements as spa

  join public.service_agreements as sa
    on sa.id =
      spa.service_agreement_id

  join public.service_requests as sr
    on sr.id =
      sa.service_request_id

  where
    spa.id =
      p_acknowledgement_id

  for update of spa, sa, sr;

  if not found then
    raise exception
      'Service payment acknowledgement was not found.'
      using errcode = 'P0002';
  end if;

  if v_provider_id <> v_actor_id then
    raise exception
      'Only the Provider can report an issue for this Service payment.'
      using errcode = '42501';
  end if;

  if v_status <> 'CUSTOMER_REPORTED_PAID' then
    raise exception
      'This Service payment acknowledgement is no longer awaiting confirmation.'
      using errcode = '55000';
  end if;

  update public.service_payment_acknowledgements
  set
    status =
      'PAYMENT_ISSUE',

    provider_confirmed_at =
      null,

    issue_reported_at =
      v_now,

    issue_reason =
      v_issue_reason,

    provider_note =
      v_provider_note,

    updated_at =
      v_now

  where
    id =
      p_acknowledgement_id
    and status =
      'CUSTOMER_REPORTED_PAID';

  if not found then
    raise exception
      'Service payment acknowledgement changed concurrently.'
      using errcode = '40001';
  end if;

  return
    p_acknowledgement_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.report_service_payment_paid(p_payment_step_id uuid, p_customer_note text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_actor_id uuid;

  v_agreement_id uuid;

  v_request_id uuid;

  v_customer_id uuid;

  v_agreement_status text;

  v_request_status text;

  v_trigger_type text;

  v_customer_note text :=
    nullif(
      btrim(
        p_customer_note
      ),
      ''
    );

  v_attempt_no integer;

  v_acknowledgement_id uuid;

  v_now timestamptz :=
    statement_timestamp();
begin
  v_actor_id :=
    public.require_current_service_actor();

  if p_payment_step_id is null then
    raise exception
      'Service payment step identity is required.'
      using errcode = '22023';
  end if;

  -- Serialize acknowledgement creation per payment step.
  --
  -- Agreement / Request identity and Customer ownership are
  -- derived from authoritative database relations, never
  -- from browser-provided participant identifiers.

  select
    ps.service_agreement_id,
    sa.service_request_id,
    sr.customer_id,
    sa.status,
    sr.status,
    ps.trigger_type

  into
    v_agreement_id,
    v_request_id,
    v_customer_id,
    v_agreement_status,
    v_request_status,
    v_trigger_type

  from public.service_agreement_payment_steps as ps

  join public.service_agreements as sa
    on sa.id =
      ps.service_agreement_id

  join public.service_requests as sr
    on sr.id =
      sa.service_request_id

  where
    ps.id =
      p_payment_step_id

  for update of ps, sa, sr;

  if not found then
    raise exception
      'Service payment step was not found.'
      using errcode = 'P0002';
  end if;

  if v_customer_id <> v_actor_id then
    raise exception
      'Only the Customer can report this Service payment.'
      using errcode = '42501';
  end if;

  if v_agreement_status <> 'APPROVED' then
    raise exception
      'Service Agreement is not approved.'
      using errcode = '55000';
  end if;

  -- Trigger eligibility is enforced on the server.
  --
  -- UPFRONT / BEFORE_START:
  --   available after the Agreement becomes active.
  --
  -- MILESTONE:
  --   work must already be in progress or later.
  --
  -- CUSTOM:
  --   exact timing remains human-defined by trigger_note, so
  --   the server only requires the agreed lifecycle or later.
  --
  -- ON_SUBMISSION:
  --   result must have been submitted (or already completed).
  --
  -- AFTER_COMPLETION:
  --   Request must be fully completed.

  if
    v_trigger_type in (
      'UPFRONT',
      'BEFORE_START',
      'CUSTOM'
    )
    and v_request_status not in (
      'AGREED',
      'IN_PROGRESS',
      'SUBMITTED',
      'COMPLETED'
    )
  then
    raise exception
      'This Service payment step is not available yet.'
      using errcode = '55000';
  end if;

  if
    v_trigger_type = 'MILESTONE'
    and v_request_status not in (
      'IN_PROGRESS',
      'SUBMITTED',
      'COMPLETED'
    )
  then
    raise exception
      'This Service payment milestone is not available yet.'
      using errcode = '55000';
  end if;

  if
    v_trigger_type = 'ON_SUBMISSION'
    and v_request_status not in (
      'SUBMITTED',
      'COMPLETED'
    )
  then
    raise exception
      'This Service payment step is not available yet.'
      using errcode = '55000';
  end if;

  if
    v_trigger_type = 'AFTER_COMPLETION'
    and v_request_status <> 'COMPLETED'
  then
    raise exception
      'This Service payment step is available after completion.'
      using errcode = '55000';
  end if;

  if exists (
    select 1
    from public.service_payment_acknowledgements as spa
    where
      spa.payment_step_id =
        p_payment_step_id
      and spa.status =
        'PROVIDER_CONFIRMED'
  ) then
    raise exception
      'This Service payment has already been confirmed.'
      using errcode = '55000';
  end if;

  if exists (
    select 1
    from public.service_payment_acknowledgements as spa
    where
      spa.payment_step_id =
        p_payment_step_id
      and spa.status =
        'CUSTOMER_REPORTED_PAID'
  ) then
    raise exception
      'This Service payment is already awaiting Provider confirmation.'
      using errcode = '55000';
  end if;

  select
    coalesce(
      max(
        spa.attempt_no
      ),
      0
    ) + 1

  into
    v_attempt_no

  from public.service_payment_acknowledgements as spa

  where
    spa.payment_step_id =
      p_payment_step_id;

  insert into public.service_payment_acknowledgements (
    payment_step_id,
    service_agreement_id,
    attempt_no,
    status,
    customer_note,
    customer_reported_at,
    created_at,
    updated_at
  )
  values (
    p_payment_step_id,
    v_agreement_id,
    v_attempt_no,
    'CUSTOMER_REPORTED_PAID',
    v_customer_note,
    v_now,
    v_now,
    v_now
  )
  returning
    id
  into
    v_acknowledgement_id;

  return
    v_acknowledgement_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.request_service_completion_revision(p_request_id uuid, p_revision_reason text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_customer_id uuid;

  v_request_status text;

  v_submission_id uuid;

  v_revision_reason text;

  v_now timestamptz :=
    statement_timestamp();
begin
  v_customer_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  v_revision_reason :=
    btrim(
      coalesce(
        p_revision_reason,
        ''
      )
    );

  if v_revision_reason = '' then
    raise exception
      'Revision reason is required.'
      using errcode = '22023';
  end if;

  select
    sr.status

  into
    v_request_status

  from public.service_requests as sr

  where
    sr.id =
      p_request_id

    and sr.customer_id =
      v_customer_id

  for update;

  if not found then
    raise exception
      'Service Request was not found.'
      using errcode = 'P0002';
  end if;

  if v_request_status <> 'SUBMITTED' then
    raise exception
      'Revision cannot be requested from the current Service Request state.'
      using errcode = '42501';
  end if;

  select
    scs.id

  into
    v_submission_id

  from public.service_completion_submissions as scs

  where
    scs.service_request_id =
      p_request_id

    and scs.status =
      'SUBMITTED'

  order by
    scs.submission_no desc

  limit 1

  for update;

  if not found then
    raise exception
      'An active completion submission is required.'
      using errcode = '42501';
  end if;

  update public.service_completion_submissions
  set
    status =
      'REVISION_REQUESTED',

    customer_responded_at =
      v_now,

    revision_reason =
      v_revision_reason,

    revision_requested_at =
      v_now

  where
    id =
      v_submission_id

    and status =
      'SUBMITTED';

  if not found then
    raise exception
      'Completion submission changed concurrently.'
      using errcode = '40001';
  end if;

  update public.service_requests
  set
    status =
      'IN_PROGRESS',

    updated_at =
      v_now

  where
    id =
      p_request_id

    and customer_id =
      v_customer_id

    and status =
      'SUBMITTED';

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return p_request_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.require_current_service_actor()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare

  v_user_id uuid :=

    auth.uid();



  v_is_banned boolean;

  v_is_suspended boolean;

  v_suspended_until timestamptz;

begin

  if v_user_id is null then

    raise exception

      'Authenticated user identity is required.'

      using errcode = '42501';

  end if;



  select

    coalesce(u.is_banned, false),

    coalesce(u.is_suspended, false),

    u.suspended_until

  into

    v_is_banned,

    v_is_suspended,

    v_suspended_until

  from public.users as u

  where u.id = v_user_id;



  if not found then

    raise exception

      'User profile was not found.'

      using errcode = '42501';

  end if;



  if v_is_banned then

    raise exception

      'Account is not allowed to use Service Marketplace.'

      using errcode = '42501';

  end if;



  if

    v_is_suspended

    and (

      v_suspended_until is null

      or v_suspended_until >

        statement_timestamp()

    )

  then

    raise exception

      'Account is temporarily restricted.'

      using errcode = '42501';

  end if;



  return v_user_id;

end;

$function$
;
CREATE OR REPLACE FUNCTION public.require_editable_service_listing_media_target(p_listing_id uuid, p_provider_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

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

$function$
;
CREATE OR REPLACE FUNCTION public.reserve_service_listing_publication_payment(p_listing_id uuid, p_provider_id uuid, p_order_id text, p_amount bigint, p_publication_duration_seconds integer, p_max_reserved_slots integer)
 RETURNS TABLE(created boolean, payment_id uuid, payment_status text, publication_action text, midtrans_order_id text, snap_token text, payment_url text, payment_expires_at timestamp with time zone, renewal_base_expires_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare

  v_now timestamptz :=

    statement_timestamp();



  v_status text;



  v_expires_at timestamptz;



  v_full_name text;



  v_username text;



  v_is_banned boolean;



  v_is_suspended boolean;



  v_suspended_until timestamptz;



  v_reserved_slots integer;



  v_action text;



  v_renewal_base_expires_at

    timestamptz;



  v_renewal_base_status text;



  v_existing_payment_id uuid;



  v_existing_payment_status text;



  v_existing_action text;



  v_existing_order_id text;



  v_existing_snap_token text;



  v_existing_payment_url text;



  v_existing_payment_expires_at

    timestamptz;



  v_existing_renewal_base

    timestamptz;



  v_payment_id uuid;

begin

  if

    p_listing_id is null

    or p_provider_id is null

  then

    raise exception

      'Service listing and Provider IDs are required.'

      using errcode = '22023';

  end if;





  if

    p_order_id is null

    or btrim(p_order_id) = ''

  then

    raise exception

      'Midtrans order ID is required.'

      using errcode = '22023';

  end if;





  if

    p_amount is null

    or p_amount <= 0

  then

    raise exception

      'Service listing publication amount must be positive.'

      using errcode = '22023';

  end if;





  if

    p_publication_duration_seconds

      <> 2592000

  then

    raise exception

      'Service listing publication duration must be exactly 2592000 seconds.'

      using errcode = '22023';

  end if;





  if

    p_max_reserved_slots is null

    or p_max_reserved_slots < 1

  then

    raise exception

      'Maximum reserved Service listing slots must be at least 1.'

      using errcode = '22023';

  end if;





  -- -------------------------------------------------------

  -- Serialize all publication decisions for this Provider.

  -- -------------------------------------------------------



  perform

    public.lock_service_provider_publication(

      p_provider_id

    );





  -- -------------------------------------------------------

  -- Lock and authorize the listing.

  -- -------------------------------------------------------



  select

    sl.status,

    sl.expires_at



  into

    v_status,

    v_expires_at



  from public.service_listings

    as sl



  where

    sl.id =

      p_listing_id



    and sl.provider_id =

      p_provider_id



  for update;





  if not found then

    raise exception

      'Service listing was not found.'

      using errcode = 'P0002';

  end if;





  -- -------------------------------------------------------

  -- Account + minimum HelpMe Jasa profile.

  --

  -- Mirrors M4C:

  -- - full_name required

  -- - username required

  -- - banned denied

  -- - active suspension denied

  -- -------------------------------------------------------



  select

    u.full_name,

    u.username,

    coalesce(

      u.is_banned,

      false

    ),

    coalesce(

      u.is_suspended,

      false

    ),

    u.suspended_until



  into

    v_full_name,

    v_username,

    v_is_banned,

    v_is_suspended,

    v_suspended_until



  from public.users

    as u



  where

    u.id =

      p_provider_id;





  if not found then

    raise exception

      'Service Provider profile was not found.'

      using errcode = 'P0002';

  end if;





  if v_is_banned then

    raise exception

      'Account is not allowed to publish Service listings.'

      using errcode = '42501';

  end if;





  if

    v_is_suspended

    and (

      v_suspended_until is null

      or v_suspended_until >

        v_now

    )

  then

    raise exception

      'Account is temporarily restricted from publishing Service listings.'

      using errcode = '42501';

  end if;





  if

    v_full_name is null

    or btrim(v_full_name) = ''

    or v_username is null

    or btrim(v_username) = ''

  then

    raise exception

      'Complete full name and username before publishing a Service listing.'

      using errcode = '23514';

  end if;





  -- -------------------------------------------------------

  -- COVER remains mandatory for every publication flow.

  -- -------------------------------------------------------



  if not exists (

    select 1



    from public.service_listing_images

      as sli



    where

      sli.service_listing_id =

        p_listing_id



      and sli.kind =

        'COVER'

  ) then

    raise exception

      'A Service listing cover image is required before publication.'

      using errcode = '23514';

  end if;





  -- -------------------------------------------------------

  -- Idempotent checkout reservation.

  --

  -- Return an already-existing nonterminal payment.

  --

  -- The M1 partial unique index remains the final DB guard.

  -- -------------------------------------------------------



  select

    slp.id,

    slp.payment_status,

    slp.publication_action,

    slp.midtrans_order_id,

    slp.snap_token,

    slp.payment_url,

    slp.payment_expires_at,

    slp.renewal_base_expires_at



  into

    v_existing_payment_id,

    v_existing_payment_status,

    v_existing_action,

    v_existing_order_id,

    v_existing_snap_token,

    v_existing_payment_url,

    v_existing_payment_expires_at,

    v_existing_renewal_base



  from public.service_listing_payments

    as slp



  where

    slp.service_listing_id =

      p_listing_id



    and slp.provider_id =

      p_provider_id



    and slp.payment_status in (

      'CREATING',

      'PENDING'

    )



  order by

    slp.created_at desc



  limit 1



  for update;





  if found then

    return query

    select

      false,

      v_existing_payment_id,

      v_existing_payment_status,

      v_existing_action,

      v_existing_order_id,

      v_existing_snap_token,

      v_existing_payment_url,

      v_existing_payment_expires_at,

      v_existing_renewal_base;



    return;

  end if;





  -- -------------------------------------------------------

  -- Determine authoritative publication action.

  --

  -- ACTIVE/PAUSED rows whose expires_at already elapsed

  -- are treated as EXPIRED_RENEWAL even if the scheduler

  -- has not normalized the row yet.

  -- -------------------------------------------------------



  case

    when

      v_status =

        'DRAFT'

    then

      v_action :=

        'INITIAL_PUBLICATION';





    when

      v_status =

        'EXPIRED'

    then

      v_action :=

        'EXPIRED_RENEWAL';





    when

      v_status in (

        'ACTIVE',

        'PAUSED'

      )

      and v_expires_at

        is not null

      and v_expires_at >

        v_now

    then

      v_action :=

        'EARLY_RENEWAL';



      v_renewal_base_expires_at :=

        v_expires_at;



      v_renewal_base_status :=

        v_status;





    when

      v_status in (

        'ACTIVE',

        'PAUSED'

      )

      and v_expires_at

        is not null

      and v_expires_at <=

        v_now

    then

      v_action :=

        'EXPIRED_RENEWAL';





    when

      v_status =

        'PAYMENT_PENDING'

    then

      raise exception

        'Service listing is waiting for a publication payment but no nonterminal payment record was found.'

        using errcode = '55000';





    when

      v_status =

        'BLOCKED'

    then

      raise exception

        'Blocked Service listings cannot start publication payments.'

        using errcode = '42501';





    when

      v_status =

        'ARCHIVED'

    then

      raise exception

        'Archived Service listings cannot start publication payments.'

        using errcode = '55000';





    else

      raise exception

        'Service listing cannot start publication payment in its current state.'

        using errcode = '55000';

  end case;





  -- -------------------------------------------------------

  -- New slot required:

  --

  -- INITIAL_PUBLICATION

  -- EXPIRED_RENEWAL

  --

  -- EARLY_RENEWAL already occupies its existing slot and

  -- must not consume a second slot.

  -- -------------------------------------------------------



  if

    v_action in (

      'INITIAL_PUBLICATION',

      'EXPIRED_RENEWAL'

    )

  then

    v_reserved_slots :=

      public.count_service_provider_reserved_slots(

        p_provider_id,

        v_now

      );





    if

      v_reserved_slots >=

        p_max_reserved_slots

    then

      raise exception

        'Maximum reserved Service listing slots reached.'

        using errcode = '54000';

    end if;

  end if;





  -- -------------------------------------------------------

  -- Create DB reservation BEFORE Midtrans network call.

  -- -------------------------------------------------------



  insert into

    public.service_listing_payments (

      service_listing_id,

      provider_id,

      publication_action,

      amount,

      currency,

      publication_duration_seconds,

      payment_status,

      midtrans_order_id,

      renewal_base_expires_at,

      renewal_base_status,

      created_at,

      updated_at

    )



  values (

    p_listing_id,

    p_provider_id,

    v_action,

    p_amount,

    'IDR',

    p_publication_duration_seconds,

    'CREATING',

    btrim(p_order_id),

    v_renewal_base_expires_at,

    v_renewal_base_status,

    v_now,

    v_now

  )



  returning

    id

  into

    v_payment_id;





  -- -------------------------------------------------------

  -- Reserve a live slot for initial/expired publication.

  --

  -- EARLY_RENEWAL keeps the listing ACTIVE or PAUSED.

  -- -------------------------------------------------------



  if

    v_action in (

      'INITIAL_PUBLICATION',

      'EXPIRED_RENEWAL'

    )

  then

    update

      public.service_listings



    set

      status =

        'PAYMENT_PENDING',



      paused_at =

        null,



      updated_at =

        v_now



    where

      id =

        p_listing_id



      and provider_id =

        p_provider_id;





    if not found then

      raise exception

        'Service listing lifecycle changed concurrently.'

        using errcode = '40001';

    end if;

  end if;





  return query

  select

    true,

    v_payment_id,

    'CREATING'::text,

    v_action,

    btrim(p_order_id),

    null::text,

    null::text,

    null::timestamptz,

    v_renewal_base_expires_at;

end;

$function$
;
CREATE OR REPLACE FUNCTION public.resume_service_listing(p_listing_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare

  v_provider_id uuid;



  v_status text;



  v_expires_at timestamptz;



  v_now timestamptz :=

    statement_timestamp();

begin

  v_provider_id :=

    public.require_current_service_actor();



  select

    sl.status,

    sl.expires_at

  into

    v_status,

    v_expires_at

  from public.service_listings as sl

  where

    sl.id = p_listing_id

    and sl.provider_id =

      v_provider_id

  for update;



  if not found then

    raise exception

      'Service listing was not found.'

      using errcode = 'P0002';

  end if;



  if v_status not in (

    'ACTIVE',

    'PAUSED'

  ) then

    raise exception

      'Service listing cannot be resumed in its current state.'

      using errcode = '55000';

  end if;



  if

    v_expires_at is null

    or v_expires_at <= v_now

  then

    raise exception

      'Service listing publication period has expired.'

      using errcode = '55000';

  end if;



  if v_status = 'ACTIVE' then

    return p_listing_id;

  end if;



  update public.service_listings

  set

    status = 'ACTIVE',

    paused_at = null,

    updated_at = v_now

  where

    id = p_listing_id

    and provider_id =

      v_provider_id

    and status = 'PAUSED';



  if not found then

    raise exception

      'Service listing lifecycle changed concurrently.'

      using errcode = '40001';

  end if;



  return p_listing_id;

end;

$function$
;
CREATE OR REPLACE FUNCTION public.send_service_request_message(p_conversation_id uuid, p_content text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_actor_id uuid;

  v_request_id uuid;

  v_customer_id uuid;

  v_provider_id uuid;

  v_request_status text;

  v_owner_id uuid;

  v_helper_id uuid;

  v_content text :=
    nullif(
      btrim(
        p_content
      ),
      ''
    );

  v_message_id uuid;

  v_now timestamptz;
begin
  v_actor_id :=
    public.require_current_service_actor();

  if p_conversation_id is null then
    raise exception
      'Conversation identity is required.'
      using errcode = '22023';
  end if;

  if v_content is null then
    raise exception
      'Message content is required.'
      using errcode = '22023';
  end if;

  -- Resolve Service context first.
  --
  -- No Task conversation is accepted by this RPC.

  select
    c.service_request_id

  into
    v_request_id

  from public.conversations as c

  where
    c.id =
      p_conversation_id

    and c.task_id is null

    and c.service_request_id is not null;

  if not found then
    raise exception
      'Service conversation was not found.'
      using errcode = 'P0002';
  end if;

  -- Lock Request before conversation.
  --
  -- M11/M12 lifecycle mutations also lock Service Request,
  -- so send authorization is serialized with state changes.

  select
    sr.customer_id,
    sr.provider_id,
    sr.status

  into
    v_customer_id,
    v_provider_id,
    v_request_status

  from public.service_requests as sr

  where
    sr.id =
      v_request_id

    and (
      sr.customer_id =
        v_actor_id

      or sr.provider_id =
        v_actor_id
    )

  for update;

  if not found then
    raise exception
      'Service conversation was not found.'
      using errcode = 'P0002';
  end if;

  if v_request_status not in (
    'NEGOTIATING',
    'AGREEMENT_PENDING',
    'AGREED',
    'IN_PROGRESS',
    'SUBMITTED'
  ) then
    raise exception
      'Messages cannot be sent for the current Service Request state.'
      using errcode = '42501';
  end if;

  select
    c.owner_id,
    c.helper_id

  into
    v_owner_id,
    v_helper_id

  from public.conversations as c

  where
    c.id =
      p_conversation_id

    and c.task_id is null

    and c.service_request_id =
      v_request_id

    and c.owner_id =
      v_customer_id

    and c.helper_id =
      v_provider_id

    and (
      c.owner_id =
        v_actor_id

      or c.helper_id =
        v_actor_id
    )

  for update;

  if not found then
    raise exception
      'Service conversation was not found.'
      using errcode = 'P0002';
  end if;

  v_now :=
    clock_timestamp();

  insert into public.messages (
    conversation_id,
    sender_id,
    content,
    created_at
  )
  values (
    p_conversation_id,
    v_actor_id,
    v_content,
    v_now
  )
  returning
    id

  into
    v_message_id;

  update public.conversations
  set
    last_message =
      v_content,

    last_message_at =
      v_now,

    owner_unread_count =
      case
        when v_actor_id =
          v_owner_id
        then
          coalesce(
            owner_unread_count,
            0
          )
        else
          coalesce(
            owner_unread_count,
            0
          ) + 1
      end,

    helper_unread_count =
      case
        when v_actor_id =
          v_helper_id
        then
          coalesce(
            helper_unread_count,
            0
          )
        else
          coalesce(
            helper_unread_count,
            0
          ) + 1
      end

  where
    id =
      p_conversation_id

    and service_request_id =
      v_request_id;

  if not found then
    raise exception
      'Service conversation changed concurrently.'
      using errcode = '40001';
  end if;

  return v_message_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.set_service_listing_cover(p_listing_id uuid, p_provider_id uuid, p_storage_path text)
 RETURNS TABLE(image_id uuid, replaced_storage_path text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

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

$function$
;
CREATE OR REPLACE FUNCTION public.start_service_request_work(p_request_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_provider_id uuid;

  v_request_status text;

  v_agreement_id uuid;

  v_now timestamptz :=
    statement_timestamp();
begin
  v_provider_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  -- Request is locked first to keep lifecycle mutations
  -- on the same lock ordering convention.

  select
    sr.status

  into
    v_request_status

  from public.service_requests as sr

  where
    sr.id =
      p_request_id

    and sr.provider_id =
      v_provider_id

  for update;

  if not found then
    raise exception
      'Service Request was not found.'
      using errcode = 'P0002';
  end if;

  if v_request_status <> 'AGREED' then
    raise exception
      'Work cannot be started from the current Service Request state.'
      using errcode = '42501';
  end if;

  -- An approved Agreement is authoritative for the work
  -- that the Provider is about to start.

  select
    sa.id

  into
    v_agreement_id

  from public.service_agreements as sa

  where
    sa.service_request_id =
      p_request_id

    and sa.status =
      'APPROVED'

  order by
    sa.version desc

  limit 1

  for update;

  if not found then
    raise exception
      'An approved Agreement is required before work can start.'
      using errcode = '42501';
  end if;

  -- Fail closed for payment steps that must be completed
  -- before work starts.
  --
  -- AFTER_COMPLETION, ON_SUBMISSION, MILESTONE, and CUSTOM
  -- do not automatically block this transition.

  if exists (
    select
      1

    from public.service_agreement_payment_steps as saps

    where
      saps.service_agreement_id =
        v_agreement_id

      and saps.trigger_type in (
        'UPFRONT',
        'BEFORE_START'
      )

      and not exists (
        select
          1

        from public.service_payment_acknowledgements as spa

        where
          spa.payment_step_id =
            saps.id

          and spa.service_agreement_id =
            v_agreement_id

          and spa.status =
            'PROVIDER_CONFIRMED'
      )
  ) then
    raise exception
      'Required pre-start payment has not been confirmed.'
      using errcode = '42501';
  end if;

  update public.service_requests
  set
    status =
      'IN_PROGRESS',

    started_at =
      v_now,

    updated_at =
      v_now

  where
    id =
      p_request_id

    and provider_id =
      v_provider_id

    and status =
      'AGREED';

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return p_request_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.submit_service_request_work(p_request_id uuid, p_provider_note text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_provider_id uuid;

  v_request_status text;

  v_agreement_id uuid;

  v_submission_no integer;

  v_submission_id uuid;

  v_provider_note text;

  v_now timestamptz :=
    statement_timestamp();
begin
  v_provider_id :=
    public.require_current_service_actor();

  if p_request_id is null then
    raise exception
      'Service Request identity is required.'
      using errcode = '22023';
  end if;

  v_provider_note :=
    btrim(
      coalesce(
        p_provider_note,
        ''
      )
    );

  if v_provider_note = '' then
    raise exception
      'Provider completion note is required.'
      using errcode = '22023';
  end if;

  -- Request is the authoritative lifecycle lock.

  select
    sr.status

  into
    v_request_status

  from public.service_requests as sr

  where
    sr.id =
      p_request_id

    and sr.provider_id =
      v_provider_id

  for update;

  if not found then
    raise exception
      'Service Request was not found.'
      using errcode = 'P0002';
  end if;

  if v_request_status <> 'IN_PROGRESS' then
    raise exception
      'Work cannot be submitted from the current Service Request state.'
      using errcode = '42501';
  end if;

  -- Submission must remain attached to the currently
  -- approved Agreement.

  select
    sa.id

  into
    v_agreement_id

  from public.service_agreements as sa

  where
    sa.service_request_id =
      p_request_id

    and sa.status =
      'APPROVED'

  order by
    sa.version desc

  limit 1

  for update;

  if not found then
    raise exception
      'An approved Agreement is required before work can be submitted.'
      using errcode = '42501';
  end if;

  -- Request locking serializes submission numbering for
  -- one Service Request.

  select
    coalesce(
      max(scs.submission_no),
      0
    ) + 1

  into
    v_submission_no

  from public.service_completion_submissions as scs

  where
    scs.service_request_id =
      p_request_id;

  insert into public.service_completion_submissions (
    service_request_id,
    service_agreement_id,
    submission_no,
    provider_note,
    proof_storage_path,
    status,
    submitted_at
  )
  values (
    p_request_id,
    v_agreement_id,
    v_submission_no,
    v_provider_note,
    null,
    'SUBMITTED',
    v_now
  )
  returning id
  into v_submission_id;

  update public.service_requests
  set
    status =
      'SUBMITTED',

    submitted_at =
      v_now,

    updated_at =
      v_now

  where
    id =
      p_request_id

    and provider_id =
      v_provider_id

    and status =
      'IN_PROGRESS';

  if not found then
    raise exception
      'Service Request changed concurrently.'
      using errcode = '40001';
  end if;

  return p_request_id;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.update_service_listing(p_listing_id uuid, p_title text, p_category text, p_description text, p_deliverables text, p_customer_preparation text, p_price_from bigint, p_is_negotiable boolean, p_service_mode text, p_location_name text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare

  v_provider_id uuid;



  v_status text;

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



  update public.service_listings

  set

    title =

      btrim(p_title),



    category =

      btrim(p_category),



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

$function$
;

-- =========================================================
-- Function privileges
-- =========================================================

REVOKE ALL ON FUNCTION public.accept_service_completion(p_request_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_service_completion(p_request_id uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_service_completion(p_request_id uuid) TO service_role;
REVOKE ALL ON FUNCTION public.add_service_listing_portfolio_image(p_listing_id uuid, p_provider_id uuid, p_storage_path text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_service_listing_portfolio_image(p_listing_id uuid, p_provider_id uuid, p_storage_path text) TO service_role;
REVOKE ALL ON FUNCTION public.admin_block_service_listing(p_service_listing_id uuid, p_reason text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_block_service_listing(p_service_listing_id uuid, p_reason text) TO service_role;
REVOKE ALL ON FUNCTION public.admin_unblock_service_listing(p_service_listing_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_unblock_service_listing(p_service_listing_id uuid) TO service_role;
REVOKE ALL ON FUNCTION public.apply_service_listing_payment_status(p_order_id text, p_payment_status text, p_transaction_id text, p_payment_method text, p_paid_at timestamp with time zone, p_expired_at timestamp with time zone) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_service_listing_payment_status(p_order_id text, p_payment_status text, p_transaction_id text, p_payment_method text, p_paid_at timestamp with time zone, p_expired_at timestamp with time zone) TO service_role;
REVOKE ALL ON FUNCTION public.approve_service_agreement(p_agreement_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_service_agreement(p_agreement_id uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_service_agreement(p_agreement_id uuid) TO service_role;
REVOKE ALL ON FUNCTION public.archive_service_listing(p_listing_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.archive_service_listing(p_listing_id uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.assert_service_listing_media_upload_target(p_listing_id uuid, p_provider_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assert_service_listing_media_upload_target(p_listing_id uuid, p_provider_id uuid) TO service_role;
REVOKE ALL ON FUNCTION public.begin_service_request_negotiation(p_request_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.begin_service_request_negotiation(p_request_id uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.cancel_service_request(p_request_id uuid, p_reason text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_service_request(p_request_id uuid, p_reason text) TO authenticated;
REVOKE ALL ON FUNCTION public.claim_first_free_service_listing_publication(p_listing_id uuid, p_provider_id uuid, p_first_free_enabled boolean, p_max_reserved_slots integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_first_free_service_listing_publication(p_listing_id uuid, p_provider_id uuid, p_first_free_enabled boolean, p_max_reserved_slots integer) TO service_role;
REVOKE ALL ON FUNCTION public.confirm_service_payment(p_acknowledgement_id uuid, p_provider_note text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_service_payment(p_acknowledgement_id uuid, p_provider_note text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_service_payment(p_acknowledgement_id uuid, p_provider_note text) TO service_role;
REVOKE ALL ON FUNCTION public.count_service_provider_reserved_slots(p_provider_id uuid, p_at timestamp with time zone) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_service_listing_draft(p_title text, p_category text, p_description text, p_deliverables text, p_customer_preparation text, p_price_from bigint, p_is_negotiable boolean, p_service_mode text, p_location_name text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_service_listing_draft(p_title text, p_category text, p_description text, p_deliverables text, p_customer_preparation text, p_price_from bigint, p_is_negotiable boolean, p_service_mode text, p_location_name text) TO authenticated;
REVOKE ALL ON FUNCTION public.create_service_listing_report(p_service_listing_id uuid, p_reason text, p_description text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_service_listing_report(p_service_listing_id uuid, p_reason text, p_description text) TO authenticated;
REVOKE ALL ON FUNCTION public.create_service_request(p_listing_id uuid, p_request_description text, p_needed_at timestamp with time zone, p_service_mode text, p_location_name text, p_budget bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_service_request(p_listing_id uuid, p_request_description text, p_needed_at timestamp with time zone, p_service_mode text, p_location_name text, p_budget bigint) TO authenticated;
REVOKE ALL ON FUNCTION public.decline_service_request(p_request_id uuid, p_reason text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decline_service_request(p_request_id uuid, p_reason text) TO authenticated;
REVOKE ALL ON FUNCTION public.delete_service_listing_draft(p_listing_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_service_listing_draft(p_listing_id uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.delete_service_listing_image(p_listing_id uuid, p_provider_id uuid, p_image_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_service_listing_image(p_listing_id uuid, p_provider_id uuid, p_image_id uuid) TO service_role;
REVOKE ALL ON FUNCTION public.ensure_service_request_conversation(p_request_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_service_request_conversation(p_request_id uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_service_request_conversation(p_request_id uuid) TO service_role;
REVOKE ALL ON FUNCTION public.expire_due_service_listings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_due_service_listings() TO service_role;
REVOKE ALL ON FUNCTION public.fail_service_listing_payment_creation(p_payment_id uuid, p_provider_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fail_service_listing_payment_creation(p_payment_id uuid, p_provider_id uuid) TO service_role;
REVOKE ALL ON FUNCTION public.finalize_service_listing_payment_checkout(p_payment_id uuid, p_provider_id uuid, p_snap_token text, p_payment_url text, p_payment_expires_at timestamp with time zone) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.finalize_service_listing_payment_checkout(p_payment_id uuid, p_provider_id uuid, p_snap_token text, p_payment_url text, p_payment_expires_at timestamp with time zone) TO service_role;
REVOKE ALL ON FUNCTION public.get_my_customer_service_requests(p_page integer, p_page_size integer, p_status text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_customer_service_requests(p_page integer, p_page_size integer, p_status text) TO authenticated;
REVOKE ALL ON FUNCTION public.get_my_latest_service_completion_submission(p_request_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_latest_service_completion_submission(p_request_id uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.get_my_provider_service_requests(p_page integer, p_page_size integer, p_status text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_provider_service_requests(p_page integer, p_page_size integer, p_status text) TO authenticated;
REVOKE ALL ON FUNCTION public.get_my_service_listing_detail(p_listing_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_service_listing_detail(p_listing_id uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.get_my_service_listing_media(p_listing_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_service_listing_media(p_listing_id uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.get_my_service_listing_status_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_service_listing_status_counts() TO authenticated;
REVOKE ALL ON FUNCTION public.get_my_service_listings(p_page integer, p_page_size integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_service_listings(p_page integer, p_page_size integer) TO authenticated;
REVOKE ALL ON FUNCTION public.get_my_service_listings_by_status(p_page integer, p_page_size integer, p_status text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_service_listings_by_status(p_page integer, p_page_size integer, p_status text) TO authenticated;
REVOKE ALL ON FUNCTION public.get_my_service_payment_acknowledgements(p_request_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_service_payment_acknowledgements(p_request_id uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.get_my_service_request_agreements(p_request_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_service_request_agreements(p_request_id uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_service_request_agreements(p_request_id uuid) TO service_role;
REVOKE ALL ON FUNCTION public.get_my_service_request_detail(p_request_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_service_request_detail(p_request_id uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.get_public_service_listing_detail(p_listing_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_service_listing_detail(p_listing_id uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_service_listing_detail(p_listing_id uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_service_listing_detail(p_listing_id uuid) TO service_role;
REVOKE ALL ON FUNCTION public.get_public_service_listing_media(p_listing_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_service_listing_media(p_listing_id uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_service_listing_media(p_listing_id uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_service_listing_media(p_listing_id uuid) TO service_role;
REVOKE ALL ON FUNCTION public.get_public_service_listings(p_page integer, p_page_size integer, p_category text, p_service_mode text, p_search text, p_provider_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_service_listings(p_page integer, p_page_size integer, p_category text, p_service_mode text, p_search text, p_provider_id uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_service_listings(p_page integer, p_page_size integer, p_category text, p_service_mode text, p_search text, p_provider_id uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_service_listings(p_page integer, p_page_size integer, p_category text, p_service_mode text, p_search text, p_provider_id uuid) TO service_role;
REVOKE ALL ON FUNCTION public.lock_service_provider_publication(p_provider_id uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_service_request_conversation_read(p_conversation_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_service_request_conversation_read(p_conversation_id uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_service_request_conversation_read(p_conversation_id uuid) TO service_role;
REVOKE ALL ON FUNCTION public.notify_service_agreement_lifecycle() FROM PUBLIC;
-- DEFAULT ACL public.notify_service_completion_response()
-- DEFAULT ACL public.notify_service_completion_submission()
REVOKE ALL ON FUNCTION public.notify_service_listing_expiration() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_service_payment_acknowledgement_change() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_service_request_lifecycle() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.pause_service_listing(p_listing_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pause_service_listing(p_listing_id uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.propose_service_agreement(p_request_id uuid, p_scope text, p_deliverables text, p_total_price bigint, p_deadline timestamp with time zone, p_revision_terms text, p_payment_plan_type text, p_payment_steps jsonb, p_notes text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.propose_service_agreement(p_request_id uuid, p_scope text, p_deliverables text, p_total_price bigint, p_deadline timestamp with time zone, p_revision_terms text, p_payment_plan_type text, p_payment_steps jsonb, p_notes text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.propose_service_agreement(p_request_id uuid, p_scope text, p_deliverables text, p_total_price bigint, p_deadline timestamp with time zone, p_revision_terms text, p_payment_plan_type text, p_payment_steps jsonb, p_notes text) TO service_role;
REVOKE ALL ON FUNCTION public.reject_service_agreement(p_agreement_id uuid, p_reason text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reject_service_agreement(p_agreement_id uuid, p_reason text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_service_agreement(p_agreement_id uuid, p_reason text) TO service_role;
REVOKE ALL ON FUNCTION public.report_service_payment_issue(p_acknowledgement_id uuid, p_issue_reason text, p_provider_note text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_service_payment_issue(p_acknowledgement_id uuid, p_issue_reason text, p_provider_note text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_service_payment_issue(p_acknowledgement_id uuid, p_issue_reason text, p_provider_note text) TO service_role;
REVOKE ALL ON FUNCTION public.report_service_payment_paid(p_payment_step_id uuid, p_customer_note text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_service_payment_paid(p_payment_step_id uuid, p_customer_note text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_service_payment_paid(p_payment_step_id uuid, p_customer_note text) TO service_role;
REVOKE ALL ON FUNCTION public.request_service_completion_revision(p_request_id uuid, p_revision_reason text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_service_completion_revision(p_request_id uuid, p_revision_reason text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_service_completion_revision(p_request_id uuid, p_revision_reason text) TO service_role;
REVOKE ALL ON FUNCTION public.require_current_service_actor() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.require_editable_service_listing_media_target(p_listing_id uuid, p_provider_id uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reserve_service_listing_publication_payment(p_listing_id uuid, p_provider_id uuid, p_order_id text, p_amount bigint, p_publication_duration_seconds integer, p_max_reserved_slots integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_service_listing_publication_payment(p_listing_id uuid, p_provider_id uuid, p_order_id text, p_amount bigint, p_publication_duration_seconds integer, p_max_reserved_slots integer) TO service_role;
REVOKE ALL ON FUNCTION public.resume_service_listing(p_listing_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resume_service_listing(p_listing_id uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.send_service_request_message(p_conversation_id uuid, p_content text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_service_request_message(p_conversation_id uuid, p_content text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_service_request_message(p_conversation_id uuid, p_content text) TO service_role;
REVOKE ALL ON FUNCTION public.set_service_listing_cover(p_listing_id uuid, p_provider_id uuid, p_storage_path text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_service_listing_cover(p_listing_id uuid, p_provider_id uuid, p_storage_path text) TO service_role;
REVOKE ALL ON FUNCTION public.start_service_request_work(p_request_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_service_request_work(p_request_id uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_service_request_work(p_request_id uuid) TO service_role;
REVOKE ALL ON FUNCTION public.submit_service_request_work(p_request_id uuid, p_provider_note text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_service_request_work(p_request_id uuid, p_provider_note text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_service_request_work(p_request_id uuid, p_provider_note text) TO service_role;
REVOKE ALL ON FUNCTION public.update_service_listing(p_listing_id uuid, p_title text, p_category text, p_description text, p_deliverables text, p_customer_preparation text, p_price_from bigint, p_is_negotiable boolean, p_service_mode text, p_location_name text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_service_listing(p_listing_id uuid, p_title text, p_category text, p_description text, p_deliverables text, p_customer_preparation text, p_price_from bigint, p_is_negotiable boolean, p_service_mode text, p_location_name text) TO authenticated;


-- =========================================================
-- Shared table policy reconciliation
-- =========================================================

DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
CREATE POLICY "Users can update own conversations" ON public.conversations AS PERMISSIVE FOR UPDATE TO authenticated USING (((service_request_id IS NULL) AND ((auth.uid() = owner_id) OR (auth.uid() = helper_id)))) WITH CHECK (((service_request_id IS NULL) AND ((auth.uid() = owner_id) OR (auth.uid() = helper_id))));
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((sender_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM conversations c
  WHERE ((c.id = messages.conversation_id) AND (c.service_request_id IS NULL) AND (c.task_id IS NOT NULL) AND ((c.owner_id = auth.uid()) OR (c.helper_id = auth.uid())))))));
DROP POLICY IF EXISTS "Users insert own notifications" ON public.notifications;
CREATE POLICY "Users insert own notifications" ON public.notifications AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) AND (service_listing_id IS NULL) AND (service_request_id IS NULL) AND (dedupe_key IS NULL)));
DROP POLICY IF EXISTS users_can_create_reports ON public.reports;
CREATE POLICY users_can_create_reports ON public.reports AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((reporter_id = auth.uid()) AND (service_listing_id IS NULL)));
DROP POLICY IF EXISTS "Allow authenticated insert reviews" ON public.reviews;
CREATE POLICY "Allow authenticated insert reviews" ON public.reviews AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((auth.uid() = reviewer_id) AND (service_request_id IS NULL)));


-- =========================================================
-- Missing lifecycle / notification triggers
-- =========================================================

DROP TRIGGER IF EXISTS
  service_agreement_notification_trigger
  ON public.service_agreements;

DROP TRIGGER IF EXISTS
  service_completion_response_notification_trigger
  ON public.service_completion_submissions;

DROP TRIGGER IF EXISTS
  service_completion_submission_notification_trigger
  ON public.service_completion_submissions;

DROP TRIGGER IF EXISTS
  service_listing_expiration_notification_trigger
  ON public.service_listings;

DROP TRIGGER IF EXISTS
  service_payment_acknowledgement_notification_trigger
  ON public.service_payment_acknowledgements;

DROP TRIGGER IF EXISTS
  service_request_notification_trigger
  ON public.service_requests;

CREATE TRIGGER service_agreement_notification_trigger AFTER INSERT OR UPDATE OF status ON service_agreements FOR EACH ROW EXECUTE FUNCTION notify_service_agreement_lifecycle();
CREATE TRIGGER service_completion_response_notification_trigger AFTER UPDATE OF status ON service_completion_submissions FOR EACH ROW EXECUTE FUNCTION notify_service_completion_response();
CREATE TRIGGER service_completion_submission_notification_trigger AFTER INSERT ON service_completion_submissions FOR EACH ROW EXECUTE FUNCTION notify_service_completion_submission();
CREATE TRIGGER service_listing_expiration_notification_trigger AFTER UPDATE OF status ON service_listings FOR EACH ROW EXECUTE FUNCTION notify_service_listing_expiration();
CREATE TRIGGER service_payment_acknowledgement_notification_trigger AFTER INSERT OR UPDATE OF status ON service_payment_acknowledgements FOR EACH ROW EXECUTE FUNCTION notify_service_payment_acknowledgement_change();
CREATE TRIGGER service_request_notification_trigger AFTER INSERT OR UPDATE OF status ON service_requests FOR EACH ROW EXECUTE FUNCTION notify_service_request_lifecycle();
