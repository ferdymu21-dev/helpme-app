"use client";

import CampaignForm from "../components/CampaignForm";

import { useEditCampaign } from "../hooks/useEditCampaign";

import type { NotificationCampaign } from "../types/campaign.types";

interface Props {
  campaign: NotificationCampaign;
}

export default function EditCampaignPage({ campaign }: Props) {
  const controller = useEditCampaign(campaign);

  return (
    <main
      className="
                mx-auto
                max-w-5xl
                space-y-8
            "
    >
      <div>
        <h1
          className="
                        text-3xl
                        font-black
                    "
        >
          Edit Campaign
        </h1>

        <p
          className="
                        mt-2
                        text-slate-500
                    "
        >
          Perbarui campaign yang sudah dibuat.
        </p>
      </div>

      <CampaignForm campaign={controller} />
    </main>
  );
}