const test = require("node:test");

const assert = require("node:assert/strict");

const fs = require("node:fs");

const path = require("node:path");

const ROOT = path.resolve(__dirname, "../..");

function readRepoFile(...segments) {
  return fs.readFileSync(path.join(ROOT, ...segments), "utf8");
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ");
}

function countOccurrences(source, needle) {
  return source.split(needle).length - 1;
}

const discoveryHookSource = readRepoFile(
  "src",
  "features",
  "service-listings",
  "hooks",
  "useServiceDiscovery.ts",
);

const discoveryUiSource = readRepoFile(
  "src",
  "features",
  "service-listings",
  "ServiceDiscoveryPageUI.tsx",
);

const discoveryServiceSource = readRepoFile(
  "src",
  "features",
  "service-listings",
  "services",
  "get-public-service-listings.service.ts",
);

const discoveryRepositorySource = readRepoFile(
  "src",
  "features",
  "service-listings",
  "repositories",
  "service-listing-read.repository.ts",
);

const homePageSource = readRepoFile(
  "src",
  "app",
  "(protected)",
  "home",
  "page.tsx",
);

const desktopHomeViewSource = readRepoFile(
  "src",
  "components",
  "home",
  "desktop",
  "DesktopHomeView.tsx",
);

const mobileHomeViewSource = readRepoFile(
  "src",
  "components",
  "home",
  "mobile",
  "MobileHomeView.tsx",
);

const serviceHomeFeedSource = readRepoFile(
  "src",
  "features",
  "service-listings",
  "ServiceHomeFeed.tsx",
);

const desktopQuickActionsSource = readRepoFile(
  "src",
  "components",
  "home",
  "desktop",
  "DesktopQuickActions.tsx",
);

const mobileQuickActionsSource = readRepoFile(
  "src",
  "components",
  "home",
  "mobile",
  "MobileQuickActions.tsx",
);

const desktopSidebarSource = readRepoFile(
  "src",
  "components",
  "layout",
  "desktop",
  "DesktopSidebar.tsx",
);

