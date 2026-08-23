import CampaignManagementPage
from "@/features/campaigns/pages/CampaignManagementPage";

import {
  getCampaignsService,
} from "@/features/campaigns/services";

export default async function Page() {
  const campaigns = await getCampaignsService();

  return (
    <CampaignManagementPage
      campaigns={campaigns}
    />
  );
}