const test = require("node:test");

const assert = require("node:assert/strict");

const fs = require("node:fs");

const path = require("node:path");

const ROOT = path.resolve(__dirname, "../..");

function repoPath(...segments) {
  return path.join(ROOT, ...segments);
}

function readRepoFile(...segments) {
  return fs.readFileSync(repoPath(...segments), "utf8");
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ");
}

const migrationSource = readRepoFile(
  "database",
  "forward-migrations",
  "20260912_10_service_listing_public_media.sql",
);

const mediaRepositorySource = readRepoFile(
  "src",
  "features",
  "service-listings",
  "repositories",
  "service-listing-media.repository.ts",
);

const publicMediaServiceSource = readRepoFile(
  "src",
  "features",
  "service-listings",
  "services",
  "get-public-service-listing-media.service.ts",
);

const publicDetailServiceSource = readRepoFile(
  "src",
  "features",
  "service-listings",
  "services",
  "get-public-service-listing-detail.service.ts",
);

const detailHookSource = readRepoFile(
  "src",
  "features",
  "service-listings",
  "hooks",
  "usePublicServiceListingDetail.ts",
);

const detailUiSource = readRepoFile(
  "src",
  "features",
  "service-listings",
  "ServiceListingDetailPageUI.tsx",
);

const publicRouteSource = readRepoFile(
  "src",
  "app",
  "services",
  "[id]",
  "page.tsx",
);

const discoveryUiSource = readRepoFile(
  "src",
  "features",
  "service-listings",
  "ServiceDiscoveryPageUI.tsx",
);

const homeServiceFeedSource = readRepoFile(
  "src",
  "features",
  "service-listings",
  "ServiceHomeFeed.tsx",
);

test("M10 exposes public Service media through a dedicated safe RPC", () => {
  const normalized = normalizeWhitespace(migrationSource);

  assert.match(migrationSource, /get_public_service_listing_media/);

  assert.ok(
    normalized.includes(
      "language sql stable security definer set search_path to ''",
    ),
  );

  assert.match(
    migrationSource,
    /from\s+public\.service_listing_images\s+as\s+sli/i,
  );

  assert.match(migrationSource, /join\s+public\.service_listings\s+as\s+sl/i);

  assert.match(migrationSource, /join\s+public\.users\s+as\s+u/i);
});

test("M10 only exposes media for currently discoverable ACTIVE listings", () => {
  const normalized = normalizeWhitespace(migrationSource);

  assert.ok(normalized.includes("and sl.status = 'ACTIVE'"));

  assert.ok(normalized.includes("and sl.expires_at > statement_timestamp()"));

  assert.match(migrationSource, /u\.is_banned/);

  assert.match(migrationSource, /u\.is_suspended/);

  assert.match(migrationSource, /u\.suspended_until/);
});

test("M10 limits public media projection to COVER and PORTFOLIO", () => {
  const normalized = normalizeWhitespace(migrationSource);

  assert.ok(normalized.includes("sli.kind in ( 'COVER', 'PORTFOLIO' )"));

  assert.match(migrationSource, /when\s+sli\.kind\s*=\s*'COVER'/i);

  assert.match(migrationSource, /sli\.sort_order/);
});

test("M10 revokes default execution and grants only the intended RPC execution roles", () => {
  const normalized = normalizeWhitespace(migrationSource);

  assert.ok(
    normalized.includes("from PUBLIC, anon, authenticated, service_role;"),
  );

  assert.ok(normalized.includes("to anon, authenticated, service_role;"));

  assert.doesNotMatch(
    migrationSource,
    /grant\s+(select|insert|update|delete)[\s\S]*service_listing_images/i,
  );
});

test("public Service media application layer reuses the existing validated media contract", () => {
  assert.match(mediaRepositorySource, /getPublicServiceListingMediaRepository/);

  assert.match(mediaRepositorySource, /get_public_service_listing_media/);

  assert.match(mediaRepositorySource, /parseServiceListingMediaRpcRows/);

  assert.match(mediaRepositorySource, /mapServiceListingMediaRpcRow/);

  assert.match(
    publicMediaServiceSource,
    /validateAndNormalizeServiceListingMediaListingId/,
  );

  assert.match(
    publicMediaServiceSource,
    /getPublicServiceListingMediaRepository/,
  );
});

