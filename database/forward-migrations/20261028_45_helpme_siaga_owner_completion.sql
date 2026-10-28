-- HelpMe Siaga: reserve request completion/cancellation for the requester (owner).
-- Forward migration: do not edit already-applied migrations 41-44.

CREATE OR REPLACE FUNCTION public.set_emergency_help_participant_status(
    p_participant_id uuid,
    p_new_status text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_actor uuid := auth.uid();
    v_current_status text;
    v_request_id uuid;
    v_request_status text;
    v_request_expires_at timestamptz;
BEGIN
    IF v_actor IS NULL THEN
        RAISE EXCEPTION 'Authentication required.'
            USING ERRCODE = '42501';
    END IF;

    -- A helper may report progress or withdraw, but cannot decide that
    -- the request itself is resolved. Only the requester can close it.
    IF p_new_status NOT IN ('EN_ROUTE', 'ARRIVED', 'WITHDRAWN') THEN
        RAISE EXCEPTION 'Status helper tidak valid.'
            USING ERRCODE = '22023';
    END IF;
    SELECT p.request_id
    INTO v_request_id
    FROM public.emergency_help_participants AS p
    WHERE p.id = p_participant_id
      AND p.helper_id = v_actor;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Partisipasi helper tidak ditemukan.'
            USING ERRCODE = 'P0002';
    END IF;

    SELECT r.status, r.expires_at
    INTO v_request_status, v_request_expires_at
    FROM public.emergency_help_requests AS r
    WHERE r.id = v_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Permintaan darurat tidak ditemukan.'
            USING ERRCODE = 'P0002';
    END IF;

    SELECT p.status
    INTO v_current_status
    FROM public.emergency_help_participants AS p
    WHERE p.id = p_participant_id
      AND p.request_id = v_request_id
      AND p.helper_id = v_actor
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Partisipasi helper tidak ditemukan.'
            USING ERRCODE = 'P0002';
    END IF;

    IF v_request_status IS DISTINCT FROM 'ACTIVE'
       OR v_request_expires_at <= clock_timestamp() THEN
        RAISE EXCEPTION 'Permintaan ini sudah ditutup atau kedaluwarsa.'
            USING ERRCODE = '42501';
    END IF;

    IF p_new_status = v_current_status THEN
        RETURN v_current_status;
    END IF;

    IF NOT (
        (v_current_status = 'WILL_HELP'
            AND p_new_status IN ('EN_ROUTE', 'WITHDRAWN'))
        OR
        (v_current_status = 'EN_ROUTE'
            AND p_new_status IN ('ARRIVED', 'WITHDRAWN'))
        OR
        (v_current_status = 'ARRIVED'
            AND p_new_status = 'WITHDRAWN')
    ) THEN
        RAISE EXCEPTION 'Transisi status helper tidak diizinkan.'
            USING ERRCODE = '22023';
    END IF;

    UPDATE public.emergency_help_participants
    SET status = p_new_status,
        updated_at = clock_timestamp()
    WHERE id = p_participant_id;

    RETURN p_new_status;
END;
$function$;