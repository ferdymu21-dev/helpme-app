const assert =
  require("node:assert/strict");

const fs =
  require("node:fs");

const path =
  require("node:path");

const test =
  require("node:test");

const ts =
  require("typescript");

const ROOT =
  path.resolve(
    __dirname,
    "../..",
  );

const FEATURE_ROOT =
  path.join(
    ROOT,
    "src",
    "features",
    "service-listings",
  );

const moduleCache =
  new Map();

function featurePath(
  ...segments
) {
  return path.join(
    FEATURE_ROOT,
    ...segments,
  );
}

function repoPath(
  ...segments
) {
  return path.join(
    ROOT,
    ...segments,
  );
}

function readRepoFile(
  ...segments
) {
  return fs.readFileSync(
    repoPath(
      ...segments,
    ),
    "utf8",
  );
}

function resolveRelativeTypeScriptModule(
  fromFile,
  request,
) {
  const basePath =
    path.resolve(
      path.dirname(
        fromFile,
      ),
      request,
    );

  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    path.join(
      basePath,
      "index.ts",
    ),
    path.join(
      basePath,
      "index.tsx",
    ),
  ];

  for (
    const candidate
    of candidates
  ) {
    if (
      fs.existsSync(
        candidate,
      ) &&
      fs.statSync(
        candidate,
      ).isFile()
    ) {
      return candidate;
    }
  }

  throw new Error(
    `Unable to resolve local TypeScript module "${request}" from "${fromFile}".`,
  );
}

function loadTypeScriptModule(
  filePath,
) {
  const absolutePath =
    path.resolve(
      filePath,
    );

  const cachedModule =
    moduleCache.get(
      absolutePath,
    );

  if (cachedModule) {
    return cachedModule.exports;
  }

  const source =
    fs.readFileSync(
      absolutePath,
      "utf8",
    );

  const transpiled =
    ts.transpileModule(
      source,
      {
        fileName:
          absolutePath,

        reportDiagnostics:
          true,

        compilerOptions: {
          module:
            ts.ModuleKind.CommonJS,

          target:
            ts.ScriptTarget.ES2020,

          esModuleInterop:
            true,
        },
      },
    );

  const diagnostics =
    transpiled.diagnostics ?? [];

  const errors =
    diagnostics.filter(
      (diagnostic) =>
        diagnostic.category ===
        ts.DiagnosticCategory.Error,
    );

  if (errors.length > 0) {
    const message =
      errors
        .map(
          (diagnostic) =>
            ts.flattenDiagnosticMessageText(
              diagnostic.messageText,
              "\n",
            ),
        )
        .join("\n");

    throw new Error(
      `TypeScript transpilation failed for ${absolutePath}:\n${message}`,
    );
  }

  const currentModule = {
    exports: {},
  };

  moduleCache.set(
    absolutePath,
    currentModule,
  );

  function localRequire(
    request,
  ) {
    if (
      request.startsWith(
        ".",
      )
    ) {
      const resolvedPath =
        resolveRelativeTypeScriptModule(
          absolutePath,
          request,
        );

      return loadTypeScriptModule(
        resolvedPath,
      );
    }

    return require(
      request,
    );
  }

  const execute =
    new Function(
      "require",
      "module",
      "exports",
      "__filename",
      "__dirname",
      transpiled.outputText,
    );

  execute(
    localRequire,
    currentModule,
    currentModule.exports,
    absolutePath,
    path.dirname(
      absolutePath,
    ),
  );

  return currentModule.exports;
}

function countMatches(
  value,
  pattern,
) {
  const flags =
    pattern.flags.includes(
      "g",
    )
      ? pattern.flags
      : `${pattern.flags}g`;

  const globalPattern =
    new RegExp(
      pattern.source,
      flags,
    );

  return Array.from(
    value.matchAll(
      globalPattern,
    ),
  ).length;
}

const {
  validateAndNormalizeServiceListingEditableFields,
} =
  loadTypeScriptModule(
    featurePath(
      "validators",
      "validate-service-listing-editable-fields.ts",
    ),
  );

