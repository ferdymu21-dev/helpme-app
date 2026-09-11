const test = require("node:test");

const assert = require("node:assert/strict");

const fs = require("node:fs");

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function normalizeSql(source) {
  return source.replace(/\s+/g, " ").trim();
}

const paymentRepositorySource = read(
  "src/lib/payments/server/payment.repository.ts",
);

const notificationSource = read(
  "src/lib/payments/server/paymentNotification.service.ts",
);

const reconciliationSource = read(
  "src/lib/payments/server/paymentReconciliation.service.ts",
);

const lifecycleRepositorySource = read(
  "src/lib/payments/server/paymentLifecycle.repository.ts",
);

const lifecycleServiceSource = read(
  "src/lib/payments/server/paymentLifecycle.service.ts",
);

const pendingPaymentRepositorySource = read(
  "src/lib/payments/server/pendingPayment.repository.ts",
);

const statusRepositorySource = read(
  "src/lib/payments/server/paymentStatus.repository.ts",
);

const statusServiceSource = read(
  "src/lib/payments/server/paymentStatus.service.ts",
);

const serviceHandlerSource = read(
  "src/lib/payments/server/handlers/service-listing.handler.ts",
);

const publicationRepositorySource = read(
  "src/features/service-listings/repositories/service-listing-publication.server.repository.ts",
);

const serviceMarketplaceCoreSource = read(
  "database/forward-migrations/20260909_01_service_marketplace_core.sql",
);

const paidPublicationSource = read(
  "database/forward-migrations/20260910_09_service_listing_paid_publication.sql",
);

const serviceMarketplaceCoreSql = normalizeSql(serviceMarketplaceCoreSource);

const paidPublicationSql = normalizeSql(paidPublicationSource);

test("canonical payment lookup includes Service listing payments", () => {
  assert.match(paymentRepositorySource, /"SERVICE_LISTING"/);

  assert.match(
    paymentRepositorySource,
    /\.from\(\s*"service_listing_payments"\s*,?\s*\)/,
  );

  assert.match(paymentRepositorySource, /findServiceListingPaymentByOrderId/);
});

test("Service listing handler delegates authoritative state to M9 RPC repository", () => {
  assert.match(serviceHandlerSource, /applyServiceListingPaymentStatus/);

  assert.match(
    publicationRepositorySource,
    /apply_service_listing_payment_status/,
  );
});

test("Service listing payment RPC receives nullable optional Midtrans fields explicitly", () => {
  assert.match(
    publicationRepositorySource,
    /p_transaction_id:[\s\S]*\?\?[\s\S]*null/,
  );

  assert.match(
    publicationRepositorySource,
    /p_payment_method:[\s\S]*\?\?[\s\S]*null/,
  );

  assert.match(publicationRepositorySource, /p_paid_at:[\s\S]*\?\?[\s\S]*null/);

  assert.match(
    publicationRepositorySource,
    /p_expired_at:[\s\S]*\?\?[\s\S]*null/,
  );
});

test("Midtrans webhook dispatches Service listing payment through shared pipeline", () => {
  assert.match(notificationSource, /handleServiceListingPayment/);

  assert.match(notificationSource, /case\s+"SERVICE_LISTING"/);

  const amountCheckIndex = notificationSource.indexOf(
    "assertPaymentAmountMatches",
  );

  const serviceDispatchIndex = notificationSource.indexOf(
    'case "SERVICE_LISTING"',
  );

  assert.ok(amountCheckIndex >= 0);

  assert.ok(serviceDispatchIndex > amountCheckIndex);
});

test("Midtrans reconciliation dispatches Service listing payment through shared pipeline", () => {
  assert.match(reconciliationSource, /handleServiceListingPayment/);

  assert.match(reconciliationSource, /case\s+"SERVICE_LISTING"/);

  const amountCheckIndex = reconciliationSource.lastIndexOf(
    "assertPaymentAmountMatches",
  );

  const dispatchCallIndex = reconciliationSource.indexOf(
    "dispatchPaymentStatus",
    amountCheckIndex,
  );

  assert.ok(amountCheckIndex >= 0);

  assert.ok(dispatchCallIndex > amountCheckIndex);
});

