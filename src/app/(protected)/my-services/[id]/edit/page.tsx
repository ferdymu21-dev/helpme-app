"use client";

import {
  useParams,
} from "next/navigation";

import EditServiceListingPageUI from "@/features/service-listings/EditServiceListingPageUI";

import {
  useEditServiceListingPage,
} from "@/features/service-listings/hooks/useEditServiceListingPage";

export default function EditServiceListingPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const props =
    useEditServiceListingPage(
      params.id,
    );

  return (
    <EditServiceListingPageUI
      {...props}
    />
  );
}