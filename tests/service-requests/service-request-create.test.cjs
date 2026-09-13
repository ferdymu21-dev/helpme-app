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

const migrationPath =
  "database/forward-migrations/20260912_11_service_request_core.sql";

const repositoryPath =
  "src/features/service-requests/repositories/create-service-request.repository.ts";

const servicePath =
  "src/features/service-requests/services/create-service-request.service.ts";

const validatorPath =
  "src/features/service-requests/validators/validate-service-request-create.ts";

const hookPath =
  "src/features/service-requests/hooks/useCreateServiceRequestPage.ts";

const uiPath = "src/features/service-requests/CreateServiceRequestPageUI.tsx";

const routePath = "src/app/(protected)/services/[id]/request/page.tsx";

const detailUiPath =
  "src/features/service-listings/ServiceListingDetailPageUI.tsx";

const protectedLayoutPath = "src/features/auth/layouts/ProtectedLayout.tsx";

const loginFormPath = "src/features/auth/components/LoginForm.tsx";

const googleButtonPath = "src/features/auth/components/GoogleAuthButton.tsx";

const authServicePath = "src/features/auth/services/auth.service.ts";

const callbackPath = "src/app/auth/callback/route.ts";

const safeRedirectPath = "src/features/auth/utils/safe-auth-redirect.ts";

test("M11 derives Service Request participants authoritatively", () => {
  const source = readRepoFile(migrationPath);
  const normalized = normalizeWhitespace(source);

  assert.ok(normalized.includes("public.create_service_request("));

  assert.ok(normalized.includes("public.require_current_service_actor();"));

  assert.ok(normalized.includes("'PENDING_PROVIDER'"));

  assert.ok(!source.includes("p_customer_id"));

  assert.ok(!source.includes("p_provider_id"));
});

