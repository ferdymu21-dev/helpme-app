"use client";

import CreateServiceListingPageUI from "@/features/service-listings/CreateServiceListingPageUI";

import {
  useCreateServiceListingPage,
} from "@/features/service-listings/hooks/useCreateServiceListingPage";

export default function CreateServiceListingPage() {
  const props =
    useCreateServiceListingPage();

  return (
    <CreateServiceListingPageUI
      {...props}
    />
  );
}