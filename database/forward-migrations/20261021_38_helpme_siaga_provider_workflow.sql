-- M38 - HelpMe Siaga provider workflow
-- Production release migration candidate; structural and behavioral checks passed locally.
-- Execute only after separate explicit production-release approval.
-- Migration 37 is explicitly excluded and must remain unchanged.
-- HelpMe Siaga: provider workflow and public directory (REVIEW CANDIDATE v2)
--
-- REVISION: incorporates static review findings from the uploaded candidate.
-- STATUS: DRAFT ONLY. NOT APPROVED, NOT SQL-PARSER-VALIDATED, AND NOT A FORWARD MIGRATION.
-- Save under database/drafts/ for review; do not execute against staging or production.
-- Before approval: finish/review API routes, validate all live schema assumptions,
-- test against disposable PostgreSQL, and run authorization/RLS/Storage/projection tests.
-- Migration numbering is intentionally omitted while untracked migration 37 is unresolved.
--
-- Existing official emergency contacts (112/119/110) remain in the UI and
-- are not managed by this directory schema.
--
-- Security model:
-- - Organizations/services/documents/review events are separate from paid
--   marketplace listings. Provider submissions require no document and begin
--   PENDING/inactive; admin-managed directory entries may have no provider user.
-- - Browser roles receive no direct table privileges. Server routes must check
--   identity/ownership/admin before reads; all table mutations use trusted RPCs.
-- - Public reads use one explicitly-columned SECURITY DEFINER RPC.
-- - Service records default to PENDING and inactive; they must be approved
--   and then activated before they appear publicly.
-- - Organization storage uses PENDING/VERIFIED as stable API/database values;
--   the UI may label these as 'Menunggu verifikasi'/'Terverifikasi'. This keeps
--   organization verification separate from a service's is_active state.
-- - NEEDS_CORRECTION is a separate organization review state with a required reason.
-- - Coordinates are public only when the organization explicitly opts in.
-- - The documents bucket is private; no browser Storage policies are created.
--
-- Important: service_role bypasses RLS. Every server route using it MUST
-- perform identity/ownership checks (or requireAdmin()) before any operation.

BEGIN;

CREATE TABLE public.emergency_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES public.users(id) ON DELETE RESTRICT,
  is_admin_managed boolean NOT NULL DEFAULT false,
  organization_name text NOT NULL,
  organization_type text NOT NULL,
  registration_identifier text,
  description text NOT NULL,
  official_phone text,
  official_whatsapp text,
  contact_email text,
  website_url text,
  public_address text,
  district text,
  city text NOT NULL DEFAULT 'Surabaya',
  province text NOT NULL DEFAULT 'Jawa Timur',
  coverage_description text NOT NULL,
  latitude numeric(9,6),
  longitude numeric(9,6),
  coordinates_public boolean NOT NULL DEFAULT false,
  verification_status text NOT NULL DEFAULT 'DRAFT',
  verified_at timestamptz,
  verified_source_label text,
  verified_source_url text,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.users(id) ON DELETE RESTRICT,
  rejection_reason text,
  correction_reason text,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT emergency_organizations_name_not_blank
    CHECK (btrim(organization_name) <> '' AND char_length(organization_name) <= 200),
  CONSTRAINT emergency_organizations_registration_identifier_length_check
    CHECK (registration_identifier IS NULL OR char_length(registration_identifier) <= 150),
  CONSTRAINT emergency_organizations_type_check
    CHECK (organization_type IN (
      'AMBULANCE_PROVIDER',
      'HEALTHCARE_FACILITY',
      'DISASTER_RELIEF',
      'SEARCH_AND_RESCUE',
      'COMMUNITY_ORGANIZATION',
      'OTHER'
    )),
  CONSTRAINT emergency_organizations_description_not_blank
    CHECK (btrim(description) <> '' AND char_length(description) <= 3000),
  CONSTRAINT emergency_organizations_contact_check
    CHECK (
      nullif(btrim(coalesce(official_phone, '')), '') IS NOT NULL
      OR nullif(btrim(coalesce(official_whatsapp, '')), '') IS NOT NULL
    ),
  CONSTRAINT emergency_organizations_city_not_blank
    CHECK (btrim(city) <> '' AND char_length(city) <= 100),
  CONSTRAINT emergency_organizations_province_not_blank
    CHECK (btrim(province) <> '' AND char_length(province) <= 100),
  CONSTRAINT emergency_organizations_coverage_not_blank
    CHECK (btrim(coverage_description) <> '' AND char_length(coverage_description) <= 500),
  CONSTRAINT emergency_organizations_public_address_length_check
    CHECK (public_address IS NULL OR char_length(public_address) <= 300),
  CONSTRAINT emergency_organizations_district_length_check
    CHECK (district IS NULL OR char_length(district) <= 100),
  CONSTRAINT emergency_organizations_contact_length_check
    CHECK (
      (official_phone IS NULL OR char_length(official_phone) <= 80)
      AND (official_whatsapp IS NULL OR char_length(official_whatsapp) <= 80)
      AND (contact_email IS NULL OR char_length(contact_email) <= 320)
      AND (website_url IS NULL OR char_length(website_url) <= 500)
    ),
  CONSTRAINT emergency_organizations_coordinates_pair_check
    CHECK ((latitude IS NULL) = (longitude IS NULL)),
  CONSTRAINT emergency_organizations_latitude_range_check
    CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CONSTRAINT emergency_organizations_longitude_range_check
    CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
  CONSTRAINT emergency_organizations_public_coordinates_check
    CHECK (
      coordinates_public = false
      OR (latitude IS NOT NULL AND longitude IS NOT NULL)
    ),
  CONSTRAINT emergency_organizations_status_check
    CHECK (verification_status IN (
      'DRAFT', 'PENDING', 'NEEDS_CORRECTION', 'VERIFIED', 'REJECTED', 'SUSPENDED'
    )),
  CONSTRAINT emergency_organizations_review_pair_check
    CHECK ((reviewed_at IS NULL) = (reviewed_by IS NULL)),
  CONSTRAINT emergency_organizations_verified_source_check
    CHECK (
      (
        verification_status IN ('VERIFIED', 'SUSPENDED')
        AND nullif(btrim(coalesce(verified_source_label, '')), '') IS NOT NULL
      )
      OR
      (
        verification_status IN ('DRAFT', 'PENDING', 'NEEDS_CORRECTION', 'REJECTED')
        AND verified_source_label IS NULL
        AND verified_source_url IS NULL
      )
    ),
  CONSTRAINT emergency_organizations_verified_source_label_length_check
    CHECK (verified_source_label IS NULL OR char_length(verified_source_label) <= 120),
  CONSTRAINT emergency_organizations_verified_source_url_check
    CHECK (verified_source_url IS NULL OR (char_length(verified_source_url) <= 500 AND verified_source_url ~* '^https?://[^[:space:]]+$')),
  CONSTRAINT emergency_organizations_admin_notes_length_check
    CHECK (admin_notes IS NULL OR char_length(admin_notes) <= 2000),
  CONSTRAINT emergency_organizations_website_url_check
    CHECK (website_url IS NULL OR website_url ~* '^https?://[^[:space:]]+$'),
  CONSTRAINT emergency_organizations_verified_at_check
    CHECK (
      (
        verification_status IN ('VERIFIED', 'SUSPENDED')
        AND verified_at IS NOT NULL
        AND reviewed_at IS NOT NULL
        AND reviewed_by IS NOT NULL
      )
      OR
      (
        verification_status IN ('DRAFT', 'PENDING', 'NEEDS_CORRECTION', 'REJECTED')
        AND verified_at IS NULL
      )
    ),
  CONSTRAINT emergency_organizations_rejection_reason_check
    CHECK (
      (
        verification_status = 'REJECTED'
        AND nullif(btrim(coalesce(rejection_reason, '')), '') IS NOT NULL
        AND reviewed_at IS NOT NULL
        AND reviewed_by IS NOT NULL
      )
      OR
      (
        verification_status <> 'REJECTED'
        AND rejection_reason IS NULL
      )
    ),
  CONSTRAINT emergency_organizations_correction_reason_check
    CHECK (
      (
        verification_status = 'NEEDS_CORRECTION'
        AND nullif(btrim(coalesce(correction_reason, '')), '') IS NOT NULL
        AND reviewed_at IS NOT NULL
        AND reviewed_by IS NOT NULL
      )
      OR
      (
        verification_status <> 'NEEDS_CORRECTION'
        AND correction_reason IS NULL
      )
    ),
  CONSTRAINT emergency_organizations_correction_reason_length_check
    CHECK (correction_reason IS NULL OR char_length(correction_reason) <= 2000),
  CONSTRAINT emergency_organizations_owner_mode_check
    CHECK (
      (is_admin_managed = true AND created_by IS NULL)
      OR (is_admin_managed = false AND created_by IS NOT NULL)
    )
);

CREATE TABLE public.emergency_provider_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL
    REFERENCES public.emergency_organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  public_phone text,
  public_whatsapp text,
  service_area text NOT NULL,
  cost_type text NOT NULL DEFAULT 'UNKNOWN',
  operating_hours text,
  review_status text NOT NULL DEFAULT 'PENDING',
  is_active boolean NOT NULL DEFAULT false,
  reviewed_by uuid REFERENCES public.users(id) ON DELETE RESTRICT,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT emergency_provider_services_name_not_blank
    CHECK (btrim(name) <> '' AND char_length(name) <= 200),
  CONSTRAINT emergency_provider_services_category_check
    CHECK (category IN (
      'AMBULANCE',
      'MEDICAL',
      'FIRE_RESCUE',
      'DISASTER_RELIEF',
      'SEARCH_RESCUE',
      'COMMUNITY_SUPPORT',
      'OTHER'
    )),
  CONSTRAINT emergency_provider_services_description_not_blank
    CHECK (btrim(description) <> '' AND char_length(description) <= 3000),
  CONSTRAINT emergency_provider_services_area_not_blank
    CHECK (btrim(service_area) <> '' AND char_length(service_area) <= 500),
  CONSTRAINT emergency_provider_services_contact_length_check
    CHECK (
      (public_phone IS NULL OR char_length(public_phone) <= 80)
      AND (public_whatsapp IS NULL OR char_length(public_whatsapp) <= 80)
      AND (operating_hours IS NULL OR char_length(operating_hours) <= 500)
    ),
  CONSTRAINT emergency_provider_services_cost_type_check
    CHECK (cost_type IN ('FREE', 'PAID', 'DONATION', 'VARIES', 'UNKNOWN')),
  CONSTRAINT emergency_provider_services_review_state_check
    CHECK (
      (
        review_status = 'PENDING'
        AND reviewed_by IS NULL
        AND reviewed_at IS NULL
        AND rejection_reason IS NULL
        AND is_active = false
      )
      OR
      (
        review_status = 'APPROVED'
        AND reviewed_by IS NOT NULL
        AND reviewed_at IS NOT NULL
        AND rejection_reason IS NULL
      )
      OR
      (
        review_status = 'REJECTED'
        AND reviewed_by IS NOT NULL
        AND reviewed_at IS NOT NULL
        AND nullif(btrim(coalesce(rejection_reason, '')), '') IS NOT NULL
        AND is_active = false
      )
    ),
  CONSTRAINT emergency_provider_services_id_org_unique
    UNIQUE (id, organization_id)
);

