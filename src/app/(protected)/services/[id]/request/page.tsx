"use client";

import { useParams } from "next/navigation";

import CreateServiceRequestPageUI from "@/features/service-requests/CreateServiceRequestPageUI";

import { useCreateServiceRequestPage } from "@/features/service-requests/hooks/useCreateServiceRequestPage";

export default function CreateServiceRequestPage() {
  const params = useParams<{
    id: string;
  }>();

  const props = useCreateServiceRequestPage(params.id);

  return <CreateServiceRequestPageUI {...props} />;
}
