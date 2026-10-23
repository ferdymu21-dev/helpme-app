-- M40 - HelpMe Siaga security category and organization types
-- CANDIDATE ONLY: review before any database execution.
-- Function definitions are sourced from M38 and narrowly updated.

BEGIN;

ALTER TABLE public.emergency_organizations
  DROP CONSTRAINT IF EXISTS emergency_organizations_type_check;

ALTER TABLE public.emergency_organizations
  ADD CONSTRAINT emergency_organizations_type_check
  CHECK (organization_type IN (
    'AMBULANCE_PROVIDER',
    'HEALTHCARE_FACILITY',
    'DISASTER_RELIEF',
    'SEARCH_AND_RESCUE',
    'COMMUNITY_ORGANIZATION',
    'GOVERNMENT_AGENCY',
    'SOCIAL_ORGANIZATION',
    'FOUNDATION',
    'OTHER'));

ALTER TABLE public.emergency_provider_services
  DROP CONSTRAINT IF EXISTS emergency_provider_services_category_check;

ALTER TABLE public.emergency_provider_services
  ADD CONSTRAINT emergency_provider_services_category_check
  CHECK (category IN (
    'AMBULANCE',
    'MEDICAL',
    'FIRE_RESCUE',
    'DISASTER_RELIEF',
    'SEARCH_RESCUE',
    'COMMUNITY_SUPPORT',
    'SECURITY',
    'OTHER'));

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
    'AMBULANCE_PROVIDER',
    'HEALTHCARE_FACILITY',
    'DISASTER_RELIEF',
    'SEARCH_AND_RESCUE',
    'COMMUNITY_ORGANIZATION',
    'GOVERNMENT_AGENCY',
    'SOCIAL_ORGANIZATION',
    'FOUNDATION',
    'OTHER'
  ) THEN
    RAISE EXCEPTION 'INVALID_ORGANIZATION_TYPE' USING ERRCODE = '22023';
  END IF;

  v_category := pg_catalog.upper(pg_catalog.btrim(coalesce(p_service_category, '')));
  IF v_category NOT IN (
    'AMBULANCE',
    'MEDICAL',
    'FIRE_RESCUE',
    'DISASTER_RELIEF',
    'SEARCH_RESCUE',
    'COMMUNITY_SUPPORT',
    'SECURITY',
    'OTHER'
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
    'AMBULANCE_PROVIDER',
    'HEALTHCARE_FACILITY',
    'DISASTER_RELIEF',
    'SEARCH_AND_RESCUE',
    'COMMUNITY_ORGANIZATION',
    'GOVERNMENT_AGENCY',
    'SOCIAL_ORGANIZATION',
    'FOUNDATION',
    'OTHER'
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
    'AMBULANCE',
    'MEDICAL',
    'FIRE_RESCUE',
    'DISASTER_RELIEF',
    'SEARCH_RESCUE',
    'COMMUNITY_SUPPORT',
    'SECURITY',
    'OTHER'
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
    'AMBULANCE',
    'MEDICAL',
    'FIRE_RESCUE',
    'DISASTER_RELIEF',
    'SEARCH_RESCUE',
    'COMMUNITY_SUPPORT',
    'SECURITY',
    'OTHER'
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
    'AMBULANCE_PROVIDER',
    'HEALTHCARE_FACILITY',
    'DISASTER_RELIEF',
    'SEARCH_AND_RESCUE',
    'COMMUNITY_ORGANIZATION',
    'GOVERNMENT_AGENCY',
    'SOCIAL_ORGANIZATION',
    'FOUNDATION',
    'OTHER'
  ) THEN
    RAISE EXCEPTION 'INVALID_ORGANIZATION_TYPE' USING ERRCODE = '22023';
  END IF;

  v_category := pg_catalog.upper(pg_catalog.btrim(coalesce(p_service_category, '')));
  IF v_category NOT IN (
    'AMBULANCE',
    'MEDICAL',
    'FIRE_RESCUE',
    'DISASTER_RELIEF',
    'SEARCH_RESCUE',
    'COMMUNITY_SUPPORT',
    'SECURITY',
    'OTHER'
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

NOTIFY pgrst, 'reload schema';

COMMIT;
