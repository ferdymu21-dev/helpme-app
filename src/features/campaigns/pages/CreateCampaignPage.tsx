"use client";

import {
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";

import CampaignForm from "../components/CampaignForm";

import {
  useCreateCampaign,
} from "../hooks/useCreateCampaign";

export default function CreateCampaignPage() {
  const campaign =
    useCreateCampaign();

  const router =
    useRouter();

  useEffect(() => {
    if (!campaign.success) {
      return;
    }

    alert(
      campaign.successMessage,
    );

    campaign.reset();

    router.push(
      "/admin/campaigns",
    );
  }, [
    campaign,
    router,
  ]);

  return (
    <main className="space-y-6 p-8">
      <CampaignForm
        campaign={campaign}
        mode="create"
        onCancel={() =>
          router.push(
            "/admin/campaigns",
          )
        }
      />
    </main>
  );
}