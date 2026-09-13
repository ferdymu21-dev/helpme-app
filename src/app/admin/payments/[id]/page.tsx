"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import { ArrowLeft, Wallet } from "lucide-react";

import { useParams } from "next/navigation";

interface PaymentDetail {
  id: string;

  serviceListingId: string;
  providerId: string;

  publicationAction: string;

  amount: number;
  currency: string;

  publicationDurationSeconds: number;

  paymentStatus: string;

  midtransOrderId: string;

  midtransTransactionId: string | null;

  paymentMethod: string | null;

  paymentExpiresAt: string | null;

  renewalBaseExpiresAt: string | null;

  paidAt: string | null;

  failedAt: string | null;

  cancelledAt: string | null;

  expiredAt: string | null;

  publicationAppliedAt: string | null;

  createdAt: string;
  updatedAt: string;

  listing: {
    id: string;

    title: string;
    status: string;

    expiresAt: string | null;
  } | null;

  provider: {
    id: string;

    fullName: string | null;

    username: string | null;
  } | null;

  publicationPeriod: {
    id: string;

    sourceType: string;

    publicationAction: string;

    durationSeconds: number;

    startsAt: string;
    endsAt: string;
    appliedAt: string;
  } | null;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("id-ID") : "-";
}

export default function AdminPaymentDetailPage() {
  const params = useParams();

  const paymentId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [payment, setPayment] = useState<PaymentDetail | null>(null);

  const [loading, setLoading] = useState(true);

  const loadPayment = useCallback(async () => {
    if (!paymentId) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/service-payments/${encodeURIComponent(paymentId)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        setPayment(null);

        return;
      }

      const data: PaymentDetail = await response.json();

      setPayment(data);
    } catch (error) {
      console.error(error);

      setPayment(null);
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPayment();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadPayment]);

  if (loading) {
    return (
      <div className="p-10 text-center text-sm text-slate-500">
        Memuat payment...
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
        Payment tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/admin/payments"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Payments Jasa
      </Link>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Wallet className="h-6 w-6 text-indigo-600" />

          <div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              {payment.paymentStatus}
            </span>

            <h1 className="mt-3 text-2xl font-black text-slate-950">
              Payment Publikasi Jasa
            </h1>

            <p className="mt-2 break-all font-mono text-xs text-slate-500">
              {payment.midtransOrderId}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="font-black text-slate-900">Transaksi</h2>

          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>Action: {payment.publicationAction}</p>

            <p>
              Nominal:{" "}
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: payment.currency,
                maximumFractionDigits: 0,
              }).format(payment.amount)}
            </p>

            <p>Payment method: {payment.paymentMethod || "-"}</p>

            <p className="break-all">
              Transaction ID: {payment.midtransTransactionId || "-"}
            </p>

            <p>Dibuat: {formatDate(payment.createdAt)}</p>

            <p>Paid: {formatDate(payment.paidAt)}</p>

            <p>Expired: {formatDate(payment.expiredAt)}</p>

            <p>Failed: {formatDate(payment.failedAt)}</p>

            <p>Cancelled: {formatDate(payment.cancelledAt)}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="font-black text-slate-900">Listing & Provider</h2>

          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              Jasa:{" "}
              <strong className="text-slate-900">
                {payment.listing?.title || "-"}
              </strong>
            </p>

            <p>Status Jasa: {payment.listing?.status || "-"}</p>

            <p>
              Provider:{" "}
              {payment.provider?.fullName || payment.provider?.username || "-"}
            </p>

            <p>
              Listing expires: {formatDate(payment.listing?.expiresAt ?? null)}
            </p>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="font-black text-slate-900">Publication Application</h2>

        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p>Payment expires: {formatDate(payment.paymentExpiresAt)}</p>

          <p>Renewal base: {formatDate(payment.renewalBaseExpiresAt)}</p>

          <p>Publication applied: {formatDate(payment.publicationAppliedAt)}</p>
        </div>

        {payment.publicationPeriod ? (
          <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
            <p className="font-bold">Publication Period</p>

            <p className="mt-2">
              Source: {payment.publicationPeriod.sourceType}
            </p>

            <p>Mulai: {formatDate(payment.publicationPeriod.startsAt)}</p>

            <p>Berakhir: {formatDate(payment.publicationPeriod.endsAt)}</p>
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            Belum ada publication period yang terhubung dengan payment ini.
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5 text-sm leading-6 text-indigo-800">
        Halaman ini read-only. Admin tidak dapat Mark Paid, Force Paid,
        memanggil Midtrans, atau mempublikasikan listing dari halaman ini.
      </section>
    </div>
  );
}
