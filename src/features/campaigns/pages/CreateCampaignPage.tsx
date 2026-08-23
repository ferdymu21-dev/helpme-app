"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import CampaignForm from "../components/CampaignForm";

import { useCreateCampaign } from "../hooks/useCreateCampaign";

export default function CreateCampaignPage() {
  const campaign = useCreateCampaign();

  const router = useRouter();

  useEffect(() => {
    if (!campaign.success) {
      return;
    }

    alert(campaign.successMessage);

    campaign.reset();

    router.push("/admin/campaigns");
  }, [campaign, router]);

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
                        text-slate-900
                    "
        >
          Create Campaign
        </h1>

        <p
          className="
                        mt-2
                        text-slate-500
                    "
        >
          Buat campaign baru untuk dikirim kepada pengguna HelpMe.
        </p>
      </div>

      <CampaignForm campaign={campaign} />
    </main>
  );
}