const {
  validateAndNormalizeServiceListingId,
} =
  loadTypeScriptModule(
    featurePath(
      "validators",
      "validate-service-listing-identity.ts",
    ),
  );

const {
  mapMyServiceListingDetailRpcRow,
  mapMyServiceListingRpcRow,
  mapPublicServiceListingDetailRpcRow,
  mapPublicServiceListingRpcRow,
  parseMyServiceListingDetailRpcRow,
  parseMyServiceListingRpcRow,
  parsePublicServiceListingDetailRpcRow,
  parsePublicServiceListingRpcRow,
} =
  loadTypeScriptModule(
    featurePath(
      "mappers",
      "service-listing-read.mapper.ts",
    ),
  );

const LISTING_ID =
  "11111111-1111-4111-8111-111111111111";

const PROVIDER_ID =
  "22222222-2222-4222-8222-222222222222";

const CREATED_AT =
  "2026-09-10T00:00:00.000Z";

const UPDATED_AT =
  "2026-09-10T01:00:00.000Z";

const EXPIRES_AT =
  "2026-10-10T00:00:00.000Z";

function createEditableFields(
  overrides = {},
) {
  return {
    title:
      "Desain Logo",

    category:
      "Desain",

    description:
      "Membuat desain logo.",

    deliverables:
      "File logo final.",

    customerPreparation:
      null,

    priceFrom:
      150000,

    isNegotiable:
      true,

    serviceMode:
      "ONLINE",

    locationName:
      null,

    ...overrides,
  };
}

function createMyDetailRow(
  overrides = {},
) {
  return {
    id:
      LISTING_ID,

    title:
      "Desain Logo",

    category:
      "Desain",

    description:
      "Membuat desain logo.",

    deliverables:
      "File logo final.",

    customer_preparation:
      null,

    price_from:
      "150000",

    is_negotiable:
      true,

    service_mode:
      "ONLINE",

    location_name:
      null,

    status:
      "DRAFT",

    published_at:
      null,

    activated_at:
      null,

    expires_at:
      null,

    paused_at:
      null,

    blocked_at:
      null,

    blocked_reason:
      null,

    blocked_from_status:
      null,

    archived_at:
      null,

    created_at:
      CREATED_AT,

    updated_at:
      UPDATED_AT,

    cover_storage_path:
      null,

    ...overrides,
  };
}

function createPublicRow(
  overrides = {},
) {
  return {
    id:
      LISTING_ID,

    provider_id:
      PROVIDER_ID,

    title:
      "Desain Logo",

    category:
      "Desain",

    description:
      "Membuat desain logo.",

    price_from:
      "150000",

    is_negotiable:
      true,

    service_mode:
      "ONLINE",

    location_name:
      null,

    created_at:
      CREATED_AT,

    expires_at:
      EXPIRES_AT,

    cover_storage_path:
      "service/cover.webp",

    provider_full_name:
      "Provider Test",

    provider_username:
      "provider-test",

    provider_avatar_url:
      null,

    provider_rating:
      "4.75",

    provider_total_reviews:
      12,

    provider_verification_status:
      "VERIFIED",

    total_count:
      "3",

    ...overrides,
  };
}

function createPublicDetailRow(
  overrides = {},
) {
  return {
    id:
      LISTING_ID,

    provider_id:
      PROVIDER_ID,

    title:
      "Desain Logo",

    category:
      "Desain",

    description:
      "Membuat desain logo.",

    deliverables:
      "File logo final.",

    customer_preparation:
      null,

    price_from:
      "150000",

    is_negotiable:
      true,

    service_mode:
      "ONLINE",

    location_name:
      null,

    published_at:
      CREATED_AT,

    created_at:
      CREATED_AT,

    expires_at:
      EXPIRES_AT,

    cover_storage_path:
      "service/cover.webp",

    provider_full_name:
      "Provider Test",

    provider_username:
      "provider-test",

    provider_avatar_url:
      null,

    provider_rating:
      "4.75",

    provider_total_reviews:
      12,

    provider_verification_status:
      "VERIFIED",

    ...overrides,
  };
}

