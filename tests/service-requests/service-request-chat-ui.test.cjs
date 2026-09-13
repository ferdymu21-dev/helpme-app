const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "../..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}

function count(source, value) {
  return source.split(value).length - 1;
}

const repositoryPath =
  "src/features/service-requests/repositories/service-request-chat.repository.ts";

const servicePath =
  "src/features/service-requests/services/service-request-chat.service.ts";

const validatorPath =
  "src/features/service-requests/validators/validate-service-request-chat.ts";

const actionPath = "src/features/service-requests/ServiceRequestChatAction.tsx";

const detailPath =
  "src/features/service-requests/ServiceRequestDetailPageUI.tsx";

const conversationTypePath =
  "src/features/messages/types/conversation.types.ts";

const chatRoomPath = "src/app/messages/[id]/page.tsx";

const desktopSidebarPath =
  "src/components/messages/shared/DesktopConversationSidebar.tsx";

const repositorySource = read(repositoryPath);

const serviceSource = read(servicePath);

const validatorSource = read(validatorPath);

const actionSource = read(actionPath);

const detailSource = read(detailPath);

const conversationTypeSource = read(conversationTypePath);

const chatRoomSource = read(chatRoomPath);

const desktopSidebarSource = read(desktopSidebarPath);

test("Service Chat repository owns exactly the three trusted RPC calls", () => {
  assert.equal(
    count(repositorySource, '"ensure_service_request_conversation"'),
    1,
  );

  assert.equal(count(repositorySource, '"send_service_request_message"'), 1);

  assert.equal(
    count(repositorySource, '"mark_service_request_conversation_read"'),
    1,
  );
});

test("Service Chat repository sends only trusted business inputs and performs no raw Chat table mutation", () => {
  const source = normalize(repositorySource);

  assert.ok(source.includes("p_request_id: requestId"));

  assert.ok(source.includes("p_conversation_id: conversationId"));

  assert.ok(source.includes("p_content: content"));

  for (const forbidden of [
    "p_customer_id",
    "p_provider_id",
    "p_owner_id",
    "p_helper_id",
    "p_sender_id",
    "p_status",
    '.from("conversations")',
    '.from("messages")',
  ]) {
    assert.ok(
      !repositorySource.includes(forbidden),
      `forbidden repository authority found: ${forbidden}`,
    );
  }
});

test("Service Chat service validates identity and content before repository access", () => {
  const source = normalize(serviceSource);

  const ensureValidation = source.indexOf(
    "validateServiceRequestChatIdentity( requestId",
  );

  const ensureRepository = source.indexOf(
    "ensureServiceRequestConversationRepository(",
  );

  assert.ok(ensureValidation >= 0);
  assert.ok(ensureRepository > ensureValidation);

  const sendIdentityValidation = source.indexOf(
    "validateServiceRequestChatIdentity( conversationId",
    ensureRepository,
  );

  const sendContentValidation = source.indexOf(
    "validateServiceRequestChatMessage(content)",
  );

  const sendRepository = source.indexOf("sendServiceRequestMessageRepository(");

  assert.ok(sendIdentityValidation >= 0);
  assert.ok(sendContentValidation > sendIdentityValidation);
  assert.ok(sendRepository > sendContentValidation);

  assert.ok(validatorSource.includes(".trim()"));
});

test("Service Request Chat CTA exposes only active Chat lifecycle states", () => {
  for (const status of [
    "NEGOTIATING",
    "AGREEMENT_PENDING",
    "AGREED",
    "IN_PROGRESS",
    "SUBMITTED",
  ]) {
    assert.ok(
      actionSource.includes(`ServiceRequestStatus.${status}`),
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
      !actionSource.includes(`ServiceRequestStatus.${status}`),
      `non-active state exposed by Chat CTA: ${status}`,
    );
  }
});

test("Service Request Chat CTA ensures conversation before navigating to the room", () => {
  const ensureIndex = actionSource.indexOf(
    "ensureServiceRequestConversationService(",
  );

  const routeIndex = actionSource.indexOf(
    "router.push(`/messages/${conversationId}`)",
  );

  assert.ok(ensureIndex >= 0);
  assert.ok(routeIndex > ensureIndex);
});

test("participant Request detail integrates exactly one Service Chat action with authoritative Request state", () => {
  assert.equal(count(detailSource, "<ServiceRequestChatAction"), 1);

  const source = normalize(detailSource);

  assert.ok(source.includes("requestId={detail.id}"));

  assert.ok(source.includes("requestStatus={detail.status}"));

  assert.ok(source.includes("isProvider={isProvider}"));

  assert.ok(source.includes("isCustomer={isCustomer}"));
});

