"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Handshake,
  Search,
} from "lucide-react";

interface Participant {
  id: string;

  fullName: string | null;

  username: string | null;
}

interface ListingSummary {
  id: string;
  title: string;
}

interface RequestSummary {
  id: string;

  status: string;

  requestDescription: string;

  createdAt: string;

  budget: number | null;

  listing: ListingSummary | null;

  customer: Participant | null;

  provider: Participant | null;
}

interface RequestListResponse {
  items: RequestSummary[];

  page: number;
  pageSize: number;

  total: number;
  totalPages: number;
}

const STATUSES = [
  "ALL",
  "PENDING_PROVIDER",
  "NEGOTIATING",
  "AGREEMENT_PENDING",
  "AGREED",
  "IN_PROGRESS",
  "SUBMITTED",
  "COMPLETED",
  "DECLINED",
  "CANCELLED",
] as const;

function formatCurrency(value: number | null) {
  if (value === null) {
    return "-";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminServiceRequestsPage() {
  const [data, setData] = useState<RequestListResponse>({
    items: [],
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  const [page, setPage] = useState(1);

  const [status, setStatus] = useState("ALL");

  const [search, setSearch] = useState("");

  const [appliedSearch, setAppliedSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.set("page", String(page));

      params.set("pageSize", "20");

      if (status !== "ALL") {
        params.set("status", status);
      }

      if (appliedSearch) {
        params.set("q", appliedSearch);
      }

      const response = await fetch(
        `/api/admin/service-requests?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Gagal memuat Permintaan Jasa.");
      }

      const result: RequestListResponse = await response.json();

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
  }, [appliedSearch, page, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRequests();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadRequests]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Handshake className="h-6 w-6 text-indigo-600" />

          <div>
            <h1 className="text-2xl font-black text-slate-950">
              Permintaan Jasa
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitoring read-only lifecycle transaksi Customer dan Provider.
            </p>
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();

            setPage(1);

            setAppliedSearch(search.trim());
          }}
          className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px_auto]"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari permintaan..."
              className="h-11 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);

              setPage(1);
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold"
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item === "ALL" ? "Semua Status" : item}
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
          Memuat Permintaan Jasa...
        </div>
      ) : data.items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Tidak ada Permintaan Jasa.
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((request) => (
            <article
              key={request.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                    {request.status}
                  </span>

                  <h2 className="mt-3 font-black text-slate-950">
                    {request.listing?.title || "Jasa"}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {request.requestDescription}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                    <span>
                      Customer:{" "}
                      {request.customer?.fullName ||
                        request.customer?.username ||
                        "-"}
                    </span>

                    <span>
                      Provider:{" "}
                      {request.provider?.fullName ||
                        request.provider?.username ||
                        "-"}
                    </span>

                    <span>Budget: {formatCurrency(request.budget)}</span>
                  </div>
                </div>

                <Link
                  href={`/admin/service-requests/${request.id}`}
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
