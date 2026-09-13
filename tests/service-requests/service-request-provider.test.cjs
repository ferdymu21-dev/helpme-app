const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "../..");

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function extractSqlFunction(source, functionName) {
  const start = source.indexOf(`public.${functionName}(`);

  assert.ok(start >= 0, `SQL function not found: ${functionName}`);

  const bodyStart = source.indexOf("as $function$", start);

  assert.ok(bodyStart >= 0, `SQL function body not found: ${functionName}`);

  const bodyEnd = source.indexOf("$function$;", bodyStart);

  assert.ok(bodyEnd >= 0, `SQL function end not found: ${functionName}`);

  return source.slice(start, bodyEnd + "$function$;".length);
}

const migrationPath =
  "database/forward-migrations/20260912_11_service_request_core.sql";

const providerListRepositoryPath =
  "src/features/service-requests/repositories/get-provider-service-requests.repository.ts";

const detailRepositoryPath =
  "src/features/service-requests/repositories/get-service-request-detail.repository.ts";

const lifecycleRepositoryPath =
  "src/features/service-requests/repositories/service-request-provider-lifecycle.repository.ts";

const providerListServicePath =
  "src/features/service-requests/services/get-provider-service-requests.service.ts";

const lifecycleServicePath =
  "src/features/service-requests/services/service-request-provider-lifecycle.service.ts";

const providerHookPath =
  "src/features/service-requests/hooks/useProviderServiceRequestsPage.ts";

const detailHookPath =
  "src/features/service-requests/hooks/useServiceRequestDetailPage.ts";

const providerUiPath =
  "src/features/service-requests/ProviderServiceRequestsPageUI.tsx";

const detailUiPath =
  "src/features/service-requests/ServiceRequestDetailPageUI.tsx";

const providerRoutePath =
  "src/app/(protected)/service-requests/provider/page.tsx";

const detailRoutePath = "src/app/(protected)/service-requests/[id]/page.tsx";

const migrationSource = readRepoFile(migrationPath);

test("M11 Provider request list derives Provider identity from the authenticated actor", () => {
  const source = normalizeWhitespace(
    extractSqlFunction(migrationSource, "get_my_provider_service_requests"),
  );

  assert.ok(source.includes("public.require_current_service_actor();"));

  assert.ok(source.includes("sr.provider_id = v_provider_id"));

  assert.ok(source.includes("count(*) over()::bigint"));

  assert.doesNotMatch(source, /\bemail\b/i);

  assert.doesNotMatch(source, /\bphone\b/i);
});

