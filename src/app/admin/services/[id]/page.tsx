"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Ban,
  BriefcaseBusiness,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { useParams } from "next/navigation";

interface ProviderSummary {
  id: string;

  fullName: string | null;
  username: string | null;

  verificationStatus: string | null;
}

interface ServiceListingDetail {
  id: string;

  title: string;
  category: string;

  description: string | null;

  status: string;

  serviceMode: string | null;

  locationName: string | null;

  createdAt: string;
  updatedAt: string;

  publishedAt: string | null;

  activatedAt: string | null;

  expiresAt: string | null;

  pausedAt: string | null;

  blockedAt: string | null;

  blockedReason: string | null;

  blockedFromStatus: string | null;

  provider: ProviderSummary | null;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("id-ID") : "-";
}

export default function AdminServiceDetailPage() {
  const params = useParams();

  const listingId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [listing, setListing] = useState<ServiceListingDetail | null>(null);

  const [loading, setLoading] = useState(true);

  const [moderationAction, setModerationAction] = useState<string | null>(null);

  const loadListing = useCallback(async () => {
    if (!listingId) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/services/${encodeURIComponent(listingId)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        setListing(null);

        return;
      }

      const data: ServiceListingDetail = await response.json();

      setListing(data);
    } catch (error) {
      console.error(error);

      setListing(null);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadListing();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadListing]);

  async function moderate(action: "BLOCK" | "UNBLOCK") {
    if (!listing) {
      return;
    }

    let reason: string | undefined;

    if (action === "BLOCK") {
      const input = window.prompt("Masukkan alasan pemblokiran jasa:");

      if (input === null || !input.trim()) {
        return;
      }

      reason = input.trim();
    } else {
      const confirmed = window.confirm("Buka blokir jasa ini?");

      if (!confirmed) {
        return;
      }
    }

    try {
      setModerationAction(action);

      const response = await fetch(
        `/api/admin/services/${encodeURIComponent(listing.id)}/moderation`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            action,

            ...(reason
              ? {
                  reason,
                }
              : {}),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Moderasi gagal.");
      }

      await loadListing();
    } catch (error) {
      console.error(error);

      window.alert("Gagal memoderasi jasa.");
    } finally {
      setModerationAction(null);
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-sm text-slate-500">
        Memuat detail Jasa...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
        <p className="font-bold text-slate-900">Jasa tidak ditemukan.</p>

        <Link
          href="/admin/services"
          className="mt-4 inline-flex text-sm font-bold text-indigo-600"
        >
          Kembali ke Jasa
        </Link>
      </div>
    );
  }

  const canBlock = ["ACTIVE", "PAUSED", "EXPIRED"].includes(listing.status);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/admin/services"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Jasa
      </Link>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <BriefcaseBusiness className="mt-1 h-6 w-6 text-indigo-600" />

          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                {listing.status}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {listing.category}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-black text-slate-950">
              {listing.title}
            </h1>

            {listing.description && (
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                {listing.description}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-black text-slate-900">Provider</h2>

          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              Nama:{" "}
              <strong className="text-slate-900">
                {listing.provider?.fullName || "-"}
              </strong>
            </p>

            <p>Username: {listing.provider?.username || "-"}</p>

            <p>Verifikasi: {listing.provider?.verificationStatus || "-"}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-black text-slate-900">Lifecycle</h2>

          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>Dibuat: {formatDate(listing.createdAt)}</p>

            <p>Published: {formatDate(listing.publishedAt)}</p>

            <p>Activated: {formatDate(listing.activatedAt)}</p>

            <p>Expires: {formatDate(listing.expiresAt)}</p>

            <p>Paused: {formatDate(listing.pausedAt)}</p>
          </div>
        </section>
      </div>

      {listing.blockedReason && (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-black text-red-900">Moderation Metadata</h2>

          <div className="mt-3 space-y-2 text-sm text-red-700">
            <p>Alasan: {listing.blockedReason}</p>

            <p>Diblokir: {formatDate(listing.blockedAt)}</p>

            <p>Status sebelumnya: {listing.blockedFromStatus || "-"}</p>
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-red-200 bg-red-50/40 p-6">
        <h2 className="font-black text-red-900">Moderasi Jasa</h2>

        <p className="mt-1 text-sm text-red-700">
          Moderasi tidak mengubah status pembayaran publikasi maupun Permintaan
          Jasa.
        </p>

        <div className="mt-5">
          {listing.status === "BLOCKED" ? (
            <button
              type="button"
              disabled={moderationAction !== null}
              onClick={() => void moderate("UNBLOCK")}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 text-sm font-bold text-emerald-700 disabled:opacity-50"
            >
              {moderationAction === "UNBLOCK" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Buka Blokir
            </button>
          ) : canBlock ? (
            <button
              type="button"
              disabled={moderationAction !== null}
              onClick={() => void moderate("BLOCK")}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white disabled:opacity-50"
            >
              {moderationAction === "BLOCK" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Ban className="h-4 w-4" />
              )}
              Blokir Jasa
            </button>
          ) : (
            <p className="text-sm text-slate-500">
              Status ini tidak dapat diblokir melalui moderation authority.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
