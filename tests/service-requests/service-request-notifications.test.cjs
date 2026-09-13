const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function sha256(relativePath) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(path.join(root, relativePath)))
    .digest("hex")
    .toUpperCase();
}

function normalize(value) {
  return value.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
}

const m2Path =
  "database/forward-migrations/20260909_02_service_shared_extensions.sql";

const m11Path =
  "database/forward-migrations/20260912_11_service_request_core.sql";

const m12Path =
  "database/forward-migrations/20260912_12_service_agreement_boundary.sql";

const m13Path =
  "database/forward-migrations/20260913_13_service_request_chat.sql";

const m14Path =
  "database/forward-migrations/20260913_14_service_request_notifications.sql";

const categoryPath =
  "src/features/notifications/constants/notification-category.ts";

const typePath = "src/features/notifications/constants/notification-type.ts";

const typeMapPath =
  "src/features/notifications/constants/notification-type-category-map.ts";

const notificationTypesPath =
  "src/features/notifications/types/notification.types.ts";

const filterTabsPath =
  "src/features/notifications/components/NotificationFilterTabs.tsx";

const notificationPagePath =
  "src/features/notifications/components/NotificationPageUI.tsx";

const notificationConfigPath =
  "src/features/notifications/utils/getNotificationConfig.ts";

const notificationIconPath =
  "src/features/notifications/utils/getNotificationIcon.tsx";

const m2 = read(m2Path);
const m14 = read(m14Path);
const normalizedM14 = normalize(m14);

test("M14 creates exactly two SECURITY DEFINER trigger functions with empty search_path", () => {
  assert.equal((m14.match(/\bsecurity\s+definer\b/gi) || []).length, 2);

  assert.equal((m14.match(/set\s+search_path\s*=\s*''/gi) || []).length, 2);

  assert.match(
    normalizedM14,
    /public\.notify_service_request_lifecycle\(\) returns trigger/,
  );

  assert.match(
    normalizedM14,
    /public\.notify_service_agreement_lifecycle\(\) returns trigger/,
  );
});

test("Service Request notification trigger observes INSERT and status UPDATE only", () => {
  assert.match(
    normalizedM14,
    /create trigger service_request_notification_trigger after insert or update of status on public\.service_requests/,
  );

  assert.match(
    normalizedM14,
    /execute function public\.notify_service_request_lifecycle\(\)/,
  );
});

test("new Service Request notifies the Provider", () => {
  assert.match(
    normalizedM14,
    /tg_op = 'INSERT'.*new\.status <> 'PENDING_PROVIDER'.*v_recipient_id := new\.provider_id.*v_type := 'SERVICE_REQUEST_CREATED'/,
  );

  assert.match(
    normalizedM14,
    /'service-request:' \|\| new\.id::text \|\| ':created'/,
  );
});

test("PENDING_PROVIDER to NEGOTIATING notifies the Customer", () => {
  assert.match(
    normalizedM14,
    /old\.status = 'PENDING_PROVIDER' and new\.status = 'NEGOTIATING'.*v_recipient_id := new\.customer_id.*v_type := 'SERVICE_REQUEST_NEGOTIATING'/,
  );

  assert.match(
    normalizedM14,
    /'service-request:' \|\| new\.id::text \|\| ':negotiating'/,
  );
});

test("Provider decline notifies the Customer from the allowed early states", () => {
  assert.match(
    normalizedM14,
    /old\.status in \( 'PENDING_PROVIDER', 'NEGOTIATING' \) and new\.status = 'DECLINED'.*v_recipient_id := new\.customer_id.*v_type := 'SERVICE_REQUEST_DECLINED'/,
  );

  assert.match(
    normalizedM14,
    /'service-request:' \|\| new\.id::text \|\| ':declined'/,
  );
});

test("Customer cancellation notifies the Provider from the allowed early states", () => {
  assert.match(
    normalizedM14,
    /old\.status in \( 'PENDING_PROVIDER', 'NEGOTIATING' \) and new\.status = 'CANCELLED'.*v_recipient_id := new\.provider_id.*v_type := 'SERVICE_REQUEST_CANCELLED'/,
  );

  assert.match(
    normalizedM14,
    /'service-request:' \|\| new\.id::text \|\| ':cancelled'/,
  );
});

