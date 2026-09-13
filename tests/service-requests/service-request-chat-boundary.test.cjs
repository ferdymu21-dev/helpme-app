const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "../..");

const m2Source = fs.readFileSync(
  path.join(
    root,
    "database/forward-migrations/20260909_02_service_shared_extensions.sql",
  ),
  "utf8",
);

const m13Source = fs.readFileSync(
  path.join(
    root,
    "database/forward-migrations/20260913_13_service_request_chat.sql",
  ),
  "utf8",
);

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}

function extractFunction(functionName) {
  const start = m13Source.indexOf(`create function public.${functionName}(`);

  assert.ok(start >= 0, `SQL function not found: ${functionName}`);

  const end = m13Source.indexOf("$function$;", start);

  assert.ok(end >= 0, `SQL function end not found: ${functionName}`);

  return m13Source.slice(start, end + "$function$;".length);
}

test("M13 is one atomic forward migration", () => {
  const source = m13Source.replace(/^\uFEFF/, "");

  const beginMatches = source.match(/^begin;$/gm) ?? [];

  const commitMatches = source.match(/^commit;$/gm) ?? [];

  assert.equal(beginMatches.length, 1);
  assert.equal(commitMatches.length, 1);

  assert.ok(source.trim().startsWith("begin;"));

  assert.ok(source.trim().endsWith("commit;"));
});

test("M13 exposes exactly the three Service Chat RPC definitions", () => {
  for (const functionName of [
    "ensure_service_request_conversation",
    "send_service_request_message",
    "mark_service_request_conversation_read",
  ]) {
    const matches =
      m13Source.match(
        new RegExp(`create function public\\.${functionName}\\s*\\(`, "g"),
      ) ?? [];

    assert.equal(
      matches.length,
      1,
      `${functionName} must have exactly one definition`,
    );
  }
});

test("all Service Chat RPCs use SECURITY DEFINER and empty search_path", () => {
  for (const functionName of [
    "ensure_service_request_conversation",
    "send_service_request_message",
    "mark_service_request_conversation_read",
  ]) {
    const source = normalize(extractFunction(functionName));

    assert.ok(source.includes("security definer set search_path to ''"));

    assert.ok(source.includes("public.require_current_service_actor();"));
  }
});

test("M2 already defines Task XOR Service Request conversation context", () => {
  const source = normalize(m2Source);

  assert.ok(
    source.includes("task_id is not null and service_request_id is null"),
  );

  assert.ok(
    source.includes("task_id is null and service_request_id is not null"),
  );
});

test("M2 binds Service conversation participants to Request Customer and Provider", () => {
  const source = normalize(m2Source);

  assert.ok(
    source.includes(
      "foreign key ( service_request_id, owner_id, helper_id ) references public.service_requests ( id, customer_id, provider_id )",
    ),
  );

  assert.ok(source.includes("unique ( service_request_id )"));
});

test("M13 removes unnecessary browser TRUNCATE TRIGGER and REFERENCES privileges", () => {
  const source = normalize(m13Source);

  assert.ok(
    source.includes(
      "revoke truncate, trigger, references on table public.conversations from anon, authenticated;",
    ),
  );

  assert.ok(
    source.includes(
      "revoke truncate, trigger, references on table public.messages from anon, authenticated;",
    ),
  );
});

test("direct browser message INSERT remains Task-only", () => {
  const source = normalize(m13Source);

  assert.ok(
    source.includes(
      'create policy "Users can send messages" on public.messages for insert to authenticated',
    ),
  );

  assert.ok(source.includes("c.service_request_id is null"));

  assert.ok(source.includes("c.task_id is not null"));

  assert.ok(source.includes("sender_id = auth.uid()"));
});

test("Service Chat browser inputs never own participants sender lifecycle or unread state", () => {
  for (const forbidden of [
    "p_customer_id",
    "p_provider_id",
    "p_owner_id",
    "p_helper_id",
    "p_sender_id",
    "p_status",
    "p_owner_unread_count",
    "p_helper_unread_count",
  ]) {
    assert.ok(
      !m13Source.includes(forbidden),
      `forbidden browser authority found: ${forbidden}`,
    );
  }
});

test("conversation creation derives Customer and Provider from a participant-locked Request", () => {
  const source = normalize(
    extractFunction("ensure_service_request_conversation"),
  );

  assert.ok(
    source.includes(
      "sr.customer_id = v_actor_id or sr.provider_id = v_actor_id",
    ),
  );

  assert.ok(source.includes("for update"));

  assert.ok(source.includes("owner_id, helper_id"));

  assert.ok(source.includes("v_customer_id, v_provider_id"));
});

test("existing Service conversation is returned before lifecycle creation gate", () => {
  const source = normalize(
    extractFunction("ensure_service_request_conversation"),
  );

  const existingLookup = source.indexOf("from public.conversations as c");

  const returnExisting = source.indexOf("return v_conversation_id;");

  const stateGate = source.indexOf("if v_request_status not in");

  assert.ok(existingLookup >= 0);
  assert.ok(returnExisting > existingLookup);
  assert.ok(stateGate > returnExisting);
});