test("Provider request list application layer stays behind the trusted list RPC", () => {
  const source = readRepoFile(providerListRepositoryPath);

  assert.match(source, /supabase\.rpc\(\s*"get_my_provider_service_requests"/);

  assert.doesNotMatch(source, /\.from\(\s*["']service_requests["']\s*\)/);

  assert.doesNotMatch(source, /\.update\(/);
});

test("Provider request list service validates status and respects the database page-size ceiling", () => {
  const source = readRepoFile(providerListServicePath);

  assert.ok(source.includes("SERVICE_REQUEST_STATUSES"));

  assert.match(source, /pageSize[\s\S]*20[\s\S]*50/);
});

test("Provider inbox protects stale requests and defers initial loading outside the effect body", () => {
  const source = readRepoFile(providerHookPath);

  assert.ok(source.includes("requestVersion"));

  assert.ok(source.includes("window.setTimeout"));

  assert.ok(source.includes("window.clearTimeout"));

  assert.ok(source.includes("getProviderServiceRequestsService"));
});

test("Provider inbox route remains inside the protected route group", () => {
  assert.equal(fs.existsSync(path.join(root, providerRoutePath)), true);

  const source = readRepoFile(providerRoutePath);

  assert.ok(source.includes("useProviderServiceRequestsPage"));

  assert.ok(source.includes("ProviderServiceRequestsPageUI"));
});

test("Provider inbox links each request to the canonical participant detail route", () => {
  const source = readRepoFile(providerUiPath);

  assert.match(
    source,
    /\/service-requests\/\$\{encodeURIComponent\(\s*request\.id/,
  );
});

test("M11 participant detail only returns a request to its Customer or Provider", () => {
  const source = normalizeWhitespace(
    extractSqlFunction(migrationSource, "get_my_service_request_detail"),
  );

  assert.ok(source.includes("public.require_current_service_actor();"));

  assert.ok(
    source.includes(
      "sr.customer_id = v_actor_id or sr.provider_id = v_actor_id",
    ),
  );

  assert.doesNotMatch(source, /\bemail\b/i);

  assert.doesNotMatch(source, /\bphone\b/i);
});

test("participant detail repository uses only the trusted participant-safe RPC", () => {
  const source = readRepoFile(detailRepositoryPath);

  assert.match(source, /get_my_service_request_detail/);

  assert.ok(source.includes(".maybeSingle()"));

  assert.doesNotMatch(source, /\.from\(\s*["']service_requests["']\s*\)/);
});

test("participant detail route remains protected", () => {
  assert.equal(fs.existsSync(path.join(root, detailRoutePath)), true);

  const source = readRepoFile(detailRoutePath);

  assert.ok(source.includes("useServiceRequestDetailPage"));

  assert.ok(source.includes("ServiceRequestDetailPageUI"));
});

test("M11 begin negotiation is Provider-scoped and only accepts PENDING_PROVIDER", () => {
  const source = normalizeWhitespace(
    extractSqlFunction(migrationSource, "begin_service_request_negotiation"),
  );

  assert.ok(source.includes("and sr.provider_id = v_provider_id for update"));

  assert.ok(source.includes("v_status <> 'PENDING_PROVIDER'"));

  assert.ok(source.includes("status = 'NEGOTIATING'"));

  assert.ok(
    source.includes(
      "and provider_id = v_provider_id and status = 'PENDING_PROVIDER'",
    ),
  );

  assert.ok(!source.includes("AGREEMENT_PENDING"));
});

test("M11 decline is Provider-scoped and limited to PENDING_PROVIDER or NEGOTIATING", () => {
  const source = normalizeWhitespace(
    extractSqlFunction(migrationSource, "decline_service_request"),
  );

  assert.ok(source.includes("and sr.provider_id = v_provider_id for update"));

  assert.ok(source.includes("p_reason is null"));

  assert.ok(source.includes("'PENDING_PROVIDER', 'NEGOTIATING'"));

  assert.ok(source.includes("status = 'DECLINED'"));

  assert.ok(!source.includes("AGREEMENT_PENDING"));
});

test("Provider lifecycle browser repository sends only request identity and decline reason", () => {
  const source = readRepoFile(lifecycleRepositoryPath);

  assert.match(source, /supabase\.rpc\(\s*"begin_service_request_negotiation"/);

  assert.match(source, /supabase\.rpc\(\s*"decline_service_request"/);

  assert.ok(source.includes("p_request_id"));

  assert.ok(source.includes("p_reason"));

  assert.doesNotMatch(source, /p_provider_id/);

  assert.doesNotMatch(source, /p_customer_id/);

  assert.doesNotMatch(source, /\bstatus\s*:/);

  assert.doesNotMatch(source, /\.from\(\s*["']service_requests["']\s*\)/);

  assert.doesNotMatch(source, /\.update\(/);
});

test("Provider lifecycle service validates request identity and decline reason before RPC access", () => {
  const source = readRepoFile(lifecycleServicePath);

  assert.ok(source.includes("validateServiceRequestId"));

  assert.ok(source.includes("reason.trim()"));

  assert.ok(source.includes("Alasan penolakan wajib diisi."));
});

test("Provider action client guards do not extend authority into AGREEMENT_PENDING", () => {
  const source = readRepoFile(detailHookPath);

  assert.ok(source.includes("ServiceRequestStatus.PENDING_PROVIDER"));

  assert.ok(source.includes("ServiceRequestStatus.NEGOTIATING"));

  assert.ok(source.includes("user.id === detail.providerId"));

  assert.ok(source.includes("canBeginNegotiation"));

  assert.ok(source.includes("canDecline"));

  assert.ok(!source.includes("ServiceRequestStatus.AGREEMENT_PENDING"));
});

test("Provider detail UI exposes only the early Provider actions implemented in F10.E", () => {
  const source = readRepoFile(detailUiPath);

  assert.ok(source.includes("Mulai Negosiasi"));

  assert.ok(source.includes("Tolak Permintaan"));

  assert.ok(source.includes("Alasan penolakan"));

  assert.ok(source.includes("isProvider"));

  assert.doesNotMatch(source, /Setujui Kesepakatan/i);

  assert.doesNotMatch(source, /Mulai Pekerjaan/i);
});

test("Service Request feature performs no direct service_requests table CRUD", () => {
  const featureRoot = path.join(root, "src/features/service-requests");

  const files = [];

  function collect(directory) {
    for (const entry of fs.readdirSync(directory, {
      withFileTypes: true,
    })) {
      const absolutePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        collect(absolutePath);

        continue;
      }

      if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        files.push(absolutePath);
      }
    }
  }

  collect(featureRoot);

  const source = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");

  assert.doesNotMatch(source, /\.from\(\s*["']service_requests["']\s*\)/);

  assert.doesNotMatch(source, /p_provider_id/);

  assert.doesNotMatch(source, /p_customer_id/);
});