test("public Service discovery keeps the safe RPC-backed read pipeline", () => {
  assert.match(discoveryHookSource, /getPublicServiceListingsService/);

  assert.match(discoveryServiceSource, /getPublicServiceListingsRepository/);

  assert.match(discoveryRepositorySource, /get_public_service_listings/);

  assert.doesNotMatch(
    discoveryHookSource,
    /\.from\s*\(\s*["']service_listings["']\s*\)/,
  );
});

test("Service discovery URL contract owns q, mode, and page", () => {
  assert.match(discoveryHookSource, /params\.set\s*\(\s*["']q["']/);

  assert.match(discoveryHookSource, /params\.set\s*\(\s*["']mode["']/);

  assert.match(discoveryHookSource, /params\.set\s*\(\s*["']page["']/);

  assert.match(discoveryHookSource, /searchParams\.get\s*\(\s*["']q["']/);

  assert.match(discoveryHookSource, /searchParams\.get\s*\(\s*["']mode["']/);

  assert.match(discoveryHookSource, /searchParams\.get\s*\(\s*["']page["']/);
});

test("Service discovery omits default URL values and validates URL input", () => {
  const normalized = normalizeWhitespace(discoveryHookSource);

  assert.ok(normalized.includes("if (normalizedSearch.length > 0)"));

  assert.ok(normalized.includes("if (serviceMode)"));

  assert.ok(normalized.includes("if (page > DEFAULT_PAGE)"));

  assert.match(discoveryHookSource, /case\s+ServiceMode\.ONLINE/);

  assert.match(discoveryHookSource, /case\s+ServiceMode\.OFFLINE/);

  assert.match(discoveryHookSource, /case\s+ServiceMode\.BOTH/);

  assert.match(discoveryHookSource, /Number\.isSafeInteger/);
});

test("Service discovery separates user history navigation from internal URL correction", () => {
  assert.equal(countOccurrences(discoveryHookSource, "router.replace("), 2);

  assert.equal(countOccurrences(discoveryHookSource, "router.push("), 5);

  assert.match(discoveryHookSource, /router\.replace\s*\(\s*canonicalUrl/);

  assert.match(discoveryHookSource, /router\.push\s*\(\s*["']\/services["']/);
});

test("Service discovery resets page for search and mode changes", () => {
  const normalized = normalizeWhitespace(discoveryHookSource);

  assert.ok(
    normalized.includes("search: nextSearch, serviceMode, page: DEFAULT_PAGE"),
  );

  assert.ok(
    normalized.includes(
      "search: searchQuery, serviceMode: value, page: DEFAULT_PAGE",
    ),
  );
});

test("Service marketplace exposes loading, retryable error, genuine empty, and filtered empty states", () => {
  assert.match(discoveryUiSource, /animate-pulse/);

  assert.match(discoveryUiSource, /Coba lagi/);

  assert.match(discoveryUiSource, /Belum ada jasa tersedia/);

  assert.match(discoveryUiSource, /Tidak ada jasa yang cocok/);

  assert.match(discoveryUiSource, /Hapus filter/);

  assert.match(discoveryUiSource, /discovery\.hasActiveFilters/);

  assert.match(discoveryUiSource, /discovery\.clearFilters/);
});

test("Service marketplace keeps a Suspense boundary for search parameter state", () => {
  assert.match(
    discoveryUiSource,
    /import[\s\S]*Suspense[\s\S]*from\s+["']react["']/,
  );

  assert.match(discoveryUiSource, /<Suspense/);

  assert.match(discoveryUiSource, /<ServiceDiscoveryPageContent\s*\/>/);
});

test("Home feed URL defaults to Task and recognizes the Service feed", () => {
  const normalized = normalizeWhitespace(homePageSource);

  assert.ok(
    normalized.includes(
      'searchParams.get("feed") === "services" ? "services" : "tasks"',
    ),
  );

  assert.match(
    homePageSource,
    /router\.replace\s*\(\s*`\/home\?\$\{params\.toString\(\)\}`/,
  );
});

test("Home Task geolocation, loading, and realtime stay isolated from the Service feed", () => {
  assert.match(
    homePageSource,
    /activeFeed\s*!==\s*["']tasks["']\s*\|\|\s*!locating/,
  );

  assert.ok(
    countOccurrences(
      homePageSource,
      'activeFeed !== "tasks" || !coordinates',
    ) >= 2,
  );

  assert.match(
    homePageSource,
    /supabase\.channel\s*\(\s*["']home-tasks-realtime["']\s*\)/,
  );
});

test("Home renders Service discovery only when the Service feed is selected", () => {
  for (const source of [desktopHomeViewSource, mobileHomeViewSource]) {
    assert.match(source, /activeFeed\s*===\s*["']tasks["']/);

    assert.match(source, /<ServiceHomeFeed/);
  }

  assert.match(serviceHomeFeedSource, /useHomeServiceFeed/);

  assert.doesNotMatch(serviceHomeFeedSource, /navigator\.geolocation/);

  assert.doesNotMatch(serviceHomeFeedSource, /postgres_changes/);

  assert.doesNotMatch(serviceHomeFeedSource, /supabase\.channel/);
});

test("Service discovery navigation exposes Cari Jasa and Tawarkan Jasa", () => {
  const sidebar = normalizeWhitespace(desktopSidebarSource);

  const desktopActions = normalizeWhitespace(desktopQuickActionsSource);

  const mobileActions = normalizeWhitespace(mobileQuickActionsSource);

  assert.ok(
    sidebar.includes(
      'label: "Cari Jasa", description: "Temukan layanan dari Provider HelpMe", href: "/services"',
    ),
  );

  for (const source of [desktopActions, mobileActions]) {
    assert.ok(source.includes('href="/my-services/new"'));

    assert.ok(source.includes("Tawarkan Jasa"));
  }
});

test("Home quick action copy does not expose internal implementation notes", () => {
  assert.doesNotMatch(desktopQuickActionsSource, /ini saya improf/i);

  assert.doesNotMatch(mobileQuickActionsSource, /ini saya improf/i);
});
