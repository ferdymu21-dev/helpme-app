export const ADMIN_SERVICE_REQUEST_STATUSES = [
  "PENDING_PROVIDER",
  "NEGOTIATING",
  "AGREEMENT_PENDING",
  "AGREED",
  "IN_PROGRESS",
  "SUBMITTED",
  "COMPLETED",
  "DECLINED",
  "CANCELLED",
] as const;

export type AdminServiceRequestStatus =
  (typeof ADMIN_SERVICE_REQUEST_STATUSES)[number];

export interface AdminServiceRequestParticipant {
  id: string;

  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;

  verificationStatus: string | null;
}

export interface AdminServiceRequestListing {
  id: string;

  title: string;
  category: string;

  status: string;
}

export interface AdminServiceRequestSummary {
  id: string;

  serviceListingId: string;

  listing: AdminServiceRequestListing | null;

  customerId: string;
  customer: AdminServiceRequestParticipant | null;

  providerId: string;
  provider: AdminServiceRequestParticipant | null;

  requestDescription: string;

  neededAt: string;

  serviceMode: string;
  locationName: string | null;

  budget: number | null;

  status: AdminServiceRequestStatus;

  createdAt: string;
  updatedAt: string;
}

export interface AdminServiceRequestDetail extends AdminServiceRequestSummary {
  agreedAt: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  completedAt: string | null;

  declinedAt: string | null;
  declinedReason: string | null;

  cancelledAt: string | null;
  cancelledById: string | null;

  cancelledBy: AdminServiceRequestParticipant | null;

  cancellationReason: string | null;
}

export interface AdminServiceRequestListResponse {
  items: AdminServiceRequestSummary[];

  page: number;
  pageSize: number;

  totalCount: number;
  totalPages: number;
}
