const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function normalize(value) {
  return value.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
}

function sha256(relativePath) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(path.join(root, relativePath)))
    .digest("hex")
    .toUpperCase();
}

function extractSqlFunction(sql, functionName) {
  const normalized = sql.replace(/\r\n/g, "\n");

  const marker = `create or replace function\n  public.${functionName}(`;

  const start = normalized.indexOf(marker);

  assert.notEqual(start, -1, `${functionName} definition was not found.`);

  const endMarker = "\n$function$;";

  const end = normalized.indexOf(endMarker, start);

  assert.notEqual(end, -1, `${functionName} body was not terminated.`);

  return normalized.slice(start, end + endMarker.length);
}

const m11Path =
  "database/forward-migrations/20260912_11_service_request_core.sql";

const m12Path =
  "database/forward-migrations/20260912_12_service_agreement_boundary.sql";

const m13Path =
  "database/forward-migrations/20260913_13_service_request_chat.sql";

const m14Path =
  "database/forward-migrations/20260913_14_service_request_notifications.sql";

const repositoryPath =
  "src/features/service-requests/repositories/service-request-customer-lifecycle.repository.ts";

const servicePath =
  "src/features/service-requests/services/service-request-customer-lifecycle.service.ts";

const hookPath =
  "src/features/service-requests/hooks/useServiceRequestDetailPage.ts";

const uiPath = "src/features/service-requests/ServiceRequestDetailPageUI.tsx";

const pagePath = "src/app/(protected)/service-requests/[id]/page.tsx";

const m11 = read(m11Path);

const cancelFunction = normalize(
  extractSqlFunction(m11, "cancel_service_request"),
);

test("M11 Customer cancellation derives actor identity and permits only early Request states", () => {
  assert.match(
    cancelFunction,
    /v_customer_id := public\.require_current_service_actor\(\)/,
  );

  assert.match(cancelFunction, /sr\.customer_id = v_customer_id/);

  assert.match(
    cancelFunction,
    /v_status not in \( 'PENDING_PROVIDER', 'NEGOTIATING' \)/,
  );

  assert.doesNotMatch(cancelFunction, /AGREEMENT_PENDING/);

  assert.doesNotMatch(cancelFunction, /AGREED/);

  assert.doesNotMatch(cancelFunction, /IN_PROGRESS/);
});

test("M11 Customer cancellation validates reason and owns cancellation metadata", () => {
  assert.match(cancelFunction, /p_reason is null or btrim\( p_reason \) = ''/);

  assert.match(cancelFunction, /status = 'CANCELLED'/);

  assert.match(cancelFunction, /cancelled_at = v_now/);

  assert.match(cancelFunction, /cancelled_by = v_customer_id/);

  assert.match(cancelFunction, /cancellation_reason = btrim\( p_reason \)/);

  assert.match(
    cancelFunction,
    /and status in \( 'PENDING_PROVIDER', 'NEGOTIATING' \)/,
  );
});

test("cancel_service_request execution is exposed only to authenticated browser actors", () => {
  const normalizedM11 = normalize(m11);

  assert.match(
    normalizedM11,
    /revoke all on function public\.cancel_service_request\( uuid, text \) from PUBLIC, anon, authenticated, service_role/,
  );

  assert.match(
    normalizedM11,
    /grant execute on function public\.cancel_service_request\( uuid, text \) to authenticated/,
  );
});

