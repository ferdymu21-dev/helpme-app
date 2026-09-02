"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  CampaignStatus,
} from "../constants/campaign-status";

import type {
  NotificationCampaign,
} from "../types/campaign.types";

import {
  formatCampaignDateWib,
  formatCampaignEnumLabel,
  formatCampaignPercent,
  formatCampaignTarget,
} from "../utils/campaign-display";

import CampaignStatusBadge from "../components/CampaignStatusBadge";

import CampaignDetailActions from "../components/CampaignDetailActions";

interface Props {
  campaign: NotificationCampaign;
}

interface DetailItemProps {
  label: string;
  value: string;
  accent?: boolean;
}

function DetailItem({
  label,
  value,
  accent = false,
}: DetailItemProps) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1.5 wrap-break-word text-sm font-bold leading-6 ${
          accent
            ? "text-rose-700"
            : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function CampaignDetailPage({
  campaign,
}: Props) {
  const [
    imageFailed,
    setImageFailed,
  ] = useState(false);

  const openRate =
    campaign.total_sent > 0
      ? (campaign.total_opened /
          campaign.total_sent) *
        100
      : 0;

  const ctr =
    campaign.total_sent > 0
      ? (campaign.total_clicked /
          campaign.total_sent) *
        100
      : 0;

  return (
    <main className="space-y-6 p-3">
      {/* BACK */}

      <Link
        href="/admin/campaigns"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900"
      >
        <span aria-hidden="true">
          ←
        </span>

        Kembali ke Campaign
      </Link>

      {/* HERO */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Campaign Detail
            </p>

            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-950">
              {campaign.title}
            </h1>

            <p className="mt-3 max-w-4xl whitespace-pre-wrap text-sm leading-6 text-slate-500">
              {campaign.message}
            </p>
          </div>

          <div className="shrink-0">
            <CampaignStatusBadge
              status={
                campaign.status
              }
            />
          </div>
        </div>
      </section>

      {/* METRICS */}

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Terkirim
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            {campaign.total_sent.toLocaleString(
              "id-ID",
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Dibuka
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            {campaign.total_opened.toLocaleString(
              "id-ID",
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Diklik
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            {campaign.total_clicked.toLocaleString(
              "id-ID",
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Open Rate
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            {formatCampaignPercent(
              openRate,
            )}
            %
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            CTR
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            {formatCampaignPercent(
              ctr,
            )}
            %
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.7fr)]">
        {/* LEFT */}

        <div className="space-y-6">
          {/* INFORMATION */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Informasi Campaign
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Konfigurasi audience,
                kategori, jenis, dan
                tujuan komunikasi.
              </p>
            </div>

            <div className="mt-6 grid gap-6 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2">
              <DetailItem
                label="Audience"
                value={formatCampaignTarget(
                  campaign.target_type,
                )}
              />

              <DetailItem
                label="Target Detail"
                value={
                  campaign.target_value ??
                  "Tidak ada target khusus"
                }
              />

              <DetailItem
                label="Kategori"
                value={formatCampaignEnumLabel(
                  campaign.category,
                )}
              />

              <DetailItem
                label="Jenis"
                value={formatCampaignEnumLabel(
                  campaign.type,
                )}
              />
            </div>
          </section>

          {/* CONTENT */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Konten Campaign
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Materi yang diterima
                pengguna melalui
                notifikasi.
              </p>
            </div>

            <div className="mt-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Pesan
              </p>

              <div className="mt-2 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {campaign.message}
                </p>
              </div>
            </div>

            {campaign.image_url && (
              <div className="mt-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Gambar
                </p>

                <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  {!imageFailed ? (
                    <div className="relative aspect-16/7 w-full">
                      <Image
                        src={
                          campaign.image_url
                        }
                        alt={
                          campaign.title
                        }
                        fill
                        unoptimized
                        sizes="900px"
                        className="object-cover"
                        onError={() =>
                          setImageFailed(
                            true,
                          )
                        }
                      />
                    </div>
                  ) : (
                    <div className="flex min-h-48 items-center justify-center px-6 text-center">
                      <p className="text-sm font-medium text-slate-400">
                        Preview gambar
                        tidak tersedia.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Redirect URL
              </p>

              {campaign.redirect_url ? (
                <a
                  href={
                    campaign.redirect_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block break-all text-sm font-bold leading-6 text-indigo-600 transition hover:text-indigo-700 hover:underline"
                >
                  {
                    campaign.redirect_url
                  }
                </a>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Tidak ada redirect
                  URL.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT */}

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          {/* TIMELINE */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-black text-slate-950">
              Timeline
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Waktu campaign dalam
              zona WIB.
            </p>

            <div className="mt-6 space-y-5">
              <DetailItem
                label="Dibuat"
                value={formatCampaignDateWib(
                  campaign.created_at,
                )}
              />

              <div className="border-t border-slate-100 pt-5">
                <DetailItem
  label="Dijadwalkan"
  value={formatCampaignDateWib(
    campaign.scheduled_at,
  )}
/>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <DetailItem
                  label="Dipublikasikan"
                  value={formatCampaignDateWib(
                    campaign.published_at,
                  )}
                />
              </div>

              <div className="border-t border-slate-100 pt-5">
                <DetailItem
                  label="Berakhir"
                  value={formatCampaignDateWib(
                    campaign.expires_at,
                  )}
                />
              </div>

              <div className="border-t border-slate-100 pt-5">
                <DetailItem
                  label="Terakhir diperbarui"
                  value={formatCampaignDateWib(
                    campaign.updated_at,
                  )}
                />
              </div>
            </div>
          </section>

          {/* STATUS */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-black text-slate-950">
              Status Campaign
            </h2>

            <div className="mt-5">
              <CampaignStatusBadge
                status={
                  campaign.status
                }
              />
            </div>

            <p className="mt-4 text-xs leading-6 text-slate-500">
              {campaign.status ===
              CampaignStatus.DRAFT
                ? "Campaign masih berupa draft dan belum dijadwalkan atau dipublikasikan."
                : campaign.status ===
                    CampaignStatus.SCHEDULED
                  ? "Campaign menunggu waktu publikasi yang sudah ditentukan."
                  : campaign.status ===
                      CampaignStatus.PUBLISHED
                    ? "Campaign sudah dipublikasikan kepada audience."
                    : campaign.status ===
                        CampaignStatus.FINISHED
                      ? "Campaign telah selesai."
                      : "Campaign telah dibatalkan."}
            </p>
          </section>
        </aside>
      </div>

      {/* ACTIONS */}

      <CampaignDetailActions
        campaignId={campaign.id}
        campaignTitle={
          campaign.title
        }
        status={
          campaign.status
        }
      />
    </main>
  );
}