test("Conversation type supports Task XOR Service Request contexts", () => {
  const source = normalize(conversationTypeSource);

  assert.ok(source.includes("task_id: string | null;"));

  assert.ok(source.includes("service_request_id: string | null;"));

  assert.ok(source.includes("tasks?: { title: string; } | null;"));
});

test("Chat room detects Service context before selecting the send mutation path", () => {
  const serviceContext = chatRoomSource.indexOf(
    "conversation.task_id === null",
  );

  const serviceSend = chatRoomSource.indexOf(
    "sendServiceRequestMessageService(",
    serviceContext,
  );

  const taskInsert = chatRoomSource.indexOf('.from("messages")', serviceSend);

  assert.ok(serviceContext >= 0);
  assert.ok(serviceSend > serviceContext);
  assert.ok(taskInsert > serviceSend);
});

test("Service send uses the trusted service while legacy Task send remains intact", () => {
  assert.ok(chatRoomSource.includes("await sendServiceRequestMessageService("));

  assert.ok(chatRoomSource.includes('.from("messages")'));

  assert.ok(chatRoomSource.includes(".insert({"));

  assert.ok(chatRoomSource.includes('.from("conversations")'));

  assert.ok(chatRoomSource.includes(".update({"));
});

test("Service unread reset uses the trusted service while Task unread updates remain intact", () => {
  const occurrences =
    chatRoomSource.match(/conversation\.task_id === null/g) ?? [];

  assert.equal(occurrences.length, 2);

  assert.ok(
    chatRoomSource.includes("await markServiceRequestConversationReadService("),
  );

  assert.ok(chatRoomSource.includes("owner_unread_count: 0"));

  assert.ok(chatRoomSource.includes("helper_unread_count: 0"));
});

test("Chat page never bypasses the Service Chat application layer with raw Service RPC names", () => {
  for (const rpcName of [
    '"ensure_service_request_conversation"',
    '"send_service_request_message"',
    '"mark_service_request_conversation_read"',
  ]) {
    assert.ok(
      !chatRoomSource.includes(rpcName),
      `raw Service Chat RPC leaked into Chat page: ${rpcName}`,
    );
  }
});

test("Service Chat SQL RPC literals exist only in the repository application boundary", () => {
  const rpcNames = [
    '"ensure_service_request_conversation"',
    '"send_service_request_message"',
    '"mark_service_request_conversation_read"',
  ];

  const srcRoot = path.join(root, "src");

  const matches = [];

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, {
      withFileTypes: true,
    })) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);

        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const source = fs.readFileSync(fullPath, "utf8");

      for (const rpcName of rpcNames) {
        if (source.includes(rpcName)) {
          matches.push(path.relative(root, fullPath).split(path.sep).join("/"));
        }
      }
    }
  }

  walk(srcRoot);

  assert.deepEqual([...new Set(matches)], [repositoryPath]);
});

test("desktop conversation sidebar identifies Service Request context without requiring a Task relation", () => {
  const source = normalize(desktopSidebarSource);

  assert.ok(
    source.includes(
      "conversation.service_request_id || conversation.tasks?.title",
    ),
  );

  assert.ok(
    source.includes(
      'conversation.service_request_id ? "Permintaan Jasa" : conversation.tasks?.title',
    ),
  );
});

test("locked Service Request migrations remain byte-identical", () => {
  const expected = new Map([
    [
      "database/forward-migrations/20260912_11_service_request_core.sql",
      "5AC614A84201EA792C55764290C9688D8F5726BCC5752D27641D9B5ED864F9F7",
    ],
    [
      "database/forward-migrations/20260912_12_service_agreement_boundary.sql",
      "82A4AE4B6CF4CBF017BB94E58EAEECCE557252E28886D7A61EE23457C6411BF4",
    ],
    [
      "database/forward-migrations/20260913_13_service_request_chat.sql",
      "43A5B5876812B6F1F500A92260D40FAC714290728DB0C9B22E2BEC06DFD543FE",
    ],
  ]);

  for (const [relativePath, expectedHash] of expected) {
    const actualHash = crypto
      .createHash("sha256")
      .update(fs.readFileSync(path.join(root, relativePath)))
      .digest("hex")
      .toUpperCase();

    assert.equal(actualHash, expectedHash, `${relativePath} changed`);
  }
});