test("Service payment status lookup is scoped to authenticated Provider identity", () => {
  assert.match(
    statusRepositorySource,
    /\.from\(\s*"service_listing_payments"\s*,?\s*\)/,
  );

  assert.match(
    statusRepositorySource,
    /\.eq\(\s*"provider_id",\s*userId\s*,?\s*\)/,
  );

  assert.match(statusRepositorySource, /serviceListingId/);
});

test("public payment status exposes Service listing identity without Provider identity", () => {
  assert.match(
    statusServiceSource,
    /snapshot\.paymentType\s*===\s*"SERVICE_LISTING"/,
  );

  assert.match(statusServiceSource, /serviceListingId/);

  assert.doesNotMatch(statusServiceSource, /providerId/);
});

test("Service listing paid publication preserves exactly-once database invariants", () => {
  assert.ok(
    serviceMarketplaceCoreSql.includes(
      "create unique index service_listing_payments_one_nonterminal_idx on public.service_listing_payments ( service_listing_id ) where payment_status in ( 'CREATING', 'PENDING' );",
    ),
  );

  assert.ok(
    serviceMarketplaceCoreSql.includes(
      "create unique index service_listing_periods_payment_once_idx on public.service_listing_publication_periods ( service_listing_payment_id ) where service_listing_payment_id is not null;",
    ),
  );

  assert.ok(
    paidPublicationSql.includes(
      "v_current_payment_status = 'PAID' and v_publication_applied_at is not null",
    ),
  );

  assert.ok(
    paidPublicationSql.includes(
      "where pp.service_listing_payment_id = v_payment_id;",
    ),
  );

  assert.ok(paidPublicationSql.includes("and publication_applied_at is null;"));

  assert.ok(
    paidPublicationSql.includes(
      "payment_status = 'PAID', midtrans_transaction_id = btrim(p_transaction_id), payment_method = btrim(p_payment_method), paid_at = v_paid_at, failed_at = null, cancelled_at = null, expired_at = null",
    ),
  );

  assert.ok(paidPublicationSql.includes("and payment_status <> 'PAID';"));

  assert.ok(
    paidPublicationSql.includes("v_starts_at := v_renewal_base_expires_at;"),
  );

  assert.ok(
    paidPublicationSql.includes(
      "v_action in ( 'INITIAL_PUBLICATION', 'EXPIRED_RENEWAL' ) then v_starts_at := v_now;",
    ),
  );

  assert.match(
    paidPublicationSql,
    /v_listing_status = 'ARCHIVED' then update public\.service_listings[\s\S]*?v_target_status := 'ARCHIVED';/,
  );

  assert.match(
    paidPublicationSql,
    /v_listing_status = 'BLOCKED' then update public\.service_listings[\s\S]*?v_target_status := 'BLOCKED';/,
  );

  assert.match(
    paidPublicationSql,
    /v_listing_status = 'EXPIRED' then update public\.service_listings set status = v_renewal_base_status[\s\S]*?v_target_status := v_renewal_base_status;/,
  );
});

test("Service listing overdue PENDING payments participate in the shared payment lifecycle", () => {
  const serviceTableIndex = lifecycleRepositorySource.indexOf(
    '"service_listing_payments"',
  );

  assert.ok(
    serviceTableIndex >= 0,
    "Payment lifecycle must read service_listing_payments.",
  );

  const serviceLifecycleBlock = lifecycleRepositorySource.slice(
    serviceTableIndex,
    serviceTableIndex + 3500,
  );

  assert.match(
    serviceLifecycleBlock,
    /\.eq\(\s*"payment_status"\s*,\s*"PENDING"\s*,?\s*\)/,
  );

  assert.match(
    serviceLifecycleBlock,
    /\.not\(\s*"payment_expires_at"\s*,\s*"is"\s*,\s*null\s*,?\s*\)/,
  );

  assert.match(
    serviceLifecycleBlock,
    /\.lte\(\s*"payment_expires_at"\s*,\s*nowIso\s*\)/,
  );

  assert.match(lifecycleRepositorySource, /paymentType:\s*"SERVICE_LISTING"/);

  assert.match(
    lifecycleRepositorySource,
    /serviceListingId:\s*[\s\S]*?payment[\s\S]*?\.service_listing_id/,
  );

  assert.doesNotMatch(
    serviceLifecycleBlock,
    /\.eq\(\s*"payment_status"\s*,\s*"CREATING"\s*\)/,
  );
});

