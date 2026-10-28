BEGIN;

-- ============================================================
-- M41: HELPME SIAGA COMMUNITY EMERGENCY HELP
-- Local draft. Do not apply before review and testing.
-- ============================================================

CREATE TABLE public.emergency_help_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id uuid NOT NULL
        REFERENCES public.users(id) ON DELETE CASCADE,
    category text NOT NULL
        CHECK (category IN ('MEDICAL', 'ACCIDENT', 'SECURITY', 'OTHER')),
    title text NOT NULL
        CHECK (char_length(btrim(title)) BETWEEN 6 AND 120),
    description text NOT NULL
        CHECK (char_length(btrim(description)) BETWEEN 8 AND 1000),
    latitude numeric(9,6) NOT NULL
        CHECK (latitude BETWEEN -90 AND 90),
    longitude numeric(9,6) NOT NULL
        CHECK (longitude BETWEEN -180 AND 180),
    location_name text NOT NULL
        CHECK (char_length(btrim(location_name)) BETWEEN 2 AND 180),
    landmark text
        CHECK (landmark IS NULL OR char_length(btrim(landmark)) <= 200),
    location geography(Point,4326) NOT NULL,
    share_phone boolean NOT NULL DEFAULT false,
    contact_phone text,
    status text NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'RESOLVED', 'CANCELLED', 'EXPIRED', 'ADMIN_CLOSED')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '3 hours'),
    reminder_sent_for_expires_at timestamptz,
    CONSTRAINT emergency_help_phone_consent_check CHECK (
        (share_phone = false AND contact_phone IS NULL)
        OR
        (share_phone = true AND contact_phone IS NOT NULL AND btrim(contact_phone) <> '')
    ),
    CONSTRAINT emergency_help_id_requester_unique UNIQUE (id, requester_id)
);

CREATE TABLE public.emergency_help_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id uuid NOT NULL
        REFERENCES public.emergency_help_requests(id) ON DELETE CASCADE,
    helper_id uuid NOT NULL
        REFERENCES public.users(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'WILL_HELP'
        CHECK (status IN ('WILL_HELP', 'EN_ROUTE', 'ARRIVED', 'COMPLETED', 'WITHDRAWN')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT emergency_help_request_helper_unique UNIQUE (request_id, helper_id)
);

CREATE INDEX emergency_help_requests_location_gix
    ON public.emergency_help_requests USING GIST (location);

CREATE INDEX emergency_help_requests_active_expiry_idx
    ON public.emergency_help_requests (expires_at)
    WHERE status = 'ACTIVE';

CREATE INDEX emergency_help_requests_requester_idx
    ON public.emergency_help_requests (requester_id, created_at DESC);

CREATE INDEX emergency_help_participants_helper_idx
    ON public.emergency_help_participants (helper_id, updated_at DESC);

CREATE INDEX emergency_help_participants_request_status_idx
    ON public.emergency_help_participants (request_id, status);

-- Prevent multiple ACTIVE requests per requester. Expired deadlines
-- are also enforced by feed/join RPCs, even before the scheduler runs.
CREATE UNIQUE INDEX emergency_help_one_active_request_per_user_idx
    ON public.emergency_help_requests (requester_id)
    WHERE status = 'ACTIVE';

ALTER TABLE public.emergency_help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_help_participants ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.emergency_help_requests FROM anon, authenticated;
REVOKE ALL ON TABLE public.emergency_help_participants FROM anon, authenticated;
GRANT SELECT ON TABLE public.emergency_help_requests TO authenticated;
GRANT SELECT ON TABLE public.emergency_help_participants TO authenticated;

CREATE POLICY emergency_help_request_read_owner
    ON public.emergency_help_requests
    FOR SELECT TO authenticated
    USING (requester_id = auth.uid());

CREATE POLICY emergency_help_participant_read_self_or_owner
    ON public.emergency_help_participants
    FOR SELECT TO authenticated
    USING (
        helper_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM public.emergency_help_requests AS r
            WHERE r.id = request_id
              AND r.requester_id = auth.uid()
        )
    );

-- Dedicated group chat for each emergency-help cycle.
-- Existing Task and Service Request conversations remain unchanged.

CREATE TABLE public.emergency_help_chats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id uuid NOT NULL
        REFERENCES public.emergency_help_requests(id) ON DELETE CASCADE,
    cycle_number integer NOT NULL CHECK (cycle_number > 0),
    created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    last_message_at timestamptz,
    closed_at timestamptz,
    UNIQUE (request_id, cycle_number),
    UNIQUE (id, request_id)
);

CREATE UNIQUE INDEX emergency_help_chats_one_open_cycle_idx
    ON public.emergency_help_chats (request_id)
    WHERE closed_at IS NULL;

CREATE TABLE public.emergency_help_chat_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id uuid NOT NULL,
    request_id uuid NOT NULL
        REFERENCES public.emergency_help_requests(id) ON DELETE CASCADE,
    user_id uuid NOT NULL
        REFERENCES auth.users(id) ON DELETE CASCADE,
    member_role text NOT NULL
        CHECK (member_role IN ('REQUESTER', 'HELPER')),
    participant_id uuid
        REFERENCES public.emergency_help_participants(id) ON DELETE CASCADE,
    joined_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    left_at timestamptz,
    UNIQUE (chat_id, user_id),
    FOREIGN KEY (chat_id, request_id)
        REFERENCES public.emergency_help_chats(id, request_id)
        ON DELETE CASCADE,
    CHECK (
        (member_role = 'REQUESTER' AND participant_id IS NULL)
        OR
        (member_role = 'HELPER' AND participant_id IS NOT NULL)
    )
);

