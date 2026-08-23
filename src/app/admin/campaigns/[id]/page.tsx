import { getCampaignByIdService } from "@/features/campaigns/services";
import CampaignDetailPage from "@/features/campaigns/pages/CampaignDetailPage";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  const campaign = await getCampaignByIdService(id);

  return <CampaignDetailPage campaign={campaign} />;
}