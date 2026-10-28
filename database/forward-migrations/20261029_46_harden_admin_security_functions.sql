-- HelpMe admin security reconciliation (targeted forward migration)
-- Align only the two security functions with the audited staging definitions.
-- This deliberately does not rewrite Storage buckets or storage.objects policies.

BEGIN;

-- Active admin predicate: banned accounts must not retain admin privileges.
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.users AS u
    WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
      AND COALESCE(u.is_banned, false) = false
  );
$function$;

REVOKE ALL PRIVILEGES
ON FUNCTION public.is_current_user_admin()
FROM PUBLIC, anon;

GRANT EXECUTE
ON FUNCTION public.is_current_user_admin()
TO authenticated, service_role;

-- Protect profile, role, verification, and moderation fields from self-edit.
-- Active admins may moderate other users only through the allowlisted fields.
CREATE OR REPLACE FUNCTION public.guard_users_sensitive_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  caller_id uuid := auth.uid();
  caller_jwt_role text := auth.jwt() ->> 'role';
  caller_is_admin boolean := false;

  self_allowed_columns text[] := ARRAY[
    'full_name',
    'phone',
    'avatar_url',
    'username',
    'bio',
    'location',
    'updated_at',
    'verification_status'
  ];

  admin_allowed_columns text[] := ARRAY[
    'verification_status',
    'verified_at',
    'is_suspended',
    'suspended_until',
    'suspension_reason',
    'is_banned',
    'updated_at'
  ];

  admin_self_allowed_columns text[] := ARRAY[
    'full_name',
    'phone',
    'avatar_url',
    'username',
    'bio',
    'location',
    'updated_at'
  ];
BEGIN
  IF caller_id IS NULL THEN
    IF caller_jwt_role IN ('anon', 'authenticated') THEN
      RAISE EXCEPTION 'Authenticated user identity is required.'
        USING errcode = '42501';
    END IF;

    RETURN NEW;
  END IF;

  -- Determine admin status from persisted data, never from NEW.role.
  SELECT EXISTS (
    SELECT 1
    FROM public.users AS u
    WHERE u.id = caller_id
      AND u.role = 'ADMIN'
      AND COALESCE(u.is_banned, false) = false
  )
  INTO caller_is_admin;

  -- Admin self-service is restricted to ordinary profile fields.
  IF caller_is_admin AND OLD.id = caller_id THEN
    IF (to_jsonb(NEW) - admin_self_allowed_columns)
       IS DISTINCT FROM
       (to_jsonb(OLD) - admin_self_allowed_columns) THEN
      RAISE EXCEPTION
        'Authenticated admin cannot update protected user fields.'
        USING errcode = '42501';
    END IF;

    RETURN NEW;
  END IF;

  -- Active admins may moderate another user, not identity/profile/role fields.
  IF caller_is_admin THEN
    IF (to_jsonb(NEW) - admin_allowed_columns)
       IS DISTINCT FROM
       (to_jsonb(OLD) - admin_allowed_columns) THEN
      RAISE EXCEPTION
        'Admin update contains protected fields.'
        USING errcode = '42501';
    END IF;

    RETURN NEW;
  END IF;

  -- Normal or banned users may only update their own profile row.
  IF OLD.id IS DISTINCT FROM caller_id THEN
    RAISE EXCEPTION 'Users may only update their own profile.'
      USING errcode = '42501';
  END IF;

  IF (to_jsonb(NEW) - self_allowed_columns)
     IS DISTINCT FROM
     (to_jsonb(OLD) - self_allowed_columns) THEN
    RAISE EXCEPTION 'User update contains protected fields.'
      USING errcode = '42501';
  END IF;

  -- Self-service may request PENDING only when an actual pending request exists.
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    IF NEW.verification_status IS DISTINCT FROM 'PENDING'
       OR OLD.verification_status IS NULL
       OR OLD.verification_status NOT IN ('UNVERIFIED', 'REJECTED', 'PENDING') THEN
      RAISE EXCEPTION 'Users cannot set this verification status.'
        USING errcode = '42501';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.verification_requests AS vr
      WHERE vr.user_id = caller_id
        AND vr.status = 'PENDING'
    ) THEN
          RAISE EXCEPTION 'Pending verification request is required.'
        USING errcode = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- A trigger function does not need client EXECUTE grants to fire from a trigger.
REVOKE ALL PRIVILEGES
ON FUNCTION public.guard_users_sensitive_update()
FROM PUBLIC, anon, authenticated, service_role;

COMMIT;