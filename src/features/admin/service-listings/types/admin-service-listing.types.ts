export const ADMIN_SERVICE_LISTING_STATUSES = [
  "DRAFT",
  "PAYMENT_PENDING",
  "ACTIVE",
  "PAUSED",
  "EXPIRED",
  "BLOCKED",
  "ARCHIVED",
] as const;

export type AdminServiceListingStatus =
  (typeof ADMIN_SERVICE_LISTING_STATUSES)[number];

export interface AdminServiceProviderSummary {
  id: string;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  verificationStatus: string | null;
}

export interface AdminServiceListingSummary {
  id: string;
  providerId: string;
  provider: AdminServiceProviderSummary | null;

  title: string;
  category: string;

  priceFrom: number;
  isNegotiable: boolean;

  serviceMode: string;
  locationName: string | null;

  status: AdminServiceListingStatus;

  publishedAt: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  pausedAt: string | null;

  blockedAt: string | null;
  blockedReason: string | null;
  blockedFromStatus: string | null;

  archivedAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface AdminServiceListingDetail extends AdminServiceListingSummary {
  description: string;
  deliverables: string;
  customerPreparation: string | null;
}

export interface AdminServiceListingListResponse {
  items: AdminServiceListingSummary[];

  page: number;
  pageSize: number;

  totalCount: number;
  totalPages: number;
}

export type AdminServiceListingModerationAction = "BLOCK" | "UNBLOCK";

export interface AdminServiceListingModerationResult {
  serviceListingId: string;
  status: AdminServiceListingStatus;

  blockedAt: string | null;
  blockedReason: string | null;
  blockedFromStatus: string | null;

  expiresAt: string | null;
}
