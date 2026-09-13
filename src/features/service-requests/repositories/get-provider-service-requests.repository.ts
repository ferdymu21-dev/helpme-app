import { supabase } from "@/lib/supabase/client";

import type { ServiceRequestStatusValue } from "../constants/service-request-status";

import { parseProviderServiceRequestSummary } from "../parsers/service-request-read.parser";

import type { ProviderServiceRequestPage } from "../types/service-request-read.types";

interface GetProviderServiceRequestsRepositoryInput {
  page: number;

  pageSize: number;

  status: ServiceRequestStatusValue | null;
}

export async function getProviderServiceRequestsRepository({
  page,
  pageSize,
  status,
}: GetProviderServiceRequestsRepositoryInput): Promise<ProviderServiceRequestPage> {
  const { data, error } = await supabase.rpc(
    "get_my_provider_service_requests",
    {
      p_page: page,

      p_page_size: pageSize,

      p_status: status,
    },
  );

  if (error) {
    throw error;
  }

  if (data !== null && !Array.isArray(data)) {
    throw new Error("Provider Service Request response is invalid.");
  }

  const rawRows: unknown[] = data ?? [];

  const rows = rawRows.map((row) => parseProviderServiceRequestSummary(row));

  const totalCount = rows[0]?.totalCount ?? 0;

  const items = rows.map((row) => {
    const { totalCount: rowTotalCount, ...request } = row;

    if (rowTotalCount !== totalCount) {
      throw new Error("Provider Service Request total count is inconsistent.");
    }

    return request;
  });

  return {
    items,

    totalCount,

    page,

    pageSize,
  };
}
