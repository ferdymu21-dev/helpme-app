const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..", "..");

const migrationPath = path.join(
  ROOT,
  "database",
  "forward-migrations",
  "20260913_16_service_admin_moderation.sql",
);

const sql = fs.readFileSync(migrationPath, "utf8");

function getFunctionBlock(name) {
  const pattern = new RegExp(
    `create\\s+or\\s+replace\\s+function\\s+public\\.${name}\\s*\\([\\s\\S]*?\\$\\$;`,
    "i",
  );

  const match = sql.match(pattern);

  assert.ok(match, `Function not found: ${name}`);

  return match[0];
}

test("M16 defines all three Service admin/report authorities", () => {
  assert.match(
    sql,
    /create\s+or\s+replace\s+function\s+public\.create_service_listing_report/i,
  );

  assert.match(
    sql,
    /create\s+or\s+replace\s+function\s+public\.admin_block_service_listing/i,
  );

  assert.match(
    sql,
    /create\s+or\s+replace\s+function\s+public\.admin_unblock_service_listing/i,
  );
});

test("all M16 authorities are SECURITY DEFINER with empty search_path", () => {
  const functions = [
    "create_service_listing_report",
    "admin_block_service_listing",
    "admin_unblock_service_listing",
  ];

  for (const name of functions) {
    const block = getFunctionBlock(name);

    assert.match(
      block,
      /security\s+definer/i,
      `${name} must be SECURITY DEFINER`,
    );

    assert.match(
      block,
      /set\s+search_path\s+to\s+''/i,
      `${name} must use empty search_path`,
    );
  }
});

test("Service Listing report derives reporter from auth.uid and provider from listing", () => {
  const block = getFunctionBlock("create_service_listing_report");

  assert.match(block, /v_reporter_id\s*:=\s*auth\.uid\(\)/i);

  assert.match(
    block,
    /select\s+sl\.provider_id[\s\S]*from\s+public\.service_listings/i,
  );

  assert.doesNotMatch(block, /p_reporter_id/i);

  assert.doesNotMatch(block, /p_provider_id/i);

  assert.match(block, /CANNOT_REPORT_OWN_SERVICE_LISTING/i);
});

test("Service Listing report prevents concurrent duplicate pending reports", () => {
  const block = getFunctionBlock("create_service_listing_report");

  assert.match(block, /pg_catalog\.pg_advisory_xact_lock/i);

  assert.match(block, /r\.reporter_id\s*=\s*v_reporter_id/i);

  assert.match(block, /r\.service_listing_id\s*=\s*p_service_listing_id/i);

  assert.match(block, /r\.status\s*=\s*'PENDING'/i);

  assert.match(block, /SERVICE_LISTING_REPORT_ALREADY_PENDING/i);
});

test("Service Listing report writes listing and provider context atomically", () => {
  const block = getFunctionBlock("create_service_listing_report");

  assert.match(block, /insert\s+into\s+public\.reports/i);

  assert.match(block, /service_listing_id/i);

  assert.match(block, /reported_user_id/i);

  assert.match(block, /v_provider_id/i);

  assert.match(block, /'PENDING'/i);
});

test("Service Listing report RPC is authenticated-callable but admin moderation RPCs are not", () => {
  assert.match(
    sql,
    /grant\s+execute\s+on\s+function\s+public\.create_service_listing_report\s*\(\s*uuid\s*,\s*text\s*,\s*text\s*\)\s+to\s+authenticated\s*;/i,
  );

  assert.doesNotMatch(
    sql,
    /grant\s+execute\s+on\s+function\s+public\.admin_block_service_listing\s*\(\s*uuid\s*,\s*text\s*\)\s+to\s+authenticated\s*;/i,
  );

  assert.doesNotMatch(
    sql,
    /grant\s+execute\s+on\s+function\s+public\.admin_unblock_service_listing\s*\(\s*uuid\s*\)\s+to\s+authenticated\s*;/i,
  );
});

test("admin moderation RPCs are service-role only", () => {
  assert.match(
    sql,
    /grant\s+execute\s+on\s+function\s+public\.admin_block_service_listing\s*\(\s*uuid\s*,\s*text\s*\)\s+to\s+service_role\s*;/i,
  );

  assert.match(
    sql,
    /grant\s+execute\s+on\s+function\s+public\.admin_unblock_service_listing\s*\(\s*uuid\s*\)\s+to\s+service_role\s*;/i,
  );
});

