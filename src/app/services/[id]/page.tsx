"use client";

import { useParams } from "next/navigation";

import ServiceListingDetailPageUI from "@/features/service-listings/ServiceListingDetailPageUI";

import { usePublicServiceListingDetail } from "@/features/service-listings/hooks/usePublicServiceListingDetail";

export default function PublicServiceListingDetailPage() {
  const params = useParams<{
    id: string;
  }>();

  const props = usePublicServiceListingDetail(params.id);

  return <ServiceListingDetailPageUI {...props} />;
}
