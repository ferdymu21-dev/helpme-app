import { supabase } from "@/lib/supabase/client";

import { parseServicePaymentAcknowledgement } from "../parsers/service-payment-acknowledgement.parser";

import type { ServicePaymentAcknowledgement } from "../types/service-payment-acknowledgement.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseMutationId(
  value: unknown,
  operation: string,
): string {
  if (
    typeof value !== "string" ||
    !UUID_PATTERN.test(value)
  ) {
    throw new Error(
      `${operation} returned an invalid acknowledgement ID.`,
    );
  }

  return value;
}

export async function getServicePaymentAcknowledgementsRepository(
  requestId: string,
): Promise<ServicePaymentAcknowledgement[]> {
  const { data, error } = await supabase.rpc(
    "get_my_service_payment_acknowledgements",
    {
      p_request_id: requestId,
    },
  );

  if (error) {
    throw error;
  }

  if (
    data !== null &&
    !Array.isArray(data)
  ) {
    throw new Error(
      "Riwayat pembayaran Jasa tidak valid.",
    );
  }

  const rows: unknown[] =
    data ?? [];

  return rows.map(
    parseServicePaymentAcknowledgement,
  );
}

export async function reportServicePaymentPaidRepository(
  paymentStepId: string,
  customerNote: string | null,
): Promise<string> {
  const { data, error } = await supabase.rpc(
    "report_service_payment_paid",
    {
      p_payment_step_id: paymentStepId,

      p_customer_note: customerNote,
    },
  );

  if (error) {
    throw error;
  }

  return parseMutationId(
    data,
    "report_service_payment_paid",
  );
}

export async function confirmServicePaymentRepository(
  acknowledgementId: string,
  providerNote: string | null,
): Promise<string> {
  const { data, error } = await supabase.rpc(
    "confirm_service_payment",
    {
      p_acknowledgement_id:
        acknowledgementId,

      p_provider_note:
        providerNote,
    },
  );

  if (error) {
    throw error;
  }

  return parseMutationId(
    data,
    "confirm_service_payment",
  );
}

export async function reportServicePaymentIssueRepository(
  acknowledgementId: string,
  issueReason: string,
  providerNote: string | null,
): Promise<string> {
  const { data, error } = await supabase.rpc(
    "report_service_payment_issue",
    {
      p_acknowledgement_id:
        acknowledgementId,

      p_issue_reason:
        issueReason,

      p_provider_note:
        providerNote,
    },
  );

  if (error) {
    throw error;
  }

  return parseMutationId(
    data,
    "report_service_payment_issue",
  );
}