test(
  "editable validator trims and normalizes valid content",
  () => {
    const result =
      validateAndNormalizeServiceListingEditableFields({
        title:
          "  Desain Logo  ",

        category:
          "  Desain  ",

        description:
          "  Membuat desain logo.  ",

        deliverables:
          "  File logo final.  ",

        customerPreparation:
          "   ",

        priceFrom:
          150000,

        isNegotiable:
          true,

        serviceMode:
          "ONLINE",

        locationName:
          "   ",
      });

    assert.deepEqual(
      result,
      {
        title:
          "Desain Logo",

        category:
          "Desain",

        description:
          "Membuat desain logo.",

        deliverables:
          "File logo final.",

        customerPreparation:
          null,

        priceFrom:
          150000,

        isNegotiable:
          true,

        serviceMode:
          "ONLINE",

        locationName:
          null,
      },
    );
  },
);

test(
  "editable validator mirrors required text and positive-price constraints",
  () => {
    assert.throws(
      () =>
        validateAndNormalizeServiceListingEditableFields(
          createEditableFields({
            title:
              "   ",
          }),
        ),
    );

    assert.throws(
      () =>
        validateAndNormalizeServiceListingEditableFields(
          createEditableFields({
            priceFrom:
              0,
          }),
        ),
    );

    assert.throws(
      () =>
        validateAndNormalizeServiceListingEditableFields(
          createEditableFields({
            priceFrom:
              Number.MAX_SAFE_INTEGER + 1,
          }),
        ),
    );
  },
);

test(
  "editable validator mirrors Service mode and location constraint",
  () => {
    const online =
      validateAndNormalizeServiceListingEditableFields(
        createEditableFields({
          serviceMode:
            "ONLINE",

          locationName:
            null,
        }),
      );

    assert.equal(
      online.locationName,
      null,
    );

    assert.throws(
      () =>
        validateAndNormalizeServiceListingEditableFields(
          createEditableFields({
            serviceMode:
              "OFFLINE",

            locationName:
              "   ",
          }),
        ),
    );

    assert.throws(
      () =>
        validateAndNormalizeServiceListingEditableFields(
          createEditableFields({
            serviceMode:
              "BOTH",

            locationName:
              null,
          }),
        ),
    );

    const offline =
      validateAndNormalizeServiceListingEditableFields(
        createEditableFields({
          serviceMode:
            "OFFLINE",

          locationName:
            "  Surabaya  ",
        }),
      );

    assert.equal(
      offline.locationName,
      "Surabaya",
    );

    assert.throws(
      () =>
        validateAndNormalizeServiceListingEditableFields(
          createEditableFields({
            serviceMode:
              "INVALID",
          }),
        ),
    );
  },
);

test(
  "shared listing identity validator trims and rejects invalid input",
  () => {
    assert.equal(
      validateAndNormalizeServiceListingId(
        `  ${LISTING_ID}  `,
      ),
      LISTING_ID,
    );

    assert.throws(
      () =>
        validateAndNormalizeServiceListingId(
          "   ",
        ),
    );

    assert.throws(
      () =>
        validateAndNormalizeServiceListingId(
          null,
        ),
    );
  },
);

test(
  "Provider detail/list parsers share canonical runtime mapping",
  () => {
    const detailRow =
      parseMyServiceListingDetailRpcRow(
        createMyDetailRow(),
      );

    assert.equal(
      detailRow.price_from,
      150000,
    );

    const detail =
      mapMyServiceListingDetailRpcRow(
        detailRow,
      );

    assert.equal(
      detail.id,
      LISTING_ID,
    );

    assert.equal(
      detail.priceFrom,
      150000,
    );

    assert.equal(
      detail.status,
      "DRAFT",
    );

    const listRow =
      parseMyServiceListingRpcRow({
        ...createMyDetailRow(),

        total_count:
          "4",
      });

    assert.equal(
      listRow.total_count,
      4,
    );

    const listItem =
      mapMyServiceListingRpcRow(
        listRow,
      );

    assert.deepEqual(
      listItem,
      detail,
    );
  },
);

