"use client";

import { useEffect, useState } from "react";

import AdForm from "../components/admin/AdForm";
import AdsTable from "../components/admin/AdsTable";

import type { AdWithStats } from "../types/ad.types";

export default function AdsManagementPage() {
  const [ads, setAds] = useState<AdWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [editingAd, setEditingAd] = useState<AdWithStats | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      <main className="p-8">
        <p>Memuat iklan...</p>
      </main>
    );
  }

  if (showForm) {
    return (
      <main className="space-y-6 p-8">
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
    <main className="space-y-6 p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Manajemen Iklan</h1>

          <p className="mt-1 text-sm text-slate-500">
            Kelola iklan yang ditampilkan pada halaman HelpMe.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="w-fit rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          + Buat Iklan
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {ads.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="font-bold">Belum ada iklan.</p>

          <p className="mt-1 text-sm text-slate-500">
            Buat iklan pertama untuk mulai menampilkan promo.
          </p>

          <button
            type="button"
            onClick={handleCreate}
            className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
          >
            Buat Iklan
          </button>
        </div>
      ) : (
        <AdsTable
          ads={ads}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}
    </main>
  );
}