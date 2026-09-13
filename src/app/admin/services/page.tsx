"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";

interface ProviderSummary {
  id: string;
  fullName: string | null;
  username: string | null;
}

interface ServiceListingSummary {
  id: string;

  title: string;
  category: string;

  status: string;

  createdAt: string;
  expiresAt: string | null;

  provider: ProviderSummary | null;
}

interface ServiceListingResponse {
  items: ServiceListingSummary[];

  page: number;
  pageSize: number;

  total: number;
  totalPages: number;
}

const STATUSES = [
  "ALL",
  "DRAFT",
  "PAYMENT_PENDING",
  "ACTIVE",
  "PAUSED",
  "EXPIRED",
  "BLOCKED",
  "ARCHIVED",
] as const;

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("id-ID");
}

export default function AdminServicesPage() {
  const [data, setData] = useState<ServiceListingResponse>({
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

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const params = new URLSearchParams();

      params.set("page", String(page));

      params.set("pageSize", "20");

      if (status !== "ALL") {
        params.set("status", status);
      }

      if (appliedSearch) {
        params.set("q", appliedSearch);
      }

      const response = await fetch(`/api/admin/services?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Gagal memuat listing jasa.");
      }

      const result: ServiceListingResponse = await response.json();

      setData(result);
    } catch (error) {
      console.error(error);

      setErrorMessage("Data Jasa belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, page, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadListings();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadListings]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <BriefcaseBusiness className="h-6 w-6 text-indigo-600" />

              <h1 className="text-2xl font-black text-slate-950">Jasa</h1>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Pantau listing jasa Provider dan lakukan moderasi melalui
              authority admin yang tersedia.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadListings()}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <form
          className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]"
          onSubmit={(event) => {
            event.preventDefault();

            setPage(1);

            setAppliedSearch(search.trim());
          }}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari judul jasa..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);

              setPage(1);
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none"
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item === "ALL" ? "Semua Status" : item}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="h-11 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            Cari
          </button>
        </form>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Total <strong className="text-slate-900">{data.total}</strong>{" "}
            listing
          </p>

          <p className="text-xs text-slate-400">
            Halaman {data.page}
            {data.totalPages > 0 && ` / ${data.totalPages}`}
          </p>
        </div>

        {errorMessage ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Memuat data Jasa...
          </div>
        ) : data.items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            Tidak ada listing Jasa yang cocok.
          </div>
        ) : (
          <div className="space-y-3">
            {data.items.map((listing) => (
              <article
                key={listing.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                        {listing.status}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {listing.category}
                      </span>
                    </div>

                    <h2 className="mt-3 text-base font-black text-slate-950">
                      {listing.title}
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                      <span>
                        Provider:{" "}
                        {listing.provider?.fullName ||
                          listing.provider?.username ||
                          "-"}
                      </span>

                      <span>Dibuat: {formatDate(listing.createdAt)}</span>

                      <span>Aktif sampai: {formatDate(listing.expiresAt)}</span>
                    </div>
                  </div>

                  <Link
                    href={`/admin/services/${listing.id}`}
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white transition hover:bg-indigo-700"
                  >
                    Tinjau
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={loading || page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </button>

          <button
            type="button"
            disabled={
              loading || data.totalPages === 0 || page >= data.totalPages
            }
            onClick={() => setPage((current) => current + 1)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 disabled:opacity-40"
          >
            Berikutnya
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
