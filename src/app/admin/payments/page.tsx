"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Wallet,
} from "lucide-react";

interface Payment {
  id: string;

  publicationAction: string;

  amount: number;
  currency: string;

  paymentStatus: string;

  midtransOrderId: string;

  paymentMethod: string | null;

  createdAt: string;

  publicationAppliedAt: string | null;

  listing: {
    id: string;

    title: string;
    status: string;
  } | null;

  provider: {
    id: string;

    fullName: string | null;

    username: string | null;
  } | null;
}

interface PaymentResponse {
  items: Payment[];

  page: number;
  pageSize: number;

  total: number;
  totalPages: number;
}

const STATUSES = [
  "ALL",
  "CREATING",
  "PENDING",
  "PAID",
  "FAILED",
  "CANCELLED",
  "EXPIRED",
] as const;

const ACTIONS = [
  "ALL",
  "INITIAL_PUBLICATION",
  "EXPIRED_RENEWAL",
  "EARLY_RENEWAL",
] as const;

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminPaymentsPage() {
  const [data, setData] = useState<PaymentResponse>({
    items: [],
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  const [page, setPage] = useState(1);

  const [status, setStatus] = useState("ALL");

  const [action, setAction] = useState("ALL");

  const [search, setSearch] = useState("");

  const [appliedSearch, setAppliedSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.set("page", String(page));

      params.set("pageSize", "20");

      if (status !== "ALL") {
        params.set("status", status);
      }

      if (action !== "ALL") {
        params.set("action", action);
      }

      if (appliedSearch) {
        params.set("q", appliedSearch);
      }

      const response = await fetch(
        `/api/admin/service-payments?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Gagal memuat pembayaran publikasi.");
      }

      const result: PaymentResponse = await response.json();

      setData(result);
    } catch (error) {
      console.error(error);

      setData({
        items: [],
        page,
        pageSize: 20,
        total: 0,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [action, appliedSearch, page, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPayments();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadPayments]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Wallet className="h-6 w-6 text-indigo-600" />

          <div>
            <h1 className="text-2xl font-black text-slate-950">
              Payments Jasa
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitoring read-only pembayaran publikasi Service Listing.
            </p>
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();

            setPage(1);

            setAppliedSearch(search.trim());
          }}
          className="mt-6 grid gap-3 xl:grid-cols-[minmax(0,1fr)_190px_220px_auto]"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari Midtrans Order ID..."
              className="h-11 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);

              setPage(1);
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold"
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item === "ALL" ? "Semua Status" : item}
              </option>
            ))}
          </select>

          <select
            value={action}
            onChange={(event) => {
              setAction(event.target.value);

              setPage(1);
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold"
          >
            {ACTIONS.map((item) => (
              <option key={item} value={item}>
                {item === "ALL" ? "Semua Aksi" : item}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="h-11 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white"
          >
            Cari
          </button>
        </form>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Memuat payments...
        </div>
      ) : data.items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Tidak ada transaksi pembayaran publikasi.
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((payment) => (
            <article
              key={payment.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      {payment.paymentStatus}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {payment.publicationAction}
                    </span>
                  </div>

                  <h2 className="mt-3 font-black text-slate-950">
                    {payment.listing?.title || "Service Listing"}
                  </h2>

                  <p className="mt-2 break-all font-mono text-xs text-slate-500">
                    {payment.midtransOrderId}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                    <span>{formatMoney(payment.amount, payment.currency)}</span>

                    <span>
                      Provider:{" "}
                      {payment.provider?.fullName ||
                        payment.provider?.username ||
                        "-"}
                    </span>

                    <span>
                      Publication applied:{" "}
                      {payment.publicationAppliedAt ? "Ya" : "Belum"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/admin/payments/${payment.id}`}
                  className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white"
                >
                  Detail
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          disabled={loading || page <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </button>

        <button
          type="button"
          disabled={loading || data.totalPages === 0 || page >= data.totalPages}
          onClick={() => setPage((current) => current + 1)}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold disabled:opacity-40"
        >
          Berikutnya
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