test("public Service detail service keeps listing identity normalized before repository access", () => {
  const normalized = normalizeWhitespace(publicDetailServiceSource);

  assert.ok(
    normalized.includes("const normalizedListingId = listingId.trim();"),
  );

  assert.match(
    publicDetailServiceSource,
    /normalizedListingId\.length\s*===\s*0/,
  );

  assert.match(
    publicDetailServiceSource,
    /getPublicServiceListingDetailRepository/,
  );
});

test("public Service detail hook loads detail and media together with stale-request protection", () => {
  assert.match(detailHookSource, /Promise\.all/);

  assert.match(detailHookSource, /getPublicServiceListingDetailService/);

  assert.match(detailHookSource, /getPublicServiceListingMediaService/);

  assert.match(detailHookSource, /requestIdRef/);

  assert.match(detailHookSource, /cancelled/);
});

test("public Service detail hook separates invalid, not-found, error, and ready states", () => {
  assert.match(detailHookSource, /"IDLE"/);

  assert.match(detailHookSource, /"READY"/);

  assert.match(detailHookSource, /"NOT_FOUND"/);

  assert.match(detailHookSource, /"ERROR"/);

  assert.match(detailHookSource, /tryNormalizeServiceListingRouteId/);

  assert.match(detailHookSource, /nextListing/);
});

test("public Service detail hook derives cover and ordered portfolio from validated media", () => {
  assert.match(detailHookSource, /ServiceListingImageKind\.COVER/);

  assert.match(detailHookSource, /ServiceListingImageKind\.PORTFOLIO/);

  assert.match(detailHookSource, /first\.sortOrder\s*-\s*second\.sortOrder/);
});

test("public Service detail route remains outside the protected route group", () => {
  assert.equal(
    fs.existsSync(repoPath("src", "app", "services", "[id]", "page.tsx")),
    true,
  );

  assert.equal(
    fs.existsSync(
      repoPath("src", "app", "(protected)", "services", "[id]", "page.tsx"),
    ),
    false,
  );

  assert.match(publicRouteSource, /usePublicServiceListingDetail/);

  assert.match(publicRouteSource, /ServiceListingDetailPageUI/);
});

test("public Service detail UI renders the core marketplace information", () => {
  for (const value of [
    "Tentang jasa",
    "Yang akan Anda dapatkan",
    "Yang perlu disiapkan",
    "Portfolio",
    "Provider",
    "Mulai dari",
    "Harga dapat dinegosiasikan",
    "Jasa aktif sampai",
  ]) {
    assert.ok(
      detailUiSource.includes(value),
      `Expected detail UI to contain: ${value}`,
    );
  }

  assert.match(detailUiSource, /listing\.description/);

  assert.match(detailUiSource, /listing\.deliverables/);

  assert.match(detailUiSource, /listing\.customerPreparation/);

  assert.match(detailUiSource, /listing\.provider/);
});

test("public Service detail UI hides location for ONLINE-only listings", () => {
  const normalized = normalizeWhitespace(detailUiSource);

  assert.ok(normalized.includes("listing.serviceMode !== ServiceMode.ONLINE"));

  assert.match(detailUiSource, /listing\.locationName/);
});

test("Minta Jasa enters the canonical Request flow without mutating from public detail", () => {
  assert.ok(detailUiSource.includes("Minta Jasa"));

  assert.match(
    detailUiSource,
    /\/services\/\$\{encodeURIComponent\(listing\.id\)\}\/request/,
  );

  assert.doesNotMatch(detailUiSource, /createServiceRequest/i);

  assert.doesNotMatch(detailHookSource, /createServiceRequest/i);
});
test("public Service detail implementation performs no raw public table reads", () => {
  for (const source of [
    publicMediaServiceSource,
    publicDetailServiceSource,
    detailHookSource,
    detailUiSource,
  ]) {
    assert.doesNotMatch(source, /\.from\s*\(\s*["']service_listings["']\s*\)/);

    assert.doesNotMatch(
      source,
      /\.from\s*\(\s*["']service_listing_images["']\s*\)/,
    );

    assert.doesNotMatch(source, /\.from\s*\(\s*["']users["']\s*\)/);
  }
});

test("Service discovery and Home Service cards continue linking to the public detail route", () => {
  assert.ok(discoveryUiSource.includes("/services/${"));

  assert.ok(homeServiceFeedSource.includes("/services/${"));
});
