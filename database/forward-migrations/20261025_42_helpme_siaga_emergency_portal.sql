BEGIN;

CREATE OR REPLACE FUNCTION public.get_my_emergency_help_portal()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_actor uuid := auth.uid();
    v_result jsonb := '[]'::jsonb;
BEGIN
    IF v_actor IS NULL THEN
        RAISE EXCEPTION 'Authentication required.'
            USING ERRCODE = '42501';
    END IF;

    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', activity.id,
                'category', activity.category,
                'title', activity.title,
                'status', activity.status,
                'role', activity.role,
                'created_at', activity.created_at,
                'expires_at', activity.expires_at,
                'helper_count', activity.helper_count
            )
            ORDER BY activity.created_at DESC
        ),
        '[]'::jsonb
    )
    INTO v_result
    FROM (
        SELECT
            r.id,
            r.category,
            r.title,
            r.status,
            r.created_at,
            r.expires_at,
            CASE
                WHEN r.requester_id = v_actor THEN 'OWNER'
                ELSE 'HELPER'
            END AS role,
            (
                SELECT count(*)::integer
                FROM public.emergency_help_participants AS p_count
                WHERE p_count.request_id = r.id
                  AND p_count.status <> 'WITHDRAWN'
            ) AS helper_count
        FROM public.emergency_help_requests AS r
        WHERE r.status = 'ACTIVE'
          AND r.expires_at > now()
          AND (
              r.requester_id = v_actor
              OR EXISTS (
                  SELECT 1
                  FROM public.emergency_help_participants AS p
                  WHERE p.request_id = r.id
                    AND p.helper_id = v_actor
                    AND p.status <> 'WITHDRAWN'
              )
          )
    ) AS activity;

    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$function$;

REVOKE ALL ON FUNCTION public.get_my_emergency_help_portal()
    FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_my_emergency_help_portal()
    TO authenticated;

COMMIT;
