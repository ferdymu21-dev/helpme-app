"use client";

import Link from "next/link";

import {
  CampaignStatus,
} from "../constants/campaign-status";

import type {
  CampaignStatusValue,
} from "../constants/campaign-status";

import {
  useCampaignActions,
} from "../hooks/useCampaignActions";

import {
  useDeleteCampaign,
} from "../hooks/useDeleteCampaign";

interface Props {
  campaignId: string;
  campaignTitle: string;
  status: CampaignStatusValue;
}

export default function CampaignDetailActions({
  campaignId,
  campaignTitle,
  status,
}: Props) {
  const actions =
    useCampaignActions(
      campaignId,
    );

  const deletion =
    useDeleteCampaign(
      campaignId,
    );

  const canEdit =
    status ===
      CampaignStatus.DRAFT ||
    status ===
      CampaignStatus.SCHEDULED;

  const canPublish =
    status ===
    CampaignStatus.SCHEDULED;

  const canCancel =
    status ===
    CampaignStatus.SCHEDULED;

  const canDelete =
    status ===
      CampaignStatus.DRAFT ||
    status ===
      CampaignStatus.CANCELLED;

  const hasAction =
    canEdit ||
    canPublish ||
    canCancel ||
    canDelete;

  async function handlePublish() {
    const confirmed =
      window.confirm(
        `Publikasikan campaign "${campaignTitle}" sekarang?`,
      );

    if (!confirmed) {
      return;
    }

    await actions.publish();
  }

  async function handleCancel() {
    const confirmed =
      window.confirm(
        `Batalkan jadwal campaign "${campaignTitle}"?`,
      );

    if (!confirmed) {
      return;
    }

    await actions.cancel();
  }

  if (!hasAction) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-slate-900">
              Tidak ada tindakan
              yang diperlukan
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Campaign dalam status
              ini bersifat read-only
              dari halaman admin.
            </p>
          </div>

          <Link
            href="/admin/campaigns"
            className="inline-flex w-fit items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Kembali ke Campaign
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-black text-slate-900">
            Tindakan Campaign
          </p>

          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
            Pastikan perubahan
            sesuai sebelum melakukan
            tindakan terhadap
            campaign.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Link
              href={`/admin/campaigns/${campaignId}/edit`}
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
                hover:bg-slate-50
              "
            >
              Edit
            </Link>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={
                deletion.remove
              }
              disabled={
                deletion.loading
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
              {deletion.loading
                ? "Menghapus..."
                : "Hapus"}
            </button>
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
              Batalkan Jadwal
            </button>
          )}

          {canPublish && (
            <button
              type="button"
              onClick={
                handlePublish
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
      </div>
    </section>
  );
}