test("Agreement notification recipients are derived from the Service Request", () => {
  assert.match(
    normalizedM14,
    /select sr\.customer_id, sr\.provider_id into v_customer_id, v_provider_id from public\.service_requests as sr where sr\.id = new\.service_request_id/,
  );

  assert.doesNotMatch(m14, /\bp_customer_id\b/i);

  assert.doesNotMatch(m14, /\bp_provider_id\b/i);
});

test("new Agreement proposal notifies the Customer with Agreement-scoped dedupe", () => {
  assert.match(
    normalizedM14,
    /tg_op = 'INSERT'.*new\.status <> 'PROPOSED'.*v_recipient_id := v_customer_id.*v_type := 'SERVICE_AGREEMENT_PROPOSED'/,
  );

  assert.match(
    normalizedM14,
    /'service-agreement:' \|\| new\.id::text \|\| ':proposed'/,
  );
});

test("Agreement approval notifies the Provider with Agreement-scoped dedupe", () => {
  assert.match(
    normalizedM14,
    /old\.status = 'PROPOSED' and new\.status = 'APPROVED'.*v_recipient_id := v_provider_id.*v_type := 'SERVICE_AGREEMENT_APPROVED'/,
  );

  assert.match(
    normalizedM14,
    /'service-agreement:' \|\| new\.id::text \|\| ':approved'/,
  );
});

test("Agreement rejection notifies the Provider with Agreement-scoped dedupe", () => {
  assert.match(
    normalizedM14,
    /old\.status = 'PROPOSED' and new\.status = 'REJECTED'.*v_recipient_id := v_provider_id.*v_type := 'SERVICE_AGREEMENT_REJECTED'/,
  );

  assert.match(
    normalizedM14,
    /'service-agreement:' \|\| new\.id::text \|\| ':rejected'/,
  );
});

