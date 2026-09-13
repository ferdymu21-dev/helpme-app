const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

const repository = read(
  "src/features/admin/reports/repositories/admin-report.repository.ts",
);

const listService = read(
  "src/features/admin/reports/services/get-admin-reports.service.ts",
);

const detailService = read(
  "src/features/admin/reports/services/get-admin-report-detail.service.ts",
);

const updateService = read(
  "src/features/admin/reports/services/update-admin-report.service.ts",
);

const listRoute = read("src/app/api/admin/reports/route.ts");

const detailRoute = read("src/app/api/admin/reports/[id]/route.ts");

const listingReportService = read(
  "src/features/reports/services/service-listing-report.service.ts",
);

test("admin Reports repository is server-only and uses adminSupabase", () => {
  assert.match(repository, /import\s+"server-only"/);

  assert.match(repository, /adminSupabase/);

  assert.doesNotMatch(repository, /@\/lib\/supabase\/client/);
});

test("admin Reports repository understands Task User and Service Listing contexts", () => {
  assert.match(repository, /\.from\(\s*"reports"\s*\)/);

  assert.match(repository, /\.from\(\s*"users"\s*\)/);

  assert.match(repository, /\.from\(\s*"tasks"\s*\)/);

  assert.match(repository, /\.from\(\s*"service_listings"\s*\)/);

  assert.match(repository, /service_listing_id/);

  assert.match(repository, /SERVICE_LISTING/);
});

test("all admin Report services require server-side admin authorization", () => {
  for (const source of [listService, detailService, updateService]) {
    assert.match(source, /requireAdmin/);

    assert.match(source, /await\s+requireAdmin\(\)/);

    assert.doesNotMatch(source, /@\/lib\/supabase\/client/);
  }
});

test("admin Report update only mutates reports and not marketplace targets", () => {
  assert.match(
    repository,
    /\.from\(\s*"reports"\s*\)(?:(?!;)[\s\S])*\.update\(/,
  );

  assert.doesNotMatch(
    repository,
    /\.from\(\s*"service_listings"\s*\)(?:(?!;)[\s\S])*\.update\(/,
  );

  assert.doesNotMatch(
    repository,
    /\.from\(\s*"tasks"\s*\)(?:(?!;)[\s\S])*\.update\(/,
  );

  assert.doesNotMatch(
    repository,
    /\.from\(\s*"users"\s*\)(?:(?!;)[\s\S])*\.update\(/,
  );
});

test("admin Report update accepts only review terminal workflow statuses", () => {
  for (const status of ["REVIEWED", "RESOLVED", "REJECTED"]) {
    assert.match(updateService, new RegExp(`"${status}"`));
  }

  assert.match(updateService, /INVALID_REPORT_STATUS/);
});

test("admin Report APIs delegate through service layer and are private no-store", () => {
  assert.match(listRoute, /getAdminReportsService/);

  assert.match(detailRoute, /getAdminReportDetailService/);

  assert.match(detailRoute, /updateAdminReportService/);

  for (const source of [listRoute, detailRoute]) {
    assert.match(source, /private,\s*no-store/);

    assert.doesNotMatch(source, /adminSupabase/);

    assert.doesNotMatch(source, /@\/lib\/supabase\/client/);
  }
});

test("Service Listing report creation uses only the trusted M16 RPC", () => {
  assert.match(
    listingReportService,
    /\.rpc\(\s*"create_service_listing_report"/,
  );

  assert.doesNotMatch(
    listingReportService,
    /\.from\(\s*"reports"\s*\)[\s\S]*\.insert\(/,
  );
});

test("Service Listing report browser payload never supplies reporter or provider identity", () => {
  assert.doesNotMatch(listingReportService, /reporterId/);

  assert.doesNotMatch(listingReportService, /reportedUserId/);

  assert.doesNotMatch(listingReportService, /providerId/);

  assert.doesNotMatch(listingReportService, /p_reporter_id/);

  assert.doesNotMatch(listingReportService, /p_provider_id/);
});

test("Service Listing report reasons reuse the existing report contract", () => {
  assert.match(listingReportService, /REPORT_REASONS/);

  assert.match(listingReportService, /INVALID_REPORT_REASON/);
});
