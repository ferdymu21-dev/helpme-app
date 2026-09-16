import type { ServiceRequestStatusValue } from "../constants/service-request-status";

import type { ServiceRequestMode } from "./service-request.types";

export interface ProviderServiceRequestSummary {
  id: string;

  serviceListingId: string;

  customerId: string;

  providerId: string;

  requestDescription: string;

  neededAt: string;

  serviceMode: ServiceRequestMode;

  locationName: string | null;

  budget: number | null;

  status: ServiceRequestStatusValue;

  createdAt: string;

  updatedAt: string;

  listingTitle: string;

  listingCategory: string;

  listingCoverStoragePath: string | null;

  customerFullName: string | null;

  customerUsername: string | null;

  customerAvatarUrl: string | null;
}

export interface ProviderServiceRequestPage {
  items: ProviderServiceRequestSummary[];

  totalCount: number;

  page: number;

  pageSize: number;
}

export type ServiceCompletionSubmissionStatus =
  | "SUBMITTED"
  | "REVISION_REQUESTED"
  | "ACCEPTED";

export interface ServiceCompletionSubmission {
  id: string;

  serviceRequestId: string;

  serviceAgreementId: string;

  submissionNo: number;

  providerNote: string;

  proofStoragePath: string | null;

  status: ServiceCompletionSubmissionStatus;

  submittedAt: string;

  customerRespondedAt: string | null;

  revisionReason: string | null;

  revisionRequestedAt: string | null;

  acceptedAt: string | null;
}

export interface ServiceRequestDetail {
  id: string;

  serviceListingId: string;

  customerId: string;

  providerId: string;

  requestDescription: string;

  neededAt: string;

  serviceMode: ServiceRequestMode;

  locationName: string | null;

  budget: number | null;

  status: ServiceRequestStatusValue;

  agreedAt: string | null;

  startedAt: string | null;

  submittedAt: string | null;

  completedAt: string | null;

  declinedAt: string | null;

  declinedReason: string | null;

  cancelledAt: string | null;

  cancelledBy: string | null;

  cancellationReason: string | null;

  createdAt: string;

  updatedAt: string;

  listingTitle: string;

  listingCategory: string;

  listingCoverStoragePath: string | null;

  customerFullName: string | null;

  customerUsername: string | null;

  customerAvatarUrl: string | null;

  providerFullName: string | null;

  providerUsername: string | null;

  providerAvatarUrl: string | null;

  providerVerificationStatus: string | null;

  latestCompletionSubmission: ServiceCompletionSubmission | null;
}
