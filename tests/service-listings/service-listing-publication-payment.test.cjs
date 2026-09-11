const test = require("node:test");

const assert = require("node:assert/strict");

const fs = require("node:fs");

function read(path) {
  return fs.readFileSync(path, "utf8");
}

const configSource = read(
  "src/features/service-listings/constants/service-listing-config.ts",
);

const orderSource = read("src/lib/payments/server/order.ts");

const routeSource = read(
  "src/app/api/service-listings/[id]/publication/route.ts",
);

const serviceSource = read(
  "src/features/service-listings/services/create-service-listing-publication.server.service.ts",
);

const repositorySource = read(
  "src/features/service-listings/repositories/service-listing-publication.server.repository.ts",
);

const recoverySource = read(
  "src/features/service-listings/services/recover-service-listing-creating-payment.server.service.ts",
);

const pendingRepositorySource = read(
  "src/lib/payments/server/pendingPayment.repository.ts",
);

const pendingTypesSource = read(
  "src/features/payments/types/pendingPayment.ts",
);

const pendingClientSource = read(
  "src/features/payments/services/pendingPayment.client.ts",
);

const paymentStatusHookSource = read(
  "src/features/payments/hooks/usePaymentStatus.ts",
);

const resumePaymentFlowSource = read(
  "src/features/payments/hooks/useResumePaymentFlow.ts",
);

const desktopPendingCardSource = read(
  "src/components/home/desktop/DesktopPendingPaymentCard.tsx",
);

const mobilePendingCardSource = read(
  "src/components/home/mobile/MobilePendingPaymentCard.tsx",
);

const paymentResultDialogSource = read(
  "src/features/payments/components/dialog/PaymentResultDialog.tsx",
);

const publicationClientSource = read(
  "src/features/service-listings/services/service-listing-publication.client.service.ts",
);

const previewHookSource = read(
  "src/features/service-listings/hooks/usePreviewServiceListingPage.ts",
);

const previewUiSource = read(
  "src/features/service-listings/PreviewServiceListingPageUI.tsx",
);

test("Service listing publication fee is centralized at Rp5.000", () => {
  assert.match(configSource, /publicationFeeAmount:\s*5_000/);
});

test("Service listing has a dedicated server payment order type", () => {
  assert.match(orderSource, /SERVICE_LISTING\s*=\s*"SERVICE_LISTING"/);
});

