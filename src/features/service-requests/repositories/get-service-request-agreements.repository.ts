import { supabase } from "@/lib/supabase/client";

import { parseServiceAgreement } from "../parsers/service-agreement.parser";

import type { ServiceAgreement } from "../types/service-agreement.types";

export async function getServiceRequestAgreementsRepository(
  requestId: string,
): Promise<ServiceAgreement[]> {
  const { data, error } = await supabase.rpc(
    "get_my_service_request_agreements",
    {
      p_request_id: requestId,
    },
  );

  if (error) {
    throw error;
  }

  if (data !== null && !Array.isArray(data)) {
    throw new Error("Riwayat Kesepakatan Jasa tidak valid.");
  }

  const rows: unknown[] = data ?? [];

  return rows.map((row) => parseServiceAgreement(row));
}
