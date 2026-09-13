"use client";

import { useParams } from "next/navigation";

import ServiceRequestDetailPageUI from "@/features/service-requests/ServiceRequestDetailPageUI";

import { useServiceRequestDetailPage } from "@/features/service-requests/hooks/useServiceRequestDetailPage";

export default function ServiceRequestDetailPage() {
  const params = useParams<{
    id: string;
  }>();

  const props = useServiceRequestDetailPage(params.id);

  return <ServiceRequestDetailPageUI {...props} />;
}
