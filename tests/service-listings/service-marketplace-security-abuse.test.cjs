const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");

function repoPath(...parts) {
  return path.join(root, ...parts);
}

function read(relativePath) {
  return fs.readFileSync(repoPath(...relativePath.split("/")), "utf8");
}

function normalizePath(value) {
  return value.split(path.sep).join("/");
}

function walk(directory) {
  const result = [];

  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true,
  })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      result.push(...walk(fullPath));

      continue;
    }

    result.push(fullPath);
  }

  return result;
}

function extractSqlFunction(source, functionName) {
  const marker = `public.${functionName}`;

  const start = source.indexOf(marker);

  assert.ok(start >= 0, `SQL function not found: ${functionName}`);

  const revokeIndex = source.indexOf("\nrevoke all", start);

  const nextFunctionIndex = source.indexOf(
    "\ncreate or replace function",
    start + marker.length,
  );

  const candidates = [revokeIndex, nextFunctionIndex, source.length].filter(
    (value) => value > start,
  );

  return source.slice(start, Math.min(...candidates));
}

const m8 = read(
  "database/forward-migrations/20260910_08_service_listing_media.sql",
);

const m17 = read(
  "database/forward-migrations/20260914_17_service_listing_media_preflight.sql",
);

const repository = read(
  "src/features/service-listings/repositories/service-listing-media.server.repository.ts",
);

const service = read(
  "src/features/service-listings/services/service-listing-media.server.service.ts",
);

const coverRoute = read(
  "src/app/api/service-listings/[id]/media/cover/route.ts",
);

const portfolioRoute = read(
  "src/app/api/service-listings/[id]/media/portfolio/route.ts",
);

const deleteRoute = read(
  "src/app/api/service-listings/[id]/media/[imageId]/route.ts",
);

const publicationRoute = read(
  "src/app/api/service-listings/[id]/publication/route.ts",
);

test("M17 media upload preflight is service-role only and delegates to the locked M8 authority", () => {
  const block = extractSqlFunction(
    m17,
    "assert_service_listing_media_upload_target",
  );

  assert.match(block, /security\s+definer/i);

  assert.match(block, /set\s+search_path\s+to\s+''/i);

  assert.match(
    block,
    /require_editable_service_listing_media_target\s*\(\s*p_listing_id\s*,\s*p_provider_id\s*\)/i,
  );

  assert.match(
    m17,
    /revoke\s+all[\s\S]*?assert_service_listing_media_upload_target[\s\S]*?from\s+PUBLIC\s*,\s*anon\s*,\s*authenticated\s*,\s*service_role\s*;/i,
  );

  assert.match(
    m17,
    /grant\s+execute[\s\S]*?assert_service_listing_media_upload_target[\s\S]*?to\s+service_role\s*;/i,
  );

  assert.doesNotMatch(
    m17,
    /grant\s+execute[\s\S]*?assert_service_listing_media_upload_target[\s\S]*?to\s+(?:anon|authenticated)\s*;/i,
  );
});

test("M8 media authority binds listing ownership and editable lifecycle before trusted metadata mutation", () => {
  const block = extractSqlFunction(
    m8,
    "require_editable_service_listing_media_target",
  );

  assert.match(block, /sl\.id\s*=\s*p_listing_id/i);

  assert.match(block, /sl\.provider_id\s*=\s*p_provider_id/i);

  assert.match(block, /for\s+update/i);

  assert.match(block, /'BLOCKED'/i);

  assert.match(block, /'ARCHIVED'/i);

  assert.match(block, /is_banned/i);

  assert.match(block, /is_suspended/i);
});

