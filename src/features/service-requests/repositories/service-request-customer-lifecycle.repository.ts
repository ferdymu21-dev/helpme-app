import { supabase } from "@/lib/supabase/client";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseMutationRequestId(value: unknown): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new Error(
      "cancel_service_request returned an invalid Service Request ID.",
    );
  }

  return value;
}

export async function cancelServiceRequestRepository(
  requestId: string,
  reason: string,
): Promise<string> {
  const { data, error } = await supabase.rpc("cancel_service_request", {
    p_request_id: requestId,

    p_reason: reason,
  });

  if (error) {
    throw error;
  }

  return parseMutationRequestId(data);
}
