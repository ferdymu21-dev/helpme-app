"use client";

import { useParams } from "next/navigation";

import PreviewServiceListingPageUI from "@/features/service-listings/PreviewServiceListingPageUI";

import { usePreviewServiceListingPage } from "@/features/service-listings/hooks/usePreviewServiceListingPage";

export default function PreviewServiceListingPage() {
  const params = useParams<{
    id: string;
  }>();

  const props =
    usePreviewServiceListingPage(
      params.id,
    );

  return (
    <PreviewServiceListingPageUI
      {...props}
    />
  );
}