test("Customer cancellation repository sends only request identity and reason", () => {
  const source = normalize(read(repositoryPath));

  assert.match(
    source,
    /supabase\.rpc\("cancel_service_request", \{ p_request_id: requestId, p_reason: reason, \}\)/,
  );

  assert.doesNotMatch(source, /\bp_customer_id\b/);

  assert.doesNotMatch(source, /\bp_provider_id\b/);

  assert.doesNotMatch(source, /\bp_status\b/);

  assert.doesNotMatch(source, /\bp_cancelled_by\b/);

  assert.doesNotMatch(source, /\.from\(["']service_requests["']\)/);

  assert.doesNotMatch(source, /\.from\(["']notifications["']\)/);
});

test("Customer cancellation service validates Request identity and trims reason before repository access", () => {
  const source = read(servicePath);

  const normalized = normalize(source);

  assert.match(normalized, /const normalizedReason = reason\.trim\(\)/);

  assert.match(normalized, /if \(!normalizedReason\)/);

  assert.match(normalized, /validateServiceRequestId\(requestId\)/);

  assert.match(
    normalized,
    /cancelServiceRequestRepository\( validateServiceRequestId\(requestId\), normalizedReason, \)/,
  );

  assert.ok(
    source.indexOf("reason.trim()") <
      source.indexOf(
        "cancelServiceRequestRepository",
        source.indexOf("export async function cancelServiceRequestService"),
      ),
  );
});

test("Customer cancellation UI guard is Customer-only and limited to PENDING_PROVIDER or NEGOTIATING", () => {
  const source = normalize(read(hookPath));

  assert.match(
    source,
    /const canCancel = Boolean\( isCustomer && \(detail\?\.status === ServiceRequestStatus\.PENDING_PROVIDER \|\| detail\?\.status === ServiceRequestStatus\.NEGOTIATING\), \)/,
  );

  const guardStart = source.indexOf("const canCancel = Boolean(");

  const guardEnd = source.indexOf(");", guardStart);

  const guard = source.slice(guardStart, guardEnd + 2);

  assert.doesNotMatch(guard, /AGREEMENT_PENDING/);

  assert.doesNotMatch(guard, /AGREED/);

  assert.doesNotMatch(guard, /IN_PROGRESS/);

  assert.doesNotMatch(guard, /isProvider/);
});

test("Customer cancellation hook uses trusted service then refreshes authoritative detail", () => {
  const source = read(hookPath);

  const serviceCall = source.indexOf(
    "await cancelServiceRequestService(detail.id, reason);",
  );

  const closeModal = source.indexOf("setCancellationOpen(false);", serviceCall);

  const clearReason = source.indexOf('setCancellationReason("");', serviceCall);

  const refresh = source.indexOf("await load();", serviceCall);

  assert.notEqual(serviceCall, -1);

  assert.ok(closeModal > serviceCall);

  assert.ok(clearReason > serviceCall);

  assert.ok(refresh > clearReason);

  assert.match(source, /Alasan pembatalan wajib diisi\./);
});

test("Service Request detail UI exposes Customer cancellation through canCancel only", () => {
  const source = normalize(read(uiPath));

  assert.match(source, /\{canCancel && \(/);

  assert.match(source, /onClick=\{onOpenCancellation\}/);

  assert.match(source, /id="cancellation-reason"/);

  assert.match(source, /onCancellationReasonChange\(event\.target\.value\)/);

  assert.match(source, /onClick=\{onConfirmCancellation\}/);

  assert.match(source, /Batalkan Permintaan/);

  assert.match(source, /Konfirmasi Pembatalan/);
});

test("protected Request detail route continues passing the complete hook contract to the UI", () => {
  const source = normalize(read(pagePath));

  assert.match(
    source,
    /const props = useServiceRequestDetailPage\(params\.id\)/,
  );

  assert.match(source, /<ServiceRequestDetailPageUI \{\.\.\.props\} \/>/);
});

test("M14 converts authoritative Customer cancellation into a Provider notification", () => {
  const source = normalize(read(m14Path));

  assert.match(
    source,
    /old\.status in \( 'PENDING_PROVIDER', 'NEGOTIATING' \) and new\.status = 'CANCELLED'/,
  );

  assert.match(
    source,
    /new\.status = 'CANCELLED' then v_recipient_id := new\.provider_id/,
  );

  assert.match(source, /v_type := 'SERVICE_REQUEST_CANCELLED'/);

  assert.match(
    source,
    /'service-request:' \|\| new\.id::text \|\| ':cancelled'/,
  );
});

test("cancel_service_request RPC literal exists only in the Customer lifecycle repository application boundary", () => {
  const featureRoot = path.join(root, "src", "features", "service-requests");

  const matches = [];

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) {
        continue;
      }

      const source = fs.readFileSync(fullPath, "utf8");

      if (/\.rpc\(\s*["']cancel_service_request["']/.test(source)) {
        matches.push(path.relative(root, fullPath).split(path.sep).join("/"));
      }
    }
  }

  walk(featureRoot);

  assert.deepEqual(matches, [repositoryPath]);
});

test("M11 through M14 remain immutable after Customer cancellation integration", () => {
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

  assert.equal(
    sha256(m14Path),
    "2C01D02AEEF1613C8C99EC259CBB5013E612FBB585ED5203C63611F8F0022195",
  );
});
