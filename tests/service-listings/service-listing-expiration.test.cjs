const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(
    path.join(root, relativePath),
    "utf8",
  );
}

function normalize(value) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function sha256(relativePath) {
  return crypto
    .createHash("sha256")
    .update(
      fs.readFileSync(
        path.join(root, relativePath),
      ),
    )
    .digest("hex")
    .toUpperCase();
}

function getFunctionBlock(
  relativePath,
  functionName,
) {
  const source = normalize(
    read(relativePath),
  );

  const start = source.indexOf(
    `create or replace function public.${functionName}`,
  );

  assert.notEqual(
    start,
    -1,
    `Function ${functionName} not found in ${relativePath}`,
  );

  const end = source.indexOf(
    "$function$;",
    start,
  );

  assert.notEqual(
    end,
    -1,
    `Function ${functionName} terminator not found in ${relativePath}`,
  );

  return source.slice(
    start,
    end + "$function$;".length,
  );
}

const schedulerRoutePath =
  "src/app/api/internal/service-listings/scheduler/route.ts";

const schedulerRepositoryPath =
  "src/features/service-listings/repositories/expire-due-service-listings.server.repository.ts";

const schedulerServicePath =
  "src/features/service-listings/services/run-service-listing-expiration.server.service.ts";

const expirationAuthorityMigrationPath =
  "database/forward-migrations/20260910_06_service_listing_first_free_entitlement.sql";

const expirationNotificationMigrationPath =
  "database/forward-migrations/20260913_15_service_listing_expiration_notifications.sql";

const notificationTypePath =
  "src/features/notifications/constants/notification-type.ts";

const notificationCategoryMapPath =
  "src/features/notifications/constants/notification-type-category-map.ts";

const notificationConfigPath =
  "src/features/notifications/utils/getNotificationConfig.ts";

const notificationIconPath =
  "src/features/notifications/utils/getNotificationIcon.tsx";

test("Service Listing scheduler fails closed and requires its dedicated bearer secret", () => {
  const source = normalize(
    read(schedulerRoutePath),
  );

  assert.match(
    source,
    /process\.env\.SERVICE_LISTING_CRON_SECRET/,
  );

  assert.match(
    source,
    /if \(!secret\)/,
  );

  assert.match(
    source,
    /status: 503/,
  );

  assert.match(
    source,
    /request\.headers\.get\(\s*"authorization"\s*\)/,
  );

  assert.match(
    source,
    /authorization !== `Bearer \$\{secret\}`/,
  );

  assert.match(
    source,
    /status: 401/,
  );

  assert.match(
    source,
    /runServiceListingExpirationService\(\)/,
  );

  assert.doesNotMatch(
    source,
    /request\.json/,
  );
});

test("Service Listing expiration scheduler keeps the database RPC as the only mutation authority", () => {
  const repository = normalize(
    read(schedulerRepositoryPath),
  );

  const service = normalize(
    read(schedulerServicePath),
  );

  const combined = [
    read(schedulerRoutePath),
    read(schedulerRepositoryPath),
    read(schedulerServicePath),
  ].join("\n");

  assert.match(
    repository,
    /adminSupabase\.rpc\( "expire_due_service_listings", \)/,
  );

  assert.match(
    service,
    /expireDueServiceListingsRepository\(\)/,
  );

  assert.match(
    service,
    /return \{ expired, \}/,
  );

  const forbidden = [
    ".from(",
    ".update(",
    "request.json",
    "listingId",
    "providerId",
  ];

  for (const token of forbidden) {
    assert.equal(
      combined.includes(token),
      false,
      `Unexpected scheduler authority token: ${token}`,
    );
  }
});

test("M6 remains authoritative for due ACTIVE and PAUSED Service Listing expiration", () => {
  const rpc = getFunctionBlock(
    expirationAuthorityMigrationPath,
    "expire_due_service_listings()",
  );

  assert.match(
    rpc,
    /status = 'EXPIRED'/,
  );

  assert.match(
    rpc,
    /status in \( 'ACTIVE', 'PAUSED' \)/,
  );

  assert.match(
    rpc,
    /expires_at is not null/,
  );

  assert.match(
    rpc,
    /expires_at <= v_now/,
  );

  assert.match(
    rpc,
    /get diagnostics v_affected = row_count/,
  );

  assert.match(
    rpc,
    /return v_affected/,
  );

  assert.doesNotMatch(
    rpc,
    /PAYMENT_PENDING/,
  );
});

test("M15 only classifies an actual ACTIVE or PAUSED publication expiry as a listing-expired notification", () => {
  const triggerFunction =
    getFunctionBlock(
      expirationNotificationMigrationPath,
      "notify_service_listing_expiration()",
    );

  assert.match(
    triggerFunction,
    /old\.status not in \( 'ACTIVE', 'PAUSED' \)/,
  );

  assert.match(
    triggerFunction,
    /new\.status <> 'EXPIRED'/,
  );

  assert.match(
    triggerFunction,
    /new\.expires_at is null/,
  );

  assert.match(
    triggerFunction,
    /new\.expires_at > statement_timestamp\(\)/,
  );

  assert.doesNotMatch(
    triggerFunction,
    /PAYMENT_PENDING/,
  );

  assert.doesNotMatch(
    triggerFunction,
    /update public\.service_listings/,
  );
});