test(
  "Public card/detail parsers normalize numeric RPC values",
  () => {
    const publicRow =
      parsePublicServiceListingRpcRow(
        createPublicRow(),
      );

    assert.equal(
      publicRow.price_from,
      150000,
    );

    assert.equal(
      publicRow.provider_rating,
      4.75,
    );

    assert.equal(
      publicRow.total_count,
      3,
    );

    const card =
      mapPublicServiceListingRpcRow(
        publicRow,
      );

    assert.equal(
      card.provider.id,
      PROVIDER_ID,
    );

    assert.equal(
      card.priceFrom,
      150000,
    );

    const detailRow =
      parsePublicServiceListingDetailRpcRow(
        createPublicDetailRow(),
      );

    const detail =
      mapPublicServiceListingDetailRpcRow(
        detailRow,
      );

    assert.equal(
      detail.id,
      LISTING_ID,
    );

    assert.equal(
      detail.deliverables,
      "File logo final.",
    );

    assert.equal(
      detail.provider.rating,
      4.75,
    );
  },
);

test(
  "runtime parsers reject invalid Service mode, status, and unsafe bigint values",
  () => {
    assert.throws(
      () =>
        parseMyServiceListingDetailRpcRow(
          createMyDetailRow({
            service_mode:
              "INVALID",
          }),
        ),
    );

    assert.throws(
      () =>
        parseMyServiceListingDetailRpcRow(
          createMyDetailRow({
            status:
              "INVALID",
          }),
        ),
    );

    assert.throws(
      () =>
        parseMyServiceListingDetailRpcRow(
          createMyDetailRow({
            price_from:
              "9007199254740992",
          }),
        ),
    );
  },
);