test("Service listing expiration uses shared authoritative Midtrans reconciliation", () => {
  assert.match(lifecycleServiceSource, /reconcileExpiredPendingPayment\s*\(/);

  assert.match(
    reconciliationSource,
    /case\s+"SERVICE_LISTING"[\s\S]*?handleServiceListingPayment/,
  );

  assert.match(
    reconciliationSource,
    /getMidtransTransactionStatus\s*\(\s*orderId\s*\)/,
  );

  assert.match(
    reconciliationSource,
    /expireMidtransTransaction\s*\(\s*orderId\s*\)/,
  );

  assert.match(
    reconciliationSource,
    /getMidtransHttpStatusCode\s*\(\s*error\s*\)\s*===\s*404/,
  );
});

test("shared payment lookup preserves Donation and Urgent Task alongside Service listing payments", () => {
  const canonicalLookupEnd = paymentRepositorySource.indexOf(
    "export async function findDonationByOrderId",
  );

  assert.ok(
    canonicalLookupEnd > 0,
    "Canonical payment lookup block must be identifiable.",
  );

  const canonicalLookup = paymentRepositorySource.slice(0, canonicalLookupEnd);

  assert.match(canonicalLookup, /findDonationByOrderId\s*\(\s*orderId\s*\)/);

  assert.match(canonicalLookup, /paymentType:\s*"DONATION"/);

  assert.match(canonicalLookup, /paymentType:\s*"URGENT_TASK"/);

  assert.match(canonicalLookup, /paymentType:\s*"SERVICE_LISTING"/);

  assert.match(paymentRepositorySource, /\.from\(\s*"support_donations"\s*\)/);

  assert.match(paymentRepositorySource, /\.from\(\s*"task_payments"\s*\)/);

  assert.match(
    paymentRepositorySource,
    /\.from\(\s*"service_listing_payments"\s*,?\s*\)/,
  );
});

test("shared webhook and reconciliation preserve Donation and Urgent Task handlers", () => {
  assert.match(
    notificationSource,
    /case\s+"DONATION":[\s\S]*?handleDonationPayment\s*\(/,
  );

  assert.match(
    notificationSource,
    /case\s+"URGENT_TASK":[\s\S]*?handleUrgentTaskPayment\s*\(/,
  );

  assert.match(
    notificationSource,
    /case\s+"SERVICE_LISTING":[\s\S]*?handleServiceListingPayment\s*\(/,
  );

  assert.match(
    reconciliationSource,
    /case\s+"DONATION":[\s\S]*?handleDonationPayment\s*\(/,
  );

  assert.match(
    reconciliationSource,
    /case\s+"URGENT_TASK":[\s\S]*?handleUrgentTaskPayment\s*\(/,
  );

  assert.match(
    reconciliationSource,
    /case\s+"SERVICE_LISTING":[\s\S]*?handleServiceListingPayment\s*\(/,
  );
});

test("payment status lookup preserves authenticated Donation and Urgent Task ownership", () => {
  const donationStart = statusRepositorySource.indexOf('"support_donations"');

  const urgentStart = statusRepositorySource.indexOf('"task_payments"');

  const serviceStart = statusRepositorySource.indexOf(
    '"service_listing_payments"',
  );

  assert.ok(
    donationStart >= 0 &&
      urgentStart > donationStart &&
      serviceStart > urgentStart,
    "Payment status repository domain blocks must be identifiable.",
  );

  const donationBlock = statusRepositorySource.slice(
    donationStart,
    urgentStart,
  );

  const urgentBlock = statusRepositorySource.slice(urgentStart, serviceStart);

  assert.match(donationBlock, /\.eq\(\s*"user_id"\s*,\s*userId\s*,?\s*\)/);

  assert.match(donationBlock, /paymentType:\s*"DONATION"/);

  assert.match(urgentBlock, /\.eq\(\s*"user_id"\s*,\s*userId\s*,?\s*\)/);

  assert.match(urgentBlock, /paymentType:\s*"URGENT_TASK"/);

  assert.match(urgentBlock, /taskId:/);
});

test("pending discovery and resume preserve Donation and Urgent Task authorization and deadline gates", () => {
  const donationBlocks = [
    ...pendingPaymentRepositorySource.matchAll(
      /\.from\(\s*"support_donations"\s*,?\s*\)([\s\S]*?)\.maybeSingle\(\s*\)/g,
    ),
  ];

  const urgentBlocks = [
    ...pendingPaymentRepositorySource.matchAll(
      /\.from\(\s*"task_payments"\s*,?\s*\)([\s\S]*?)\.maybeSingle\(\s*\)/g,
    ),
  ];

  assert.equal(
    donationBlocks.length,
    2,
    "Donation must remain available in both pending discovery and resume lookup.",
  );

  assert.equal(
    urgentBlocks.length,
    2,
    "Urgent Task must remain available in both pending discovery and resume lookup.",
  );

  for (const match of donationBlocks) {
    const block = match[1];

    assert.match(block, /\.eq\(\s*"user_id"\s*,\s*userId\s*,?\s*\)/);

    assert.match(block, /\.eq\(\s*"payment_status"\s*,\s*"PENDING"\s*,?\s*\)/);

    assert.match(
      block,
      /\.not\(\s*"payment_expires_at"\s*,\s*"is"\s*,\s*null\s*,?\s*\)/,
    );

    assert.match(block, /\.gt\(\s*"payment_expires_at"\s*,\s*nowIso\s*,?\s*\)/);
  }

  for (const match of urgentBlocks) {
    const block = match[1];

    assert.match(block, /\.eq\(\s*"user_id"\s*,\s*userId\s*,?\s*\)/);

    assert.match(block, /\.eq\(\s*"payment_status"\s*,\s*"PENDING"\s*,?\s*\)/);

    assert.match(
      block,
      /\.not\(\s*"payment_expires_at"\s*,\s*"is"\s*,\s*null\s*,?\s*\)/,
    );

    assert.match(block, /\.gt\(\s*"payment_expires_at"\s*,\s*nowIso\s*,?\s*\)/);
  }

  assert.match(pendingPaymentRepositorySource, /paymentType:\s*"DONATION"/);

  assert.match(pendingPaymentRepositorySource, /paymentType:\s*"URGENT_TASK"/);
});

test("payment lifecycle preserves overdue Donation and Urgent Task candidates", () => {
  const donationStart = lifecycleRepositorySource.indexOf(
    '"support_donations"',
  );

  const urgentStart = lifecycleRepositorySource.indexOf('"task_payments"');

  const serviceStart = lifecycleRepositorySource.indexOf(
    '"service_listing_payments"',
  );

  assert.ok(
    donationStart >= 0 &&
      urgentStart > donationStart &&
      serviceStart > urgentStart,
    "Lifecycle domain query blocks must be identifiable.",
  );

  const donationQuery = lifecycleRepositorySource.slice(
    donationStart,
    urgentStart,
  );

  const urgentQuery = lifecycleRepositorySource.slice(
    urgentStart,
    serviceStart,
  );

  for (const query of [donationQuery, urgentQuery]) {
    assert.match(query, /\.eq\(\s*"payment_status"\s*,\s*"PENDING"\s*,?\s*\)/);

    assert.match(
      query,
      /\.not\(\s*"payment_expires_at"\s*,\s*"is"\s*,\s*null\s*,?\s*\)/,
    );

    assert.match(query, /\.lte\(\s*"payment_expires_at"\s*,\s*nowIso\s*\)/);
  }

  assert.match(lifecycleRepositorySource, /paymentType:\s*"DONATION"/);

  assert.match(lifecycleRepositorySource, /paymentType:\s*"URGENT_TASK"/);

  assert.match(lifecycleRepositorySource, /taskId:\s*payment\.task_id/);
});