test("BLOCK accepts only ACTIVE PAUSED or EXPIRED lifecycle states", () => {
  const block = getFunctionBlock("admin_block_service_listing");

  assert.match(
    block,
    /v_status\s+not\s+in\s*\(\s*'ACTIVE'\s*,\s*'PAUSED'\s*,\s*'EXPIRED'\s*\)/i,
  );

  assert.match(block, /blocked_from_status\s*=\s*v_status/i);

  assert.match(block, /status\s*=\s*'BLOCKED'/i);

  assert.match(block, /BLOCK_REASON_REQUIRED/i);

  assert.match(block, /SERVICE_LISTING_ALREADY_BLOCKED/i);
});

test("BLOCK locks the listing row before evaluating moderation state", () => {
  const block = getFunctionBlock("admin_block_service_listing");

  assert.match(block, /from\s+public\.service_listings[\s\S]*for\s+update/i);
});

test("UNBLOCK is expiry-aware and cannot resurrect elapsed publication", () => {
  const block = getFunctionBlock("admin_unblock_service_listing");

  assert.match(block, /v_expires_at\s*<=\s*v_now/i);

  assert.match(block, /v_target_status\s*:=\s*'EXPIRED'/i);

  assert.match(block, /v_blocked_from_status\s*=\s*'EXPIRED'/i);

  assert.match(block, /v_target_status\s*:=\s*v_blocked_from_status/i);
});

test("UNBLOCK preserves PAUSED semantics and clears moderation metadata", () => {
  const block = getFunctionBlock("admin_unblock_service_listing");

  assert.match(block, /v_target_status\s*=\s*'PAUSED'/i);

  assert.match(block, /blocked_at\s*=\s*null/i);

  assert.match(block, /blocked_reason\s*=\s*null/i);

  assert.match(block, /blocked_from_status\s*=\s*null/i);

  assert.match(block, /SERVICE_LISTING_NOT_BLOCKED/i);
});

test("M16 does not mutate Service Request or publication payment lifecycle", () => {
  assert.doesNotMatch(sql, /update\s+public\.service_requests/i);

  assert.doesNotMatch(sql, /delete\s+from\s+public\.service_requests/i);

  assert.doesNotMatch(sql, /update\s+public\.service_listing_payments/i);

  assert.doesNotMatch(sql, /delete\s+from\s+public\.service_listing_payments/i);

  assert.doesNotMatch(sql, /payment_status\s*=/i);
});

test("M16 does not expose raw table grants for Service Listing moderation", () => {
  assert.doesNotMatch(
    sql,
    /grant\s+update[\s\S]*on\s+(?:table\s+)?public\.service_listings[\s\S]*to\s+authenticated/i,
  );

  assert.doesNotMatch(
    sql,
    /grant\s+delete[\s\S]*on\s+(?:table\s+)?public\.service_listings[\s\S]*to\s+authenticated/i,
  );
});
test("Service Listing report only accepts currently public ACTIVE listings", () => {
  const block = getFunctionBlock("create_service_listing_report");

  assert.match(block, /sl\.status\s*=\s*'ACTIVE'/i);

  assert.match(
    block,
    /sl\.expires_at\s*>\s*pg_catalog\.statement_timestamp\(\)/i,
  );

  assert.match(block, /SERVICE_LISTING_NOT_REPORTABLE/i);
});

test("Service Listing report validates reason inside database authority", () => {
  const block = getFunctionBlock("create_service_listing_report");

  for (const reason of [
    "SPAM",
    "SCAM",
    "FAKE_TASK",
    "INAPPROPRIATE",
    "HARASSMENT",
    "OTHER",
  ]) {
    assert.match(block, new RegExp(`'${reason}'`));
  }

  assert.match(block, /INVALID_REPORT_REASON/i);
});

test("M16 migration hash is locked after F13 security hardening", () => {
  const cryptoForHash = require("node:crypto");
  const fsForHash = require("node:fs");
  const pathForHash = require("node:path");

  const migrationPath = pathForHash.resolve(
    __dirname,
    "..",
    "..",
    "database",
    "forward-migrations",
    "20260913_16_service_admin_moderation.sql",
  );

  const actualHash = cryptoForHash
    .createHash("sha256")
    .update(fsForHash.readFileSync(migrationPath))
    .digest("hex")
    .toUpperCase();

  assert.equal(
    actualHash,
    "9468469ADFA403D5C6D67BA3F519092529B3710225610912F74CD5FD45C5364B",
  );
});
