const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const ROOT =
  path.resolve(
    __dirname,
    "..",
    "..",
  );

function read(relativePath) {
  return fs.readFileSync(
    path.join(
      ROOT,
      relativePath,
    ),
    "utf8",
  );
}

const modal =
  read(
    "src/features/reports/components/ReportServiceListingModal.tsx",
  );

const action =
  read(
    "src/features/service-listings/components/ServiceListingReportAction.tsx",
  );

const detail =
  read(
    "src/features/service-listings/ServiceListingDetailPageUI.tsx",
  );

const reportsPage =
  read(
    "src/features/admin/pages/ReportsPage.tsx",
  );

const reportDetail =
  read(
    "src/app/admin/reports/[id]/page.tsx",
  );

test(
  "Service Listing report modal uses trusted report service",
  () => {
    assert.match(
      modal,
      /submitServiceListingReport/,
    );

    assert.match(
      modal,
      /REPORT_REASONS/,
    );

    assert.doesNotMatch(
      modal,
      /reporterId/,
    );

    assert.doesNotMatch(
      modal,
      /providerId/,
    );

    assert.doesNotMatch(
      modal,
      /reportedUserId/,
    );
  },
);

test(
  "Service Listing report action owns client modal state",
  () => {
    assert.match(
      action,
      /"use client"/,
    );

    assert.match(
      action,
      /ReportServiceListingModal/,
    );

    assert.match(
      action,
      /Laporkan Jasa/,
    );
  },
);

test(
  "public Service detail wires the report action without becoming report authority",
  () => {
    assert.match(
      detail,
      /ServiceListingReportAction/,
    );

    assert.match(
      detail,
      /serviceListingId=\{listing\.id\}/,
    );

    assert.doesNotMatch(
      detail,
      /create_service_listing_report/,
    );
  },
);

test(
  "admin Reports list no longer reads reports through browser Supabase",
  () => {
    assert.doesNotMatch(
      reportsPage,
      /@\/lib\/supabase\/client/,
    );

    assert.match(
      reportsPage,
      /\/api\/admin\/reports/,
    );

    assert.doesNotMatch(
      reportsPage,
      /\.from\(\s*"reports"\s*\)/,
    );
  },
);

test(
  "admin Reports list recognizes Service Listing context",
  () => {
    assert.match(
      reportsPage,
      /service_listing/,
    );

    assert.match(
      reportsPage,
      /Laporan Jasa/,
    );

    assert.match(
      reportsPage,
      /BriefcaseBusiness/,
    );
  },
);

test(
  "admin Report detail uses server API for report reads and status updates",
  () => {
    assert.doesNotMatch(
      reportDetail,
      /@\/lib\/supabase\/client/,
    );

    assert.doesNotMatch(
      reportDetail,
      /updateReportStatus/,
    );

    assert.match(
      reportDetail,
      /\/api\/admin\/reports\//,
    );

    assert.match(
      reportDetail,
      /method:\s*"PATCH"/,
    );
  },
);

test(
  "admin Report detail moderates Service Listing through canonical moderation API",
  () => {
    assert.match(
      reportDetail,
      /\/api\/admin\/services\//,
    );

    assert.match(
      reportDetail,
      /"BLOCK"/,
    );

    assert.match(
      reportDetail,
      /"UNBLOCK"/,
    );

    assert.doesNotMatch(
      reportDetail,
      /\.from\(\s*"service_listings"\s*\)[\s\S]*\.update\(/,
    );
  },
);

test(
  "admin Report detail renders Service Listing investigation context",
  () => {
    assert.match(
      reportDetail,
      /Jasa Dilaporkan/,
    );

    assert.match(
      reportDetail,
      /Moderasi Jasa/,
    );

    assert.match(
      reportDetail,
      /service_listing/,
    );
  },
);