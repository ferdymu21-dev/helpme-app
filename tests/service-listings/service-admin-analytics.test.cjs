const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

const repository = read(
  "src/features/admin/analytics/repositories/getAdminAnalytics.repository.ts",
);

const service = read(
  "src/features/admin/analytics/services/getAdminAnalytics.service.ts",
);

const types = read(
  "src/features/admin/analytics/types/admin-analytics.types.ts",
);

const api = read("src/app/api/admin/analytics/route.ts");
const analyticsPage = read("src/app/admin/analytics/page.tsx");

test("Admin analytics repository remains server-only and uses adminSupabase", () => {
  assert.match(repository, /import\s+"server-only"/);

  assert.match(repository, /\badminSupabase\b/);

  assert.doesNotMatch(repository, /@\/lib\/supabase\/client/);
});

test("Admin analytics repository paginates source rows instead of relying on default row limit", () => {
  assert.match(repository, /const pageSize = 1000/);

  assert.match(repository, /while\s*\(\s*true\s*\)/);

  assert.match(repository, /\.range\s*\(/);
});

test("Admin analytics reads Service Listing Request and publication payment data", () => {
  assert.match(repository, /\.from\(\s*"service_listings"\s*\)/);

  assert.match(repository, /\.from\(\s*"service_requests"\s*\)/);

  assert.match(repository, /\.from\(\s*"service_listing_payments"\s*\)/);
});

test("Admin analytics repository remains strictly read-only", () => {
  assert.doesNotMatch(repository, /\.(?:insert|update|upsert|delete)\s*\(/);

  assert.doesNotMatch(repository, /\.rpc\s*\(/);
});

test("Analytics report source includes Service Listing context", () => {
  assert.match(repository, /\bservice_listing_id\b/);
});

test("Admin analytics service retains canonical admin authorization", () => {
  assert.match(service, /\brequireAdmin\s*\(\s*\)/);
});

test("Service Request active analytics uses canonical nonterminal statuses", () => {
  for (const status of [
    "PENDING_PROVIDER",
    "NEGOTIATING",
    "AGREEMENT_PENDING",
    "AGREED",
    "IN_PROGRESS",
    "SUBMITTED",
  ]) {
    assert.match(service, new RegExp(`"${status}"`));
  }

  assert.match(service, /activeServiceRequestStatuses/);
});

test("Publication revenue counts only PAID Service Listing payments", () => {
  assert.match(service, /servicePublicationRevenue/);

  assert.match(service, /payment\.payment_status\s*===\s*"PAID"/);

  assert.match(service, /payment\.amount/);
});

test("Service Listing moderation analytics only counts pending listing reports", () => {
  assert.match(service, /report\.service_listing_id\s*!==\s*null/);

  assert.match(service, /report\.status\s*===\s*"PENDING"/);
});

test("Admin analytics response exposes Service Marketplace contract", () => {
  assert.match(types, /AdminAnalyticsServiceMarketplace/);

  assert.match(types, /serviceMarketplace:\s*AdminAnalyticsServiceMarketplace/);

  assert.match(service, /serviceMarketplace:\s*\{/);
});

test("Service Marketplace analytics UI consumes the server analytics contract", () => {
  assert.match(analyticsPage, /\bserviceMarketplace\b/);

  assert.match(analyticsPage, /\.paidRevenue\b/);

  assert.match(analyticsPage, /\.pendingListingReports\b/);

  assert.match(analyticsPage, /Operasional marketplace jasa/);
});

test("Service Marketplace analytics UI has no direct database authority", () => {
  assert.doesNotMatch(analyticsPage, /@\/lib\/supabase\/client/);

  assert.doesNotMatch(
    analyticsPage,
    /\.from\s*\(\s*["']service_(?:listings|requests|listing_payments)["']\s*\)/,
  );

  assert.doesNotMatch(analyticsPage, /\.rpc\s*\(/);

  assert.match(analyticsPage, /\/api\/admin\/analytics/);
});
test("Admin analytics API remains private no-store GET boundary", () => {
  assert.match(api, /export async function GET/);

  assert.match(api, /private,\s*no-store/);

  assert.doesNotMatch(api, /export async function (?:POST|PATCH|PUT|DELETE)/);
});