test("publication endpoint does not accept browser amount or publication action", () => {
  assert.doesNotMatch(routeSource, /request\.json\s*\(/);

  assert.doesNotMatch(routeSource, /body\.amount/);

  assert.doesNotMatch(routeSource, /body\.publicationAction/);

  assert.doesNotMatch(routeSource, /body\.providerId/);
});

test("publication service reads authoritative fee from ServiceListingConfig", () => {
  assert.match(
    serviceSource,
    /ServiceListingConfig[\s\S]*publicationFeeAmount/,
  );

  assert.doesNotMatch(serviceSource, /input\.amount/);
});

test("first-free publication is attempted before paid reservation for drafts", () => {
  const firstFreeIndex = serviceSource.indexOf(
    "claimFirstFreeServiceListingPublication",
  );

  const reserveIndex = serviceSource.indexOf(
    "reserveServiceListingPublicationPayment",
  );

  assert.ok(firstFreeIndex >= 0);

  assert.ok(reserveIndex > firstFreeIndex);
});

test("Midtrans transaction is created only after DB payment reservation", () => {
  const reserveCall = serviceSource.lastIndexOf(
    "await reserveServiceListingPublicationPayment",
  );

  const transactionCall = serviceSource.lastIndexOf("await createTransaction");

  assert.ok(reserveCall >= 0);

  assert.ok(transactionCall > reserveCall);
});

test("Service listing publication repository uses trusted RPC foundation", () => {
  assert.match(
    repositorySource,
    /claim_first_free_service_listing_publication/,
  );

  assert.match(repositorySource, /reserve_service_listing_publication_payment/);

  assert.match(repositorySource, /finalize_service_listing_payment_checkout/);

  assert.match(repositorySource, /adminSupabase/);
});

test("ambiguous Midtrans create failure is not blindly marked FAILED", () => {
  /*
   * Application orchestration must not invoke a typed
   * failure helper from the Midtrans create catch path.
   */
  assert.doesNotMatch(
    serviceSource,
    /\bfailServiceListingPaymentCreation\s*\(/,
  );

  /*
   * The service must also not bypass the repository and
   * invoke the SQL cleanup RPC directly.
   *
   * Mentioning the RPC name inside explanatory comments
   * is intentionally allowed.
   */
  assert.doesNotMatch(
    serviceSource,
    /\.rpc\s*\(\s*["']fail_service_listing_payment_creation["']/,
  );
});

test("ambiguous CREATING recovery keeps the same Midtrans Order ID", () => {
  assert.match(
    recoverySource,
    /getMidtransHttpStatusCode\s*\(\s*error\s*\)\s*!==\s*404/,
  );

  assert.match(recoverySource, /kind:\s*"RETRY_SAME_ORDER"/);

  assert.doesNotMatch(
    recoverySource,
    /\bfailServiceListingPaymentCreation\s*\(/,
  );

  assert.doesNotMatch(recoverySource, /fail_service_listing_payment_creation/);

  assert.match(
    serviceSource,
    /recovery\.kind\s*===\s*"RETRY_SAME_ORDER"[\s\S]*?shouldCreateMidtransCheckout\s*=\s*true/,
  );

  assert.match(
    serviceSource,
    /createTransaction\s*\(\s*\{[\s\S]*?orderId:\s*reservation\.orderId/,
  );
});

test("Service listing CREATING recovery only replaces a payment after authoritative terminal state", () => {
  assert.match(
    recoverySource,
    /if\s*\(\s*!reconciled\s*\)[\s\S]*?kind:\s*"STILL_CREATING"/,
  );

  assert.match(
    recoverySource,
    /refreshed\.status\s*===\s*"PAID"[\s\S]*?kind:\s*"PAYMENT_APPLIED"/,
  );

  assert.match(
    recoverySource,
    /refreshed\.status\s*===\s*"FAILED"[\s\S]*?refreshed\.status\s*===\s*"CANCELLED"[\s\S]*?refreshed\.status\s*===\s*"EXPIRED"[\s\S]*?kind:\s*"RETRY_RESERVATION"/,
  );

  const retrySameOrderIndex = serviceSource.indexOf(
    'recovery.kind === "RETRY_SAME_ORDER"',
  );

  const retryReservationIndex = serviceSource.indexOf(
    'recovery.kind === "RETRY_RESERVATION"',
  );

  const replacementOrderIndex = serviceSource.indexOf(
    "generatedOrderId = generateOrderId",
    retryReservationIndex,
  );

  assert.ok(retrySameOrderIndex >= 0);

  assert.ok(retryReservationIndex > retrySameOrderIndex);

  assert.ok(replacementOrderIndex > retryReservationIndex);
});

test("Service listing PENDING payment is resumable only for its authenticated Provider and active Snap session", () => {
  const serviceTableMatches =
    pendingRepositorySource.match(
      /\.from\(\s*"service_listing_payments"\s*\)/g,
    ) ?? [];

  const providerScopeMatches =
    pendingRepositorySource.match(
      /\.eq\(\s*"provider_id"\s*,\s*userId\s*\)/g,
    ) ?? [];

  const snapTokenGateMatches =
    pendingRepositorySource.match(
      /\.not\(\s*"snap_token"\s*,\s*"is"\s*,\s*null\s*\)/g,
    ) ?? [];

  assert.ok(
    serviceTableMatches.length >= 2,
    "Service listing payments must participate in both pending discovery and resume lookup.",
  );

  assert.ok(
    providerScopeMatches.length >= 2,
    "Both Service pending and resume queries must be scoped to the authenticated Provider.",
  );

  assert.ok(
    snapTokenGateMatches.length >= 2,
    "Service pending and resume must require an existing Snap token.",
  );

  assert.match(
    pendingRepositorySource,
    /\.gt\(\s*"payment_expires_at"\s*,\s*nowIso\s*\)/,
  );

  assert.doesNotMatch(
    pendingRepositorySource,
    /\.eq\(\s*"payment_status"\s*,\s*"CREATING"\s*\)/,
  );
});

test("Service listing payment type is accepted by pending and payment-status client contracts", () => {
  assert.match(pendingTypesSource, /"SERVICE_LISTING"/);

  assert.match(pendingClientSource, /value\s*===\s*"SERVICE_LISTING"/);

  assert.match(paymentStatusHookSource, /"SERVICE_LISTING"/);
});

test("Service listing resume reuses the stored checkout instead of creating another payment", () => {
  assert.match(
    resumePaymentFlowSource,
    /requestResumePayment\s*\(\s*paymentOrderId\s*\)/,
  );

  assert.match(resumePaymentFlowSource, /snapToken:\s*payment\.snapToken/);

  assert.doesNotMatch(resumePaymentFlowSource, /\bcreateTransaction\s*\(/);

  assert.doesNotMatch(resumePaymentFlowSource, /\bgenerateOrderId\s*\(/);
});

test("Pending payment and result UI identify Service listing publication explicitly", () => {
  assert.match(
    desktopPendingCardSource,
    /payment\.paymentType\s*===\s*"SERVICE_LISTING"/,
  );

  assert.match(desktopPendingCardSource, /"Publikasi Jasa"/);

  assert.match(
    mobilePendingCardSource,
    /payment\.paymentType\s*===\s*"SERVICE_LISTING"/,
  );

  assert.match(mobilePendingCardSource, /"Publikasi Jasa"/);

  assert.match(
    paymentResultDialogSource,
    /paymentType\s*===\s*"SERVICE_LISTING"/,
  );

  assert.match(paymentResultDialogSource, /"Biaya publikasi jasa"/);

  assert.match(
    paymentResultDialogSource,
    /showViewTaskButton[\s\S]*isUrgentTask[\s\S]*taskId/,
  );
});

test("Provider publication UX keeps amount, action, and Provider identity server-authoritative", () => {
  const requestMatch = publicationClientSource.match(
    /const\s+response\s*=\s*await\s+fetch\(([\s\S]*?)\);\s*if\s*\(\s*!response\.ok\s*\)/,
  );

  assert.ok(
    requestMatch,
    "Publication client HTTP request must be identifiable.",
  );

  const requestBlock = requestMatch[1];

  assert.match(requestBlock, /\/api\/service-listings\/[\s\S]*?\/publication/);

  assert.match(requestBlock, /method:\s*"POST"/);

  assert.doesNotMatch(requestBlock, /\bbody\s*:/);

  assert.doesNotMatch(requestBlock, /\bamount\b/);

  assert.doesNotMatch(requestBlock, /\bpublicationAction\b/);

  assert.doesNotMatch(requestBlock, /\bproviderId\b/);
});

test("Provider publication UX handles canonical publication results without duplicating payment creation", () => {
  assert.match(publicationClientSource, /case\s+"FIRST_FREE_ACTIVATED"/);

  assert.match(publicationClientSource, /case\s+"PAYMENT_REQUIRED"/);

  assert.match(publicationClientSource, /case\s+"PAYMENT_CREATING"/);

  assert.match(publicationClientSource, /case\s+"PAYMENT_APPLIED"/);

  assert.match(
    previewHookSource,
    /case\s+"PAYMENT_REQUIRED"[\s\S]*?snapToken:\s*result\.snapToken/,
  );

  const creatingMatch = previewHookSource.match(
    /case\s+"PAYMENT_CREATING":([\s\S]*?)case\s+"PAYMENT_REQUIRED":/,
  );

  assert.ok(creatingMatch, "PAYMENT_CREATING branch must be identifiable.");

  const creatingBlock = creatingMatch[1];

  assert.doesNotMatch(creatingBlock, /\bopenPayment\s*\(/);

  assert.doesNotMatch(creatingBlock, /\bgenerateOrderId\s*\(/);

  assert.doesNotMatch(creatingBlock, /\bcreateTransaction\s*\(/);
});

test("Snap callbacks never activate Service listings and authoritative payment polling remains active", () => {
  assert.match(
    previewHookSource,
    /usePaymentStatus\(\s*\{[\s\S]*?orderId:\s*publicationOrderId/,
  );

  const successMatch = previewHookSource.match(
    /onSuccess\(\)\s*\{([\s\S]*?)\},\s*onPending/,
  );

  assert.ok(successMatch, "Snap onSuccess callback must be identifiable.");

  const successBlock = successMatch[1];

  assert.doesNotMatch(successBlock, /\bsetListing\s*\(/);

  assert.doesNotMatch(successBlock, /\brefreshListing\s*\(/);

  assert.match(successBlock, /dikonfirmasi oleh server/);

  const closeMatch = previewHookSource.match(
    /onClose\(\)\s*\{([\s\S]*?)\},\s*\}\);/,
  );

  assert.ok(closeMatch, "Snap onClose callback must be identifiable.");

  assert.doesNotMatch(closeMatch[1], /setPublicationOrderId\s*\(\s*""\s*\)/);

  assert.match(
    previewHookSource,
    /handleSettledPayment[\s\S]*?await\s+refreshListing\(\)/,
  );
});

test("Provider publication UI exposes lifecycle-safe actions for each Service listing status", () => {
  assert.match(
    previewUiSource,
    /ServiceListingStatus\.DRAFT:[\s\S]*?return\s+"Publikasikan jasa"/,
  );

  assert.match(
    previewUiSource,
    /ServiceListingStatus\.PAYMENT_PENDING:[\s\S]*?return\s+"Lanjutkan pembayaran"/,
  );

  assert.match(
    previewUiSource,
    /ServiceListingStatus\.ACTIVE:[\s\S]*?ServiceListingStatus\.PAUSED:[\s\S]*?return\s+"Perpanjang 30 hari"/,
  );

  assert.match(
    previewUiSource,
    /ServiceListingStatus\.EXPIRED:[\s\S]*?return\s+"Perpanjang jasa"/,
  );

  assert.match(
    previewUiSource,
    /ServiceListingStatus\.BLOCKED:[\s\S]*?ServiceListingStatus\.ARCHIVED:[\s\S]*?return\s+null/,
  );

  assert.match(
    previewHookSource,
    /listing\.status\s*!==[\s\S]*?ServiceListingStatus\.ACTIVE/,
  );

  assert.match(
    previewHookSource,
    /listing\.status\s*!==[\s\S]*?ServiceListingStatus\.PAUSED/,
  );

  assert.match(
    previewUiSource,
    /Menjeda jasa tidak menghentikan[\s\S]*?masa aktif publikasi/,
  );
});
