const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "../..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function normalize(value) {
  return value.replace(/\s+/g, " ").trim();
}

function count(source, value) {
  return source.split(value).length - 1;
}

const parserSource = read(
  "src/features/service-requests/parsers/service-agreement.parser.ts",
);

const validatorSource = read(
  "src/features/service-requests/validators/validate-service-agreement-proposal.ts",
);

const readRepositorySource = read(
  "src/features/service-requests/repositories/get-service-request-agreements.repository.ts",
);

const lifecycleRepositorySource = read(
  "src/features/service-requests/repositories/service-agreement-lifecycle.repository.ts",
);

const lifecycleServiceSource = read(
  "src/features/service-requests/services/service-agreement-lifecycle.service.ts",
);

const hookSource = read(
  "src/features/service-requests/hooks/useServiceAgreementPanel.ts",
);

const panelSource = read(
  "src/features/service-requests/ServiceAgreementPanel.tsx",
);

const detailSource = read(
  "src/features/service-requests/ServiceRequestDetailPageUI.tsx",
);

test("Agreement read application layer stays behind the participant-safe RPC", () => {
  assert.match(
    readRepositorySource,
    /supabase\.rpc\(\s*["']get_my_service_request_agreements["']/,
  );

  assert.doesNotMatch(
    readRepositorySource,
    /\.from\(\s*["']service_agreements["']/,
  );

  assert.doesNotMatch(
    readRepositorySource,
    /\.from\(\s*["']service_agreement_payment_steps["']/,
  );

  assert.match(readRepositorySource, /parseServiceAgreement/);
});

test("Agreement mutation repository sends only trusted business inputs", () => {
  const source = normalize(lifecycleRepositorySource);

  assert.ok(source.includes('"propose_service_agreement"'));

  assert.ok(source.includes('"approve_service_agreement"'));

  assert.ok(source.includes('"reject_service_agreement"'));

  for (const expected of [
    "p_request_id:",
    "p_scope:",
    "p_deliverables:",
    "p_total_price:",
    "p_deadline:",
    "p_revision_terms:",
    "p_payment_plan_type:",
    "p_payment_steps:",
    "p_notes:",
  ]) {
    assert.ok(
      lifecycleRepositorySource.includes(expected),
      `missing proposal business input: ${expected}`,
    );
  }

  for (const forbidden of [
    "p_provider_id",
    "p_customer_id",
    "p_proposed_by",
    "p_version",
    "p_supersedes_agreement_id",
    "p_status",
    "p_prior_confirmed_amount",
  ]) {
    assert.ok(
      !lifecycleRepositorySource.includes(forbidden),
      `forbidden client authority found: ${forbidden}`,
    );
  }

  assert.doesNotMatch(lifecycleRepositorySource, /\.from\(/);
});

test("Agreement proposal validator normalizes deadline into an absolute ISO timestamp", () => {
  const source = normalize(validatorSource);

  assert.ok(
    source.includes("const deadlineTimestamp = Date.parse(deadlineInput)"),
  );

  assert.ok(source.includes("new Date(deadlineTimestamp).toISOString()"));

  assert.ok(source.includes("paymentTotal !== totalPrice"));

  assert.ok(
    source.includes(
      "Jumlah seluruh tahap pembayaran harus sama dengan total harga.",
    ),
  );
});

test("Agreement proposal validator requires CUSTOM payment trigger notes", () => {
  const source = normalize(validatorSource);

  assert.ok(source.includes("ServiceAgreementPaymentTriggerType.CUSTOM"));

  assert.ok(source.includes("!normalizedTriggerNote"));

  assert.ok(source.includes("Catatan pemicu pembayaran custom wajib diisi."));
});

test("Agreement lifecycle service validates proposal identity and rejection reason before RPC access", () => {
  const source = normalize(lifecycleServiceSource);

  assert.ok(source.includes("validateServiceAgreementProposal(draft)"));

  assert.ok(source.includes("validateServiceAgreementId(agreementId)"));

  assert.ok(source.includes("const normalizedReason = reason.trim()"));

  assert.ok(source.includes("Alasan penolakan kesepakatan wajib diisi."));

  assert.doesNotMatch(lifecycleServiceSource, /supabase/i);
});

test("Provider Agreement proposal action is client-guarded only by NEGOTIATING", () => {
  const source = normalize(hookSource);

  assert.ok(
    source.includes(
      "isProvider && requestStatus === ServiceRequestStatus.NEGOTIATING",
    ),
  );

  assert.ok(source.includes("await proposeServiceAgreementService("));

  assert.ok(!source.includes("ServiceRequestStatus.AGREED"));
});

test("Customer Agreement response is client-guarded by AGREEMENT_PENDING and latest PROPOSED", () => {
  const source = normalize(hookSource);

  assert.ok(
    source.includes(
      "isCustomer && requestStatus === ServiceRequestStatus.AGREEMENT_PENDING",
    ),
  );

  assert.ok(
    source.includes(
      "latestAgreement?.status === ServiceAgreementStatus.PROPOSED",
    ),
  );

  assert.ok(source.includes("await approveServiceAgreementService("));

  assert.ok(source.includes("await rejectServiceAgreementService("));
});

test("Agreement hook refreshes authoritative Request and Agreement state after mutations", () => {
  const source = normalize(hookSource);

  assert.ok(source.includes("await onRequestChanged()"));

  assert.ok(source.includes("await load()"));

  assert.ok(source.includes("await refreshRequestAndAgreements()"));

  assert.ok(source.includes("getServiceRequestAgreementsService"));
});

test("Agreement hook never bypasses the service layer", () => {
  for (const forbidden of [
    "supabase",
    ".rpc(",
    '.from("',
    ".from('",
    "p_provider_id",
    "p_customer_id",
    "p_version",
    "p_proposed_by",
  ]) {
    assert.ok(
      !hookSource.includes(forbidden),
      `hook database authority found: ${forbidden}`,
    );
  }
});

test("Agreement panel exposes proposal approval rejection and version history UX", () => {
  assert.match(panelSource, /Ajukan Kesepakatan/);

  assert.match(panelSource, /Setujui Kesepakatan/);

  assert.match(panelSource, /Tolak Proposal/);

  assert.match(panelSource, /Riwayat Kesepakatan/);

  assert.match(panelSource, /agreement\.version/);

  assert.match(panelSource, /agreement\.paymentSteps\.map/);
});

test("SUPERSEDED remains display-only in the Agreement UI boundary", () => {
  assert.equal(count(panelSource, "ServiceAgreementStatus.SUPERSEDED"), 1);

  assert.equal(count(hookSource, "ServiceAgreementStatus.SUPERSEDED"), 0);

  assert.doesNotMatch(hookSource, /supersede/i);
});

test("participant Request detail integrates exactly one Agreement panel with authoritative refresh", () => {
  assert.equal(count(detailSource, 'from "./ServiceAgreementPanel"'), 1);

  assert.equal(count(detailSource, "<ServiceAgreementPanel"), 1);

  const source = normalize(detailSource);

  assert.ok(source.includes("requestId={detail.id}"));

  assert.ok(source.includes("requestStatus={detail.status}"));

  assert.ok(source.includes("isProvider={isProvider}"));

  assert.ok(source.includes("isCustomer={isCustomer}"));

  assert.ok(source.includes("onRequestChanged={refresh}"));
});

test("Agreement parser keeps RPC data behind strict runtime parsing", () => {
  const source = normalize(parserSource);

  assert.ok(source.includes("if (!Array.isArray(value.payment_steps))"));

  assert.ok(source.includes("SERVICE_AGREEMENT_STATUSES.find"));

  assert.ok(source.includes("SERVICE_AGREEMENT_PAYMENT_PLAN_TYPES.find"));

  assert.ok(source.includes("SERVICE_AGREEMENT_PAYMENT_TRIGGER_TYPES.find"));

  assert.ok(source.includes("value.payment_steps.map(parsePaymentStep)"));

  assert.doesNotMatch(parserSource, /\bany\b/);

  assert.doesNotMatch(parserSource, /unknown\s+as/);
});
