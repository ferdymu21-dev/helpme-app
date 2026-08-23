"use client";

import { useMemo, useState } from "react";

import type { NotificationCampaign } from "../types/campaign.types";

import CampaignToolbar from "../components/CampaignToolbar";
import CampaignList from "../components/CampaignList";

interface Props {
  campaigns: NotificationCampaign[];
}

export default function CampaignManagementPage({
  campaigns,
}: Props) {
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [target, setTarget] = useState("");

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchSearch =
        campaign.title.toLowerCase().includes(search.toLowerCase()) ||
        campaign.message.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        !status || campaign.status === status;

      const matchTarget =
        !target || campaign.target_type === target;

      return matchSearch && matchStatus && matchTarget;
    });
  }, [campaigns, search, status, target]);

  return (
    <>
      <CampaignToolbar
        search={search}
        status={status}
        target={target}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onTargetChange={setTarget}
      />

      <CampaignList campaigns={filteredCampaigns} />
    </>
  );
}