CREATE TABLE public.emergency_organization_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL
    REFERENCES public.emergency_organizations(id) ON DELETE RESTRICT,
  uploaded_by uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  document_type text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  original_file_name text NOT NULL,
  mime_type text NOT NULL,
  file_size_bytes bigint NOT NULL,
  review_status text NOT NULL DEFAULT 'PENDING',
  reviewed_by uuid REFERENCES public.users(id) ON DELETE RESTRICT,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT emergency_organization_documents_id_org_unique
    UNIQUE (id, organization_id),
  CONSTRAINT emergency_organization_documents_type_check
    CHECK (document_type IN (
      'LEGAL_REGISTRATION',
      'AUTHORIZATION_LETTER',
      'OPERATIONAL_LICENSE',
      'SUPPORTING_DOCUMENT',
      'OTHER'
    )),
  CONSTRAINT emergency_organization_documents_path_not_blank
    CHECK (
      btrim(storage_path) <> ''
      AND left(storage_path, 1) <> '/'
      AND split_part(storage_path, '/', 1) = organization_id::text
    ),
  CONSTRAINT emergency_organization_documents_file_name_not_blank
    CHECK (btrim(original_file_name) <> ''),
  CONSTRAINT emergency_organization_documents_mime_check
    CHECK (mime_type IN (
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp'
    )),
  CONSTRAINT emergency_organization_documents_size_check
    CHECK (file_size_bytes BETWEEN 1 AND 10485760),
  CONSTRAINT emergency_organization_documents_review_state_check
    CHECK (
      (
        review_status = 'PENDING'
        AND reviewed_by IS NULL
        AND reviewed_at IS NULL
        AND rejection_reason IS NULL
      )
      OR
      (
        review_status = 'ACCEPTED'
        AND reviewed_by IS NOT NULL
        AND reviewed_at IS NOT NULL
        AND rejection_reason IS NULL
      )
      OR
      (
        review_status = 'REJECTED'
        AND reviewed_by IS NOT NULL
        AND reviewed_at IS NOT NULL
        AND nullif(btrim(coalesce(rejection_reason, '')), '') IS NOT NULL
      )
    )
);

CREATE TABLE public.emergency_provider_review_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL
    REFERENCES public.emergency_organizations(id) ON DELETE RESTRICT,
  service_id uuid,
  document_id uuid,
  actor_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  action text NOT NULL,
  from_status text,
  to_status text,
  reason text,
  verification_method text,
  source_name text,
  source_url text,
  public_source_label text,
  public_source_url text,
  evidence_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT emergency_provider_review_events_service_fk
    FOREIGN KEY (service_id, organization_id)
    REFERENCES public.emergency_provider_services(id, organization_id)
    ON DELETE RESTRICT,
  CONSTRAINT emergency_provider_review_events_document_fk
    FOREIGN KEY (document_id, organization_id)
    REFERENCES public.emergency_organization_documents(id, organization_id)
    ON DELETE RESTRICT,
  CONSTRAINT emergency_provider_review_events_action_check
    CHECK (action IN (
      'SUBMITTED',
      'ADMIN_CREATED',
      'APPROVED',
      'REJECTED',
      'SUSPENDED',
      'REACTIVATED',
      'ORGANIZATION_UPDATED',
      'CORRECTION_REQUESTED',
      'DOCUMENT_UPLOADED',
      'DOCUMENT_ACCEPTED',
      'DOCUMENT_REJECTED',
      'SERVICE_CREATED',
      'SERVICE_UPDATED',
      'SERVICE_APPROVED',
      'SERVICE_REJECTED',
      'SERVICE_ACTIVATED',
      'SERVICE_DEACTIVATED'
    )),
  CONSTRAINT emergency_provider_review_events_target_check
    CHECK (
      (
        action IN (
          'SERVICE_CREATED', 'SERVICE_UPDATED', 'SERVICE_APPROVED',
          'SERVICE_REJECTED', 'SERVICE_ACTIVATED', 'SERVICE_DEACTIVATED'
        )
        AND service_id IS NOT NULL
        AND document_id IS NULL
      )
      OR
      (
        action IN (
          'DOCUMENT_UPLOADED', 'DOCUMENT_ACCEPTED', 'DOCUMENT_REJECTED'
        )
        AND document_id IS NOT NULL
        AND service_id IS NULL
      )
      OR
      (
        action IN (
          'SUBMITTED', 'ADMIN_CREATED', 'APPROVED', 'REJECTED', 'SUSPENDED',
          'REACTIVATED', 'ORGANIZATION_UPDATED', 'CORRECTION_REQUESTED'
        )
        AND service_id IS NULL
        AND document_id IS NULL
      )
    ),
  CONSTRAINT emergency_provider_review_events_reason_check
    CHECK (
      action NOT IN (
        'REJECTED', 'SUSPENDED', 'DOCUMENT_REJECTED', 'SERVICE_REJECTED',
        'CORRECTION_REQUESTED'
      )
      OR nullif(btrim(coalesce(reason, '')), '') IS NOT NULL
    ),
  CONSTRAINT emergency_provider_review_events_method_check
    CHECK (verification_method IS NULL OR verification_method IN (
      'OFFICIAL_WEBSITE', 'PHONE_CONFIRMATION', 'PUBLIC_RECORD',
      'DOCUMENT_REVIEW', 'IN_PERSON', 'OTHER'
    )),
  CONSTRAINT emergency_provider_review_events_source_name_length_check
    CHECK (source_name IS NULL OR char_length(source_name) <= 250),
  CONSTRAINT emergency_provider_review_events_source_url_check
    CHECK (source_url IS NULL OR (char_length(source_url) <= 500 AND source_url ~* '^https?://[^[:space:]]+$')),
  CONSTRAINT emergency_provider_review_events_public_label_len_check
    CHECK (public_source_label IS NULL OR char_length(public_source_label) <= 120),
  CONSTRAINT emergency_provider_review_events_public_source_url_check
    CHECK (public_source_url IS NULL OR (char_length(public_source_url) <= 500 AND public_source_url ~* '^https?://[^[:space:]]+$')),
  CONSTRAINT emergency_provider_review_events_evidence_length_check
    CHECK (evidence_summary IS NULL OR char_length(evidence_summary) <= 2000),
  CONSTRAINT emergency_provider_review_events_verified_source_required_check
    CHECK (
      action NOT IN ('ADMIN_CREATED', 'APPROVED', 'REACTIVATED')
      OR (
        verification_method IS NOT NULL
        AND nullif(btrim(coalesce(source_name, '')), '') IS NOT NULL
        AND nullif(btrim(coalesce(public_source_label, '')), '') IS NOT NULL
        AND nullif(btrim(coalesce(evidence_summary, '')), '') IS NOT NULL
      )
    )
);

CREATE INDEX emergency_organizations_creator_status_idx
  ON public.emergency_organizations (created_by, verification_status, created_at DESC);

CREATE INDEX emergency_organizations_public_city_status_idx
  ON public.emergency_organizations (city, verification_status, organization_name);

CREATE INDEX emergency_provider_services_org_review_active_idx
  ON public.emergency_provider_services (organization_id, review_status, is_active, category);

CREATE INDEX emergency_organization_documents_org_status_idx
  ON public.emergency_organization_documents (organization_id, review_status, created_at DESC);

CREATE INDEX emergency_provider_review_events_org_created_idx
  ON public.emergency_provider_review_events (organization_id, created_at DESC);

ALTER TABLE public.emergency_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_organization_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_provider_review_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.emergency_organizations
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.emergency_provider_services
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.emergency_organization_documents
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.emergency_provider_review_events
  FROM PUBLIC, anon, authenticated;

-- Read models may query through server routes after authorization. Mutations
-- (including audit events) must go through SECURITY DEFINER RPCs so state and
-- event writes remain atomic and callers cannot bypass lifecycle validation.
REVOKE ALL ON TABLE public.emergency_organizations FROM service_role;
GRANT SELECT ON TABLE public.emergency_organizations TO service_role;
REVOKE ALL ON TABLE public.emergency_provider_services FROM service_role;
GRANT SELECT ON TABLE public.emergency_provider_services TO service_role;
REVOKE ALL ON TABLE public.emergency_organization_documents FROM service_role;
GRANT SELECT ON TABLE public.emergency_organization_documents TO service_role;
REVOKE ALL ON TABLE public.emergency_provider_review_events FROM service_role;
GRANT SELECT ON TABLE public.emergency_provider_review_events TO service_role;

-- The bucket is private. No browser Storage policies are created here.
-- Before applying this migration, inspect storage.objects policies for this
-- bucket id if the bucket already exists; the public=false flag alone does
-- not override an independently-granted storage.objects policy.
DO $bucket$
DECLARE
  v_existing_bucket storage.buckets%ROWTYPE;
BEGIN
  SELECT *
  INTO v_existing_bucket
  FROM storage.buckets
  WHERE id = 'emergency-provider-documents';

  IF FOUND THEN
    IF v_existing_bucket.name IS DISTINCT FROM 'emergency-provider-documents'
      OR v_existing_bucket.public IS DISTINCT FROM false
      OR v_existing_bucket.file_size_limit IS DISTINCT FROM 10485760
      OR v_existing_bucket.allowed_mime_types IS DISTINCT FROM ARRAY[
        'application/pdf', 'image/jpeg', 'image/png', 'image/webp'
      ]::text[]
    THEN
      RAISE EXCEPTION 'SIAGA_DOCUMENT_BUCKET_CONFIGURATION_MISMATCH';
    END IF;
  ELSE
    INSERT INTO storage.buckets (
      id,
      name,
      public,
      file_size_limit,
      allowed_mime_types
    )
    VALUES (
      'emergency-provider-documents',
      'emergency-provider-documents',
      false,
      10485760,
      ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp'
      ]::text[]
    );
  END IF;
END;
$bucket$;

COMMENT ON TABLE public.emergency_organizations IS
  'Siaga directory organizations. All writes and private reads are server-mediated; public access uses a limited directory RPC.';
COMMENT ON TABLE public.emergency_provider_services IS
  'Individual help/emergency services; new records are pending review and inactive by default.';
COMMENT ON TABLE public.emergency_organization_documents IS
  'Private evidence documents for organization verification. Storage paths and document metadata must never be returned in public projections.';
COMMENT ON TABLE public.emergency_provider_review_events IS
  'Application audit events for Siaga organization, service, and document review.';



-- =========================================================
-- Transactional provider and moderation RPCs.
-- These functions are only executable by service_role. Every API route
-- must authenticate the user first and pass the authenticated user id.
-- =========================================================

-- Siaga organization media: private, backend-mediated access only.
DO $organization_media_bucket$
DECLARE
  v_existing_bucket storage.buckets%ROWTYPE;
BEGIN
  SELECT *
  INTO v_existing_bucket
  FROM storage.buckets
  WHERE id = 'emergency-organization-media';

  IF FOUND THEN
    IF v_existing_bucket.name IS DISTINCT FROM 'emergency-organization-media'
      OR v_existing_bucket.public IS DISTINCT FROM false
      OR v_existing_bucket.file_size_limit IS DISTINCT FROM 5242880
      OR v_existing_bucket.allowed_mime_types IS DISTINCT FROM ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp'
      ]
    THEN
      RAISE EXCEPTION
        'SIAGA_ORGANIZATION_MEDIA_BUCKET_CONFIGURATION_MISMATCH';
    END IF;
  ELSE
    INSERT INTO storage.buckets (
      id,
      name,
      public,
      file_size_limit,
      allowed_mime_types
    )
    VALUES (
      'emergency-organization-media',
      'emergency-organization-media',
      false,
      5242880,
      ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp'
      ]
    );
  END IF;