test("M15 resolves the exact publication period and dedupes expiration per period", () => {
  const triggerFunction =
    getFunctionBlock(
      expirationNotificationMigrationPath,
      "notify_service_listing_expiration()",
    );

  assert.match(
    triggerFunction,
    /from public\.service_listing_publication_periods as pp/,
  );

  assert.match(
    triggerFunction,
    /pp\.service_listing_id = new\.id/,
  );

  assert.match(
    triggerFunction,
    /pp\.provider_id = new\.provider_id/,
  );

  assert.match(
    triggerFunction,
    /pp\.ends_at = new\.expires_at/,
  );

  assert.match(
    triggerFunction,
    /select pp\.id into v_publication_period_id/,
  );

  assert.match(
    triggerFunction,
    /'service-listing-publication:' \|\| v_publication_period_id::text \|\| ':expired'/,
  );

  assert.match(
    triggerFunction,
    /if v_publication_period_id is null then return new;/,
  );
});

test("M15 sends the expiration notification to the Provider with canonical Service Listing context", () => {
  const triggerFunction =
    getFunctionBlock(
      expirationNotificationMigrationPath,
      "notify_service_listing_expiration()",
    );

  assert.match(
    triggerFunction,
    /insert into public\.notifications/,
  );

  assert.match(
    triggerFunction,
    /service_listing_id/,
  );

  assert.match(
    triggerFunction,
    /new\.provider_id/,
  );

  assert.match(
    triggerFunction,
    /'SERVICE_LISTING_EXPIRED'/,
  );

  assert.match(
    triggerFunction,
    /'SERVICE'/,
  );

  assert.match(
    triggerFunction,
    /'\/my-services\/' \|\| new\.id::text \|\| '\/preview'/,
  );

  assert.match(
    triggerFunction,
    /on conflict \( user_id, dedupe_key \).*do nothing/,
  );
});

test("M15 trigger is status-scoped and its SECURITY DEFINER function is not browser-callable", () => {
  const source = normalize(
    read(
      expirationNotificationMigrationPath,
    ),
  );

  assert.match(
    source,
    /create trigger service_listing_expiration_notification_trigger after update of status on public\.service_listings/,
  );

  assert.match(
    source,
    /security definer set search_path = ''/,
  );

  assert.match(
    source,
    /revoke all on function public\.notify_service_listing_expiration\(\) from public, anon, authenticated/,
  );

  assert.doesNotMatch(
    source,
    /grant execute on function public\.notify_service_listing_expiration/,
  );
});

test("SERVICE_LISTING_EXPIRED is a canonical SERVICE notification type", () => {
  const typeSource = normalize(
    read(notificationTypePath),
  );

  const categorySource = normalize(
    read(notificationCategoryMapPath),
  );

  assert.match(
    typeSource,
    /SERVICE_LISTING_EXPIRED: "SERVICE_LISTING_EXPIRED"/,
  );

  assert.match(
    categorySource,
    /\[NotificationType\.SERVICE_LISTING_EXPIRED\]: NotificationCategory\.SERVICE/,
  );
});

test("SERVICE_LISTING_EXPIRED has explicit notification UI configuration and icon mapping", () => {
  const configSource = normalize(
    read(notificationConfigPath),
  );

  const iconSource = normalize(
    read(notificationIconPath),
  );

  assert.match(
    configSource,
    /case "SERVICE_LISTING_EXPIRED": return \{ icon: Clock3, iconColor: "text-amber-600", backgroundColor: "bg-amber-100", \.\.\.badge, \};/,
  );

  assert.match(
    iconSource,
    /case NotificationType\.SERVICE_LISTING_EXPIRED: return <Clock3 size=\{22\} className="text-amber-600" \/>;/,
  );
});

test("Service Listing expiration notification redirect uses the canonical Provider manage route", () => {
  const source = normalize(
    read(
      expirationNotificationMigrationPath,
    ),
  );

  assert.match(
    source,
    /'\/my-services\/' \|\| new\.id::text \|\| '\/preview'/,
  );

  assert.doesNotMatch(
    source,
    /\/services\/.*\/preview/,
  );
});

test("M11 through M15 remain byte-identical to their locked migration hashes", () => {
  const expected = [
    [
      "database/forward-migrations/20260912_11_service_request_core.sql",
      "5AC614A84201EA792C55764290C9688D8F5726BCC5752D27641D9B5ED864F9F7",
    ],
    [
      "database/forward-migrations/20260912_12_service_agreement_boundary.sql",
      "82A4AE4B6CF4CBF017BB94E58EAEECCE557252E28886D7A61EE23457C6411BF4",
    ],
    [
      "database/forward-migrations/20260913_13_service_request_chat.sql",
      "43A5B5876812B6F1F500A92260D40FAC714290728DB0C9B22E2BEC06DFD543FE",
    ],
    [
      "database/forward-migrations/20260913_14_service_request_notifications.sql",
      "2C01D02AEEF1613C8C99EC259CBB5013E612FBB585ED5203C63611F8F0022195",
    ],
    [
      "database/forward-migrations/20260913_15_service_listing_expiration_notifications.sql",
      "DE1D8D39848C8318AA33ADDBBC9A1C145D0A64472C813EA96659A519DA7E8438",
    ],
  ];

  for (
    const [
      relativePath,
      expectedHash,
    ] of expected
  ) {
    assert.equal(
      sha256(relativePath),
      expectedHash,
      `Migration hash changed: ${relativePath}`,
    );
  }
});