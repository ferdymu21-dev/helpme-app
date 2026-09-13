const assert = require("node:assert/strict");
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

const routePath = "src/app/(protected)/my-services/page.tsx";

const hookPath = "src/features/service-listings/hooks/useMyServicesPage.ts";

const uiPath = "src/features/service-listings/MyServicesPageUI.tsx";

const servicePath =
  "src/features/service-listings/services/get-my-service-listings.service.ts";

const repositoryPath =
  "src/features/service-listings/repositories/service-listing-read.repository.ts";

const migrationPath =
  "database/forward-migrations/20260910_04_service_listing_read_and_draft.sql";

test("Jasa Saya index exists inside the protected route group and uses the dashboard hook contract", () => {
  const source = normalize(read(routePath));

  assert.match(
    routePath.replace(/\\/g, "/"),
    /^src\/app\/\(protected\)\/my-services\/page\.tsx$/,
  );

  assert.match(source, /useMyServicesPage/);

  assert.match(source, /const props = useMyServicesPage\(\)/);

  assert.match(source, /<MyServicesPageUI \{\.\.\.props\} \/>/);
});

test("Provider dashboard reads listings through the existing service boundary with server-backed pagination", () => {
  const source = normalize(read(hookPath));

  assert.match(source, /const PAGE_SIZE = 20/);

  assert.match(
    source,
    /getMyServiceListingsService\(\{ page, pageSize: PAGE_SIZE, \}\)/,
  );

  assert.doesNotMatch(source, /status:/);

  assert.doesNotMatch(source, /\.filter\(/);

  assert.doesNotMatch(source, /\.slice\(/);
});

test("Provider dashboard protects against stale async listing responses", () => {
  const source = normalize(read(hookPath));

  assert.match(source, /const requestVersion = useRef\(0\)/);

  assert.match(source, /const version = requestVersion\.current \+ 1/);

  assert.match(source, /requestVersion\.current = version/);

  assert.match(
    source,
    /if \(requestVersion\.current !== version\) \{ return; \}/,
  );

  assert.match(source, /requestVersion\.current \+= 1/);
});

test("Provider dashboard recovers from an empty later page without fabricating total_count", () => {
  const source = normalize(read(hookPath));

  assert.match(
    source,
    /page > 1 && result\.items\.length === 0 && result\.totalCount === null/,
  );

  assert.match(source, /setPage\(\(current\) => Math\.max\(1, current - 1\)\)/);

  assert.doesNotMatch(source, /result\.totalCount\s*=(?!=)/);
});

test("get_my_service_listings derives Provider ownership from auth.uid and returns every lifecycle state", () => {
  const source = normalize(read(migrationPath));

  const start = source.indexOf(
    "create or replace function public.get_my_service_listings(",
  );

  assert.notEqual(start, -1);

  const end = source.indexOf("$function$;", start);

  assert.notEqual(end, -1);

  const rpc = source.slice(start, end);

  assert.match(rpc, /sl\.provider_id = auth\.uid\(\)/);

  assert.doesNotMatch(rpc, /sl\.status\s*=/);

  assert.match(rpc, /order by sl\.created_at desc, sl\.id desc/);

  assert.match(rpc, /least\( coalesce\( p_page_size, 20 \), 50 \)/);
});

test("Provider dashboard service and repository keep the existing trusted read RPC boundary", () => {
  const service = normalize(read(servicePath));

  const repository = normalize(read(repositoryPath));

  assert.match(service, /getMyServiceListingsRepository\( query, \)/);

  assert.match(
    repository,
    /supabase\.rpc\( "get_my_service_listings", \{ p_page: page, p_page_size: pageSize, \}, \)/,
  );

  assert.doesNotMatch(repository, /\.from\(["']service_listings["']\)/);
});

test("Jasa Saya UI exposes create and canonical manage navigation", () => {
  const source = normalize(read(uiPath));

  assert.match(source, /Jasa Saya/);

  assert.match(source, /href="\/my-services\/new"/);

  assert.match(source, /Tawarkan Jasa/);

  assert.match(source, /href=\{`\/my-services\/\$\{listing\.id\}\/preview`\}/);

  assert.match(source, /Kelola Jasa/);
});

test("Jasa Saya renders all canonical Service Listing lifecycle labels", () => {
  const source = normalize(read(uiPath));

  const expectations = [
    ["DRAFT", "Draft"],
    ["PAYMENT_PENDING", "Menunggu pembayaran"],
    ["ACTIVE", "Aktif"],
    ["PAUSED", "Dijeda"],
    ["EXPIRED", "Kedaluwarsa"],
    ["BLOCKED", "Diblokir"],
    ["ARCHIVED", "Diarsipkan"],
  ];

  for (const [status, label] of expectations) {
    assert.match(source, new RegExp(`ServiceListingStatus\\.${status}`));

    assert.match(source, new RegExp(label));
  }
});

test("Jasa Saya uses the canonical Service media public URL helper for covers", () => {
  const source = normalize(read(uiPath));

  assert.match(
    source,
    /getServiceListingMediaPublicUrl\( listing\.coverStoragePath, \)/,
  );

  assert.doesNotMatch(source, /supabase\.storage/);
});

test("Provider dashboard exposes loading retry empty and pagination states", () => {
  const source = normalize(read(uiPath));

  assert.match(source, /ServiceListingSkeleton/);

  assert.match(source, /Jasa Anda belum dapat dimuat/);

  assert.match(source, /Coba Lagi/);

  assert.match(source, /Belum ada jasa/);

  assert.match(source, /onClick=\{onPreviousPage\}/);

  assert.match(source, /onClick=\{onNextPage\}/);

  assert.match(source, /Sebelumnya/);

  assert.match(source, /Berikutnya/);
});

test("Provider dashboard does not duplicate lifecycle mutation authority", () => {
  const source = [read(hookPath), read(uiPath)].join("\n");

  const forbidden = [
    "pauseServiceListing",
    "resumeServiceListing",
    "archiveServiceListing",
    "deleteServiceListingDraft",
    '"pause_service_listing"',
    '"resume_service_listing"',
    '"archive_service_listing"',
    '"delete_service_listing_draft"',
  ];

  for (const token of forbidden) {
    assert.equal(
      source.includes(token),
      false,
      `Unexpected dashboard mutation token: ${token}`,
    );
  }

  assert.doesNotMatch(source, /\bsupabase\s*\.\s*from\s*\(/);
});

test("Provider dashboard intentionally has no fake client-side status filter", () => {
  const source = normalize(read(uiPath));

  assert.doesNotMatch(source, /Filter status/);

  assert.doesNotMatch(source, /Semua Status/);

  assert.doesNotMatch(source, /onStatusChange/);

  assert.doesNotMatch(source, /<select/);
});
