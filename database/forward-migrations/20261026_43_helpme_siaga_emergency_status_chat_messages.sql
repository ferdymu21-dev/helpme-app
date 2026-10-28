BEGIN;

ALTER TABLE public.emergency_help_chat_messages
    ADD COLUMN IF NOT EXISTS message_type text NOT NULL DEFAULT 'USER'
    CHECK (message_type IN ('USER', 'SYSTEM'));

CREATE OR REPLACE FUNCTION public.get_emergency_help_chat(
    p_request_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_actor uuid := auth.uid();
    v_request record;
    v_chat_id uuid;
    v_members jsonb;
    v_messages jsonb;
BEGIN
    IF v_actor IS NULL OR p_request_id IS NULL THEN
        RAISE EXCEPTION 'Authentication and request identity are required.'
            USING ERRCODE = '42501';
    END IF;

    SELECT r.id, r.requester_id, r.title
    INTO v_request
    FROM public.emergency_help_requests AS r
    WHERE r.id = p_request_id
      AND r.status = 'ACTIVE'
      AND r.expires_at > clock_timestamp();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Chat tidak tersedia karena permintaan sudah ditutup atau kedaluwarsa.'
            USING ERRCODE = '42501';
    END IF;

    SELECT c.id
    INTO v_chat_id
    FROM public.emergency_help_chats AS c
    WHERE c.request_id = p_request_id
      AND c.closed_at IS NULL
    ORDER BY c.cycle_number DESC
    LIMIT 1;

    IF v_chat_id IS NULL THEN
        RAISE EXCEPTION 'Grup chat tidak tersedia.'
            USING ERRCODE = 'P0002';
    END IF;

    IF v_actor <> v_request.requester_id
       AND NOT EXISTS (
           SELECT 1
           FROM public.emergency_help_chat_members AS m
           WHERE m.chat_id = v_chat_id
             AND m.user_id = v_actor
             AND m.member_role = 'HELPER'
             AND m.left_at IS NULL
       ) THEN
        RAISE EXCEPTION 'Anda bukan anggota grup bantuan ini.'
            USING ERRCODE = '42501';
    END IF;

    SELECT coalesce(
        jsonb_agg(
            jsonb_build_object(
                'user_id', m.user_id,
                'member_role', m.member_role,
                'display_name', coalesce(nullif(u.full_name, ''), 'Anggota HelpMe'),
                'participant_status', p.status,
                'joined_at', m.joined_at
            )
            ORDER BY
                CASE WHEN m.member_role = 'REQUESTER' THEN 0 ELSE 1 END,
                m.joined_at
        ),
        '[]'::jsonb
    )
    INTO v_members
    FROM public.emergency_help_chat_members AS m
    LEFT JOIN public.emergency_help_participants AS p
      ON p.id = m.participant_id
    LEFT JOIN public.users AS u
      ON u.id = m.user_id
    WHERE m.chat_id = v_chat_id
      AND m.left_at IS NULL;

    SELECT coalesce(
        jsonb_agg(
            jsonb_build_object(
                'id', recent.id,
                'sender_id', recent.sender_id,
                'sender_name', recent.sender_name,
                'message_type', recent.message_type,
                'content', recent.content,
                'created_at', recent.created_at
            )
            ORDER BY recent.created_at
        ),
        '[]'::jsonb
    )
    INTO v_messages
    FROM (
        SELECT
            msg.id,
            msg.sender_id,
            coalesce(nullif(u.full_name, ''), 'Anggota HelpMe') AS sender_name,
            msg.message_type,
            msg.content,
            msg.created_at
        FROM public.emergency_help_chat_messages AS msg
        LEFT JOIN public.users AS u
          ON u.id = msg.sender_id
        WHERE msg.chat_id = v_chat_id
        ORDER BY msg.created_at DESC
        LIMIT 100
    ) AS recent;

    RETURN jsonb_build_object(
        'chat_id', v_chat_id,
        'request_id', v_request.id,
        'title', v_request.title,
        'members', v_members,
        'messages', v_messages
    );
END;
$function$;
CREATE OR REPLACE FUNCTION public.post_emergency_help_participant_status_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_chat_id uuid;
    v_helper_name text;
    v_message text;
BEGIN
    -- Participant creation announces that the helper is ready.
    IF TG_OP = 'INSERT' THEN
        IF NEW.status IS DISTINCT FROM 'WILL_HELP' THEN
            RETURN NEW;
        END IF;
    ELSE
        -- Ignore updates that do not change the participant status.
        IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
            RETURN NEW;
        END IF;
    END IF;

    v_helper_name := COALESCE(
        (
            SELECT NULLIF(BTRIM(u.full_name), '')
            FROM public.users AS u
            WHERE u.id = NEW.helper_id
        ),
        'Relawan HelpMe'
    );

    v_message := CASE NEW.status
        WHEN 'WILL_HELP'
            THEN v_helper_name || ' siap membantu.'
        WHEN 'EN_ROUTE'
            THEN v_helper_name || ' sedang dalam perjalanan menuju lokasi.'
        WHEN 'ARRIVED'
            THEN v_helper_name || ' sudah tiba di lokasi.'
        WHEN 'WITHDRAWN'
            THEN v_helper_name || ' mengundurkan diri dari permintaan bantuan.'
        WHEN 'COMPLETED'
            THEN v_helper_name || ' telah menyelesaikan bantuan.'
        ELSE NULL
    END;

    IF v_message IS NULL THEN
        RETURN NEW;
    END IF;

    -- Only publish into the current, open chat of a live request.
    SELECT c.id
    INTO v_chat_id
    FROM public.emergency_help_chats AS c
    JOIN public.emergency_help_requests AS r
      ON r.id = c.request_id
    WHERE c.request_id = NEW.request_id
      AND c.closed_at IS NULL
      AND r.status = 'ACTIVE'
      AND r.expires_at > clock_timestamp()
    ORDER BY c.cycle_number DESC
    LIMIT 1;

    -- Preserve participant status updates if no active chat exists.
    IF v_chat_id IS NULL THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.emergency_help_chat_messages (
        chat_id,
        sender_id,
        message_type,
        content
    )
    VALUES (
        v_chat_id,
        NEW.helper_id,
        'SYSTEM',
        v_message
    );

    UPDATE public.emergency_help_chats
    SET last_message_at = clock_timestamp()
    WHERE id = v_chat_id
      AND closed_at IS NULL;

    RETURN NEW;
END;
$function$;

REVOKE ALL
    ON FUNCTION public.post_emergency_help_participant_status_message()
    FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS emergency_help_chat_status_message
    ON public.emergency_help_participants;

CREATE TRIGGER emergency_help_chat_status_message
    AFTER INSERT OR UPDATE
    ON public.emergency_help_participants
    FOR EACH ROW
    EXECUTE FUNCTION public.post_emergency_help_participant_status_message();

COMMIT;