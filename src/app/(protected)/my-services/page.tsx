"use client";

import MyServicesPageUI from "@/features/service-listings/MyServicesPageUI";

import { useMyServicesPage } from "@/features/service-listings/hooks/useMyServicesPage";

export default function MyServicesPage() {
  const props = useMyServicesPage();

  return <MyServicesPageUI {...props} />;
}
