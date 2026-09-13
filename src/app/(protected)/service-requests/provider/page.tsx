"use client";

import ProviderServiceRequestsPageUI from "@/features/service-requests/ProviderServiceRequestsPageUI";

import { useProviderServiceRequestsPage } from "@/features/service-requests/hooks/useProviderServiceRequestsPage";

export default function ProviderServiceRequestsPage() {
  const props = useProviderServiceRequestsPage();

  return <ProviderServiceRequestsPageUI {...props} />;
}