CREATE INDEX emergency_help_chat_members_user_active_idx
    ON public.emergency_help_chat_members (user_id, chat_id)
    WHERE left_at IS NULL;

CREATE TABLE public.emergency_help_chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id uuid NOT NULL
        REFERENCES public.emergency_help_chats(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL
        REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL
        CHECK (char_length(btrim(content)) BETWEEN 1 AND 2000),
    created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX emergency_help_chat_messages_chat_time_idx
    ON public.emergency_help_chat_messages (chat_id, created_at DESC);

-- Chat tables are accessed through the protected RPCs below, not direct client writes.
ALTER TABLE public.emergency_help_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_help_chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_help_chat_messages ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
    public.emergency_help_chats,
    public.emergency_help_chat_members,
    public.emergency_help_chat_messages
FROM PUBLIC, anon, authenticated;

-- Create one initial room for a new request and a fresh room after reactivation.
CREATE OR REPLACE FUNCTION public.sync_emergency_help_chat_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_chat_id uuid;
    v_cycle_number integer;
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'ACTIVE'
           AND NEW.expires_at > clock_timestamp() THEN
            INSERT INTO public.emergency_help_chats (
                request_id, cycle_number
            )
            VALUES (NEW.id, 1)
            RETURNING id INTO v_chat_id;

            INSERT INTO public.emergency_help_chat_members (
                chat_id, request_id, user_id, member_role, participant_id
            )
            VALUES (
                v_chat_id, NEW.id, NEW.requester_id, 'REQUESTER', NULL
            )
            ON CONFLICT (chat_id, user_id) DO NOTHING;
        END IF;

        RETURN NEW;
    END IF;

    -- Close the room when the request is resolved, cancelled, closed,
    -- or its expiry timestamp has passed.
    IF NEW.status IS DISTINCT FROM 'ACTIVE'
       OR NEW.expires_at <= clock_timestamp() THEN
        UPDATE public.emergency_help_chats
        SET closed_at = coalesce(closed_at, clock_timestamp())
        WHERE request_id = NEW.id
          AND closed_at IS NULL;

        RETURN NEW;
    END IF;

    -- A reactivated request starts a new chat cycle.
    IF (
        OLD.status IS DISTINCT FROM NEW.status
        OR OLD.expires_at IS DISTINCT FROM NEW.expires_at
    )
    AND NEW.status = 'ACTIVE'
    AND NEW.expires_at > clock_timestamp()
    AND (
        OLD.status IS DISTINCT FROM 'ACTIVE'
        OR OLD.expires_at <= clock_timestamp()
    ) THEN
        UPDATE public.emergency_help_chats
        SET closed_at = coalesce(closed_at, clock_timestamp())
        WHERE request_id = NEW.id
          AND closed_at IS NULL;

        SELECT coalesce(max(cycle_number), 0) + 1
        INTO v_cycle_number
        FROM public.emergency_help_chats
        WHERE request_id = NEW.id;

        INSERT INTO public.emergency_help_chats (
            request_id, cycle_number
        )
        VALUES (NEW.id, v_cycle_number)
        RETURNING id INTO v_chat_id;

        INSERT INTO public.emergency_help_chat_members (
            chat_id, request_id, user_id, member_role, participant_id
        )
        VALUES (
            v_chat_id, NEW.id, NEW.requester_id, 'REQUESTER', NULL
        )
        ON CONFLICT (chat_id, user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$function$;

CREATE TRIGGER emergency_help_chat_request_sync_insert
    AFTER INSERT ON public.emergency_help_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_emergency_help_chat_request();

CREATE TRIGGER emergency_help_chat_request_sync_update
    AFTER UPDATE ON public.emergency_help_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_emergency_help_chat_request();

-- Joining grants access to the current room; withdrawing revokes it.
CREATE OR REPLACE FUNCTION public.sync_emergency_help_chat_participant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_chat_id uuid;
BEGIN
    IF NEW.status = 'WITHDRAWN' THEN
        UPDATE public.emergency_help_chat_members
        SET left_at = coalesce(left_at, clock_timestamp())
        WHERE participant_id = NEW.id
          AND request_id = NEW.request_id
          AND member_role = 'HELPER'
          AND left_at IS NULL;

        RETURN NEW;
    END IF;

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

    IF v_chat_id IS NULL THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.emergency_help_chat_members (
        chat_id, request_id, user_id, member_role, participant_id,
        joined_at, left_at
    )
    VALUES (
        v_chat_id, NEW.request_id, NEW.helper_id, 'HELPER', NEW.id,
        clock_timestamp(), NULL
    )
    ON CONFLICT (chat_id, user_id)
    DO UPDATE SET
        member_role = 'HELPER',
        participant_id = EXCLUDED.participant_id,
        joined_at = clock_timestamp(),
        left_at = NULL;

    RETURN NEW;
END;
$function$;

CREATE TRIGGER emergency_help_chat_participant_sync
    AFTER INSERT OR UPDATE ON public.emergency_help_participants
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_emergency_help_chat_participant();

-- Only the requester and current group members can read an active room.
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

CREATE OR REPLACE FUNCTION public.send_emergency_help_chat_message(
    p_request_id uuid,
    p_content text
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
    v_chat_id uuid;
    v_message_id uuid;
    v_content text := btrim(p_content);
BEGIN
    IF v_actor IS NULL OR p_request_id IS NULL THEN
        RAISE EXCEPTION 'Authentication and request identity are required.'
            USING ERRCODE = '42501';
    END IF;

    IF v_content IS NULL
       OR char_length(v_content) NOT BETWEEN 1 AND 2000 THEN
        RAISE EXCEPTION 'Pesan harus berisi 1–2000 karakter.'
            USING ERRCODE = '22023';
    END IF;

    SELECT r.requester_id
    INTO v_requester
    FROM public.emergency_help_requests AS r
    WHERE r.id = p_request_id
      AND r.status = 'ACTIVE'
      AND r.expires_at > clock_timestamp()
    FOR UPDATE;

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

    IF v_actor <> v_requester
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

    INSERT INTO public.emergency_help_chat_messages (
        chat_id, sender_id, content
    )
    VALUES (v_chat_id, v_actor, v_content)
    RETURNING id INTO v_message_id;

    UPDATE public.emergency_help_chats
    SET last_message_at = clock_timestamp()
    WHERE id = v_chat_id
      AND closed_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Grup chat telah ditutup.'
            USING ERRCODE = '42501';
    END IF;

    RETURN v_message_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.sync_emergency_help_chat_request()
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_emergency_help_chat_participant()
    FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.get_emergency_help_chat(uuid)
    FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_emergency_help_chat(uuid)
    TO authenticated;

REVOKE ALL ON FUNCTION public.send_emergency_help_chat_message(uuid, text)
    FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_emergency_help_chat_message(uuid, text)
    TO authenticated;
-- Extend notification context while retaining existing contexts.
ALTER TABLE public.notifications
    ADD COLUMN emergency_help_request_id uuid
    REFERENCES public.emergency_help_requests(id) ON DELETE SET NULL;

ALTER TABLE public.notifications
    DROP CONSTRAINT notifications_primary_context_check;

ALTER TABLE public.notifications
    ADD CONSTRAINT notifications_primary_context_check
    CHECK (
        (CASE WHEN task_id IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN service_listing_id IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN service_request_id IS NOT NULL THEN 1 ELSE 0 END)
        + (CASE WHEN emergency_help_request_id IS NOT NULL THEN 1 ELSE 0 END)
        <= 1
    );

-- Keep legacy browser-generated notifications out of emergency context.
DROP POLICY IF EXISTS "Users insert own notifications"
    ON public.notifications;

CREATE POLICY "Users insert own notifications"
    ON public.notifications
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND service_listing_id IS NULL
        AND service_request_id IS NULL
        AND emergency_help_request_id IS NULL
        AND dedupe_key IS NULL
    );

CREATE INDEX notifications_emergency_help_request_idx
    ON public.notifications (emergency_help_request_id)
    WHERE emergency_help_request_id IS NOT NULL;

-- ============================================================
-- CREATE REQUEST
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_emergency_help_request(
    p_category text,
    p_title text,
    p_description text,
    p_latitude double precision,
    p_longitude double precision,
    p_location_name text,
    p_landmark text DEFAULT NULL,
    p_share_phone boolean DEFAULT false,
    p_contact_phone text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_actor uuid := auth.uid();
    v_request_id uuid;
    v_share_phone boolean := coalesce(p_share_phone, false);
    v_phone text := nullif(btrim(p_contact_phone), '');
BEGIN
    IF v_actor IS NULL THEN
        RAISE EXCEPTION 'Authentication required.'
            USING ERRCODE = '42501';
    END IF;

    IF p_category IS NULL
       OR p_category NOT IN ('MEDICAL', 'ACCIDENT', 'SECURITY', 'OTHER') THEN
        RAISE EXCEPTION 'Kategori darurat tidak valid.'
            USING ERRCODE = '22023';
    END IF;

    IF p_title IS NULL OR char_length(btrim(p_title)) NOT BETWEEN 6 AND 120
       OR p_description IS NULL
       OR char_length(btrim(p_description)) NOT BETWEEN 8 AND 1000 THEN
        RAISE EXCEPTION 'Judul atau deskripsi tidak valid.'
            USING ERRCODE = '22023';
    END IF;

    IF p_latitude IS NULL OR p_longitude IS NULL
       OR p_latitude NOT BETWEEN -90 AND 90
       OR p_longitude NOT BETWEEN -180 AND 180 THEN
        RAISE EXCEPTION 'Koordinat lokasi tidak valid.'
            USING ERRCODE = '22023';
    END IF;

    IF p_location_name IS NULL
       OR char_length(btrim(p_location_name)) NOT BETWEEN 2 AND 180 THEN
        RAISE EXCEPTION 'Area lokasi wajib diisi.'
            USING ERRCODE = '22023';
    END IF;

    IF v_share_phone
       AND (v_phone IS NULL OR v_phone !~ '^[+0-9][0-9 +()\-]{6,22}$') THEN
        RAISE EXCEPTION 'Nomor telepon yang dibagikan tidak valid.'
            USING ERRCODE = '22023';
    END IF;

    -- Reconcile this user's stale ACTIVE request before the unique index check.
    UPDATE public.emergency_help_requests
    SET status = 'EXPIRED',
        updated_at = clock_timestamp()
    WHERE requester_id = v_actor
      AND status = 'ACTIVE'
      AND expires_at <= clock_timestamp();

    IF EXISTS (
        SELECT 1
        FROM public.emergency_help_requests AS r
        WHERE r.requester_id = v_actor
          AND r.status = 'ACTIVE'
          AND r.expires_at > clock_timestamp()
    ) THEN
        RAISE EXCEPTION 'Anda masih memiliki permintaan darurat aktif.'
            USING ERRCODE = '23505';
    END IF;

    INSERT INTO public.emergency_help_requests (
        requester_id, category, title, description,
        latitude, longitude, location_name, landmark, location,
        share_phone, contact_phone, status, expires_at
    )
    VALUES (
        v_actor,
        p_category,
        btrim(p_title),
        btrim(p_description),
        p_latitude::numeric,
        p_longitude::numeric,
        btrim(p_location_name),
        nullif(btrim(p_landmark), ''),
        public.st_setsrid(public.st_makepoint(p_longitude, p_latitude), 4326)::public.geography,
        v_share_phone,
        CASE WHEN v_share_phone THEN v_phone ELSE NULL END,
        'ACTIVE',
        clock_timestamp() + interval '3 hours'
    )
    RETURNING id INTO v_request_id;

    RETURN v_request_id;
END;
$function$;

-- ============================================================
-- JOIN REQUEST AS AN ADDITIONAL HELPER
-- ============================================================

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
                'Seorang warga kembali bersedia membantu. Buka grup bantuan untuk berkoordinasi.',
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

-- ============================================================
-- PARTICIPANT STATUS
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_emergency_help_participant_status(
    p_participant_id uuid,
    p_new_status text
)
RETURNS text
LANGUAGE plpgsql
VOLATILE
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

    IF p_new_status NOT IN ('EN_ROUTE', 'ARRIVED', 'COMPLETED', 'WITHDRAWN') THEN
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
            AND p_new_status IN ('EN_ROUTE', 'WITHDRAWN', 'COMPLETED'))
        OR
        (v_current_status = 'EN_ROUTE'
            AND p_new_status IN ('ARRIVED', 'WITHDRAWN', 'COMPLETED'))
        OR
        (v_current_status = 'ARRIVED'
            AND p_new_status IN ('WITHDRAWN', 'COMPLETED'))
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

-- ============================================================
-- EXTEND ACTIVE REQUEST FOR ANOTHER THREE HOURS
-- ============================================================

CREATE OR REPLACE FUNCTION public.extend_emergency_help_request(
    p_request_id uuid
)
RETURNS timestamptz
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_actor uuid := auth.uid();
    v_status text;
    v_expires_at timestamptz;
BEGIN
    IF v_actor IS NULL THEN
        RAISE EXCEPTION 'Authentication required.'
            USING ERRCODE = '42501';
    END IF;

    SELECT r.status, r.expires_at
    INTO v_status, v_expires_at
    FROM public.emergency_help_requests AS r
    WHERE r.id = p_request_id
      AND r.requester_id = v_actor
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Permintaan darurat tidak ditemukan.'
            USING ERRCODE = 'P0002';
    END IF;

    IF v_status <> 'ACTIVE' OR v_expires_at <= clock_timestamp() THEN
        RAISE EXCEPTION 'Permintaan sudah kedaluwarsa atau tidak aktif.'
            USING ERRCODE = '22023';
    END IF;

    UPDATE public.emergency_help_requests
    SET expires_at = clock_timestamp() + interval '3 hours',
        reminder_sent_for_expires_at = NULL,
        updated_at = clock_timestamp()
    WHERE id = p_request_id
    RETURNING expires_at INTO v_expires_at;

    RETURN v_expires_at;
END;
$function$;

-- ============================================================
-- REACTIVATE EXPIRED REQUEST AFTER RECONFIRMING ITS DETAILS/LOCATION
-- ============================================================

CREATE OR REPLACE FUNCTION public.reactivate_emergency_help_request(
    p_request_id uuid,
    p_category text,
    p_title text,
    p_description text,
    p_latitude double precision,
    p_longitude double precision,
    p_location_name text,
    p_landmark text DEFAULT NULL,
    p_share_phone boolean DEFAULT false,
    p_contact_phone text DEFAULT NULL
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
    v_share_phone boolean := coalesce(p_share_phone, false);
    v_phone text := nullif(btrim(p_contact_phone), '');
BEGIN
    IF v_actor IS NULL THEN
        RAISE EXCEPTION 'Authentication required.'
            USING ERRCODE = '42501';
    END IF;

    SELECT r.requester_id, r.status, r.expires_at
    INTO v_requester, v_status, v_expires_at
    FROM public.emergency_help_requests AS r
    WHERE r.id = p_request_id
    FOR UPDATE;

    IF NOT FOUND OR v_requester <> v_actor THEN
        RAISE EXCEPTION 'Permintaan darurat tidak ditemukan.'
            USING ERRCODE = 'P0002';
    END IF;

    IF v_status = 'ACTIVE' AND v_expires_at <= clock_timestamp() THEN
        UPDATE public.emergency_help_requests
        SET status = 'EXPIRED',
            updated_at = clock_timestamp()
        WHERE id = p_request_id;
        v_status := 'EXPIRED';
    END IF;

    IF v_status <> 'EXPIRED' THEN
        RAISE EXCEPTION 'Hanya permintaan kedaluwarsa yang dapat diaktifkan kembali.'
            USING ERRCODE = '22023';
    END IF;

    IF p_category IS NULL
       OR p_category NOT IN ('MEDICAL', 'ACCIDENT', 'SECURITY', 'OTHER')
       OR p_title IS NULL
       OR char_length(btrim(p_title)) NOT BETWEEN 6 AND 120
       OR p_description IS NULL
       OR char_length(btrim(p_description)) NOT BETWEEN 8 AND 1000
       OR p_latitude IS NULL
       OR p_latitude NOT BETWEEN -90 AND 90
       OR p_longitude IS NULL
       OR p_longitude NOT BETWEEN -180 AND 180
       OR p_location_name IS NULL
       OR char_length(btrim(p_location_name)) NOT BETWEEN 2 AND 180 THEN
        RAISE EXCEPTION 'Detail permintaan atau lokasi tidak valid.'
            USING ERRCODE = '22023';
    END IF;

    IF v_share_phone
       AND (v_phone IS NULL OR v_phone !~ '^[+0-9][0-9 +()\-]{6,22}$') THEN
        RAISE EXCEPTION 'Nomor telepon yang dibagikan tidak valid.'
            USING ERRCODE = '22023';
    END IF;

    UPDATE public.emergency_help_requests
    SET status = 'EXPIRED',
        updated_at = clock_timestamp()
    WHERE requester_id = v_actor
      AND id <> p_request_id
      AND status = 'ACTIVE'
      AND expires_at <= clock_timestamp();

    IF EXISTS (
        SELECT 1
        FROM public.emergency_help_requests AS r
        WHERE r.requester_id = v_actor
          AND r.id <> p_request_id
          AND r.status = 'ACTIVE'
          AND r.expires_at > clock_timestamp()
    ) THEN
        RAISE EXCEPTION 'Anda memiliki permintaan darurat aktif lainnya.'
            USING ERRCODE = '23505';
    END IF;

    -- Prior-cycle helpers must opt in again before seeing the new exact location.
    UPDATE public.emergency_help_participants
    SET status = 'WITHDRAWN',
        updated_at = clock_timestamp()
    WHERE request_id = p_request_id
      AND status <> 'WITHDRAWN';

    UPDATE public.emergency_help_requests
    SET category = p_category,
        title = btrim(p_title),
        description = btrim(p_description),
        latitude = p_latitude::numeric,
        longitude = p_longitude::numeric,
        location_name = btrim(p_location_name),
        landmark = nullif(btrim(p_landmark), ''),
        location = public.st_setsrid(public.st_makepoint(p_longitude, p_latitude), 4326)::public.geography,
        share_phone = v_share_phone,
        contact_phone = CASE WHEN v_share_phone THEN v_phone ELSE NULL END,
        status = 'ACTIVE',
        expires_at = clock_timestamp() + interval '3 hours',
        reminder_sent_for_expires_at = NULL,
        updated_at = clock_timestamp()
    WHERE id = p_request_id;

    RETURN p_request_id;
END;
$function$;

-- ============================================================
-- REQUESTER CLOSES REQUEST: RESOLVED OR CANCELLED
-- ============================================================

CREATE OR REPLACE FUNCTION public.close_emergency_help_request(
    p_request_id uuid,
    p_target_status text
)
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_actor uuid := auth.uid();
    v_cycle_number integer;
BEGIN
    IF v_actor IS NULL THEN
        RAISE EXCEPTION 'Authentication required.'
            USING ERRCODE = '42501';
    END IF;

    IF p_target_status NOT IN ('RESOLVED', 'CANCELLED') THEN
        RAISE EXCEPTION 'Status penutupan tidak valid.'
            USING ERRCODE = '22023';
    END IF;

    UPDATE public.emergency_help_requests
    SET status = p_target_status,
        updated_at = clock_timestamp()
    WHERE id = p_request_id
      AND requester_id = v_actor
      AND status = 'ACTIVE'
      AND expires_at > clock_timestamp();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Permintaan tidak ditemukan, tidak aktif, atau kedaluwarsa.'
            USING ERRCODE = 'P0002';
    END IF;

    SELECT max(c.cycle_number)
    INTO v_cycle_number
    FROM public.emergency_help_chats AS c
    WHERE c.request_id = p_request_id;

    INSERT INTO public.notifications (
        user_id, title, message, type, category,
        is_read, redirect_url, emergency_help_request_id, dedupe_key
    )
    SELECT
        p.helper_id,
        CASE
            WHEN p_target_status = 'CANCELLED'
                THEN 'Permintaan bantuan dibatalkan'
            ELSE 'Permintaan bantuan telah selesai'
        END,
        CASE
            WHEN p_target_status = 'CANCELLED'
                THEN 'Pemohon membatalkan permintaan ini. Grup bantuan telah ditutup.'
            ELSE 'Pemohon menandai permintaan sebagai selesai. Grup bantuan telah ditutup.'
        END,
        'SIAGA_EMERGENCY_HELP_CLOSED',
        'SYSTEM',
        false,
        '/siaga/emergency/' || p_request_id::text,
        p_request_id,
        'siaga-emergency-closed:' ||
            p_request_id::text || ':' ||
            coalesce(v_cycle_number, 1)::text || ':' ||
            p.helper_id::text
    FROM public.emergency_help_participants AS p
    WHERE p.request_id = p_request_id
      AND p.status IN ('WILL_HELP', 'EN_ROUTE', 'ARRIVED')
    ON CONFLICT DO NOTHING;

    RETURN p_target_status;
END;
$function$;

-- ============================================================
-- PRIVACY-SAFE DETAIL RPC
-- Exact coordinates/phone are available only to requester or
-- a non-withdrawn participant; they are never part of the feed RPC.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_emergency_help_detail(
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
    v_result jsonb;
    v_is_owner boolean := false;
    v_is_participant boolean := false;
BEGIN
    IF v_actor IS NULL THEN
        RAISE EXCEPTION 'Authentication required.'
            USING ERRCODE = '42501';
    END IF;

    -- Allow a signed-in nearby user to preview an active request,
    -- but reveal exact location and phone only to the owner/joined helper.
    SELECT
        r.requester_id = v_actor,
        EXISTS (
            SELECT 1
            FROM public.emergency_help_participants AS p
            WHERE p.request_id = r.id
              AND p.helper_id = v_actor
              AND p.status <> 'WITHDRAWN'
              AND r.status = 'ACTIVE'
              AND r.expires_at > now()
        )
    INTO v_is_owner, v_is_participant
    FROM public.emergency_help_requests AS r
    WHERE r.id = p_request_id
      AND (
          r.requester_id = v_actor
          OR EXISTS (
              SELECT 1
              FROM public.emergency_help_participants AS p
              WHERE p.request_id = r.id
                AND p.helper_id = v_actor
                AND p.status <> 'WITHDRAWN'
                AND r.status = 'ACTIVE'
                AND r.expires_at > now()
          )
          OR (
              r.status = 'ACTIVE'
              AND r.expires_at > now()
          )
      );

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Permintaan tidak ditemukan atau akses tidak diizinkan.'
            USING ERRCODE = '42501';
    END IF;

    SELECT jsonb_build_object(
        'id', r.id,
        'requester_id',
            CASE WHEN v_is_owner THEN r.requester_id ELSE NULL END,
        'category', r.category,
        'title', r.title,
        'description', r.description,
        'latitude',
            CASE
                WHEN v_is_owner OR v_is_participant THEN r.latitude
                ELSE NULL
            END,
        'longitude',
            CASE
                WHEN v_is_owner OR v_is_participant THEN r.longitude
                ELSE NULL
            END,
        'location_name',
            CASE
                WHEN v_is_owner OR v_is_participant THEN r.location_name
                ELSE 'Lokasi sekitar'
            END,
        'landmark',
            CASE
                WHEN v_is_owner OR v_is_participant THEN r.landmark
                ELSE NULL
            END,
        'share_phone',
            CASE
                WHEN v_is_owner OR v_is_participant THEN r.share_phone
                ELSE false
            END,
        'contact_phone',
            CASE
                WHEN r.share_phone
                 AND (v_is_owner OR v_is_participant)
                THEN r.contact_phone
                ELSE NULL
            END,
        'status',
            CASE
                WHEN r.status = 'ACTIVE' AND r.expires_at <= now()
                    THEN 'EXPIRED'
                ELSE r.status
            END,
        'created_at', r.created_at,
        'updated_at', r.updated_at,
        'expires_at', r.expires_at,
        'helper_count', (
            SELECT count(*)::integer
            FROM public.emergency_help_participants AS p
            WHERE p.request_id = r.id
              AND p.status IN ('WILL_HELP', 'EN_ROUTE', 'ARRIVED')
        ),
        'participants', coalesce((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', p.id,
                    'helper_id', p.helper_id,
                    'status', p.status,
                    'created_at', p.created_at,
                    'updated_at', p.updated_at
                )
                ORDER BY p.created_at
            )
            FROM public.emergency_help_participants AS p
            WHERE p.request_id = r.id
              AND (
                  v_is_owner
                  OR p.helper_id = v_actor
              )
        ), '[]'::jsonb)
    )
    INTO v_result
    FROM public.emergency_help_requests AS r
    WHERE r.id = p_request_id;

    RETURN v_result;
END;
$function$;

-- ============================================================
-- UNIFIED HOME TASK FEED
-- Regular tasks remain regular tasks. Emergency requests use
-- a distinct item_type and are ordered before regular tasks.
-- The 25-km limit and pagination are both applied in SQL.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_home_task_feed(
    p_latitude double precision,
    p_longitude double precision,
    p_page integer DEFAULT 1,
    p_page_size integer DEFAULT 10,
    p_category text DEFAULT NULL,
    p_search text DEFAULT NULL,
    p_urgent_only boolean DEFAULT false
)
RETURNS TABLE (
    id uuid,
    item_type text,
    emergency_help_request_id uuid,
    user_id uuid,
    title text,
    description text,
    category text,
    budget integer,
    status text,
    latitude numeric,
    longitude numeric,
    created_at timestamptz,
    address text,
    updated_at timestamptz,
    selected_helper_id uuid,
    location_type text,
    location_name text,
    manual_address text,
    owner_latitude numeric,
    owner_longitude numeric,
    scheduled_at timestamptz,
    is_urgent boolean,
    is_emergency boolean,
    completion_proof_photo text,
    completed_at timestamptz,
    confirmed_at timestamptz,
    distance_km double precision,
    distance_tier integer,
    helper_count integer,
    total_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
    WITH params AS (
        SELECT
            public.st_setsrid(
                public.st_makepoint(p_longitude, p_latitude),
                4326
            )::public.geography AS helper_location,
            greatest(coalesce(p_page, 1), 1) AS safe_page,
            least(greatest(coalesce(p_page_size, 10), 1), 50) AS safe_page_size,
            nullif(btrim(p_search), '') AS safe_search
        WHERE p_latitude IS NOT NULL
          AND p_latitude BETWEEN -90 AND 90
          AND p_longitude IS NOT NULL
          AND p_longitude BETWEEN -180 AND 180
    ),
    task_candidates AS (
        SELECT
            t.id,
            'TASK'::text AS item_type,
            NULL::uuid AS emergency_help_request_id,
            t.user_id,
            t.title,
            t.description,
            t.category,
            t.budget,
            t.status,
            t.latitude,
            t.longitude,
            t.created_at,
            t.address,
            t.updated_at,
            t.selected_helper_id,
            t.location_type,
            t.location_name,
            t.manual_address,
            t.owner_latitude,
            t.owner_longitude,
            t.scheduled_at,
            coalesce(t.is_urgent, false) AS is_urgent,
            false AS is_emergency,
            t.completion_proof_photo,
            t.completed_at,
            t.confirmed_at,
            public.st_distance(t.location, p.helper_location) / 1000.0 AS distance_km,
            CASE
                WHEN coalesce(t.is_urgent, false) THEN 0
                WHEN public.st_dwithin(t.location, p.helper_location, 10000) THEN 1
                ELSE 2
            END AS distance_tier,
            0::integer AS helper_count
        FROM public.tasks AS t
        CROSS JOIN params AS p
        WHERE t.status = 'OPEN'
          AND t.location IS NOT NULL
          AND public.st_dwithin(t.location, p.helper_location, 25000)
          AND (
              p_category IS NULL
              OR p_category = 'Semua'
              OR t.category = p_category
          )
          AND (
              NOT coalesce(p_urgent_only, false)
              OR coalesce(t.is_urgent, false)
          )
          AND (
              p.safe_search IS NULL
              OR concat_ws(
                  ' ', t.title, t.description, t.location_name, t.manual_address
              ) ILIKE ('%' || p.safe_search || '%')
          )
    ),
    emergency_candidates AS (
        SELECT
            r.id,
            'EMERGENCY_HELP'::text AS item_type,
            r.id AS emergency_help_request_id,
            r.requester_id AS user_id,
            r.title,
            r.description,
            r.category,
            0::integer AS budget,
            'ACTIVE'::text AS status,
            NULL::numeric AS latitude,
            NULL::numeric AS longitude,
            r.created_at,
            'Lokasi sekitar'::text AS address,
            r.updated_at,
            NULL::uuid AS selected_helper_id,
            'MANUAL'::text AS location_type,
            'Lokasi sekitar'::text,
            NULL::text AS manual_address,
            NULL::numeric AS owner_latitude,
            NULL::numeric AS owner_longitude,
            NULL::timestamptz AS scheduled_at,
            false AS is_urgent,
            true AS is_emergency,
            NULL::text AS completion_proof_photo,
            NULL::timestamptz AS completed_at,
            NULL::timestamptz AS confirmed_at,
            public.st_distance(r.location, p.helper_location) / 1000.0 AS distance_km,
            0::integer AS distance_tier,
            (
                SELECT count(*)::integer
                FROM public.emergency_help_participants AS hp
                WHERE hp.request_id = r.id
                  AND hp.status IN ('WILL_HELP', 'EN_ROUTE', 'ARRIVED')
            ) AS helper_count
        FROM public.emergency_help_requests AS r
        CROSS JOIN params AS p
        WHERE r.status = 'ACTIVE'
          AND r.expires_at > now()
          AND r.requester_id <> auth.uid()
          AND public.st_dwithin(r.location, p.helper_location, 25000)
        -- Emergency cards remain visible even when the user filters
        -- regular task category/search; they take precedence in this feed.
    ),
    combined AS (
        SELECT * FROM task_candidates
        UNION ALL
        SELECT * FROM emergency_candidates
    ),
    ranked AS (
        SELECT c.*, count(*) OVER () AS total_count
        FROM combined AS c
    )
    SELECT
        r.id,
        r.item_type,
        r.emergency_help_request_id,
        r.user_id,
        r.title,
        r.description,
        r.category,
        r.budget,
        r.status,
        r.latitude,
        r.longitude,
        r.created_at,
        r.address,
        r.updated_at,
        r.selected_helper_id,
        r.location_type,
        r.location_name,
        r.manual_address,
        r.owner_latitude,
        r.owner_longitude,
        r.scheduled_at,
        r.is_urgent,
        r.is_emergency,
        r.completion_proof_photo,
        r.completed_at,
        r.confirmed_at,
        r.distance_km,
        r.distance_tier,
        r.helper_count,
        r.total_count
    FROM ranked AS r
    ORDER BY
        CASE WHEN r.item_type = 'EMERGENCY_HELP' THEN 0 ELSE 1 END ASC,
        CASE
            WHEN r.item_type = 'EMERGENCY_HELP' THEN r.distance_km
            ELSE r.distance_tier::double precision
        END ASC,
        r.distance_km ASC,
        r.created_at DESC,
        r.id ASC
    LIMIT (SELECT safe_page_size FROM params)
    OFFSET (
        SELECT (safe_page - 1) * safe_page_size
        FROM params
    );
$function$;

-- ============================================================
-- PERIODIC LIFECYCLE WORKER
-- Reminder is due one hour before expires_at (three-hour initial
-- lifetime => approximately two hours after request creation).
-- This RPC must be called by a separately configured scheduler.
-- ============================================================

CREATE OR REPLACE FUNCTION public.run_emergency_help_lifecycle()
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_request record;
    v_reminded integer := 0;
    v_expired integer := 0;
BEGIN
    IF coalesce(auth.role(), '') <> 'service_role' THEN
        RAISE EXCEPTION 'Service role required.'
            USING ERRCODE = '42501';
    END IF;

    FOR v_request IN
        SELECT r.id, r.requester_id, r.expires_at
        FROM public.emergency_help_requests AS r
        WHERE r.status = 'ACTIVE'
          AND r.expires_at > clock_timestamp()
          AND r.expires_at <= clock_timestamp() + interval '1 hour'
          AND r.reminder_sent_for_expires_at IS DISTINCT FROM r.expires_at
        FOR UPDATE SKIP LOCKED
    LOOP
        INSERT INTO public.notifications (
            user_id, title, message, type, category,
            is_read, redirect_url, emergency_help_request_id, dedupe_key
        )
        VALUES (
            v_request.requester_id,
            'Masih membutuhkan bantuan?',
            'Permintaan bantuan darurat Anda akan kedaluwarsa dalam sekitar satu jam. Konfirmasikan kebutuhan bantuan untuk memperpanjangnya.',
            'SIAGA_EMERGENCY_HELP_CONFIRM',
            'SYSTEM',
            false,
            '/siaga/emergency/' || v_request.id::text,
            v_request.id,
            'siaga-emergency-reminder:' || v_request.id::text || ':' ||
                extract(epoch FROM v_request.expires_at)::bigint::text
        )
        ON CONFLICT DO NOTHING;

        UPDATE public.emergency_help_requests
        SET reminder_sent_for_expires_at = v_request.expires_at,
            updated_at = clock_timestamp()
        WHERE id = v_request.id
          AND expires_at = v_request.expires_at;

        v_reminded := v_reminded + 1;
    END LOOP;

    UPDATE public.emergency_help_requests
    SET status = 'EXPIRED',
        updated_at = clock_timestamp()
    WHERE status = 'ACTIVE'
      AND expires_at <= clock_timestamp();

    GET DIAGNOSTICS v_expired = ROW_COUNT;

    RETURN jsonb_build_object(
        'reminders_processed', v_reminded,
        'requests_expired', v_expired
    );
END;
$function$;

-- Remove default PUBLIC execution from privileged RPCs.
REVOKE ALL ON FUNCTION public.create_emergency_help_request(text, text, text, double precision, double precision, text, text, boolean, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.join_emergency_help_request(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_emergency_help_participant_status(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.extend_emergency_help_request(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reactivate_emergency_help_request(uuid, text, text, text, double precision, double precision, text, text, boolean, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.close_emergency_help_request(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_emergency_help_detail(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_home_task_feed(double precision, double precision, integer, integer, text, text, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.run_emergency_help_lifecycle() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_emergency_help_request(text, text, text, double precision, double precision, text, text, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_emergency_help_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_emergency_help_participant_status(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.extend_emergency_help_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reactivate_emergency_help_request(uuid, text, text, text, double precision, double precision, text, text, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.close_emergency_help_request(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_emergency_help_detail(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_home_task_feed(double precision, double precision, integer, integer, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.run_emergency_help_lifecycle() TO service_role;

DO $publication$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_catalog.pg_publication
        WHERE pubname = 'supabase_realtime'
    ) THEN
        RAISE EXCEPTION 'Publication supabase_realtime tidak ditemukan.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_catalog.pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'emergency_help_requests'
    ) THEN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_help_requests';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_catalog.pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'emergency_help_participants'
    ) THEN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_help_participants';
    END IF;
END;
$publication$;

COMMIT;