test("Service lifecycle notifications use SERVICE category, request context, redirect, and idempotent insert", () => {
  assert.equal(
    (m14.match(/insert\s+into\s+public\.notifications/gi) || []).length,
    2,
  );

  assert.equal((m14.match(/'SERVICE'/g) || []).length, 2);

  assert.equal((m14.match(/service_request_id/gi) || []).length >= 3, true);

  assert.equal(
    (m14.match(/on\s+conflict\s*\(\s*user_id,\s*dedupe_key\s*\)/gi) || [])
      .length,
    2,
  );

  assert.equal((m14.match(/\/service-requests\//g) || []).length, 2);
});

test("browser cannot call Service notification trigger functions directly", () => {
  assert.doesNotMatch(m14, /\bauth\.uid\s*\(/i);

  assert.doesNotMatch(m14, /\bp_user_id\b/i);

  assert.doesNotMatch(m14, /\bp_type\b/i);

  assert.doesNotMatch(m14, /\bp_dedupe_key\b/i);

  assert.match(
    normalizedM14,
    /revoke all on function public\.notify_service_request_lifecycle\(\) from public, anon, authenticated/,
  );

  assert.match(
    normalizedM14,
    /revoke all on function public\.notify_service_agreement_lifecycle\(\) from public, anon, authenticated/,
  );
});

test("M2 keeps Service notification context and dedupe server-controlled", () => {
  const normalizedM2 = normalize(m2);

  assert.match(normalizedM2, /add column service_request_id uuid/);

  assert.match(normalizedM2, /add column dedupe_key text/);

  assert.match(normalizedM2, /notifications_user_dedupe_unique_idx/);

  assert.match(
    normalizedM2,
    /grant insert \( id, user_id, title, message, type, is_read, created_at, task_id, redirect_url, category, campaign_id, image_url \) on table public\.notifications to authenticated/,
  );

  assert.match(
    normalizedM2,
    /service_request_id is null and dedupe_key is null/,
  );
});

test("all seven Service notification types map to SERVICE", () => {
  const types = read(typePath);

  const map = read(typeMapPath);

  const serviceTypes = [
    "SERVICE_REQUEST_CREATED",
    "SERVICE_REQUEST_NEGOTIATING",
    "SERVICE_REQUEST_DECLINED",
    "SERVICE_REQUEST_CANCELLED",
    "SERVICE_AGREEMENT_PROPOSED",
    "SERVICE_AGREEMENT_APPROVED",
    "SERVICE_AGREEMENT_REJECTED",
  ];

  for (const type of serviceTypes) {
    assert.match(types, new RegExp(`${type}: "${type}"`));

    assert.match(
      normalize(map),
      new RegExp(
        `NotificationType\\.${type}\\]: NotificationCategory\\.SERVICE`,
      ),
    );
  }
});

test("notification UI exposes the Jasa category and Service context", () => {
  const category = read(categoryPath);

  const rowType = read(notificationTypesPath);

  const tabs = read(filterTabsPath);

  const page = read(notificationPagePath);

  const config = read(notificationConfigPath);

  assert.match(category, /SERVICE:\s*"SERVICE"/);

  assert.match(rowType, /service_request_id\?:\s*string/);

  assert.match(tabs, /NotificationCategory\.SERVICE/);

  assert.match(tabs, /Jasa \(\$\{service\}\)/);

  assert.match(
    page,
    /notification\.category === NotificationCategory\.SERVICE/,
  );

  assert.match(page, /service=\{serviceCount\}/);

  assert.match(config, /badge:\s*"Jasa"/);
});

test("Service notification icon/config covers all seven lifecycle types", () => {
  const config = read(notificationConfigPath);

  const icon = read(notificationIconPath);

  const serviceTypes = [
    "SERVICE_REQUEST_CREATED",
    "SERVICE_REQUEST_NEGOTIATING",
    "SERVICE_REQUEST_DECLINED",
    "SERVICE_REQUEST_CANCELLED",
    "SERVICE_AGREEMENT_PROPOSED",
    "SERVICE_AGREEMENT_APPROVED",
    "SERVICE_AGREEMENT_REJECTED",
  ];

  for (const type of serviceTypes) {
    assert.match(config, new RegExp(type));

    assert.match(icon, new RegExp(`NotificationType\\.${type}`));
  }
});

test("Service Request application code does not directly mutate notifications", () => {
  const featureRoot = path.join(root, "src", "features", "service-requests");

  const files = [];

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        files.push(fullPath);
      }
    }
  }

  walk(featureRoot);

  for (const fullPath of files) {
    const source = fs.readFileSync(fullPath, "utf8");

    const relative = path.relative(root, fullPath).split(path.sep).join("/");

    assert.doesNotMatch(
      source,
      /\.from\(["']notifications["']\)/,
      `Raw notifications access found in ${relative}`,
    );
  }
});

test("existing Task notification category remains unchanged", () => {
  const map = normalize(read(typeMapPath));

  assert.match(
    map,
    /NotificationType\.APPLY_TASK\]: NotificationCategory\.TASK/,
  );

  assert.match(
    map,
    /NotificationType\.TASK_ACCEPTED\]: NotificationCategory\.TASK/,
  );

  assert.match(
    map,
    /NotificationType\.TASK_CANCELLED\]: NotificationCategory\.TASK/,
  );
});

test("M11, M12, and M13 remain immutable", () => {
  assert.equal(
    sha256(m11Path),
    "5AC614A84201EA792C55764290C9688D8F5726BCC5752D27641D9B5ED864F9F7",
  );

  assert.equal(
    sha256(m12Path),
    "82A4AE4B6CF4CBF017BB94E58EAEECCE557252E28886D7A61EE23457C6411BF4",
  );

  assert.equal(
    sha256(m13Path),
    "43A5B5876812B6F1F500A92260D40FAC714290728DB0C9B22E2BEC06DFD543FE",
  );
});

test("M14 remains immutable", () => {
  assert.equal(
    sha256(m14Path),
    "2C01D02AEEF1613C8C99EC259CBB5013E612FBB585ED5203C63611F8F0022195",
  );
});