test("new Service conversation is allowed only in active Chat lifecycle states", () => {
  const source = normalize(
    extractFunction("ensure_service_request_conversation"),
  );

  for (const status of [
    "NEGOTIATING",
    "AGREEMENT_PENDING",
    "AGREED",
    "IN_PROGRESS",
    "SUBMITTED",
  ]) {
    assert.ok(
      source.includes(`'${status}'`),
      `missing active Chat state: ${status}`,
    );
  }

  for (const status of [
    "PENDING_PROVIDER",
    "COMPLETED",
    "DECLINED",
    "CANCELLED",
  ]) {
    assert.ok(
      !source.includes(`'${status}'`),
      `terminal/pre-negotiation state must not create Chat: ${status}`,
    );
  }
});

test("Service conversation creation is idempotent and database-owned", () => {
  const source = normalize(
    extractFunction("ensure_service_request_conversation"),
  );

  assert.ok(source.includes("insert into public.conversations"));

  assert.ok(
    source.includes("null, p_request_id, v_customer_id, v_provider_id"),
  );

  assert.ok(source.includes("on conflict ( service_request_id ) do nothing"));
});

test("Service message send locks Request before conversation and enforces active lifecycle", () => {
  const source = normalize(extractFunction("send_service_request_message"));

  const requestLock = source.indexOf("from public.service_requests as sr");

  const conversationLock = source.indexOf(
    "from public.conversations as c",
    requestLock + 1,
  );

  assert.ok(requestLock >= 0);
  assert.ok(conversationLock > requestLock);

  for (const status of [
    "NEGOTIATING",
    "AGREEMENT_PENDING",
    "AGREED",
    "IN_PROGRESS",
    "SUBMITTED",
  ]) {
    assert.ok(source.includes(`'${status}'`));
  }

  for (const status of [
    "PENDING_PROVIDER",
    "COMPLETED",
    "DECLINED",
    "CANCELLED",
  ]) {
    assert.ok(!source.includes(`'${status}'`));
  }
});

test("Service message send atomically inserts message and maintains conversation metadata", () => {
  const source = normalize(extractFunction("send_service_request_message"));

  assert.ok(source.includes("insert into public.messages"));

  assert.ok(source.includes("sender_id, content, created_at"));

  assert.ok(source.includes("v_actor_id, v_content, v_now"));

  assert.ok(
    source.includes("update public.conversations set last_message = v_content"),
  );

  assert.ok(source.includes("last_message_at = v_now"));

  assert.ok(source.includes("owner_unread_count = case"));

  assert.ok(source.includes("helper_unread_count = case"));
});

test("Service sender can increment only the other participant unread counter", () => {
  const source = normalize(extractFunction("send_service_request_message"));

  assert.ok(
    source.includes(
      "when v_actor_id = v_owner_id then coalesce( owner_unread_count, 0 ) else coalesce( owner_unread_count, 0 ) + 1",
    ),
  );

  assert.ok(
    source.includes(
      "when v_actor_id = v_helper_id then coalesce( helper_unread_count, 0 ) else coalesce( helper_unread_count, 0 ) + 1",
    ),
  );
});

test("mark-read accepts only Service conversation participants and clears only actor unread state", () => {
  const source = normalize(
    extractFunction("mark_service_request_conversation_read"),
  );

  assert.ok(source.includes("c.task_id is null"));

  assert.ok(source.includes("c.service_request_id is not null"));

  assert.ok(
    source.includes("c.owner_id = v_actor_id or c.helper_id = v_actor_id"),
  );

  assert.ok(source.includes("owner_unread_count = 0"));

  assert.ok(source.includes("helper_unread_count = 0"));

  assert.ok(!source.includes("v_request_status"));
});

test("M13 RPC execution is revoked from default browser roles then granted explicitly", () => {
  for (const functionName of [
    "ensure_service_request_conversation",
    "send_service_request_message",
    "mark_service_request_conversation_read",
  ]) {
    const aclStart = m13Source.indexOf(`on function public.${functionName}(`);

    assert.ok(aclStart >= 0, `ACL not found: ${functionName}`);

    const tail = m13Source.slice(aclStart);

    for (const role of ["public", "anon", "authenticated"]) {
      assert.match(
        tail,
        new RegExp(
          `on function public\\.${functionName}\\([\\s\\S]*?from ${role};`,
        ),
      );
    }

    assert.match(
      tail,
      new RegExp(
        `on function public\\.${functionName}\\([\\s\\S]*?to authenticated;`,
      ),
    );

    assert.match(
      tail,
      new RegExp(
        `on function public\\.${functionName}\\([\\s\\S]*?to service_role;`,
      ),
    );
  }
});
