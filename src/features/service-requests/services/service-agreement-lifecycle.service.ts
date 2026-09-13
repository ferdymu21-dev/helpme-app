import {
  approveServiceAgreementRepository,
  proposeServiceAgreementRepository,
  rejectServiceAgreementRepository,
} from "../repositories/service-agreement-lifecycle.repository";

import type { ServiceAgreementProposalDraft } from "../types/service-agreement.types";

import { validateServiceAgreementId } from "../validators/validate-service-agreement-identity";

import { validateServiceAgreementProposal } from "../validators/validate-service-agreement-proposal";

export async function proposeServiceAgreementService(
  draft: ServiceAgreementProposalDraft,
): Promise<string> {
  return proposeServiceAgreementRepository(
    validateServiceAgreementProposal(draft),
  );
}

export async function approveServiceAgreementService(
  agreementId: string,
): Promise<string> {
  return approveServiceAgreementRepository(
    validateServiceAgreementId(agreementId),
  );
}

export async function rejectServiceAgreementService(
  agreementId: string,
  reason: string,
): Promise<string> {
  const normalizedReason = reason.trim();

  if (!normalizedReason) {
    throw new Error("Alasan penolakan kesepakatan wajib diisi.");
  }

  return rejectServiceAgreementRepository(
    validateServiceAgreementId(agreementId),
    normalizedReason,
  );
}