test("Service Request repository uses the authoritative RPC boundary", () => {
  const source = readRepoFile(repositoryPath);
  const normalized = normalizeWhitespace(source);

  assert.match(source, /supabase\.rpc\(\s*"create_service_request"/);

  assert.ok(normalized.includes("p_listing_id: payload.listingId"));

  assert.ok(
    normalized.includes("p_request_description: payload.requestDescription"),
  );

  assert.ok(normalized.includes("p_needed_at: payload.neededAt"));

  assert.ok(normalized.includes("p_service_mode: payload.serviceMode"));

  assert.ok(normalized.includes("p_location_name: payload.locationName"));

  assert.ok(normalized.includes("p_budget: payload.budget"));

  assert.ok(!source.includes('.from("service_requests")'));

  assert.ok(!source.includes(".from('service_requests')"));
});

test("Service Request service validates before repository mutation", () => {
  const source = readRepoFile(servicePath);

  const validateIndex = source.indexOf(
    "validateAndNormalizeServiceRequestCreate",
  );

  const repositoryIndex = source.lastIndexOf("createServiceRequestRepository");

  assert.ok(validateIndex >= 0);
  assert.ok(repositoryIndex >= 0);
  assert.ok(validateIndex < repositoryIndex);
});

test("Service Request validator mirrors mode location and budget rules", () => {
  const source = readRepoFile(validatorPath);

  assert.ok(source.includes("ServiceMode.ONLINE"));

  assert.ok(source.includes("ServiceMode.OFFLINE"));

  assert.ok(source.includes("Lokasi wajib diisi untuk jasa offline."));

  assert.ok(source.includes("Number.isSafeInteger"));

  assert.ok(source.includes("budget <= 0"));
});

test("Service Request form route remains inside the protected route group", () => {
  assert.equal(fs.existsSync(path.join(root, routePath)), true);

  const source = readRepoFile(routePath);

  assert.ok(source.includes("useCreateServiceRequestPage"));

  assert.ok(source.includes("CreateServiceRequestPageUI"));
});

test("public Service detail activates Minta Jasa through the canonical protected request route", () => {
  const source = readRepoFile(detailUiPath);

  assert.ok(source.includes("/request"));

  assert.ok(source.includes("Minta Jasa"));

  assert.ok(source.includes("encodeURIComponent(listing.id)"));

  assert.ok(!source.includes("Fitur permintaan jasa sedang disiapkan"));
});

test("ProtectedLayout preserves the requested internal destination through login", () => {
  const source = readRepoFile(protectedLayoutPath);

  assert.ok(source.includes("getSafeAuthRedirect"));

  assert.ok(source.includes("window.location.search"));

  assert.ok(source.includes("/login?next="));

  assert.ok(source.includes("encodeURIComponent"));
});

test("safe auth redirect rejects unsafe redirect shapes before navigation", () => {
  const source = readRepoFile(safeRedirectPath);

  assert.ok(source.includes('candidate.startsWith("/")'));

  assert.ok(source.includes('candidate.startsWith("//")'));

  assert.ok(source.includes('candidate.includes("\\\\")'));

  assert.ok(source.includes("CONTROL_CHARACTER_PATTERN"));

  assert.ok(source.includes("decodeURIComponent"));

  assert.ok(source.includes('decodedPath.startsWith("//")'));

  assert.ok(source.includes('const DEFAULT_AUTH_REDIRECT = "/home"'));
});

test("password login returns only to the validated next destination", () => {
  const source = readRepoFile(loginFormPath);

  assert.ok(source.includes("getSafeAuthRedirect"));

  assert.ok(source.includes("window.location.search"));

  assert.ok(source.includes('.get("next")'));

  assert.ok(source.includes("router.replace"));

  assert.ok(source.includes("nextPath"));
});

test("Google OAuth carries the validated return target through the callback", () => {
  const buttonSource = readRepoFile(googleButtonPath);

  const authSource = readRepoFile(authServicePath);

  assert.ok(buttonSource.includes("getSafeAuthRedirect"));

  assert.ok(buttonSource.includes("signInWithGoogle"));

  assert.ok(buttonSource.includes("nextPath"));

  assert.ok(authSource.includes("getSafeAuthRedirect"));

  assert.ok(authSource.includes("callbackUrl.searchParams.set("));

  assert.ok(authSource.includes('"next"'));

  assert.ok(authSource.includes("safeNextPath"));
});

test("OAuth callback revalidates next before redirecting", () => {
  const source = readRepoFile(callbackPath);

  assert.ok(source.includes("getSafeAuthRedirect"));

  assert.ok(source.includes("requestUrl.searchParams.get("));

  assert.ok(source.includes('"next"'));

  assert.ok(source.includes("createLoginRedirectUrl"));

  assert.ok(source.includes("new URL("));

  assert.ok(source.includes("nextPath"));
});

test("Service Request listing-load and submission errors remain separate", () => {
  const hookSource = readRepoFile(hookPath);

  const uiSource = readRepoFile(uiPath);

  assert.ok(hookSource.includes("listingErrorMessage"));

  assert.ok(hookSource.includes("submissionErrorMessage"));

  assert.ok(uiSource.includes("listingErrorMessage"));

  assert.ok(uiSource.includes("submissionErrorMessage"));

  const listingErrorIndex = uiSource.indexOf("if (listingErrorMessage)");

  const notFoundIndex = uiSource.indexOf("if (notFound || !listing)");

  assert.ok(listingErrorIndex >= 0);
  assert.ok(notFoundIndex >= 0);
  assert.ok(listingErrorIndex < notFoundIndex);
});

test("Service Request creation client never owns the initial lifecycle status", () => {
  const creationSource = [
    repositoryPath,
    servicePath,
    validatorPath,
    hookPath,
    uiPath,
  ]
    .map(readRepoFile)
    .join("\n");

  assert.ok(!creationSource.includes("PENDING_PROVIDER"));

  assert.doesNotMatch(creationSource, /\bp_status\b/);

  assert.doesNotMatch(creationSource, /\bstatus\s*:/);
});
test("Request creation does not fabricate Chat Agreement or Payment side effects", () => {
  const repositorySource = readRepoFile(repositoryPath);

  assert.ok(repositorySource.includes('"create_service_request"'));

  assert.ok(!repositorySource.includes("conversation"));

  assert.ok(!repositorySource.includes("agreement"));

  assert.ok(!repositorySource.includes("payment"));
});
