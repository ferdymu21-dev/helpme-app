BEGIN;

CREATE OR REPLACE FUNCTION public.join_emergency_help_request(
    p_request_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_actor uuid := auth.uid();
    v_requester uuid;
    v_status text;
    v_expires_at timestamptz;
    v_participant_id uuid;
    v_participant_status text;
BEGIN
    IF v_actor IS NULL OR p_request_id IS NULL THEN
        RAISE EXCEPTION 'Authentication and request identity are required.'
            USING ERRCODE = '42501';
    END IF;

    SELECT r.requester_id, r.status, r.expires_at
    INTO v_requester, v_status, v_expires_at
    FROM public.emergency_help_requests AS r
    WHERE r.id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Permintaan darurat tidak ditemukan.'
            USING ERRCODE = 'P0002';
    END IF;

    IF v_requester = v_actor THEN
        RAISE EXCEPTION 'Pemohon tidak dapat bergabung sebagai helper.'
            USING ERRCODE = '42501';
    END IF;

    IF v_status <> 'ACTIVE' OR v_expires_at <= clock_timestamp() THEN
        IF v_status = 'ACTIVE' AND v_expires_at <= clock_timestamp() THEN
            UPDATE public.emergency_help_requests
            SET status = 'EXPIRED',
                updated_at = clock_timestamp()
            WHERE id = p_request_id;
        END IF;
        RETURN NULL;
    END IF;

    SELECT p.id, p.status
    INTO v_participant_id, v_participant_status
    FROM public.emergency_help_participants AS p
    WHERE p.request_id = p_request_id
      AND p.helper_id = v_actor
    FOR UPDATE;

    IF FOUND THEN
        IF v_participant_status = 'WITHDRAWN' THEN
            UPDATE public.emergency_help_participants
            SET status = 'WILL_HELP',
                updated_at = clock_timestamp()
            WHERE id = v_participant_id;

            INSERT INTO public.notifications (
                user_id, title, message, type, category,
                is_read, redirect_url, emergency_help_request_id, dedupe_key
            )
            VALUES (
                v_requester,
                'Penolong bergabung kembali',
                'Seorang relawan kembali bersedia membantu. Buka grup bantuan untuk berkoordinasi.',
                'SIAGA_EMERGENCY_HELP_JOINED',
                'SYSTEM',
                false,
                '/siaga/emergency/' || p_request_id::text,
                p_request_id,
                'siaga-emergency-helper-rejoined:' ||
                    p_request_id::text || ':' ||
                    v_participant_id::text || ':' ||
                    gen_random_uuid()::text
            )
            ON CONFLICT DO NOTHING;
        END IF;

        RETURN v_participant_id;
    END IF;

    INSERT INTO public.emergency_help_participants (
        request_id, helper_id, status
    )
    VALUES (p_request_id, v_actor, 'WILL_HELP')
    RETURNING id INTO v_participant_id;

    INSERT INTO public.notifications (
        user_id, title, message, type, category,
        is_read, redirect_url, emergency_help_request_id, dedupe_key
    )
    VALUES (
        v_requester,
        'Relawan siap membantu',
        'Seorang relawan bergabung sebagai penolong. Buka grup bantuan untuk berkoordinasi.',
        'SIAGA_EMERGENCY_HELP_JOINED',
        'SYSTEM',
        false,
        '/siaga/emergency/' || p_request_id::text,
        p_request_id,
        'siaga-emergency-helper-joined:' ||
            p_request_id::text || ':' ||
            v_participant_id::text
    )
    ON CONFLICT DO NOTHING;

    RETURN v_participant_id;
END;
$function$;

COMMIT;