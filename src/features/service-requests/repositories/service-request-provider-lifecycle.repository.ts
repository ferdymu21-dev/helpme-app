import { supabase } from "@/lib/supabase/client";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseMutationRequestId(value: unknown, operation: string): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new Error(`${operation} returned an invalid Service Request ID.`);
  }

  return value;
}

export async function beginServiceRequestNegotiationRepository(
  requestId: string,
): Promise<string> {
  const { data, error } = await supabase.rpc(
    "begin_service_request_negotiation",
    {
      p_request_id: requestId,
    },
  );

  if (error) {
    throw error;
  }

  return parseMutationRequestId(data, "begin_service_request_negotiation");
}

export async function startServiceRequestWorkRepository(
  requestId: string,
): Promise<string> {
  const { data, error } = await supabase.rpc(
    "start_service_request_work",
    {
      p_request_id: requestId,
    },
  );

  if (error) {
    throw error;
  }

  return parseMutationRequestId(data, "start_service_request_work");
}

export async function submitServiceRequestWorkRepository(
  requestId: string,
  providerNote: string,
): Promise<string> {
  const { data, error } = await supabase.rpc(
    "submit_service_request_work",
    {
      p_request_id: requestId,
      p_provider_note: providerNote,
    },
  );

  if (error) {
    throw error;
  }

  return parseMutationRequestId(data, "submit_service_request_work");
}

export async function declineServiceRequestRepository(
  requestId: string,
  reason: string,
): Promise<string> {
  const { data, error } = await supabase.rpc("decline_service_request", {
    p_request_id: requestId,

    p_reason: reason,
  });

  if (error) {
    throw error;
  }

  return parseMutationRequestId(data, "decline_service_request");
}
