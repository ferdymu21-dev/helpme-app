import { supabase } from "@/lib/supabase/client";

import { parseServiceRequestDetail } from "../parsers/service-request-read.parser";

import type { ServiceRequestDetail } from "../types/service-request-read.types";

export async function getServiceRequestDetailRepository(
  requestId: string,
): Promise<ServiceRequestDetail | null> {
  const { data, error } = await supabase
    .rpc("get_my_service_request_detail", {
      p_request_id: requestId,
    })
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return parseServiceRequestDetail(data);
}
