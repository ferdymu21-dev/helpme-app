const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..", "..");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

const navigation = read("src/features/admin/constants/admin-navigation.ts");

const servicesPage = read("src/app/admin/services/page.tsx");

const serviceDetail = read("src/app/admin/services/[id]/page.tsx");

const requestsPage = read("src/app/admin/service-requests/page.tsx");

const requestDetail = read("src/app/admin/service-requests/[id]/page.tsx");

const paymentsPage = read("src/app/admin/payments/page.tsx");

const paymentDetail = read("src/app/admin/payments/[id]/page.tsx");

test("admin navigation exposes Jasa Permintaan Jasa and Payments Jasa", () => {
  assert.match(navigation, /href:\s*"\/admin\/services"/);

  assert.match(navigation, /href:\s*"\/admin\/service-requests"/);

  assert.match(navigation, /href:\s*"\/admin\/payments"/);

  assert.match(navigation, /label:\s*"Jasa"/);

  assert.match(navigation, /label:\s*"Permintaan Jasa"/);

  assert.match(navigation, /label:\s*"Payments Jasa"/);
});

test("new Jasa admin pages do not use browser Supabase", () => {
  for (const source of [
    servicesPage,
    serviceDetail,
    requestsPage,
    requestDetail,
    paymentsPage,
    paymentDetail,
  ]) {
    assert.doesNotMatch(source, /@\/lib\/supabase\/client/);

    assert.doesNotMatch(source, /\.from\s*\(/);
  }
});

test("Service Listing admin UI uses canonical admin APIs", () => {
  assert.match(servicesPage, /\/api\/admin\/services/);

  assert.match(serviceDetail, /\/api\/admin\/services\//);

  assert.match(serviceDetail, /\/moderation/);
});

test("Service Listing UI exposes only canonical BLOCK and UNBLOCK moderation", () => {
  assert.match(serviceDetail, /"BLOCK"/);

  assert.match(serviceDetail, /"UNBLOCK"/);

  assert.doesNotMatch(serviceDetail, /Force Paid|Mark Paid|Publish Now/i);
});

test("Service Request admin UI is read-only", () => {
  assert.match(requestsPage, /\/api\/admin\/service-requests/);

  assert.match(requestDetail, /\/api\/admin\/service-requests\//);

  assert.doesNotMatch(requestDetail, /method:\s*"(?:POST|PATCH|PUT|DELETE)"/);

  assert.doesNotMatch(
    requestDetail,
    /\bhandle(?:Accept|Decline|Cancel|Complete|Start|Submit)\b/,
  );
});

test("Payment admin UI is read-only and uses service payment monitoring API", () => {
  assert.match(paymentsPage, /\/api\/admin\/service-payments/);

  assert.match(paymentDetail, /\/api\/admin\/service-payments\//);

  for (const source of [paymentsPage, paymentDetail]) {
    assert.doesNotMatch(source, /method:\s*"(?:POST|PATCH|PUT|DELETE)"/);
  }
});

test("Payment admin UI never exposes checkout credentials", () => {
  for (const source of [paymentsPage, paymentDetail]) {
    assert.doesNotMatch(source, /\bsnapToken\b|\bsnap_token\b/);

    assert.doesNotMatch(source, /\bpaymentUrl\b|\bpayment_url\b/);
  }
});

test("Payment detail explicitly communicates read-only authority", () => {
  assert.match(paymentDetail, /read-only/i);

  assert.match(paymentDetail, /Force Paid/);

  assert.match(paymentDetail, /Midtrans/);
});

test("Service Request detail communicates participant non-impersonation", () => {
  assert.match(requestDetail, /read-only/i);

  assert.match(requestDetail, /Customer/);

  assert.match(requestDetail, /Provider/);

  assert.match(requestDetail, /tidak dapat bertindak/);
});
