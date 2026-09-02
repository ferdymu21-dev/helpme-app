"use client";

import Link from "next/link";

import {
  CampaignStatus,
} from "../constants/campaign-status";

import {
  useCampaignActions,
} from "../hooks/useCampaignActions";

import type {
  NotificationCampaign,
} from "../types/campaign.types";

import {
  formatCampaignDateWib,
  formatCampaignEnumLabel,
  formatCampaignPercent,
  formatCampaignTarget,
} from "../utils/campaign-display";

import CampaignStatusBadge from "./CampaignStatusBadge";

interface Props {
  campaign: NotificationCampaign;
}

interface TimingInfo {
  label: string;
  value: string;
  warning: boolean;
}

function getTimingInfo(
  campaign: NotificationCampaign,
): TimingInfo {
  if (
    campaign.status ===
      CampaignStatus.SCHEDULED &&
    campaign.scheduled_at
  ) {
    const scheduledDate =
      new Date(
        campaign.scheduled_at,
      );

    const overdue =
      scheduledDate.getTime() <=
      Date.now();

    return {
      label: overdue
        ? "Melewati jadwal"
        : "Dijadwalkan",

      value:
        formatCampaignDateWib(
          campaign.scheduled_at,
        ),

      warning: overdue,
    };
  }

  if (
    campaign.status ===
      CampaignStatus.PUBLISHED &&
    campaign.published_at
  ) {
    return {
      label:
        "Dipublikasikan",

      value:
        formatCampaignDateWib(
          campaign.published_at,
        ),

      warning: false,
    };
  }

  if (
    campaign.status ===
    CampaignStatus.DRAFT
  ) {
    return {
      label: "Dibuat",

      value:
        formatCampaignDateWib(
          campaign.created_at,
        ),

      warning: false,
    };
  }

  return {
    label: "Diperbarui",

    value:
      formatCampaignDateWib(
        campaign.updated_at,
      ),

    warning: false,
  };
}

export default function CampaignCard({
  campaign,
}: Props) {
  const actions =
    useCampaignActions(
      campaign.id,
    );

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

  const timing =
    getTimingInfo(campaign);

  const canEdit =
    campaign.status ===
      CampaignStatus.DRAFT ||
    campaign.status ===
      CampaignStatus.SCHEDULED;

  const canPublishNow =
    campaign.status ===
    CampaignStatus.SCHEDULED;

  const canCancel =
    campaign.status ===
    CampaignStatus.SCHEDULED;

  async function handlePublishNow() {
    const confirmed =
      window.confirm(
        `Publikasikan campaign "${campaign.title}" sekarang?`,
      );

    if (!confirmed) {
      return;
    }

    await actions.publish();
  }

  async function handleCancel() {
    const confirmed =
      window.confirm(
        `Batalkan campaign "${campaign.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    await actions.cancel();
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
      {/* HEADER */}

      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-black leading-6 text-slate-950">
              {campaign.title}
            </h2>

            <p className="mt-2 line-clamp-2 max-w-4xl text-sm leading-6 text-slate-500">
              {campaign.message}
            </p>
          </div>

          <CampaignStatusBadge
            status={
              campaign.status
            }
          />
        </div>

        {/* META */}

        <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Audience
            </p>

            <p className="mt-1.5 text-sm font-bold text-slate-800">
              {formatCampaignTarget(
                campaign.target_type,
              )}
            </p>

            {campaign.target_value && (
              <p className="mt-1 truncate text-xs text-slate-500">
                {
                  campaign.target_value
                }
              </p>
            )}
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Kategori
            </p>

            <p className="mt-1.5 text-sm font-bold text-slate-800">
              {formatCampaignEnumLabel(
                campaign.category,
              )}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Jenis
            </p>

            <p className="mt-1.5 text-sm font-bold text-slate-800">
              {formatCampaignEnumLabel(
                campaign.type,
              )}
            </p>
          </div>

          <div>
            <p
              className={`text-[11px] font-bold uppercase tracking-wider ${
                timing.warning
                  ? "text-rose-500"
                  : "text-slate-400"
              }`}
            >
              {timing.label}
            </p>

            <p
              className={`mt-1.5 text-sm font-bold ${
                timing.warning
                  ? "text-rose-700"
                  : "text-slate-800"
              }`}
            >
              {timing.value}
            </p>

            {timing.warning && (
              <p className="mt-1 text-xs font-medium text-rose-500">
                Campaign belum
                dipublikasikan
                setelah waktu
                jadwal.
              </p>
            )}
          </div>
        </div>

        {/* METRICS */}

        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 sm:grid-cols-3 xl:grid-cols-5">
          <div className="bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Terkirim
            </p>

            <p className="mt-2 text-xl font-black text-slate-950">
              {campaign.total_sent.toLocaleString(
                "id-ID",
              )}
            </p>
          </div>

          <div className="bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Dibuka
            </p>

            <p className="mt-2 text-xl font-black text-slate-950">
              {campaign.total_opened.toLocaleString(
                "id-ID",
              )}
            </p>
          </div>

          <div className="bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Diklik
            </p>

            <p className="mt-2 text-xl font-black text-slate-950">
              {campaign.total_clicked.toLocaleString(
                "id-ID",
              )}
            </p>
          </div>

          <div className="bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Open Rate
            </p>

            <p className="mt-2 text-xl font-black text-slate-950">
              {formatCampaignPercent(
                openRate,
              )}
              %
            </p>
          </div>

          <div className="bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              CTR
            </p>

            <p className="mt-2 text-xl font-black text-slate-950">
              {formatCampaignPercent(
                ctr,
              )}
              %
            </p>
          </div>
        </div>
      </div>

      {/* ACTIONS */}

      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/admin/campaigns/${campaign.id}`}
          className="
            inline-flex
            w-fit
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-bold
            text-slate-700
            transition
            hover:border-indigo-200
            hover:bg-indigo-50
            hover:text-indigo-700
          "
        >
          Lihat Detail
        </Link>

        {(canEdit ||
          canPublishNow ||
          canCancel) && (
          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <Link
                href={`/admin/campaigns/${campaign.id}/edit`}
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-slate-700
                  transition
                  hover:bg-slate-100
                "
              >
                Edit
              </Link>
            )}

            {canCancel && (
              <button
                type="button"
                onClick={
                  handleCancel
                }
                disabled={
                  actions.loading
                }
                className="
                  rounded-xl
                  border
                  border-rose-200
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-rose-600
                  transition
                  hover:bg-rose-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Batalkan
              </button>
            )}

            {canPublishNow && (
              <button
                type="button"
                onClick={
                  handlePublishNow
                }
                disabled={
                  actions.loading
                }
                className="
                  rounded-xl
                  bg-indigo-600
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-indigo-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {actions.loading
                  ? "Memproses..."
                  : "Publikasikan Sekarang"}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}