import EditCampaignPage from "@/features/campaigns/pages/EditCampaignPage";

import { getCampaignByIdService } from "@/features/campaigns/services";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  const campaign = await getCampaignByIdService(id);

  return <EditCampaignPage campaign={campaign} />;
}