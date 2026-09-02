"use client";

import Image from "next/image";
import { useState } from "react";

import type { AdWithStats } from "../../types/ad.types";

interface AdsTableProps {
  ads: AdWithStats[];
  onEdit: (ad: AdWithStats) => void;
  onDelete: (ad: AdWithStats) => void;
  deletingId?: string | null;
}

interface AdStatus {
  label: string;
  className: string;
  dotClassName: string;
}

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCtr(value: number) {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getPositionLabel(position: AdWithStats["position"]) {
  if (position === "home_desktop") {
    return "Home Desktop";
  }

  return "Home Mobile";
}

function getAdStatus(ad: AdWithStats): AdStatus {
  const now = new Date();

  if (!ad.is_active) {
    return {
      label: "Nonaktif",
      className: "border-slate-200 bg-slate-50 text-slate-600",
      dotClassName: "bg-slate-400",
    };
  }

  if (ad.start_at && new Date(ad.start_at) > now) {
    return {
      label: "Terjadwal",
      className: "border-blue-200 bg-blue-50 text-blue-700",
      dotClassName: "bg-blue-500",
    };
  }

  if (ad.end_at && new Date(ad.end_at) < now) {
    return {
      label: "Berakhir",
      className: "border-rose-200 bg-rose-50 text-rose-700",
      dotClassName: "bg-rose-500",
    };
  }

  return {
    label: "Aktif",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClassName: "bg-emerald-500",
  };
}

function getLinkHost(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

function AdThumbnail({ ad }: { ad: AdWithStats }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-2 text-center">
        <span className="text-[10px] font-semibold leading-4 text-slate-400">
          Preview tidak tersedia
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
      <Image
        key={ad.image_url}
        src={ad.image_url}
        alt={ad.title}
        fill
        unoptimized
        sizes="96px"
        className="object-cover"
        onError={() => {
          setFailed(true);
        }}
      />
    </div>
  );
}

function PeriodInfo({ ad }: { ad: AdWithStats }) {
  const start = formatDate(ad.start_at);

  const end = formatDate(ad.end_at);

  if (!start && !end) {
    return (
      <p className="text-sm font-medium text-slate-600">Tanpa batas waktu</p>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-500">
        <span className="font-semibold text-slate-700">Mulai:</span>{" "}
        {start ?? "Sekarang"}
      </p>

      <p className="text-xs text-slate-500">
        <span className="font-semibold text-slate-700">Berakhir:</span>{" "}
        {end ?? "Tidak dibatasi"}
      </p>
    </div>
  );
}

export default function AdsTable({
  ads,
  onEdit,
  onDelete,
  deletingId,
}: AdsTableProps) {
  return (
    <>
      {/* DESKTOP TABLE */}
      <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <div className="grid grid-cols-[minmax(270px,1.5fr)_130px_115px_200px_180px_120px] border-b border-slate-200 bg-slate-50 px-5 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Iklan
          </p>

          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Penempatan
          </p>

          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Status
          </p>

          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Periode
          </p>

          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Performa
          </p>

          <p className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Aksi
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {ads.map((ad) => {
            const status = getAdStatus(ad);

            return (
              <article
                key={ad.id}
                className={`grid grid-cols-[minmax(270px,1.5fr)_130px_115px_200px_180px_120px] items-center gap-0 px-5 py-5 transition hover:bg-slate-50/70 ${
                  deletingId === ad.id ? "opacity-50" : ""
                }`}
              >
                {/* AD */}

                <div className="flex min-w-0 items-center gap-3 pr-4">
                  <AdThumbnail ad={ad} />

                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-black text-slate-900">
                      {ad.title}
                    </h2>

                    {ad.description && (
                      <p className="mt-1 line-clamp-1 text-xs leading-5 text-slate-500">
                        {ad.description}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-[11px] font-semibold text-slate-500">
                        CTA: {ad.button_text}
                      </span>

                      <span className="max-w-32 truncate text-[11px] text-slate-400">
                        {getLinkHost(ad.link_url)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PLACEMENT */}

                <div className="pr-4">
                  <span className="inline-flex rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700">
                    {getPositionLabel(ad.position)}
                  </span>

                  <p className="mt-2 text-xs text-slate-400">
                    Urutan{" "}
                    <span className="font-bold text-slate-600">
                      {ad.sort_order}
                    </span>
                  </p>
                </div>

                {/* STATUS */}

                <div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-bold ${status.className}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${status.dotClassName}`}
                    />

                    {status.label}
                  </span>
                </div>

                {/* PERIOD */}
                <div className="pr-3">
                  <PeriodInfo ad={ad} />
                </div>

                {/* PERFORMANCE */}
                <div className="grid grid-cols-3 gap-2 pr-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Imp.
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-900">
                      {ad.stats.impressions.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Klik
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-900">
                      {ad.stats.clicks.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      CTR
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-900">
                      {formatCtr(ad.stats.ctr)}%
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="flex items-center justify-end gap-1.5 pl-2">
                  <button
                    type="button"
                    onClick={() => onEdit(ad)}
                    disabled={deletingId === ad.id}
                    className="
      rounded-lg
      border
      border-slate-200
      bg-white
      px-3
      py-2
      text-xs
      font-bold
      text-slate-700
      transition
      hover:border-indigo-200
      hover:bg-indigo-50
      hover:text-indigo-700
      disabled:cursor-not-allowed
      disabled:opacity-50
    "
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(ad)}
                    disabled={deletingId === ad.id}
                    aria-label={`Hapus iklan ${ad.title}`}
                    title="Hapus iklan"
                    className="
      flex
      h-8
      w-8
      items-center
      justify-center
      rounded-lg
      border
      border-rose-200
      bg-white
      text-sm
      font-bold
      text-rose-600
      transition
      hover:bg-rose-50
      disabled:cursor-not-allowed
      disabled:opacity-50
    "
                  >
                    {deletingId === ad.id ? "…" : "×"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* MOBILE / TABLET */}

      <section className="grid gap-4 lg:hidden">
        {ads.map((ad) => {
          const status = getAdStatus(ad);

          return (
            <article
              key={ad.id}
              className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${
                deletingId === ad.id ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <AdThumbnail ad={ad} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-black text-slate-900">
                        {ad.title}
                      </h2>

                      {ad.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {ad.description}
                        </p>
                      )}
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${status.className}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${status.dotClassName}`}
                      />

                      {status.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Penempatan
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {getPositionLabel(ad.position)}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Urutan
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {ad.sort_order}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-100 p-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Jadwal Penayangan
                </p>

                <PeriodInfo ad={ad} />
              </div>

              <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-xl border border-slate-100">
                <div className="p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Impression
                  </p>

                  <p className="mt-1 text-base font-black text-slate-900">
                    {ad.stats.impressions.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Klik
                  </p>

                  <p className="mt-1 text-base font-black text-slate-900">
                    {ad.stats.clicks.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    CTR
                  </p>

                  <p className="mt-1 text-base font-black text-slate-900">
                    {formatCtr(ad.stats.ctr)}%
                  </p>
                </div>
              </div>

              <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => onEdit(ad)}
                  disabled={deletingId === ad.id}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(ad)}
                  disabled={deletingId === ad.id}
                  className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                >
                  {deletingId === ad.id ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}