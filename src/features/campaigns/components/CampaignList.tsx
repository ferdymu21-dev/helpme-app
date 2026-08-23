"use client";

import type { NotificationCampaign } from "../types/campaign.types";

import CampaignCard from "./CampaignCard";

import CampaignEmpty from "./CampaignEmpty";

interface Props {
  campaigns: NotificationCampaign[];
}

export default function CampaignList({ campaigns }: Props) {
  if (campaigns.length === 0) {
    return <CampaignEmpty />;
  }

  return (
    <div
      className="
                grid
                gap-6
            "
    >
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}