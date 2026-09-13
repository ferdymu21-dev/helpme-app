import { supabase } from "@/lib/supabase/client";

import { REPORT_REASONS } from "../constants/report-reasons";

export interface SubmitServiceListingReportInput {
  serviceListingId: string;

  reason: string;

  description: string;
}

export async function submitServiceListingReport(
  input: SubmitServiceListingReportInput,
): Promise<void> {
  const serviceListingId = input.serviceListingId.trim();

  const reason = input.reason.trim();

  const description = input.description.trim();

  if (!serviceListingId) {
    throw new Error("SERVICE_LISTING_ID_REQUIRED");
  }

  const validReason = REPORT_REASONS.some((item) => item.value === reason);

  if (!validReason) {
    throw new Error("INVALID_REPORT_REASON");
  }

  const { error } = await supabase.rpc("create_service_listing_report", {
    p_service_listing_id: serviceListingId,

    p_reason: reason,

    p_description: description || null,
  });

  if (error) {
    throw new Error(error.message);
  }
}
