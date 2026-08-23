"use client";

import Image from "next/image";
import type { AdWithStats } from "../../types/ad.types";


interface AdsTableProps {
  ads: AdWithStats[];
  onEdit: (ad: AdWithStats) => void;
  onDelete: (ad: AdWithStats) => void;
  deletingId?: string | null;
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getAdStatus(ad: AdWithStats) {
  const now = new Date();

  if (!ad.is_active) {
    return {
      label: "Nonaktif",
      className: "bg-slate-100 text-slate-500",
    };
  }

  if (ad.start_at && new Date(ad.start_at) > now) {
    return {
      label: "Terjadwal",
      className: "bg-blue-100 text-blue-700",
    };
  }

  if (ad.end_at && new Date(ad.end_at) < now) {
    return {
      label: "Berakhir",
      className: "bg-red-100 text-red-700",
    };
  }

  return {
    label: "Aktif",
    className: "bg-green-100 text-green-700",
  };
}

export default function AdsTable({
  ads,
  onEdit,
  onDelete,
  deletingId,
}: AdsTableProps) {
  return (
    <div className="space-y-4">
      {ads.map((ad) => {
        const status = getAdStatus(ad);

        return (
          <div
            key={ad.id}
            className="rounded-2xl bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-5 lg:flex-row">
              <Image
                src={ad.image_url}
                alt={ad.title}
                width={192}
                height={112}
                className="h-40 w-full rounded-xl object-cover lg:h-28 lg:w-48"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-base font-bold">{ad.title}</h2>

                    {ad.description && (
                      <p className="mt-1 text-sm text-slate-500">
                        {ad.description}
                      </p>
                    )}
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    {ad.position === "home_desktop"
                      ? "Home Desktop"
                      : "Home Mobile"}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Urutan: {ad.sort_order}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Mulai: {formatDate(ad.start_at)}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Berakhir: {formatDate(ad.end_at)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 sm:max-w-md">
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-slate-500">
                      Impression
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-900">
                      {ad.stats.impressions.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-slate-500">
                      Click
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-900">
                      {ad.stats.clicks.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-slate-500">
                      CTR
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-900">
                      {ad.stats.ctr.toLocaleString("id-ID", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      %
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(ad)}
                    className="rounded-xl border-slate-300 bg-slate-300 px-4 py-2 text-sm font-bold transition hover:bg-slate-500"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(ad)}
                    disabled={deletingId === ad.id}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === ad.id ? "Menghapus..." : "Hapus"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}