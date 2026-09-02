"use client";

import { useEffect, useMemo, useState } from "react";

import AdForm from "../components/admin/AdForm";
import AdsTable from "../components/admin/AdsTable";

import type { AdPosition, AdWithStats } from "../types/ad.types";

type AdStatusFilter = "all" | "active" | "scheduled" | "ended" | "inactive";

type AdPositionFilter = "all" | AdPosition;

function getAdStatusKey(ad: AdWithStats): Exclude<AdStatusFilter, "all"> {
  const now = new Date();

  if (!ad.is_active) {
    return "inactive";
  }

  if (ad.start_at && new Date(ad.start_at) > now) {
    return "scheduled";
  }

  if (ad.end_at && new Date(ad.end_at) < now) {
    return "ended";
  }

  return "active";
}

export default function AdsManagementPage() {
  const [ads, setAds] = useState<AdWithStats[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [editingAd, setEditingAd] = useState<AdWithStats | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState<AdStatusFilter>("all");

  const [positionFilter, setPositionFilter] = useState<AdPositionFilter>("all");

  async function loadAds() {
    try {
      setError(null);

      const response = await fetch("/api/ads?admin=true", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Anda belum login.");
        }

        if (response.status === 403) {
          throw new Error("Anda tidak memiliki akses admin.");
        }

        throw new Error(data?.message ?? "Gagal mengambil data iklan.");
      }

      setAds(data as AdWithStats[]);
    } catch (error) {
      console.error("Load ads error:", error);

      setError(
        error instanceof Error ? error.message : "Gagal mengambil data iklan.",
      );
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialAds() {
      try {
        const response = await fetch("/api/ads?admin=true", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Anda belum login.");
          }

          if (response.status === 403) {
            throw new Error("Anda tidak memiliki akses admin.");
          }

          throw new Error(data?.message ?? "Gagal mengambil data iklan.");
        }

        setAds(data as AdWithStats[]);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Load ads error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data iklan.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialAds();

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const totalImpressions = ads.reduce(
      (total, ad) => total + ad.stats.impressions,
      0,
    );

    const totalClicks = ads.reduce((total, ad) => total + ad.stats.clicks, 0);

    const activeAds = ads.filter(
      (ad) => getAdStatusKey(ad) === "active",
    ).length;

    const ctr =
      totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return {
      totalAds: ads.length,
      activeAds,
      totalImpressions,
      totalClicks,
      ctr,
    };
  }, [ads]);

  const filteredAds = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return ads.filter((ad) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        ad.title.toLowerCase().includes(normalizedSearch) ||
        (ad.description ?? "").toLowerCase().includes(normalizedSearch) ||
        ad.button_text.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || getAdStatusKey(ad) === statusFilter;

      const matchesPosition =
        positionFilter === "all" || ad.position === positionFilter;

      return matchesSearch && matchesStatus && matchesPosition;
    });
  }, [ads, positionFilter, searchQuery, statusFilter]);

  function handleCreate() {
    setEditingAd(null);
    setShowForm(true);
  }

  function handleEdit(ad: AdWithStats) {
    setEditingAd(ad);
    setShowForm(true);
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditingAd(null);
    loadAds();
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingAd(null);
  }

  async function handleDelete(ad: AdWithStats) {
    const confirmed = window.confirm(`Hapus iklan "${ad.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(ad.id);
      setError(null);

      const response = await fetch(`/api/ads/${ad.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Anda belum login.");
        }

        if (response.status === 403) {
          throw new Error("Anda tidak memiliki akses admin.");
        }

        if (response.status === 404) {
          throw new Error("Iklan tidak ditemukan.");
        }

        throw new Error(data?.message ?? "Gagal menghapus iklan.");
      }

      await loadAds();
    } catch (error) {
      console.error("Delete ad error:", error);

      setError(
        error instanceof Error ? error.message : "Gagal menghapus iklan.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main className="space-y-6 p-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded-lg bg-slate-200" />

          <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-200" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>

        <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </main>
    );
  }

  if (showForm) {
    return (
      <main className="p-8">
        <AdForm
          key={editingAd?.id ?? "create"}
          ad={editingAd}
          onSuccess={handleFormSuccess}
          onCancel={handleCancelForm}
        />
      </main>
    );
  }

  return (
    <main className="space-y-6 p-2">
      {/* PAGE HEADER */}

      <section className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            Advertising
          </p>

          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            Manajemen Iklan
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Kelola penempatan, jadwal, dan performa iklan yang ditampilkan
            kepada pengguna HelpMe.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="
            inline-flex
            w-fit
            items-center
            justify-center
            rounded-xl
            bg-indigo-600
            px-5
            py-3
            text-sm
            font-bold
            text-white
            shadow-sm
            transition
            hover:bg-indigo-700
            focus:outline-none
            focus:ring-4
            focus:ring-indigo-100
          "
        >
          + Buat Iklan
        </button>
      </section>

      {/* ERROR */}

      {error && (
        <section className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-red-800">Terjadi masalah</p>

            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>

          <button
            type="button"
            onClick={loadAds}
            className="w-fit text-sm font-bold text-red-700 underline underline-offset-4"
          >
            Coba lagi
          </button>
        </section>
      )}

      {/* SUMMARY */}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Iklan</p>

          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="text-3xl font-black tracking-tight text-slate-950">
              {summary.totalAds.toLocaleString("id-ID")}
            </p>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Semua iklan
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Iklan Aktif</p>

          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="text-3xl font-black tracking-tight text-slate-950">
              {summary.activeAds.toLocaleString("id-ID")}
            </p>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Sedang tayang
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Impression</p>

          <div className="mt-3">
            <p className="text-3xl font-black tracking-tight text-slate-950">
              {summary.totalImpressions.toLocaleString("id-ID")}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Akumulasi seluruh penayangan
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Click-through Rate
          </p>

          <div className="mt-3">
            <p className="text-3xl font-black tracking-tight text-slate-950">
              {summary.ctr.toLocaleString("id-ID", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              %
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {summary.totalClicks.toLocaleString("id-ID")} total klik
            </p>
          </div>
        </div>
      </section>

      {/* FILTER */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 xl:grid-cols-[minmax(280px,1fr)_190px_200px]">
          <div>
            <label htmlFor="ad-search" className="sr-only">
              Cari iklan
            </label>

            <input
              id="ad-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari judul, deskripsi, atau CTA..."
              className="
                h-12
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-4
                text-sm
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-indigo-400
                focus:bg-white
                focus:ring-4
                focus:ring-indigo-50
              "
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as AdStatusFilter)
            }
            className="
              h-12
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              text-sm
              font-medium
              text-slate-700
              outline-none
              focus:border-indigo-400
              focus:ring-4
              focus:ring-indigo-50
            "
          >
            <option value="all">Semua Status</option>

            <option value="active">Aktif</option>

            <option value="scheduled">Terjadwal</option>

            <option value="ended">Berakhir</option>

            <option value="inactive">Nonaktif</option>
          </select>

          <select
            value={positionFilter}
            onChange={(event) =>
              setPositionFilter(event.target.value as AdPositionFilter)
            }
            className="
              h-12
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              text-sm
              font-medium
              text-slate-700
              outline-none
              focus:border-indigo-400
              focus:ring-4
              focus:ring-indigo-50
            "
          >
            <option value="all">Semua Penempatan</option>

            <option value="home_desktop">Home Desktop</option>

            <option value="home_mobile">Home Mobile</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            Menampilkan{" "}
            <span className="font-bold text-slate-900">
              {filteredAds.length}
            </span>{" "}
            dari <span className="font-bold text-slate-900">{ads.length}</span>{" "}
            iklan
          </p>

          {(searchQuery ||
            statusFilter !== "all" ||
            positionFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setPositionFilter("all");
              }}
              className="text-sm font-bold text-indigo-600 transition hover:text-indigo-700"
            >
              Reset filter
            </button>
          )}
        </div>
      </section>

      {/* CONTENT */}

      {ads.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-lg font-black text-indigo-600">
            AD
          </div>

          <h2 className="mt-5 text-lg font-black text-slate-900">
            Belum ada iklan
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Buat iklan pertama untuk mulai menampilkan promosi pada halaman
            HelpMe.
          </p>

          <button
            type="button"
            onClick={handleCreate}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            + Buat Iklan
          </button>
        </section>
      ) : filteredAds.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <h2 className="text-base font-black text-slate-900">
            Iklan tidak ditemukan
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Coba ubah kata pencarian atau filter yang digunakan.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setPositionFilter("all");
            }}
            className="mt-5 text-sm font-bold text-indigo-600"
          >
            Reset semua filter
          </button>
        </section>
      ) : (
        <AdsTable
          ads={filteredAds}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}
    </main>
  );
}