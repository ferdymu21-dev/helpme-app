const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

const readRepository = read(
  "src/features/admin/service-listings/repositories/admin-service-listing.repository.ts",
);

const moderationRepository = read(
  "src/features/admin/service-listings/repositories/admin-service-listing-moderation.repository.ts",
);

const listService = read(
  "src/features/admin/service-listings/services/get-admin-service-listings.service.ts",
);

const detailService = read(
  "src/features/admin/service-listings/services/get-admin-service-listing-detail.service.ts",
);

const moderationService = read(
  "src/features/admin/service-listings/services/moderate-admin-service-listing.service.ts",
);

const listRoute = read("src/app/api/admin/services/route.ts");

const detailRoute = read("src/app/api/admin/services/[id]/route.ts");

const moderationRoute = read(
  "src/app/api/admin/services/[id]/moderation/route.ts",
);

test("admin Service Listing repositories are server-only and use adminSupabase", () => {
  for (const source of [readRepository, moderationRepository]) {
    assert.match(source, /import\s+"server-only"/);

    assert.match(source, /adminSupabase/);

    assert.doesNotMatch(source, /@\/lib\/supabase\/client/);
  }
});

test("all admin Service Listing services require server-side admin authorization", () => {
  for (const source of [listService, detailService, moderationService]) {
    assert.match(source, /requireAdmin/);

    assert.match(source, /await\s+requireAdmin\(\)/);

    assert.doesNotMatch(source, /@\/lib\/supabase\/client/);
  }
});

test("admin moderation repository uses only dedicated M16 moderation RPCs", () => {
  assert.match(moderationRepository, /\.rpc\(\s*"admin_block_service_listing"/);

  assert.match(
    moderationRepository,
    /\.rpc\(\s*"admin_unblock_service_listing"/,
  );

  assert.doesNotMatch(
    moderationRepository,
    /\.from\(\s*"service_listings"\s*\)[\s\S]*\.update\(/,
  );

  assert.doesNotMatch(
    moderationRepository,
    /\.from\(\s*"service_listings"\s*\)[\s\S]*\.delete\(/,
  );
});

test("admin read repository only reads Service Listing and provider data", () => {
  assert.match(readRepository, /\.from\(\s*"service_listings"\s*\)/);

  assert.match(readRepository, /\.from\(\s*"users"\s*\)/);

  assert.doesNotMatch(readRepository, /\.update\(/);

  assert.doesNotMatch(readRepository, /\.insert\(/);

  assert.doesNotMatch(readRepository, /\.delete\(/);
});

test("admin Service Listing API routes delegate through service layer", () => {
  assert.match(listRoute, /getAdminServiceListingsService/);

  assert.match(detailRoute, /getAdminServiceListingDetailService/);

  assert.match(moderationRoute, /moderateAdminServiceListingService/);

  for (const source of [listRoute, detailRoute, moderationRoute]) {
    assert.doesNotMatch(source, /adminSupabase/);

    assert.doesNotMatch(source, /@\/lib\/supabase\/client/);
  }
});

test("admin Service Listing APIs are private no-store", () => {
  for (const source of [listRoute, detailRoute, moderationRoute]) {
    assert.match(source, /private,\s*no-store/);
  }
});

test("admin Service Listing application boundary does not mutate publication payments", () => {
  const combined = [
    readRepository,
    moderationRepository,
    listService,
    detailService,
    moderationService,
    listRoute,
    detailRoute,
    moderationRoute,
  ].join("\n");

  assert.doesNotMatch(
    combined,
    /\.from\(\s*"service_listing_payments"\s*\)[\s\S]*\.update\(/,
  );

  assert.doesNotMatch(combined, /payment_status\s*:/);
});

test("moderation payload only accepts BLOCK or UNBLOCK and requires a block reason", () => {
  assert.match(moderationService, /action\s*!==\s*"BLOCK"/);

  assert.match(moderationService, /action\s*!==\s*"UNBLOCK"/);

  assert.match(moderationService, /BLOCK_REASON_REQUIRED/);

  assert.match(moderationService, /BLOCK_REASON_TOO_LONG/);
});
