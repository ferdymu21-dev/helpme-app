"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import CampaignForm from "../components/CampaignForm";

import {
  CampaignStatus,
} from "../constants/campaign-status";

import {
  useEditCampaign,
} from "../hooks/useEditCampaign";

import type {
  NotificationCampaign,
} from "../types/campaign.types";

interface Props {
  campaign: NotificationCampaign;
}

export default function EditCampaignPage({
  campaign,
}: Props) {
  const controller =
    useEditCampaign(
      campaign,
    );

  const router =
    useRouter();

  const canEdit =
    campaign.status ===
      CampaignStatus.DRAFT ||
    campaign.status ===
      CampaignStatus.SCHEDULED;

  /*
   * UI defense-in-depth.
   *
   * List/detail tidak menawarkan
   * Edit untuk campaign terminal/
   * published. Direct URL juga tidak
   * menampilkan form mutasi.
   */
  if (!canEdit) {
    return (
      <main className="p-8">
        <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-sm font-black text-slate-600">
            !
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-950">
            Campaign tidak dapat
            diedit
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Hanya campaign berstatus
            Draft atau Terjadwal yang
            dapat diedit melalui
            halaman ini.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={`/admin/campaigns/${campaign.id}`}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Lihat Detail
            </Link>

            <Link
              href="/admin/campaigns"
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Kembali ke Campaign
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-8">
      <CampaignForm
        campaign={controller}
        mode="edit"
        currentStatus={
          campaign.status
        }
        onCancel={() =>
          router.push(
            `/admin/campaigns/${campaign.id}`,
          )
        }
      />
    </main>
  );
}