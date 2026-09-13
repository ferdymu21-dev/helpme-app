begin;

-- =========================================================
-- M13: SERVICE REQUEST CHAT
-- =========================================================
--
-- Depends on:
--   M2  - conversations.service_request_id + XOR + participant FK
--   M11 - require_current_service_actor()
--
-- Task Chat keeps its existing browser path.
--
-- Service Chat uses trusted RPC operations:
--   1. ensure_service_request_conversation
--   2. send_service_request_message
--   3. mark_service_request_conversation_read
--
-- Browser never owns:
--   customer identity
--   provider identity
--   owner/helper identity
--   sender identity
--   unread recipient
--   Service Request lifecycle status
-- =========================================================


-- =========================================================
-- 1. REMOVE UNNECESSARY BROWSER TABLE PRIVILEGES
-- =========================================================

revoke truncate, trigger, references
on table public.conversations
from anon, authenticated;

revoke truncate, trigger, references
on table public.messages
from anon, authenticated;


-- =========================================================
-- 2. DIRECT MESSAGE INSERT REMAINS TASK-ONLY
-- =========================================================
--
-- Service messages must go through
-- send_service_request_message so message insert and
-- conversation metadata remain atomic.
--
-- Existing authenticated INSERT privilege is preserved
-- for legacy Task Chat.

drop policy if exists
  "Users can send messages"
on public.messages;


create policy
  "Users can send messages"
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()

  and exists (
    select
      1

    from public.conversations as c

    where
      c.id = messages.conversation_id

      and c.service_request_id is null

      and c.task_id is not null

      and (
        c.owner_id = auth.uid()
        or c.helper_id = auth.uid()
      )
  )
);


-- =========================================================
-- 3. ENSURE SERVICE REQUEST CONVERSATION
-- =========================================================
--
-- Existing conversation:
--   participant may retrieve it even after terminal state.
--
-- New conversation:
--   may only be created while Service Request Chat is active.
--
-- Identity:
--   owner_id  = Customer
--   helper_id = Provider
--
-- request row is locked to serialize first-time creation.

create function public.ensure_service_request_conversation(
  p_request_id uuid
)
returns uuid
language plpgsql
volatile
security definer
set search_path to ''
as $function$
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
$function$;


-- =========================================================
-- 4. SEND SERVICE REQUEST MESSAGE
-- =========================================================
--
-- Atomic operation:
--   validate participant
--   validate Request lifecycle
--   insert message
--   update conversation summary
--   increment recipient unread count
--
-- Service Request is locked first so a lifecycle transition
-- cannot race the message lifecycle check.

create function public.send_service_request_message(
  p_conversation_id uuid,
  p_content text
)
returns uuid
language plpgsql
volatile
security definer
set search_path to ''
as $function$
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
$function$;


-- =========================================================
-- 5. MARK SERVICE CONVERSATION READ
-- =========================================================
--
-- Terminal Service Request history may still be read.
-- Therefore this operation intentionally has no active-status
-- requirement.
--
-- Actor may clear only their own unread counter.

create function public.mark_service_request_conversation_read(
  p_conversation_id uuid
)
returns uuid
language plpgsql
volatile
security definer
set search_path to ''
as $function$
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
$function$;


-- =========================================================
-- 6. RPC EXECUTION ACL
-- =========================================================

revoke all
on function public.ensure_service_request_conversation(
  uuid
)
from public;

revoke all
on function public.ensure_service_request_conversation(
  uuid
)
from anon;

revoke all
on function public.ensure_service_request_conversation(
  uuid
)
from authenticated;

grant execute
on function public.ensure_service_request_conversation(
  uuid
)
to authenticated;

grant execute
on function public.ensure_service_request_conversation(
  uuid
)
to service_role;


revoke all
on function public.send_service_request_message(
  uuid,
  text
)
from public;

revoke all
on function public.send_service_request_message(
  uuid,
  text
)
from anon;

revoke all
on function public.send_service_request_message(
  uuid,
  text
)
from authenticated;

grant execute
on function public.send_service_request_message(
  uuid,
  text
)
to authenticated;

grant execute
on function public.send_service_request_message(
  uuid,
  text
)
to service_role;


revoke all
on function public.mark_service_request_conversation_read(
  uuid
)
from public;

revoke all
on function public.mark_service_request_conversation_read(
  uuid
)
from anon;

revoke all
on function public.mark_service_request_conversation_read(
  uuid
)
from authenticated;

grant execute
on function public.mark_service_request_conversation_read(
  uuid
)
to authenticated;

grant execute
on function public.mark_service_request_conversation_read(
  uuid
)
to service_role;

commit;
