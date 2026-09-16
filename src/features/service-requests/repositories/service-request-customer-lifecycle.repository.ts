import { supabase } from "@/lib/supabase/client";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseMutationRequestId(
  value: unknown,
  operation: string,
): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new Error(
      `${operation} returned an invalid Service Request ID.`,
    );
  }

  return value;
}

export async function requestServiceCompletionRevisionRepository(
  requestId: string,
  revisionReason: string,
): Promise<string> {
  const { data, error } = await supabase.rpc(
    "request_service_completion_revision",
    {
      p_request_id: requestId,
      p_revision_reason: revisionReason,
    },
  );

  if (error) {
    throw error;
  }

  return parseMutationRequestId(
    data,
    "request_service_completion_revision",
  );
}

export async function acceptServiceCompletionRepository(
  requestId: string,
): Promise<string> {
  const { data, error } = await supabase.rpc(
    "accept_service_completion",
    {
      p_request_id: requestId,
    },
  );

  if (error) {
    throw error;
  }

  return parseMutationRequestId(
    data,
    "accept_service_completion",
  );
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

  return parseMutationRequestId(data, "cancel_service_request");
}