test(
  "mutation repositories preserve RPC-only authorization boundary",
  () => {
    const createRepository =
      readRepoFile(
        "src",
        "features",
        "service-listings",
        "repositories",
        "create-service-listing-draft.repository.ts",
      );

    const updateRepository =
      readRepoFile(
        "src",
        "features",
        "service-listings",
        "repositories",
        "update-service-listing.repository.ts",
      );

    const deleteRepository =
      readRepoFile(
        "src",
        "features",
        "service-listings",
        "repositories",
        "delete-service-listing-draft.repository.ts",
      );

    const lifecycleRepository =
      readRepoFile(
        "src",
        "features",
        "service-listings",
        "repositories",
        "service-listing-lifecycle.repository.ts",
      );

    assert.equal(
      countMatches(
        createRepository,
        /\.rpc\s*\(\s*"create_service_listing_draft"/g,
      ),
      1,
    );

    assert.equal(
      countMatches(
        updateRepository,
        /\.rpc\s*\(\s*"update_service_listing"/g,
      ),
      1,
    );

    assert.equal(
      countMatches(
        deleteRepository,
        /\.rpc\s*\(\s*"delete_service_listing_draft"/g,
      ),
      1,
    );

    assert.equal(
      countMatches(
        lifecycleRepository,
        /\.rpc\s*\(\s*"pause_service_listing"/g,
      ),
      1,
    );

    assert.equal(
      countMatches(
        lifecycleRepository,
        /\.rpc\s*\(\s*"resume_service_listing"/g,
      ),
      1,
    );

    assert.equal(
      countMatches(
        lifecycleRepository,
        /\.rpc\s*\(\s*"archive_service_listing"/g,
      ),
      1,
    );

    const mutationSource =
      [
        createRepository,
        updateRepository,
        deleteRepository,
        lifecycleRepository,
      ].join(
        "\n",
      );

    assert.doesNotMatch(
      mutationSource,
      /\badminSupabase\b/,
    );

    assert.doesNotMatch(
      mutationSource,
      /\.from\s*\(/,
    );

    assert.doesNotMatch(
      mutationSource,
      /\bp_provider_id\b/,
    );

    assert.doesNotMatch(
      mutationSource,
      /\bp_status\b/,
    );
  },
);

test(
  "Provider read repository remains RPC-only and own-detail does not accept providerId",
  () => {
    const source =
      readRepoFile(
        "src",
        "features",
        "service-listings",
        "repositories",
        "service-listing-read.repository.ts",
      );

    assert.equal(
      countMatches(
        source,
        /\.rpc\s*\(\s*"get_my_service_listings"/g,
      ),
      1,
    );

    assert.equal(
      countMatches(
        source,
        /\.rpc\s*\(\s*"get_my_service_listing_detail"/g,
      ),
      1,
    );

    assert.doesNotMatch(
      source,
      /\badminSupabase\b/,
    );

    assert.doesNotMatch(
      source,
      /\.from\s*\(/,
    );

    const detailMatch =
      source.match(
        /export\s+async\s+function\s+getMyServiceListingDetailRepository\s*\([\s\S]*?(?=\nexport\s+async\s+function|\s*$)/,
      );

    assert.ok(
      detailMatch,
    );

    assert.match(
      detailMatch[0],
      /\bp_listing_id\s*:/,
    );

    assert.doesNotMatch(
      detailMatch[0],
      /\bp_provider_id\b/,
    );

    assert.match(
      detailMatch[0],
      /\.maybeSingle\s*\(/,
    );
  },
);

test(
  "client lifecycle layer does not duplicate database lifecycle state machine",
  () => {
    const files = [
      readRepoFile(
        "src",
        "features",
        "service-listings",
        "repositories",
        "service-listing-lifecycle.repository.ts",
      ),

      readRepoFile(
        "src",
        "features",
        "service-listings",
        "services",
        "pause-service-listing.service.ts",
      ),

      readRepoFile(
        "src",
        "features",
        "service-listings",
        "services",
        "resume-service-listing.service.ts",
      ),

      readRepoFile(
        "src",
        "features",
        "service-listings",
        "services",
        "archive-service-listing.service.ts",
      ),
    ];

    const source =
      files.join(
        "\n",
      );

    assert.doesNotMatch(
      source,
      /"(?:ACTIVE|PAUSED|EXPIRED|BLOCKED|ARCHIVED|PAYMENT_PENDING|DRAFT)"/,
    );
  },
);

test(
  "M4D Provider detail keeps authenticated owner-only read boundary",
  () => {
    const sql =
      readRepoFile(
        "database",
        "forward-migrations",
        "20260910_07_service_listing_provider_detail.sql",
      );

    const executableSql =
      sql.replace(
        /--.*$/gm,
        "",
      );

    assert.equal(
      countMatches(
        executableSql,
        /sl\.provider_id\s*=\s*auth\.uid\s*\(\s*\)/gi,
      ),
      1,
    );

    assert.equal(
      countMatches(
        executableSql,
        /sl\.id\s*=\s*p_listing_id/gi,
      ),
      1,
    );

    assert.equal(
      countMatches(
        executableSql,
        /grant\s+execute[\s\S]*?to\s+authenticated\s*;/gi,
      ),
      1,
    );

    assert.equal(
      countMatches(
        executableSql,
        /grant\s+execute[\s\S]*?to\s+anon\s*;/gi,
      ),
      0,
    );

    assert.equal(
      countMatches(
        executableSql,
        /\bp_provider_id\b/gi,
      ),
      0,
    );

    assert.equal(
      countMatches(
        executableSql,
        /status\s*=\s*'ACTIVE'/gi,
      ),
      0,
    );
  },
);

test(
  "M4B lifecycle RPCs retain database-owned transition authority",
  () => {
    const sql =
      readRepoFile(
        "database",
        "forward-migrations",
        "20260910_05_service_listing_lifecycle.sql",
      );

    const executableSql =
      sql.replace(
        /--.*$/gm,
        "",
      );

    for (
      const rpcName
      of [
        "pause_service_listing",
        "resume_service_listing",
        "archive_service_listing",
      ]
    ) {
      assert.equal(
        countMatches(
          executableSql,
          new RegExp(
            `create\\s+or\\s+replace\\s+function\\s+public\\.${rpcName}\\s*\\(`,
            "gi",
          ),
        ),
        1,
      );
    }

    assert.equal(
      countMatches(
        executableSql,
        /public\.require_current_service_actor\s*\(\s*\)/gi,
      ),
      3,
    );

    assert.equal(
      countMatches(
        executableSql,
        /for\s+update\s*;/gi,
      ),
      3,
    );
  },
);