END;
$organization_media_bucket$;
CREATE OR REPLACE FUNCTION public.set_emergency_organization_media_path(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_media_kind text,
  p_storage_path text
)
RETURNS TABLE(result_previous_storage_path text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_now timestamptz := pg_catalog.statement_timestamp();
  v_role text;
  v_is_banned boolean;
  v_is_suspended boolean;
  v_suspended_until timestamptz;
  v_owner_id uuid;
  v_is_admin_managed boolean;
  v_organization_status text;
  v_previous_profile_path text;
  v_previous_cover_path text;
  v_previous_path text;
  v_expected_folder text;
BEGIN
  IF p_actor_user_id IS NULL OR p_organization_id IS NULL THEN
    RAISE EXCEPTION 'IDENTIFIER_REQUIRED'
      USING ERRCODE = '22004';
  END IF;

  IF p_media_kind IS NULL OR p_media_kind NOT IN ('PROFILE', 'COVER') THEN
    RAISE EXCEPTION 'INVALID_MEDIA_KIND'
      USING ERRCODE = '22023';
  END IF;

  IF p_storage_path IS NULL
    OR pg_catalog.char_length(p_storage_path) > 300
  THEN
    RAISE EXCEPTION 'INVALID_MEDIA_PATH'
      USING ERRCODE = '22023';
  END IF;

  v_expected_folder := pg_catalog.lower(p_media_kind);

  IF p_storage_path !~ (
    '^' || p_organization_id::text || '/' || v_expected_folder ||
    '/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$'
  ) THEN
    RAISE EXCEPTION 'INVALID_MEDIA_PATH'
      USING ERRCODE = '22023';
  END IF;

  SELECT
    coalesce(u.role, ''),
    coalesce(u.is_banned, false),
    coalesce(u.is_suspended, false),
    u.suspended_until
  INTO
    v_role,
    v_is_banned,
    v_is_suspended,
    v_suspended_until
  FROM public.users AS u
  WHERE u.id = p_actor_user_id
  FOR SHARE;

  IF NOT FOUND
    OR v_is_banned
    OR (
      v_is_suspended
      AND (
        v_suspended_until IS NULL
        OR v_suspended_until > v_now
      )
    )
  THEN
    RAISE EXCEPTION 'ACCOUNT_UNAVAILABLE'
      USING ERRCODE = '42501';
  END IF;

  SELECT
    o.created_by,
    o.is_admin_managed,
    o.verification_status,
    o.profile_image_path,
    o.cover_image_path
  INTO
    v_owner_id,
    v_is_admin_managed,
    v_organization_status,
    v_previous_profile_path,
    v_previous_cover_path
  FROM public.emergency_organizations AS o
  WHERE o.id = p_organization_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORGANIZATION_NOT_FOUND'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_owner_id IS DISTINCT FROM p_actor_user_id
    AND NOT (v_is_admin_managed AND v_role = 'ADMIN')
  THEN
    RAISE EXCEPTION 'FORBIDDEN'
      USING ERRCODE = '42501';
  END IF;

  IF v_organization_status = 'SUSPENDED' THEN
    RAISE EXCEPTION 'SUSPENDED_ORGANIZATION_CANNOT_BE_EDITED'
      USING ERRCODE = '55000';
  END IF;

  IF p_media_kind = 'PROFILE' THEN
    v_previous_path := v_previous_profile_path;

    UPDATE public.emergency_organizations
    SET
      profile_image_path = p_storage_path,
      updated_at = v_now
    WHERE id = p_organization_id;
  ELSE
    v_previous_path := v_previous_cover_path;

    UPDATE public.emergency_organizations
    SET
      cover_image_path = p_storage_path,
      updated_at = v_now
    WHERE id = p_organization_id;
  END IF;

  RETURN QUERY SELECT v_previous_path;
END;
$function$;
CREATE OR REPLACE FUNCTION public.submit_emergency_organization(
  p_actor_user_id uuid,
  p_organization_name text,
  p_organization_type text,
  p_registration_identifier text,
  p_description text,
  p_official_phone text,
  p_official_whatsapp text,
  p_contact_email text,
  p_website_url text,
  p_public_address text,
  p_district text,
  p_city text,
  p_province text,
  p_coverage_description text,
  p_latitude numeric,
  p_longitude numeric,
  p_coordinates_public boolean,
  p_service_name text,
  p_service_category text,
  p_service_description text,
  p_service_phone text,
  p_service_whatsapp text,
  p_service_area text,
  p_cost_type text,
  p_operating_hours text
)
RETURNS TABLE (
  result_organization_id uuid,
  result_organization_status text,
  result_service_id uuid,
  result_service_status text,
  result_submitted_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_organization_id uuid;
  v_service_id uuid;
  v_now timestamptz := pg_catalog.statement_timestamp();
  v_organization_type text;
  v_category text;
  v_cost_type text;
  v_website_url text;
BEGIN
  IF p_actor_user_id IS NULL THEN
    RAISE EXCEPTION 'ACTOR_REQUIRED' USING ERRCODE = '22004';
  END IF;

  PERFORM 1
  FROM public.users AS u
  WHERE u.id = p_actor_user_id
    AND NOT coalesce(u.is_banned, false)
    AND NOT (
      coalesce(u.is_suspended, false)
      AND (u.suspended_until IS NULL OR u.suspended_until > v_now)
    )
  FOR SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ACCOUNT_UNAVAILABLE' USING ERRCODE = '42501';
  END IF;

  IF nullif(pg_catalog.btrim(coalesce(p_organization_name, '')), '') IS NULL
    OR nullif(pg_catalog.btrim(coalesce(p_description, '')), '') IS NULL
    OR nullif(pg_catalog.btrim(coalesce(p_coverage_description, '')), '') IS NULL
    OR nullif(pg_catalog.btrim(coalesce(p_service_name, '')), '') IS NULL
    OR nullif(pg_catalog.btrim(coalesce(p_service_description, '')), '') IS NULL
    OR nullif(pg_catalog.btrim(coalesce(p_service_area, '')), '') IS NULL
  THEN
    RAISE EXCEPTION 'REQUIRED_FIELDS_MISSING' USING ERRCODE = '22023';
  END IF;

  IF pg_catalog.char_length(pg_catalog.btrim(p_organization_name)) > 200
    OR pg_catalog.char_length(pg_catalog.btrim(p_description)) > 3000
    OR pg_catalog.char_length(pg_catalog.btrim(p_coverage_description)) > 500
    OR pg_catalog.char_length(pg_catalog.btrim(p_service_name)) > 200
    OR pg_catalog.char_length(pg_catalog.btrim(p_service_description)) > 3000
    OR pg_catalog.char_length(pg_catalog.btrim(p_service_area)) > 500
    OR pg_catalog.char_length(coalesce(p_website_url, '')) > 500
    OR pg_catalog.char_length(coalesce(p_public_address, '')) > 300
    OR pg_catalog.char_length(coalesce(p_district, '')) > 100
    OR pg_catalog.char_length(coalesce(p_city, 'Surabaya')) > 100
    OR pg_catalog.char_length(coalesce(p_province, 'Jawa Timur')) > 100
  THEN
    RAISE EXCEPTION 'FIELD_TOO_LONG' USING ERRCODE = '22023';
  END IF;

  v_organization_type := pg_catalog.upper(pg_catalog.btrim(coalesce(p_organization_type, '')));
  IF v_organization_type NOT IN (
    'AMBULANCE_PROVIDER', 'HEALTHCARE_FACILITY', 'DISASTER_RELIEF',
    'SEARCH_AND_RESCUE', 'COMMUNITY_ORGANIZATION', 'OTHER'
  ) THEN
    RAISE EXCEPTION 'INVALID_ORGANIZATION_TYPE' USING ERRCODE = '22023';
  END IF;

  v_category := pg_catalog.upper(pg_catalog.btrim(coalesce(p_service_category, '')));
  IF v_category NOT IN (
    'AMBULANCE', 'MEDICAL', 'FIRE_RESCUE', 'DISASTER_RELIEF',
    'SEARCH_RESCUE', 'COMMUNITY_SUPPORT', 'OTHER'
  ) THEN
    RAISE EXCEPTION 'INVALID_SERVICE_CATEGORY' USING ERRCODE = '22023';
  END IF;

  v_cost_type := pg_catalog.upper(pg_catalog.btrim(coalesce(p_cost_type, 'UNKNOWN')));
  IF v_cost_type NOT IN ('FREE', 'PAID', 'DONATION', 'VARIES', 'UNKNOWN') THEN
    RAISE EXCEPTION 'INVALID_COST_TYPE' USING ERRCODE = '22023';
  END IF;

  v_website_url := nullif(pg_catalog.btrim(coalesce(p_website_url, '')), '');
  IF v_website_url IS NOT NULL AND v_website_url !~* '^https?://[^[:space:]]+$' THEN
    RAISE EXCEPTION 'INVALID_WEBSITE_URL' USING ERRCODE = '22023';
  END IF;

  IF nullif(pg_catalog.btrim(coalesce(p_official_phone, '')), '') IS NULL
    AND nullif(pg_catalog.btrim(coalesce(p_official_whatsapp, '')), '') IS NULL
  THEN
    RAISE EXCEPTION 'ORGANIZATION_CONTACT_REQUIRED' USING ERRCODE = '22023';
  END IF;

  IF (p_latitude IS NULL) <> (p_longitude IS NULL) THEN
    RAISE EXCEPTION 'COORDINATE_PAIR_REQUIRED' USING ERRCODE = '22023';
  END IF;

  IF p_latitude IS NOT NULL AND (
    p_latitude < -90 OR p_latitude > 90
    OR p_longitude < -180 OR p_longitude > 180
  ) THEN
    RAISE EXCEPTION 'COORDINATES_OUT_OF_RANGE' USING ERRCODE = '22023';
  END IF;

  IF coalesce(p_coordinates_public, false) AND p_latitude IS NULL THEN
    RAISE EXCEPTION 'PUBLIC_COORDINATES_REQUIRE_LOCATION' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.emergency_organizations (
    created_by, organization_name, organization_type, registration_identifier,
    description, official_phone, official_whatsapp, contact_email, website_url,
    public_address, district, city, province, coverage_description,
    latitude, longitude, coordinates_public, verification_status, created_at, updated_at
  )
  VALUES (
    p_actor_user_id,
    pg_catalog.btrim(p_organization_name),
    v_organization_type,
    nullif(pg_catalog.btrim(coalesce(p_registration_identifier, '')), ''),
    pg_catalog.btrim(p_description),
    nullif(pg_catalog.btrim(coalesce(p_official_phone, '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_official_whatsapp, '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_contact_email, '')), ''),
    v_website_url,
    nullif(pg_catalog.btrim(coalesce(p_public_address, '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_district, '')), ''),
    coalesce(nullif(pg_catalog.btrim(coalesce(p_city, '')), ''), 'Surabaya'),
    coalesce(nullif(pg_catalog.btrim(coalesce(p_province, '')), ''), 'Jawa Timur'),
    pg_catalog.btrim(p_coverage_description),
    p_latitude,
    p_longitude,
    coalesce(p_coordinates_public, false),
    'PENDING',
    v_now,
    v_now
  )
  RETURNING id INTO v_organization_id;

  INSERT INTO public.emergency_provider_services (
    organization_id, name, category, description, public_phone, public_whatsapp,
    service_area, cost_type, operating_hours, review_status, is_active,
    created_at, updated_at
  )
  VALUES (
    v_organization_id,
    pg_catalog.btrim(p_service_name),
    v_category,
    pg_catalog.btrim(p_service_description),
    nullif(pg_catalog.btrim(coalesce(p_service_phone, '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_service_whatsapp, '')), ''),
    pg_catalog.btrim(p_service_area),
    v_cost_type,
    nullif(pg_catalog.btrim(coalesce(p_operating_hours, '')), ''),
    'PENDING',
    false,
    v_now,
    v_now
  )
  RETURNING id INTO v_service_id;

  INSERT INTO public.emergency_provider_review_events (
    organization_id, actor_user_id, action, from_status, to_status, created_at
  )
  VALUES (
    v_organization_id, p_actor_user_id, 'SUBMITTED', 'DRAFT', 'PENDING', v_now
  );

  INSERT INTO public.emergency_provider_review_events (
    organization_id, service_id, actor_user_id, action, from_status, to_status, created_at
  )
  VALUES (
    v_organization_id, v_service_id, p_actor_user_id,
    'SERVICE_CREATED', NULL, 'PENDING', v_now
  );

  RETURN QUERY
  SELECT v_organization_id, 'PENDING'::text, v_service_id, 'PENDING'::text, v_now;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_emergency_organization_profile(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_organization_name text,
  p_organization_type text,
  p_registration_identifier text,
  p_description text,
  p_official_phone text,
  p_official_whatsapp text,
  p_contact_email text,
  p_website_url text,
  p_public_address text,
  p_district text,
  p_city text,
  p_province text,
  p_coverage_description text,
  p_latitude numeric,
  p_longitude numeric,
  p_coordinates_public boolean
)
RETURNS TABLE (
  result_organization_id uuid,
  result_verification_status text,
  result_updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_owner_id uuid;
  v_is_admin_managed boolean;
  v_current_status text;
  v_new_type text;
  v_website_url text;
  v_now timestamptz := pg_catalog.statement_timestamp();
BEGIN
  IF p_actor_user_id IS NULL OR p_organization_id IS NULL THEN
    RAISE EXCEPTION 'IDENTIFIER_REQUIRED' USING ERRCODE = '22004';
  END IF;

  PERFORM 1 FROM public.users AS u
  WHERE u.id = p_actor_user_id
    AND NOT coalesce(u.is_banned, false)
    AND NOT (coalesce(u.is_suspended, false)
      AND (u.suspended_until IS NULL OR u.suspended_until > v_now))
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ACCOUNT_UNAVAILABLE' USING ERRCODE = '42501';
  END IF;

  SELECT o.created_by, o.is_admin_managed, o.verification_status
  INTO v_owner_id, v_is_admin_managed, v_current_status
  FROM public.emergency_organizations AS o
  WHERE o.id = p_organization_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORGANIZATION_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;
  IF v_owner_id IS DISTINCT FROM p_actor_user_id THEN
    IF NOT v_is_admin_managed THEN
      RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
    END IF;
    PERFORM 1 FROM public.users AS u
    WHERE u.id = p_actor_user_id AND u.role::text = 'ADMIN'
      AND NOT coalesce(u.is_banned, false)
      AND NOT (
        coalesce(u.is_suspended, false)
        AND (u.suspended_until IS NULL OR u.suspended_until > pg_catalog.statement_timestamp())
      )
    FOR SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
    END IF;
  END IF;
  IF v_current_status = 'SUSPENDED' THEN
    RAISE EXCEPTION 'SUSPENDED_ORGANIZATION_CANNOT_BE_EDITED' USING ERRCODE = '55000';
  END IF;

  IF nullif(pg_catalog.btrim(coalesce(p_organization_name, '')), '') IS NULL
    OR nullif(pg_catalog.btrim(coalesce(p_description, '')), '') IS NULL
    OR nullif(pg_catalog.btrim(coalesce(p_coverage_description, '')), '') IS NULL
  THEN
    RAISE EXCEPTION 'REQUIRED_FIELDS_MISSING' USING ERRCODE = '22023';
  END IF;

  v_new_type := pg_catalog.upper(pg_catalog.btrim(coalesce(p_organization_type, '')));
  IF v_new_type NOT IN (
    'AMBULANCE_PROVIDER', 'HEALTHCARE_FACILITY', 'DISASTER_RELIEF',
    'SEARCH_AND_RESCUE', 'COMMUNITY_ORGANIZATION', 'OTHER'
  ) THEN
    RAISE EXCEPTION 'INVALID_ORGANIZATION_TYPE' USING ERRCODE = '22023';
  END IF;

  IF (p_latitude IS NULL) <> (p_longitude IS NULL) THEN
    RAISE EXCEPTION 'COORDINATE_PAIR_REQUIRED' USING ERRCODE = '22023';
  END IF;
  IF p_latitude IS NOT NULL AND (
    p_latitude < -90 OR p_latitude > 90
    OR p_longitude < -180 OR p_longitude > 180
  ) THEN
    RAISE EXCEPTION 'COORDINATES_OUT_OF_RANGE' USING ERRCODE = '22023';
  END IF;
  IF coalesce(p_coordinates_public, false) AND p_latitude IS NULL THEN
    RAISE EXCEPTION 'PUBLIC_COORDINATES_REQUIRE_LOCATION' USING ERRCODE = '22023';
  END IF;

  v_website_url := nullif(pg_catalog.btrim(coalesce(p_website_url, '')), '');
  IF v_website_url IS NOT NULL AND v_website_url !~* '^https?://[^[:space:]]+$' THEN
    RAISE EXCEPTION 'INVALID_WEBSITE_URL' USING ERRCODE = '22023';
  END IF;
  IF nullif(pg_catalog.btrim(coalesce(p_official_phone, '')), '') IS NULL
    AND nullif(pg_catalog.btrim(coalesce(p_official_whatsapp, '')), '') IS NULL
  THEN
    RAISE EXCEPTION 'ORGANIZATION_CONTACT_REQUIRED' USING ERRCODE = '22023';
  END IF;

  UPDATE public.emergency_organizations AS o
  SET organization_name = pg_catalog.btrim(p_organization_name),
      organization_type = v_new_type,
      registration_identifier = nullif(pg_catalog.btrim(coalesce(p_registration_identifier, '')), ''),
      description = pg_catalog.btrim(p_description),
      official_phone = nullif(pg_catalog.btrim(coalesce(p_official_phone, '')), ''),
      official_whatsapp = nullif(pg_catalog.btrim(coalesce(p_official_whatsapp, '')), ''),
      contact_email = nullif(pg_catalog.btrim(coalesce(p_contact_email, '')), ''),
      website_url = v_website_url,
      public_address = nullif(pg_catalog.btrim(coalesce(p_public_address, '')), ''),
      district = nullif(pg_catalog.btrim(coalesce(p_district, '')), ''),
      city = coalesce(nullif(pg_catalog.btrim(coalesce(p_city, '')), ''), 'Surabaya'),
      province = coalesce(nullif(pg_catalog.btrim(coalesce(p_province, '')), ''), 'Jawa Timur'),
      coverage_description = pg_catalog.btrim(p_coverage_description),
      latitude = p_latitude,
      longitude = p_longitude,
      coordinates_public = coalesce(p_coordinates_public, false),
      verification_status = 'PENDING',
      verified_at = NULL,
      verified_source_label = NULL,
      verified_source_url = NULL,
      reviewed_at = NULL,
      reviewed_by = NULL,
      rejection_reason = NULL,
      correction_reason = NULL,
      admin_notes = o.admin_notes,
      updated_at = v_now
  WHERE o.id = p_organization_id;

  WITH deactivated_services AS (
    UPDATE public.emergency_provider_services AS s
    SET is_active = false,
        updated_at = v_now
    WHERE s.organization_id = p_organization_id
      AND s.is_active = true
    RETURNING s.id, s.organization_id
  )
  INSERT INTO public.emergency_provider_review_events (
    organization_id, service_id, actor_user_id, action, from_status, to_status, reason, created_at
  )
  SELECT
    ds.organization_id, ds.id, p_actor_user_id, 'SERVICE_DEACTIVATED',
    'ACTIVE', 'INACTIVE', 'ORGANIZATION_PROFILE_UPDATED_REQUIRES_REVERIFICATION', v_now
  FROM deactivated_services AS ds;

  INSERT INTO public.emergency_provider_review_events (
    organization_id, actor_user_id, action, from_status, to_status, created_at
  )
  VALUES (
    p_organization_id, p_actor_user_id, 'ORGANIZATION_UPDATED',
    v_current_status, 'PENDING', v_now
  );

  RETURN QUERY
  SELECT o.id, o.verification_status, o.updated_at
  FROM public.emergency_organizations AS o
  WHERE o.id = p_organization_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_emergency_provider_service(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_service_name text,
  p_service_category text,
  p_service_description text,
  p_service_phone text,
  p_service_whatsapp text,
  p_service_area text,
  p_cost_type text,
  p_operating_hours text
)
RETURNS TABLE (
  result_service_id uuid,
  result_organization_id uuid,
  result_review_status text,
  result_is_active boolean,
  result_created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_owner_id uuid;
  v_is_admin_managed boolean;
  v_org_status text;
  v_service_id uuid;
  v_category text;
  v_cost text;
  v_now timestamptz := pg_catalog.statement_timestamp();
BEGIN
  PERFORM 1 FROM public.users AS u
  WHERE u.id = p_actor_user_id
    AND NOT coalesce(u.is_banned, false)
    AND NOT (coalesce(u.is_suspended, false)
      AND (u.suspended_until IS NULL OR u.suspended_until > v_now))
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ACCOUNT_UNAVAILABLE' USING ERRCODE = '42501';
  END IF;

  SELECT o.created_by, o.is_admin_managed, o.verification_status
  INTO v_owner_id, v_is_admin_managed, v_org_status
  FROM public.emergency_organizations AS o
  WHERE o.id = p_organization_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORGANIZATION_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;
  IF v_owner_id IS DISTINCT FROM p_actor_user_id THEN
    IF NOT v_is_admin_managed THEN
      RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
    END IF;
    PERFORM 1 FROM public.users AS u
    WHERE u.id = p_actor_user_id AND u.role::text = 'ADMIN'
      AND NOT coalesce(u.is_banned, false)
      AND NOT (
        coalesce(u.is_suspended, false)
        AND (u.suspended_until IS NULL OR u.suspended_until > pg_catalog.statement_timestamp())
      )
    FOR SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
    END IF;
  END IF;
  IF v_org_status NOT IN ('PENDING', 'VERIFIED') THEN
    RAISE EXCEPTION 'ORGANIZATION_NOT_READY_FOR_SERVICE' USING ERRCODE = '55000';
  END IF;

  IF nullif(pg_catalog.btrim(coalesce(p_service_name, '')), '') IS NULL
    OR nullif(pg_catalog.btrim(coalesce(p_service_description, '')), '') IS NULL
    OR nullif(pg_catalog.btrim(coalesce(p_service_area, '')), '') IS NULL
  THEN
    RAISE EXCEPTION 'REQUIRED_FIELDS_MISSING' USING ERRCODE = '22023';
  END IF;

  v_category := pg_catalog.upper(pg_catalog.btrim(coalesce(p_service_category, '')));
  IF v_category NOT IN (
    'AMBULANCE', 'MEDICAL', 'FIRE_RESCUE', 'DISASTER_RELIEF',
    'SEARCH_RESCUE', 'COMMUNITY_SUPPORT', 'OTHER'
  ) THEN
    RAISE EXCEPTION 'INVALID_SERVICE_CATEGORY' USING ERRCODE = '22023';
  END IF;

  v_cost := pg_catalog.upper(pg_catalog.btrim(coalesce(p_cost_type, 'UNKNOWN')));
  IF v_cost NOT IN ('FREE', 'PAID', 'DONATION', 'VARIES', 'UNKNOWN') THEN
    RAISE EXCEPTION 'INVALID_COST_TYPE' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.emergency_provider_services (
    organization_id, name, category, description, public_phone, public_whatsapp,
    service_area, cost_type, operating_hours, review_status, is_active, created_at, updated_at
  )
  VALUES (
    p_organization_id,
    pg_catalog.btrim(p_service_name),
    v_category,
    pg_catalog.btrim(p_service_description),
    nullif(pg_catalog.btrim(coalesce(p_service_phone, '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_service_whatsapp, '')), ''),
    pg_catalog.btrim(p_service_area),
    v_cost,
    nullif(pg_catalog.btrim(coalesce(p_operating_hours, '')), ''),
    'PENDING', false, v_now, v_now
  )
  RETURNING id INTO v_service_id;

  INSERT INTO public.emergency_provider_review_events (
    organization_id, service_id, actor_user_id, action, from_status, to_status, created_at
  )
  VALUES (
    p_organization_id, v_service_id, p_actor_user_id,
    'SERVICE_CREATED', NULL, 'PENDING', v_now
  );

  RETURN QUERY SELECT v_service_id, p_organization_id, 'PENDING'::text, false, v_now;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_emergency_provider_service(
  p_actor_user_id uuid,
  p_service_id uuid,
  p_service_name text,
  p_service_category text,
  p_service_description text,
  p_service_phone text,
  p_service_whatsapp text,
  p_service_area text,
  p_cost_type text,
  p_operating_hours text
)
RETURNS TABLE (
  result_service_id uuid,
  result_organization_id uuid,
  result_review_status text,
  result_is_active boolean,
  result_updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_organization_id uuid;
  v_owner_id uuid;
  v_is_admin_managed boolean;
  v_org_status text;
  v_review_status text;
  v_was_active boolean;
  v_category text;
  v_cost text;
  v_now timestamptz := pg_catalog.statement_timestamp();
BEGIN
  PERFORM 1 FROM public.users AS u
  WHERE u.id = p_actor_user_id
    AND NOT coalesce(u.is_banned, false)
    AND NOT (coalesce(u.is_suspended, false)
      AND (u.suspended_until IS NULL OR u.suspended_until > v_now))
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ACCOUNT_UNAVAILABLE' USING ERRCODE = '42501';
  END IF;

  SELECT s.organization_id INTO v_organization_id
  FROM public.emergency_provider_services AS s
  WHERE s.id = p_service_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SERVICE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  SELECT o.created_by, o.is_admin_managed, o.verification_status
  INTO v_owner_id, v_is_admin_managed, v_org_status
  FROM public.emergency_organizations AS o
  WHERE o.id = v_organization_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORGANIZATION_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;
  IF v_owner_id IS DISTINCT FROM p_actor_user_id THEN
    IF NOT v_is_admin_managed THEN
      RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
    END IF;
    PERFORM 1 FROM public.users AS u
    WHERE u.id = p_actor_user_id AND u.role::text = 'ADMIN'
      AND NOT coalesce(u.is_banned, false)
      AND NOT (
        coalesce(u.is_suspended, false)
        AND (u.suspended_until IS NULL OR u.suspended_until > pg_catalog.statement_timestamp())
      )
    FOR SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
    END IF;
  END IF;
  IF v_org_status NOT IN ('PENDING', 'VERIFIED') THEN
    RAISE EXCEPTION 'ORGANIZATION_NOT_READY_FOR_SERVICE' USING ERRCODE = '55000';
  END IF;

  SELECT s.review_status, s.is_active
  INTO v_review_status, v_was_active
  FROM public.emergency_provider_services AS s
  WHERE s.id = p_service_id AND s.organization_id = v_organization_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SERVICE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  IF nullif(pg_catalog.btrim(coalesce(p_service_name, '')), '') IS NULL
    OR nullif(pg_catalog.btrim(coalesce(p_service_description, '')), '') IS NULL
    OR nullif(pg_catalog.btrim(coalesce(p_service_area, '')), '') IS NULL
  THEN
    RAISE EXCEPTION 'REQUIRED_FIELDS_MISSING' USING ERRCODE = '22023';
  END IF;

  v_category := pg_catalog.upper(pg_catalog.btrim(coalesce(p_service_category, '')));
  IF v_category NOT IN (
    'AMBULANCE', 'MEDICAL', 'FIRE_RESCUE', 'DISASTER_RELIEF',
    'SEARCH_RESCUE', 'COMMUNITY_SUPPORT', 'OTHER'
  ) THEN
    RAISE EXCEPTION 'INVALID_SERVICE_CATEGORY' USING ERRCODE = '22023';
  END IF;
  v_cost := pg_catalog.upper(pg_catalog.btrim(coalesce(p_cost_type, 'UNKNOWN')));
  IF v_cost NOT IN ('FREE', 'PAID', 'DONATION', 'VARIES', 'UNKNOWN') THEN
    RAISE EXCEPTION 'INVALID_COST_TYPE' USING ERRCODE = '22023';
  END IF;

  UPDATE public.emergency_provider_services AS s
  SET name = pg_catalog.btrim(p_service_name),
      category = v_category,
      description = pg_catalog.btrim(p_service_description),
      public_phone = nullif(pg_catalog.btrim(coalesce(p_service_phone, '')), ''),
      public_whatsapp = nullif(pg_catalog.btrim(coalesce(p_service_whatsapp, '')), ''),
      service_area = pg_catalog.btrim(p_service_area),
      cost_type = v_cost,
      operating_hours = nullif(pg_catalog.btrim(coalesce(p_operating_hours, '')), ''),
      review_status = 'PENDING',
      is_active = false,
      reviewed_by = NULL,
      reviewed_at = NULL,
      rejection_reason = NULL,
      updated_at = v_now
  WHERE s.id = p_service_id;

  IF v_was_active THEN
    INSERT INTO public.emergency_provider_review_events (
      organization_id, service_id, actor_user_id, action, from_status, to_status, reason, created_at
    )
    VALUES (
      v_organization_id, p_service_id, p_actor_user_id, 'SERVICE_DEACTIVATED',
      'ACTIVE', 'INACTIVE', 'SERVICE_PROFILE_UPDATED_REQUIRES_REAPPROVAL', v_now
    );
  END IF;

  INSERT INTO public.emergency_provider_review_events (
    organization_id, service_id, actor_user_id, action, from_status, to_status, created_at
  )
  VALUES (
    v_organization_id, p_service_id, p_actor_user_id,
    'SERVICE_UPDATED', v_review_status, 'PENDING', v_now
  );

  RETURN QUERY
  SELECT s.id, s.organization_id, s.review_status, s.is_active, s.updated_at
  FROM public.emergency_provider_services AS s
  WHERE s.id = p_service_id;
END;
$function$;


CREATE OR REPLACE FUNCTION public.admin_create_emergency_organization(
  p_actor_user_id uuid,
  p_organization_name text,
  p_organization_type text,
  p_registration_identifier text,
  p_description text,
  p_official_phone text,
  p_official_whatsapp text,
  p_contact_email text,
  p_website_url text,
  p_public_address text,
  p_district text,
  p_city text,
  p_province text,
  p_coverage_description text,
  p_latitude numeric,
  p_longitude numeric,
  p_coordinates_public boolean,
  p_service_name text,
  p_service_category text,
  p_service_description text,
  p_service_phone text,
  p_service_whatsapp text,
  p_service_area text,
  p_cost_type text,
  p_operating_hours text,
  p_verification_method text,
  p_source_name text,
  p_source_url text,
  p_public_source_label text,
  p_public_source_url text,
  p_evidence_summary text,
  p_admin_notes text
)
RETURNS TABLE (
  result_organization_id uuid,
  result_organization_status text,
  result_service_id uuid,
  result_service_status text,
  result_service_is_active boolean,
  result_created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_organization_id uuid;
  v_service_id uuid;
  v_organization_type text;
  v_category text;
  v_cost_type text;
  v_website_url text;
  v_source_url text;
  v_public_source_url text;
  v_source_label text;
  v_now timestamptz := pg_catalog.statement_timestamp();
BEGIN
  IF p_actor_user_id IS NULL THEN
    RAISE EXCEPTION 'ACTOR_REQUIRED' USING ERRCODE = '22004';
  END IF;

  PERFORM 1 FROM public.users AS u
  WHERE u.id = p_actor_user_id
    AND u.role::text = 'ADMIN'
    AND NOT coalesce(u.is_banned, false)
    AND NOT (
      coalesce(u.is_suspended, false)
      AND (u.suspended_until IS NULL OR u.suspended_until > pg_catalog.statement_timestamp())
    )
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  IF nullif(pg_catalog.btrim(coalesce(p_organization_name, '')), '') IS NULL
    OR nullif(pg_catalog.btrim(coalesce(p_description, '')), '') IS NULL
    OR nullif(pg_catalog.btrim(coalesce(p_coverage_description, '')), '') IS NULL
    OR nullif(pg_catalog.btrim(coalesce(p_service_name, '')), '') IS NULL
    OR nullif(pg_catalog.btrim(coalesce(p_service_description, '')), '') IS NULL
    OR nullif(pg_catalog.btrim(coalesce(p_service_area, '')), '') IS NULL
  THEN
    RAISE EXCEPTION 'REQUIRED_FIELDS_MISSING' USING ERRCODE = '22023';
  END IF;

  v_organization_type := pg_catalog.upper(pg_catalog.btrim(coalesce(p_organization_type, '')));
  IF v_organization_type NOT IN (
    'AMBULANCE_PROVIDER', 'HEALTHCARE_FACILITY', 'DISASTER_RELIEF',
    'SEARCH_AND_RESCUE', 'COMMUNITY_ORGANIZATION', 'OTHER'
  ) THEN
    RAISE EXCEPTION 'INVALID_ORGANIZATION_TYPE' USING ERRCODE = '22023';
  END IF;

  v_category := pg_catalog.upper(pg_catalog.btrim(coalesce(p_service_category, '')));
  IF v_category NOT IN (
    'AMBULANCE', 'MEDICAL', 'FIRE_RESCUE', 'DISASTER_RELIEF',
    'SEARCH_RESCUE', 'COMMUNITY_SUPPORT', 'OTHER'
  ) THEN
    RAISE EXCEPTION 'INVALID_SERVICE_CATEGORY' USING ERRCODE = '22023';
  END IF;

  v_cost_type := pg_catalog.upper(pg_catalog.btrim(coalesce(p_cost_type, 'UNKNOWN')));
  IF v_cost_type NOT IN ('FREE', 'PAID', 'DONATION', 'VARIES', 'UNKNOWN') THEN
    RAISE EXCEPTION 'INVALID_COST_TYPE' USING ERRCODE = '22023';
  END IF;

  IF nullif(pg_catalog.btrim(coalesce(p_official_phone, '')), '') IS NULL
    AND nullif(pg_catalog.btrim(coalesce(p_official_whatsapp, '')), '') IS NULL
  THEN
    RAISE EXCEPTION 'ORGANIZATION_CONTACT_REQUIRED' USING ERRCODE = '22023';
  END IF;
  IF (p_latitude IS NULL) <> (p_longitude IS NULL) THEN
    RAISE EXCEPTION 'COORDINATE_PAIR_REQUIRED' USING ERRCODE = '22023';
  END IF;
  IF p_latitude IS NOT NULL AND (
    p_latitude < -90 OR p_latitude > 90
    OR p_longitude < -180 OR p_longitude > 180
  ) THEN
    RAISE EXCEPTION 'COORDINATES_OUT_OF_RANGE' USING ERRCODE = '22023';
  END IF;
  IF coalesce(p_coordinates_public, false) AND p_latitude IS NULL THEN
    RAISE EXCEPTION 'PUBLIC_COORDINATES_REQUIRE_LOCATION' USING ERRCODE = '22023';
  END IF;

  v_website_url := nullif(pg_catalog.btrim(coalesce(p_website_url, '')), '');
  IF v_website_url IS NOT NULL AND v_website_url !~* '^https?://[^[:space:]]+$' THEN
    RAISE EXCEPTION 'INVALID_WEBSITE_URL' USING ERRCODE = '22023';
  END IF;

  IF p_verification_method IS NULL OR p_verification_method NOT IN (
    'OFFICIAL_WEBSITE', 'PHONE_CONFIRMATION', 'PUBLIC_RECORD',
    'DOCUMENT_REVIEW', 'IN_PERSON', 'OTHER'
  ) THEN
    RAISE EXCEPTION 'VERIFICATION_METHOD_REQUIRED' USING ERRCODE = '22023';
  END IF;
  IF nullif(pg_catalog.btrim(coalesce(p_source_name, '')), '') IS NULL
    OR nullif(pg_catalog.btrim(coalesce(p_public_source_label, '')), '') IS NULL
    OR nullif(pg_catalog.btrim(coalesce(p_evidence_summary, '')), '') IS NULL
  THEN
    RAISE EXCEPTION 'VERIFICATION_EVIDENCE_REQUIRED' USING ERRCODE = '22023';
  END IF;
  IF pg_catalog.char_length(p_public_source_label) > 120
    OR pg_catalog.char_length(p_source_name) > 250
    OR pg_catalog.char_length(p_evidence_summary) > 2000
  THEN
    RAISE EXCEPTION 'VERIFICATION_EVIDENCE_TOO_LONG' USING ERRCODE = '22023';
  END IF;

  v_source_url := nullif(pg_catalog.btrim(coalesce(p_source_url, '')), '');
  IF v_source_url IS NOT NULL AND v_source_url !~* '^https?://[^[:space:]]+$' THEN
    RAISE EXCEPTION 'INVALID_SOURCE_URL' USING ERRCODE = '22023';
  END IF;
  v_public_source_url := nullif(pg_catalog.btrim(coalesce(p_public_source_url, '')), '');
  IF v_public_source_url IS NOT NULL AND v_public_source_url !~* '^https?://[^[:space:]]+$' THEN
    RAISE EXCEPTION 'INVALID_PUBLIC_SOURCE_URL' USING ERRCODE = '22023';
  END IF;
  v_source_label := pg_catalog.btrim(p_public_source_label);

  INSERT INTO public.emergency_organizations (
    created_by, is_admin_managed, organization_name, organization_type,
    registration_identifier, description, official_phone, official_whatsapp,
    contact_email, website_url, public_address, district, city, province,
    coverage_description, latitude, longitude, coordinates_public,
    verification_status, verified_at, verified_source_label, verified_source_url,
    reviewed_at, reviewed_by, admin_notes, created_at, updated_at
  )
  VALUES (
    NULL, true,
    pg_catalog.btrim(p_organization_name),
    v_organization_type,
    nullif(pg_catalog.btrim(coalesce(p_registration_identifier, '')), ''),
    pg_catalog.btrim(p_description),
    nullif(pg_catalog.btrim(coalesce(p_official_phone, '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_official_whatsapp, '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_contact_email, '')), ''),
    v_website_url,
    nullif(pg_catalog.btrim(coalesce(p_public_address, '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_district, '')), ''),
    coalesce(nullif(pg_catalog.btrim(coalesce(p_city, '')), ''), 'Surabaya'),
    coalesce(nullif(pg_catalog.btrim(coalesce(p_province, '')), ''), 'Jawa Timur'),
    pg_catalog.btrim(p_coverage_description),
    p_latitude,
    p_longitude,
    coalesce(p_coordinates_public, false),
    'VERIFIED', v_now, v_source_label, v_public_source_url,
    v_now, p_actor_user_id,
    nullif(pg_catalog.btrim(coalesce(p_admin_notes, '')), ''),
    v_now, v_now
  )
  RETURNING id INTO v_organization_id;

  INSERT INTO public.emergency_provider_services (
    organization_id, name, category, description, public_phone, public_whatsapp,
    service_area, cost_type, operating_hours, review_status, is_active,
    created_at, updated_at
  )
  VALUES (
    v_organization_id,
    pg_catalog.btrim(p_service_name),
    v_category,
    pg_catalog.btrim(p_service_description),
    nullif(pg_catalog.btrim(coalesce(p_service_phone, '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_service_whatsapp, '')), ''),
    pg_catalog.btrim(p_service_area),
    v_cost_type,
    nullif(pg_catalog.btrim(coalesce(p_operating_hours, '')), ''),
    'PENDING', false, v_now, v_now
  )
  RETURNING id INTO v_service_id;

  INSERT INTO public.emergency_provider_review_events (
    organization_id, actor_user_id, action, from_status, to_status,
    verification_method, source_name, source_url, public_source_label,
    public_source_url, evidence_summary, created_at
  )
  VALUES (
    v_organization_id, p_actor_user_id, 'ADMIN_CREATED', NULL, 'VERIFIED',
    p_verification_method,
    pg_catalog.btrim(p_source_name),
    v_source_url,
    v_source_label,
    v_public_source_url,
    pg_catalog.btrim(p_evidence_summary),
    v_now
  );

  INSERT INTO public.emergency_provider_review_events (
    organization_id, service_id, actor_user_id, action, from_status, to_status, created_at
  )
  VALUES (
    v_organization_id, v_service_id, p_actor_user_id,
    'SERVICE_CREATED', NULL, 'PENDING', v_now
  );

  UPDATE public.emergency_provider_services AS s
  SET review_status = 'APPROVED',
      reviewed_by = p_actor_user_id,
      reviewed_at = v_now,
      updated_at = v_now
  WHERE s.id = v_service_id;

  INSERT INTO public.emergency_provider_review_events (
    organization_id, service_id, actor_user_id, action, from_status, to_status, created_at
  )
  VALUES (
    v_organization_id, v_service_id, p_actor_user_id,
    'SERVICE_APPROVED', 'PENDING', 'APPROVED', v_now
  );

  RETURN QUERY
  SELECT v_organization_id, 'VERIFIED'::text, v_service_id, 'APPROVED'::text, false, v_now;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_review_emergency_organization(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_decision text,
  p_reason text,
  p_verification_method text,
  p_source_name text,
  p_source_url text,
  p_public_source_label text,
  p_public_source_url text,
  p_evidence_summary text,
  p_admin_notes text
)
RETURNS TABLE (
  result_organization_id uuid,
  result_verification_status text,
  result_verified_at timestamptz,
  result_reviewed_at timestamptz,
  result_reviewed_by uuid,
  result_rejection_reason text,
  result_correction_reason text,
  result_updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_current_status text;
  v_target_status text;
  v_action text;
  v_now timestamptz := pg_catalog.statement_timestamp();
BEGIN
  IF p_actor_user_id IS NULL OR p_organization_id IS NULL THEN
    RAISE EXCEPTION 'IDENTIFIER_REQUIRED' USING ERRCODE = '22004';
  END IF;
  IF pg_catalog.upper(pg_catalog.btrim(coalesce(p_decision, ''))) NOT IN (
    'VERIFIED', 'NEEDS_CORRECTION', 'REJECTED', 'SUSPENDED', 'REACTIVATED'
  ) THEN
    RAISE EXCEPTION 'INVALID_ORGANIZATION_DECISION' USING ERRCODE = '22023';
  END IF;

  PERFORM 1 FROM public.users AS u
  WHERE u.id = p_actor_user_id
    AND u.role::text = 'ADMIN'
    AND NOT coalesce(u.is_banned, false)
    AND NOT (
      coalesce(u.is_suspended, false)
      AND (u.suspended_until IS NULL OR u.suspended_until > pg_catalog.statement_timestamp())
    )
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT o.verification_status INTO v_current_status
  FROM public.emergency_organizations AS o
  WHERE o.id = p_organization_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORGANIZATION_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  p_decision := pg_catalog.upper(pg_catalog.btrim(p_decision));
  IF p_decision = 'VERIFIED' THEN
    IF v_current_status NOT IN ('PENDING', 'REJECTED') THEN
      RAISE EXCEPTION 'INVALID_ORGANIZATION_TRANSITION' USING ERRCODE = '55000';
    END IF;
    v_target_status := 'VERIFIED';
    v_action := 'APPROVED';
  ELSIF p_decision = 'NEEDS_CORRECTION' THEN
    IF v_current_status <> 'PENDING' THEN
      RAISE EXCEPTION 'INVALID_ORGANIZATION_TRANSITION' USING ERRCODE = '55000';
    END IF;
    IF nullif(pg_catalog.btrim(coalesce(p_reason, '')), '') IS NULL THEN
      RAISE EXCEPTION 'CORRECTION_REASON_REQUIRED' USING ERRCODE = '22023';
    END IF;
    v_target_status := 'NEEDS_CORRECTION';
    v_action := 'CORRECTION_REQUESTED';
  ELSIF p_decision = 'REJECTED' THEN
    IF v_current_status NOT IN ('DRAFT', 'PENDING', 'NEEDS_CORRECTION') THEN
      RAISE EXCEPTION 'INVALID_ORGANIZATION_TRANSITION' USING ERRCODE = '55000';
    END IF;
    IF nullif(pg_catalog.btrim(coalesce(p_reason, '')), '') IS NULL THEN
      RAISE EXCEPTION 'REJECTION_REASON_REQUIRED' USING ERRCODE = '22023';
    END IF;
    v_target_status := 'REJECTED';
    v_action := 'REJECTED';
  ELSIF p_decision = 'SUSPENDED' THEN
    IF v_current_status <> 'VERIFIED' THEN
      RAISE EXCEPTION 'INVALID_ORGANIZATION_TRANSITION' USING ERRCODE = '55000';
    END IF;
    IF nullif(pg_catalog.btrim(coalesce(p_reason, '')), '') IS NULL THEN
      RAISE EXCEPTION 'SUSPENSION_REASON_REQUIRED' USING ERRCODE = '22023';
    END IF;
    v_target_status := 'SUSPENDED';
    v_action := 'SUSPENDED';
  ELSE
    IF v_current_status <> 'SUSPENDED' THEN
      RAISE EXCEPTION 'INVALID_ORGANIZATION_TRANSITION' USING ERRCODE = '55000';
    END IF;
    v_target_status := 'VERIFIED';
    v_action := 'REACTIVATED';
  END IF;

  IF p_decision IN ('VERIFIED', 'REACTIVATED') THEN
    IF p_verification_method IS NULL OR p_verification_method NOT IN (
      'OFFICIAL_WEBSITE', 'PHONE_CONFIRMATION', 'PUBLIC_RECORD',
      'DOCUMENT_REVIEW', 'IN_PERSON', 'OTHER'
    ) THEN
      RAISE EXCEPTION 'VERIFICATION_METHOD_REQUIRED' USING ERRCODE = '22023';
    END IF;
    IF nullif(pg_catalog.btrim(coalesce(p_source_name, '')), '') IS NULL
      OR nullif(pg_catalog.btrim(coalesce(p_public_source_label, '')), '') IS NULL
      OR nullif(pg_catalog.btrim(coalesce(p_evidence_summary, '')), '') IS NULL
    THEN
      RAISE EXCEPTION 'VERIFICATION_EVIDENCE_REQUIRED' USING ERRCODE = '22023';
    END IF;
    IF pg_catalog.char_length(p_public_source_label) > 120
      OR pg_catalog.char_length(p_source_name) > 250
      OR pg_catalog.char_length(p_evidence_summary) > 2000
    THEN
      RAISE EXCEPTION 'VERIFICATION_EVIDENCE_TOO_LONG' USING ERRCODE = '22023';
    END IF;
  END IF;

  IF nullif(pg_catalog.btrim(coalesce(p_source_url, '')), '') IS NOT NULL
    AND pg_catalog.btrim(p_source_url) !~* '^https?://[^[:space:]]+$'
  THEN
    RAISE EXCEPTION 'INVALID_SOURCE_URL' USING ERRCODE = '22023';
  END IF;
  IF nullif(pg_catalog.btrim(coalesce(p_public_source_url, '')), '') IS NOT NULL
    AND pg_catalog.btrim(p_public_source_url) !~* '^https?://[^[:space:]]+$'
  THEN
    RAISE EXCEPTION 'INVALID_PUBLIC_SOURCE_URL' USING ERRCODE = '22023';
  END IF;

  UPDATE public.emergency_organizations AS o
  SET verification_status = v_target_status,
      verified_at = CASE
        WHEN v_target_status = 'SUSPENDED' THEN o.verified_at
        WHEN v_target_status = 'VERIFIED' THEN v_now
        ELSE NULL
      END,
      verified_source_label = CASE
        WHEN v_target_status = 'SUSPENDED' THEN o.verified_source_label
        WHEN v_target_status = 'VERIFIED' THEN nullif(pg_catalog.btrim(coalesce(p_public_source_label, '')), '')
        ELSE NULL
      END,
      verified_source_url = CASE
        WHEN v_target_status = 'SUSPENDED' THEN o.verified_source_url
        WHEN v_target_status = 'VERIFIED' THEN nullif(pg_catalog.btrim(coalesce(p_public_source_url, '')), '')
        ELSE NULL
      END,
      reviewed_at = v_now,
      reviewed_by = p_actor_user_id,
      rejection_reason = CASE
        WHEN v_target_status = 'REJECTED' THEN pg_catalog.btrim(p_reason)
        ELSE NULL
      END,
      correction_reason = CASE
        WHEN v_target_status = 'NEEDS_CORRECTION' THEN pg_catalog.btrim(p_reason)
        ELSE NULL
      END,
      admin_notes = CASE
        WHEN p_admin_notes IS NULL THEN o.admin_notes
        ELSE nullif(pg_catalog.btrim(p_admin_notes), '')
      END,
      updated_at = v_now
  WHERE o.id = p_organization_id;

  IF v_target_status IN ('REJECTED', 'SUSPENDED') THEN
    WITH deactivated_services AS (
      UPDATE public.emergency_provider_services AS s
      SET is_active = false,
          updated_at = v_now
      WHERE s.organization_id = p_organization_id
        AND s.is_active = true
      RETURNING s.id, s.organization_id
    )
    INSERT INTO public.emergency_provider_review_events (
      organization_id, service_id, actor_user_id, action, from_status, to_status, reason, created_at
    )
    SELECT
      ds.organization_id, ds.id, p_actor_user_id, 'SERVICE_DEACTIVATED',
      'ACTIVE', 'INACTIVE', pg_catalog.btrim(p_reason), v_now
    FROM deactivated_services AS ds;
  END IF;

  INSERT INTO public.emergency_provider_review_events (
    organization_id, actor_user_id, action, from_status, to_status, reason,
    verification_method, source_name, source_url, public_source_label,
    public_source_url, evidence_summary, created_at
  )
  VALUES (
    p_organization_id, p_actor_user_id, v_action,
    v_current_status, v_target_status,
    nullif(pg_catalog.btrim(coalesce(p_reason, '')), ''),
    CASE WHEN p_decision IN ('VERIFIED', 'REACTIVATED') THEN p_verification_method ELSE NULL END,
    nullif(pg_catalog.btrim(coalesce(p_source_name, '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_source_url, '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_public_source_label, '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_public_source_url, '')), ''),
    nullif(pg_catalog.btrim(coalesce(p_evidence_summary, '')), ''),
    v_now
  );

  RETURN QUERY
  SELECT o.id, o.verification_status, o.verified_at, o.reviewed_at,
         o.reviewed_by, o.rejection_reason, o.correction_reason, o.updated_at
  FROM public.emergency_organizations AS o
  WHERE o.id = p_organization_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_review_emergency_service(
  p_actor_user_id uuid,
  p_service_id uuid,
  p_decision text,
  p_reason text
)
RETURNS TABLE (
  result_service_id uuid,
  result_organization_id uuid,
  result_review_status text,
  result_is_active boolean,
  result_reviewed_at timestamptz,
  result_reviewed_by uuid,
  result_rejection_reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_organization_id uuid;
  v_org_status text;
  v_old_status text;
  v_target_status text;
  v_action text;
  v_now timestamptz := pg_catalog.statement_timestamp();
BEGIN
  IF p_actor_user_id IS NULL OR p_service_id IS NULL THEN
    RAISE EXCEPTION 'IDENTIFIER_REQUIRED' USING ERRCODE = '22004';
  END IF;

  PERFORM 1 FROM public.users AS u
  WHERE u.id = p_actor_user_id
    AND u.role::text = 'ADMIN'
    AND NOT coalesce(u.is_banned, false)
    AND NOT (
      coalesce(u.is_suspended, false)
      AND (u.suspended_until IS NULL OR u.suspended_until > pg_catalog.statement_timestamp())
    )
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT s.organization_id INTO v_organization_id
  FROM public.emergency_provider_services AS s
  WHERE s.id = p_service_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SERVICE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  SELECT o.verification_status INTO v_org_status
  FROM public.emergency_organizations AS o
  WHERE o.id = v_organization_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORGANIZATION_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;
  IF v_org_status <> 'VERIFIED' THEN
    RAISE EXCEPTION 'ORGANIZATION_NOT_VERIFIED' USING ERRCODE = '55000';
  END IF;

  SELECT s.review_status INTO v_old_status
  FROM public.emergency_provider_services AS s
  WHERE s.id = p_service_id AND s.organization_id = v_organization_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SERVICE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;
  IF v_old_status <> 'PENDING' THEN
    RAISE EXCEPTION 'SERVICE_NOT_PENDING_REVIEW' USING ERRCODE = '55000';
  END IF;

  p_decision := pg_catalog.upper(pg_catalog.btrim(coalesce(p_decision, '')));
  IF p_decision NOT IN ('APPROVED', 'REJECTED') THEN
    RAISE EXCEPTION 'INVALID_SERVICE_DECISION' USING ERRCODE = '22023';
  END IF;
  IF p_decision = 'REJECTED'
    AND nullif(pg_catalog.btrim(coalesce(p_reason, '')), '') IS NULL
  THEN
    RAISE EXCEPTION 'REJECTION_REASON_REQUIRED' USING ERRCODE = '22023';
  END IF;

  v_target_status := p_decision;
  v_action := CASE WHEN p_decision = 'APPROVED' THEN 'SERVICE_APPROVED' ELSE 'SERVICE_REJECTED' END;

  UPDATE public.emergency_provider_services AS s
  SET review_status = v_target_status,
      is_active = false,
      reviewed_by = p_actor_user_id,
      reviewed_at = v_now,
      rejection_reason = CASE WHEN v_target_status = 'REJECTED' THEN pg_catalog.btrim(p_reason) ELSE NULL END,
      updated_at = v_now
  WHERE s.id = p_service_id;

  INSERT INTO public.emergency_provider_review_events (
    organization_id, service_id, actor_user_id, action, from_status, to_status, reason, created_at
  )
  VALUES (
    v_organization_id, p_service_id, p_actor_user_id, v_action,
    v_old_status, v_target_status,
    nullif(pg_catalog.btrim(coalesce(p_reason, '')), ''), v_now
  );

  RETURN QUERY
  SELECT s.id, s.organization_id, s.review_status, s.is_active,
         s.reviewed_at, s.reviewed_by, s.rejection_reason
  FROM public.emergency_provider_services AS s
  WHERE s.id = p_service_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_emergency_service_active(
  p_actor_user_id uuid,
  p_service_id uuid,
  p_is_active boolean
)
RETURNS TABLE (
  result_service_id uuid,
  result_organization_id uuid,
  result_review_status text,
  result_is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_organization_id uuid;
  v_owner_id uuid;
  v_is_admin_managed boolean;
  v_org_status text;
  v_review_status text;
  v_old_active boolean;
  v_now timestamptz := pg_catalog.statement_timestamp();
  v_action text;
BEGIN
  IF p_actor_user_id IS NULL OR p_service_id IS NULL OR p_is_active IS NULL THEN
    RAISE EXCEPTION 'IDENTIFIER_REQUIRED' USING ERRCODE = '22004';
  END IF;
  PERFORM 1 FROM public.users AS u
  WHERE u.id = p_actor_user_id
    AND NOT coalesce(u.is_banned, false)
    AND NOT (coalesce(u.is_suspended, false)
      AND (u.suspended_until IS NULL OR u.suspended_until > v_now))
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ACCOUNT_UNAVAILABLE' USING ERRCODE = '42501';
  END IF;

  SELECT s.organization_id INTO v_organization_id
  FROM public.emergency_provider_services AS s
  WHERE s.id = p_service_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SERVICE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  SELECT o.created_by, o.is_admin_managed, o.verification_status
  INTO v_owner_id, v_is_admin_managed, v_org_status
  FROM public.emergency_organizations AS o
  WHERE o.id = v_organization_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORGANIZATION_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;
  IF v_owner_id IS DISTINCT FROM p_actor_user_id THEN
    IF NOT v_is_admin_managed THEN
      RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
    END IF;
    PERFORM 1 FROM public.users AS u
    WHERE u.id = p_actor_user_id AND u.role::text = 'ADMIN'
      AND NOT coalesce(u.is_banned, false)
      AND NOT (
        coalesce(u.is_suspended, false)
        AND (u.suspended_until IS NULL OR u.suspended_until > pg_catalog.statement_timestamp())
      )
    FOR SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
    END IF;
  END IF;

  SELECT s.review_status, s.is_active
  INTO v_review_status, v_old_active
  FROM public.emergency_provider_services AS s
  WHERE s.id = p_service_id AND s.organization_id = v_organization_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SERVICE_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  IF p_is_active AND (v_org_status <> 'VERIFIED' OR v_review_status <> 'APPROVED') THEN
    RAISE EXCEPTION 'SERVICE_NOT_ELIGIBLE_FOR_ACTIVATION' USING ERRCODE = '55000';
  END IF;

  IF v_old_active = p_is_active THEN
    RETURN QUERY
    SELECT s.id, s.organization_id, s.review_status, s.is_active
    FROM public.emergency_provider_services AS s
    WHERE s.id = p_service_id;
    RETURN;
  END IF;

  UPDATE public.emergency_provider_services AS s
  SET is_active = p_is_active,
      updated_at = v_now
  WHERE s.id = p_service_id;

  v_action := CASE WHEN p_is_active THEN 'SERVICE_ACTIVATED' ELSE 'SERVICE_DEACTIVATED' END;
  INSERT INTO public.emergency_provider_review_events (
    organization_id, service_id, actor_user_id, action, from_status, to_status, created_at
  )
  VALUES (
    v_organization_id, p_service_id, p_actor_user_id, v_action,
    CASE WHEN v_old_active THEN 'ACTIVE' ELSE 'INACTIVE' END,
    CASE WHEN p_is_active THEN 'ACTIVE' ELSE 'INACTIVE' END,
    v_now
  );

  RETURN QUERY
  SELECT s.id, s.organization_id, s.review_status, s.is_active
  FROM public.emergency_provider_services AS s
  WHERE s.id = p_service_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.register_emergency_organization_document(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_document_type text,
  p_storage_path text,
  p_original_file_name text,
  p_mime_type text,
  p_file_size_bytes bigint
)
RETURNS TABLE (
  result_document_id uuid,
  result_organization_id uuid,
  result_review_status text,
  result_created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_owner_id uuid;
  v_is_admin_managed boolean;
  v_org_status text;
  v_document_id uuid;
  v_doc_type text;
  v_now timestamptz := pg_catalog.statement_timestamp();
BEGIN
  PERFORM 1 FROM public.users AS u
  WHERE u.id = p_actor_user_id
    AND NOT coalesce(u.is_banned, false)
    AND NOT (coalesce(u.is_suspended, false)
      AND (u.suspended_until IS NULL OR u.suspended_until > v_now))
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ACCOUNT_UNAVAILABLE' USING ERRCODE = '42501';
  END IF;

  SELECT o.created_by, o.is_admin_managed, o.verification_status
  INTO v_owner_id, v_is_admin_managed, v_org_status
  FROM public.emergency_organizations AS o
  WHERE o.id = p_organization_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORGANIZATION_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;
  IF v_owner_id IS DISTINCT FROM p_actor_user_id THEN
    IF NOT v_is_admin_managed THEN
      RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
    END IF;
    PERFORM 1 FROM public.users AS u
    WHERE u.id = p_actor_user_id AND u.role::text = 'ADMIN'
      AND NOT coalesce(u.is_banned, false)
      AND NOT (
        coalesce(u.is_suspended, false)
        AND (u.suspended_until IS NULL OR u.suspended_until > pg_catalog.statement_timestamp())
      )
    FOR SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
    END IF;
  END IF;
  IF v_org_status = 'SUSPENDED' THEN
    RAISE EXCEPTION 'SUSPENDED_ORGANIZATION_CANNOT_UPLOAD_DOCUMENTS' USING ERRCODE = '55000';
  END IF;

  v_doc_type := pg_catalog.upper(pg_catalog.btrim(coalesce(p_document_type, '')));
  IF v_doc_type NOT IN (
    'LEGAL_REGISTRATION', 'AUTHORIZATION_LETTER', 'OPERATIONAL_LICENSE',
    'SUPPORTING_DOCUMENT', 'OTHER'
  ) THEN
    RAISE EXCEPTION 'INVALID_DOCUMENT_TYPE' USING ERRCODE = '22023';
  END IF;
  IF p_storage_path IS NULL OR p_storage_path !~ (
    '^' || p_organization_id::text || '/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\.(pdf|jpg|jpeg|png|webp)$'
  ) THEN
    RAISE EXCEPTION 'INVALID_DOCUMENT_STORAGE_PATH' USING ERRCODE = '22023';
  END IF;
  IF nullif(pg_catalog.btrim(coalesce(p_original_file_name, '')), '') IS NULL
    OR pg_catalog.char_length(p_original_file_name) > 255
    OR p_original_file_name ~ '[[:cntrl:]]'
  THEN
    RAISE EXCEPTION 'INVALID_DOCUMENT_FILE_NAME' USING ERRCODE = '22023';
  END IF;
  IF p_mime_type NOT IN ('application/pdf', 'image/jpeg', 'image/png', 'image/webp') THEN
    RAISE EXCEPTION 'INVALID_DOCUMENT_MIME_TYPE' USING ERRCODE = '22023';
  END IF;
  IF (p_mime_type = 'application/pdf' AND pg_catalog.lower(p_storage_path) !~ '\.pdf$')
    OR (p_mime_type = 'image/jpeg' AND pg_catalog.lower(p_storage_path) !~ '\.(jpg|jpeg)$')
    OR (p_mime_type = 'image/png' AND pg_catalog.lower(p_storage_path) !~ '\.png$')
    OR (p_mime_type = 'image/webp' AND pg_catalog.lower(p_storage_path) !~ '\.webp$')
  THEN
    RAISE EXCEPTION 'DOCUMENT_EXTENSION_MIME_MISMATCH' USING ERRCODE = '22023';
  END IF;
  IF p_file_size_bytes IS NULL OR p_file_size_bytes < 1 OR p_file_size_bytes > 10485760 THEN
    RAISE EXCEPTION 'INVALID_DOCUMENT_FILE_SIZE' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM storage.objects AS so
    WHERE so.bucket_id = 'emergency-provider-documents'
      AND so.name = p_storage_path
  ) THEN
    RAISE EXCEPTION 'DOCUMENT_STORAGE_OBJECT_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.emergency_organization_documents (
    organization_id, uploaded_by, document_type, storage_path,
    original_file_name, mime_type, file_size_bytes, review_status, created_at
  )
  VALUES (
    p_organization_id, p_actor_user_id, v_doc_type, p_storage_path,
    pg_catalog.btrim(p_original_file_name), p_mime_type, p_file_size_bytes, 'PENDING', v_now
  )
  RETURNING id INTO v_document_id;

  INSERT INTO public.emergency_provider_review_events (
    organization_id, document_id, actor_user_id, action, from_status, to_status, created_at
  )
  VALUES (
    p_organization_id, v_document_id, p_actor_user_id,
    'DOCUMENT_UPLOADED', NULL, 'PENDING', v_now
  );

  RETURN QUERY SELECT v_document_id, p_organization_id, 'PENDING'::text, v_now;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_review_emergency_document(
  p_actor_user_id uuid,
  p_document_id uuid,
  p_decision text,
  p_reason text
)
RETURNS TABLE (
  result_document_id uuid,
  result_organization_id uuid,
  result_review_status text,
  result_reviewed_at timestamptz,
  result_reviewed_by uuid,
  result_rejection_reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_organization_id uuid;
  v_old_status text;
  v_target_status text;
  v_action text;
  v_now timestamptz := pg_catalog.statement_timestamp();
BEGIN
  IF p_actor_user_id IS NULL OR p_document_id IS NULL THEN
    RAISE EXCEPTION 'IDENTIFIER_REQUIRED' USING ERRCODE = '22004';
  END IF;

  PERFORM 1 FROM public.users AS u
  WHERE u.id = p_actor_user_id
    AND u.role::text = 'ADMIN'
    AND NOT coalesce(u.is_banned, false)
    AND NOT (
      coalesce(u.is_suspended, false)
      AND (u.suspended_until IS NULL OR u.suspended_until > pg_catalog.statement_timestamp())
    )
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  SELECT d.organization_id INTO v_organization_id
  FROM public.emergency_organization_documents AS d
  WHERE d.id = p_document_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'DOCUMENT_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  PERFORM 1 FROM public.emergency_organizations AS o
  WHERE o.id = v_organization_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORGANIZATION_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  SELECT d.review_status INTO v_old_status
  FROM public.emergency_organization_documents AS d
  WHERE d.id = p_document_id AND d.organization_id = v_organization_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'DOCUMENT_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;
  IF v_old_status <> 'PENDING' THEN
    RAISE EXCEPTION 'DOCUMENT_NOT_PENDING_REVIEW' USING ERRCODE = '55000';
  END IF;

  p_decision := pg_catalog.upper(pg_catalog.btrim(coalesce(p_decision, '')));
  IF p_decision NOT IN ('ACCEPTED', 'REJECTED') THEN
    RAISE EXCEPTION 'INVALID_DOCUMENT_DECISION' USING ERRCODE = '22023';
  END IF;
  IF p_decision = 'REJECTED'
    AND nullif(pg_catalog.btrim(coalesce(p_reason, '')), '') IS NULL
  THEN
    RAISE EXCEPTION 'REJECTION_REASON_REQUIRED' USING ERRCODE = '22023';
  END IF;

  v_target_status := p_decision;
  v_action := CASE WHEN p_decision = 'ACCEPTED' THEN 'DOCUMENT_ACCEPTED' ELSE 'DOCUMENT_REJECTED' END;

  UPDATE public.emergency_organization_documents AS d
  SET review_status = v_target_status,
      reviewed_by = p_actor_user_id,
      reviewed_at = v_now,
      rejection_reason = CASE WHEN v_target_status = 'REJECTED' THEN pg_catalog.btrim(p_reason) ELSE NULL END
  WHERE d.id = p_document_id;

  INSERT INTO public.emergency_provider_review_events (
    organization_id, document_id, actor_user_id, action, from_status, to_status, reason, created_at
  )
  VALUES (
    v_organization_id, p_document_id, p_actor_user_id, v_action,
    v_old_status, v_target_status,
    nullif(pg_catalog.btrim(coalesce(p_reason, '')), ''), v_now
  );

  RETURN QUERY
  SELECT d.id, d.organization_id, d.review_status, d.reviewed_at,
         d.reviewed_by, d.rejection_reason
  FROM public.emergency_organization_documents AS d
  WHERE d.id = p_document_id;
END;
$function$;

-- Restrict all provider/admin mutations to the server-only service-role boundary.
REVOKE ALL ON FUNCTION public.submit_emergency_organization(
  uuid, text, text, text, text, text, text, text, text, text, text, text, text, text,
  numeric, numeric, boolean, text, text, text, text, text, text, text, text
) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_emergency_organization(
  uuid, text, text, text, text, text, text, text, text, text, text, text, text, text,
  numeric, numeric, boolean, text, text, text, text, text, text, text, text
) TO service_role;

REVOKE ALL ON FUNCTION public.update_emergency_organization_profile(
  uuid, uuid, text, text, text, text, text, text, text, text, text, text, text, text, text,
  numeric, numeric, boolean
) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_emergency_organization_profile(
  uuid, uuid, text, text, text, text, text, text, text, text, text, text, text, text, text,
  numeric, numeric, boolean
) TO service_role;

REVOKE ALL ON FUNCTION public.create_emergency_provider_service(
  uuid, uuid, text, text, text, text, text, text, text, text
) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_emergency_provider_service(
  uuid, uuid, text, text, text, text, text, text, text, text
) TO service_role;

REVOKE ALL ON FUNCTION public.update_emergency_provider_service(
  uuid, uuid, text, text, text, text, text, text, text, text
) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_emergency_provider_service(
  uuid, uuid, text, text, text, text, text, text, text, text
) TO service_role;

REVOKE ALL ON FUNCTION public.admin_create_emergency_organization(
  uuid,
  text, text, text, text, text, text, text, text, text, text, text, text, text,
  numeric, numeric, boolean,
  text, text, text, text, text, text, text, text,
  text, text, text, text, text, text, text
) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_create_emergency_organization(
  uuid,
  text, text, text, text, text, text, text, text, text, text, text, text, text,
  numeric, numeric, boolean,
  text, text, text, text, text, text, text, text,
  text, text, text, text, text, text, text
) TO service_role;

REVOKE ALL ON FUNCTION public.admin_review_emergency_organization(
  uuid, uuid, text, text, text, text, text, text, text, text, text
) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_review_emergency_organization(
  uuid, uuid, text, text, text, text, text, text, text, text, text
) TO service_role;

REVOKE ALL ON FUNCTION public.admin_review_emergency_service(
  uuid, uuid, text, text
) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_review_emergency_service(
  uuid, uuid, text, text
) TO service_role;

REVOKE ALL ON FUNCTION public.set_emergency_service_active(
  uuid, uuid, boolean
) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_emergency_service_active(
  uuid, uuid, boolean
) TO service_role;

REVOKE ALL ON FUNCTION public.register_emergency_organization_document(
  uuid, uuid, text, text, text, text, bigint
) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.register_emergency_organization_document(
  uuid, uuid, text, text, text, text, bigint
) TO service_role;

REVOKE ALL ON FUNCTION public.admin_review_emergency_document(
  uuid, uuid, text, text
) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_review_emergency_document(
  uuid, uuid, text, text
) TO service_role;


CREATE OR REPLACE FUNCTION public.get_public_emergency_directory(
  p_city text DEFAULT 'Surabaya',
  p_category text DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_latitude double precision DEFAULT NULL,
  p_longitude double precision DEFAULT NULL,
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  organization_id uuid,
  organization_name text,
  organization_type text,
  description text,
  public_phone text,
  public_whatsapp text,
  website_url text,
  public_address text,
  district text,
  city text,
  province text,
  coverage_description text,
  latitude numeric,
  longitude numeric,
  verified_at timestamptz,
  service_id uuid,
  service_name text,
  service_category text,
  service_description text,
  service_phone text,
  service_whatsapp text,
  service_area text,
  cost_type text,
  operating_hours text,
  distance_meters double precision,
  verified_source_label text,
  verified_source_url text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF p_city IS NOT NULL AND char_length(p_city) > 100 THEN
    RAISE EXCEPTION 'CITY_FILTER_TOO_LONG' USING ERRCODE = '22023';
  END IF;

  IF p_category IS NOT NULL AND char_length(p_category) > 40 THEN
    RAISE EXCEPTION 'CATEGORY_FILTER_TOO_LONG' USING ERRCODE = '22023';
  END IF;

  IF p_search IS NOT NULL AND char_length(p_search) > 100 THEN
    RAISE EXCEPTION 'SEARCH_TOO_LONG' USING ERRCODE = '22023';
  END IF;

  IF (p_latitude IS NULL) <> (p_longitude IS NULL) THEN
    RAISE EXCEPTION 'COORDINATE_PAIR_REQUIRED' USING ERRCODE = '22023';
  END IF;

  IF p_latitude IS NOT NULL AND (
    p_latitude < -90 OR p_latitude > 90
    OR p_longitude < -180 OR p_longitude > 180
  ) THEN
    RAISE EXCEPTION 'COORDINATES_OUT_OF_RANGE' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT
    result.organization_id,
    result.organization_name,
    result.organization_type,
    result.description,
    result.public_phone,
    result.public_whatsapp,
    result.website_url,
    result.public_address,
    result.district,
    result.city,
    result.province,
    result.coverage_description,
    result.latitude,
    result.longitude,
    result.verified_at,
    result.service_id,
    result.service_name,
    result.service_category,
    result.service_description,
    result.service_phone,
    result.service_whatsapp,
    result.service_area,
    result.cost_type,
    result.operating_hours,
    result.distance_meters,
    result.verified_source_label,
    result.verified_source_url
  FROM (
    SELECT
      o.id AS organization_id,
      o.organization_name,
      o.organization_type,
      o.description,
      o.official_phone AS public_phone,
      o.official_whatsapp AS public_whatsapp,
      o.website_url,
      o.public_address,
      o.district,
      o.city,
      o.province,
      o.coverage_description,
      CASE WHEN o.coordinates_public THEN o.latitude ELSE NULL END AS latitude,
      CASE WHEN o.coordinates_public THEN o.longitude ELSE NULL END AS longitude,
      o.verified_at,
      o.verified_source_label,
      o.verified_source_url,
      s.id AS service_id,
      s.name AS service_name,
      s.category AS service_category,
      s.description AS service_description,
      coalesce(
        nullif(btrim(s.public_phone), ''),
        nullif(btrim(o.official_phone), '')
      ) AS service_phone,
      coalesce(
        nullif(btrim(s.public_whatsapp), ''),
        nullif(btrim(o.official_whatsapp), '')
      ) AS service_whatsapp,
      s.service_area,
      s.cost_type,
      s.operating_hours,
      CASE
        WHEN o.coordinates_public
          AND p_latitude IS NOT NULL
          AND o.latitude IS NOT NULL
          AND o.longitude IS NOT NULL
        THEN
          6371000.0::double precision * acos(
            greatest(
              -1.0::double precision,
              least(
                1.0::double precision,
                cos(radians(p_latitude))
                * cos(radians(o.latitude::double precision))
                * cos(radians(o.longitude::double precision - p_longitude))
                + sin(radians(p_latitude))
                * sin(radians(o.latitude::double precision))
              )
            )
          )
        ELSE NULL::double precision
      END AS distance_meters
    FROM public.emergency_organizations AS o
    LEFT JOIN public.users AS u
      ON u.id = o.created_by
    JOIN public.emergency_provider_services AS s
      ON s.organization_id = o.id
    WHERE o.verification_status = 'VERIFIED'
      AND s.review_status = 'APPROVED'
      AND s.is_active = true
      AND (
        o.is_admin_managed = true
        OR (
          u.id IS NOT NULL
          AND NOT coalesce(u.is_banned, false)
          AND NOT (
            coalesce(u.is_suspended, false)
            AND (u.suspended_until IS NULL OR u.suspended_until > statement_timestamp())
          )
        )
      )
      AND (
        nullif(btrim(p_city), '') IS NULL
        OR lower(o.city) = lower(btrim(p_city))
      )
      AND (
        nullif(btrim(p_category), '') IS NULL
        OR s.category = upper(btrim(p_category))
      )
      AND (
        nullif(btrim(p_search), '') IS NULL
        OR concat_ws(
          ' ',
          o.organization_name,
          o.description,
          s.name,
          s.description,
          s.service_area,
          o.coverage_description
        ) ILIKE ('%' || btrim(p_search) || '%')
      )
  ) AS result
  ORDER BY
    result.distance_meters NULLS LAST,
    result.organization_name,
    result.service_name
  LIMIT greatest(1, least(coalesce(p_limit, 50), 100));
END;
$function$;

REVOKE ALL ON FUNCTION public.get_public_emergency_directory(
  text, text, text, double precision, double precision, integer
) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_public_emergency_directory(
  text, text, text, double precision, double precision, integer
) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.set_emergency_organization_media_path(
  uuid, uuid, text, text
) FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.set_emergency_organization_media_path(
  uuid, uuid, text, text
) TO service_role;

COMMIT;

-- END OF FORWARD-CANDIDATE BODY. Review only; not approved for execution.