test("server media repository exposes upload preflight only through adminSupabase", () => {
  assert.match(repository, /import\s+"server-only"/);

  assert.match(repository, /\badminSupabase\b/);

  assert.match(
    repository,
    /\.rpc\(\s*"assert_service_listing_media_upload_target"/,
  );

  assert.match(repository, /p_listing_id:\s*listingId/);

  assert.match(repository, /p_provider_id:\s*providerId/);
});

test("cover and portfolio authorize before Storage upload while retaining final metadata authority", () => {
  const coverStart = service.indexOf(
    "export async function uploadServiceListingCoverService",
  );

  const portfolioStart = service.indexOf(
    "export async function uploadServiceListingPortfolioImageService",
  );

  const deleteStart = service.indexOf(
    "export async function deleteServiceListingImageService",
  );

  assert.ok(
    coverStart >= 0 &&
      portfolioStart > coverStart &&
      deleteStart > portfolioStart,
    "Media service function boundaries must be identifiable.",
  );

  const coverBlock = service.slice(coverStart, portfolioStart);

  const portfolioBlock = service.slice(portfolioStart, deleteStart);

  for (const [label, block, metadataCall] of [
    ["cover", coverBlock, "setServiceListingCoverMetadataRepository("],
    [
      "portfolio",
      portfolioBlock,
      "addServiceListingPortfolioMetadataRepository(",
    ],
  ]) {
    const preflightIndex = block.indexOf(
      "assertServiceListingMediaUploadTargetRepository(",
    );

    const uploadIndex = block.indexOf("uploadServiceListingMediaObject(");

    const metadataIndex = block.indexOf(metadataCall);

    assert.ok(preflightIndex >= 0, `${label} preflight must exist.`);

    assert.ok(
      uploadIndex > preflightIndex,
      `${label} Storage upload must occur after preflight.`,
    );

    assert.ok(
      metadataIndex > uploadIndex,
      `${label} metadata authority must remain after Storage upload.`,
    );

    assert.match(block, /tryRemoveStorageObject\s*\(/);
  }
});

test("media API routes derive Provider identity from authenticated user instead of browser payload", () => {
  for (const source of [coverRoute, portfolioRoute, deleteRoute]) {
    assert.match(source, /providerId:\s*user\.id/);

    assert.doesNotMatch(source, /formData\.get\(\s*["']providerId["']/);

    assert.doesNotMatch(source, /body\.providerId/);
  }
});

test("Service Listing browser feature has no direct Storage write or delete authority", () => {
  const featureRoot = repoPath("src", "features", "service-listings");

  const mutationFiles = [];

  for (const filePath of walk(featureRoot)) {
    if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) {
      continue;
    }

    const source = fs.readFileSync(filePath, "utf8");

    if (/\.storage[\s\S]{0,500}\.(?:upload|remove)\s*\(/.test(source)) {
      mutationFiles.push(normalizePath(path.relative(root, filePath)));
    }
  }

  assert.deepEqual(mutationFiles, [
    "src/features/service-listings/repositories/service-listing-media.server.repository.ts",
  ]);
});

test("Service media migrations expose no browser Storage object write policy", () => {
  const migrationRoot = repoPath("database", "forward-migrations");

  for (const filePath of walk(migrationRoot)) {
    if (!filePath.endsWith(".sql")) {
      continue;
    }

    const source = fs.readFileSync(filePath, "utf8");

    const statements = source.split(";");

    for (const statement of statements) {
      if (
        /create\s+policy/i.test(statement) &&
        /storage\.objects/i.test(statement) &&
        /service-media/i.test(statement)
      ) {
        assert.fail(
          `Browser Storage policy found for service-media in ${normalizePath(
            path.relative(root, filePath),
          )}`,
        );
      }
    }
  }
});

test("existing M8 media metadata mutations remain service-role only final authorities", () => {
  for (const functionName of [
    "set_service_listing_cover",
    "add_service_listing_portfolio_image",
    "delete_service_listing_image",
  ]) {
    const block = extractSqlFunction(m8, functionName);

    assert.match(block, /require_editable_service_listing_media_target\s*\(/i);

    const signaturePattern = new RegExp(
      `grant\\s+execute[\\s\\S]*?${functionName}[\\s\\S]*?to\\s+service_role\\s*;`,
      "i",
    );

    assert.match(m8, signaturePattern);
  }
});

test("publication Provider identity remains server-authoritative and browser cannot submit payment authority", () => {
  assert.match(publicationRoute, /providerId:\s*user\.id/);

  assert.doesNotMatch(publicationRoute, /request\.json\s*\(/);

  assert.doesNotMatch(
    publicationRoute,
    /body\.providerId|body\.amount|body\.publicationAction/,
  );
});
test("M17 media upload preflight migration hash is locked", () => {
  const actual = crypto
    .createHash("sha256")
    .update(
      fs.readFileSync(
        repoPath(
          "database",
          "forward-migrations",
          "20260914_17_service_listing_media_preflight.sql",
        ),
      ),
    )
    .digest("hex");

  assert.equal(
    actual,
    "b0dcf40469d7833f249ad39dfebc4dbca88175e7474c8dc619c6d58abda0c1c4",
  );
});
