const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

const repository = read(
  "src/features/admin/service-requests/repositories/admin-service-request.repository.ts",
);

const listService = read(
  "src/features/admin/service-requests/services/get-admin-service-requests.service.ts",
);

const detailService = read(
  "src/features/admin/service-requests/services/get-admin-service-request-detail.service.ts",
);

const listRoute = read("src/app/api/admin/service-requests/route.ts");

const detailRoute = read("src/app/api/admin/service-requests/[id]/route.ts");

const types = read(
  "src/features/admin/service-requests/types/admin-service-request.types.ts",
);

test("admin Service Request repository is server-only and uses adminSupabase", () => {
  assert.match(repository, /import\s+"server-only"/);

  assert.match(repository, /adminSupabase/);

  assert.doesNotMatch(repository, /@\/lib\/supabase\/client/);
});

test("admin Service Request services require server-side admin authorization", () => {
  for (const source of [listService, detailService]) {
    assert.match(source, /requireAdmin/);

    assert.match(source, /await\s+requireAdmin\(\)/);

    assert.doesNotMatch(source, /@\/lib\/supabase\/client/);
  }
});

test("admin Service Request repository is read-only", () => {
  assert.match(repository, /\.from\(\s*"service_requests"\s*\)/);

  assert.match(repository, /\.from\(\s*"service_listings"\s*\)/);

  assert.match(repository, /\.from\(\s*"users"\s*\)/);

  assert.doesNotMatch(repository, /\.insert\(/);

  assert.doesNotMatch(repository, /\.update\(/);

  assert.doesNotMatch(repository, /\.delete\(/);

  assert.doesNotMatch(repository, /\.rpc\(/);
});

test("admin Service Request boundary cannot act as Customer or Provider", () => {
  const combined = [
    repository,
    listService,
    detailService,
    listRoute,
    detailRoute,
  ].join("\n");

  const forbiddenAuthorities = [
    "accept_service_request",
    "decline_service_request",
    "cancel_service_request",
    "propose_service_agreement",
    "approve_service_agreement",
    "reject_service_agreement",
    "start_service_request",
    "submit_service_completion",
    "complete_service_request",
  ];

  for (const authority of forbiddenAuthorities) {
    assert.doesNotMatch(
      combined,
      new RegExp(`\\.rpc\\(\\s*"${authority}"`, "i"),
    );
  }
});

test("admin Service Request APIs delegate only through services", () => {
  assert.match(listRoute, /getAdminServiceRequestsService/);

  assert.match(detailRoute, /getAdminServiceRequestDetailService/);

  for (const source of [listRoute, detailRoute]) {
    assert.doesNotMatch(source, /adminSupabase/);

    assert.doesNotMatch(source, /@\/lib\/supabase\/client/);
  }
});

test("admin Service Request APIs are private no-store", () => {
  for (const source of [listRoute, detailRoute]) {
    assert.match(source, /private,\s*no-store/);
  }
});

test("admin Service Request statuses match canonical lifecycle", () => {
  const statuses = [
    "PENDING_PROVIDER",
    "NEGOTIATING",
    "AGREEMENT_PENDING",
    "AGREED",
    "IN_PROGRESS",
    "SUBMITTED",
    "COMPLETED",
    "DECLINED",
    "CANCELLED",
  ];

  for (const status of statuses) {
    assert.match(types, new RegExp(`"${status}"`));
  }
});

test("admin Service Request list filtering is server-side", () => {
  assert.match(repository, /query\.eq\(\s*"status"/);

  assert.match(repository, /query\.ilike\(\s*"request_description"/);

  assert.match(repository, /count:\s*"exact"/);

  assert.match(repository, /\.range\(/);
});
