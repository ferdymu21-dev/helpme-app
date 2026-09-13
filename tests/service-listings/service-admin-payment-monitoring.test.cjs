const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

const repository = read(
  "src/features/admin/service-payments/repositories/admin-service-payment.repository.ts",
);

const listService = read(
  "src/features/admin/service-payments/services/get-admin-service-payments.service.ts",
);

const detailService = read(
  "src/features/admin/service-payments/services/get-admin-service-payment-detail.service.ts",
);

const types = read(
  "src/features/admin/service-payments/types/admin-service-payment.types.ts",
);

const listRoute = read("src/app/api/admin/service-payments/route.ts");

const detailRoute = read("src/app/api/admin/service-payments/[id]/route.ts");

test("admin Service Payment repository is server-only and uses adminSupabase", () => {
  assert.match(repository, /import\s+"server-only"/);

  assert.match(repository, /adminSupabase/);

  assert.doesNotMatch(repository, /@\/lib\/supabase\/client/);
});

test("admin Service Payment services require canonical admin authorization", () => {
  for (const source of [listService, detailService]) {
    assert.match(source, /requireAdmin/);

    assert.match(source, /await\s+requireAdmin\(\)/);
  }
});

test("admin Service Payment repository is strictly read-only", () => {
  assert.match(repository, /\.from\(\s*"service_listing_payments"\s*\)/);

  assert.doesNotMatch(repository, /\.(?:insert|update|upsert|delete)\s*\(/);

  assert.doesNotMatch(repository, /\.rpc\s*\(/);
});

test("admin Service Payment monitor never exposes checkout credentials", () => {
  assert.doesNotMatch(repository, /\bsnap_token\b/);

  assert.doesNotMatch(repository, /\bpayment_url\b/);

  assert.doesNotMatch(types, /\bsnapToken\b/);

  assert.doesNotMatch(types, /\bpaymentUrl\b/);
});

test("admin Service Payment monitor cannot call Midtrans or alter payment lifecycle", () => {
  assert.doesNotMatch(
    repository,
    /(?:from\s+["'][^"']*midtrans|require\(\s*["'][^"']*midtrans)/i,
  );

  assert.doesNotMatch(listService, /midtrans/i);

  assert.doesNotMatch(detailService, /midtrans/i);

  assert.doesNotMatch(repository, /apply_service_listing_publication/i);
});

test("admin Service Payment statuses and publication actions are canonical", () => {
  for (const status of [
    "CREATING",
    "PENDING",
    "PAID",
    "FAILED",
    "CANCELLED",
    "EXPIRED",
  ]) {
    assert.match(types, new RegExp(`"${status}"`));
  }

  for (const action of [
    "INITIAL_PUBLICATION",
    "EXPIRED_RENEWAL",
    "EARLY_RENEWAL",
  ]) {
    assert.match(types, new RegExp(`"${action}"`));
  }
});

test("admin Service Payment list filters are executed server-side", () => {
  assert.match(repository, /\.eq\(\s*"payment_status"/);

  assert.match(repository, /\.eq\(\s*"publication_action"/);

  assert.match(repository, /\.ilike\(\s*"midtrans_order_id"/);

  assert.match(repository, /\.range\(/);
});

test("admin Service Payment response can correlate publication application read-only", () => {
  assert.match(
    repository,
    /\.from\(\s*"service_listing_publication_periods"\s*\)/,
  );

  assert.match(repository, /publication_applied_at/);

  assert.match(repository, /publicationPeriod/);
});

test("admin Service Payment APIs delegate through services and are private no-store", () => {
  assert.match(listRoute, /getAdminServicePaymentsService/);

  assert.match(detailRoute, /getAdminServicePaymentDetailService/);

  for (const source of [listRoute, detailRoute]) {
    assert.match(source, /private,\s*no-store/);

    assert.doesNotMatch(source, /adminSupabase/);

    assert.doesNotMatch(source, /@\/lib\/supabase\/client/);
  }
});
