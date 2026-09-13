import { supabase } from "@/lib/supabase/client";

import type { ProposeServiceAgreementInput } from "../types/service-agreement.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseAgreementMutationId(value: unknown, operation: string): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new Error(`${operation} returned an invalid Agreement ID.`);
  }

  return value;
}

export async function proposeServiceAgreementRepository(
  input: ProposeServiceAgreementInput,
): Promise<string> {
  const { data, error } = await supabase.rpc("propose_service_agreement", {
    p_request_id: input.requestId,

    p_scope: input.scope,

    p_deliverables: input.deliverables,

    p_total_price: input.totalPrice,

    p_deadline: input.deadline,

    p_revision_terms: input.revisionTerms,

    p_payment_plan_type: input.paymentPlanType,

    p_payment_steps: input.paymentSteps.map((step) => ({
      label: step.label,

      amount: step.amount,

      trigger_type: step.triggerType,

      trigger_note: step.triggerNote,
    })),

    p_notes: input.notes,
  });

  if (error) {
    throw error;
  }

  return parseAgreementMutationId(data, "propose_service_agreement");
}

export async function approveServiceAgreementRepository(
  agreementId: string,
): Promise<string> {
  const { data, error } = await supabase.rpc("approve_service_agreement", {
    p_agreement_id: agreementId,
  });

  if (error) {
    throw error;
  }

  return parseAgreementMutationId(data, "approve_service_agreement");
}

export async function rejectServiceAgreementRepository(
  agreementId: string,
  reason: string,
): Promise<string> {
  const { data, error } = await supabase.rpc("reject_service_agreement", {
    p_agreement_id: agreementId,

    p_reason: reason,
  });

  if (error) {
    throw error;
  }

  return parseAgreementMutationId(data, "reject_service_agreement");
}
