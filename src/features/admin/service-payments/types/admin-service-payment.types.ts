export const ADMIN_SERVICE_PAYMENT_STATUSES = [
  "CREATING",
  "PENDING",
  "PAID",
  "FAILED",
  "CANCELLED",
  "EXPIRED",
] as const;

export type AdminServicePaymentStatus =
  (typeof ADMIN_SERVICE_PAYMENT_STATUSES)[number];

export const ADMIN_SERVICE_PAYMENT_ACTIONS = [
  "INITIAL_PUBLICATION",
  "EXPIRED_RENEWAL",
  "EARLY_RENEWAL",
] as const;

export type AdminServicePaymentAction =
  (typeof ADMIN_SERVICE_PAYMENT_ACTIONS)[number];

export interface AdminServicePaymentProvider {
  id: string;

  fullName: string | null;
  username: string | null;
}

export interface AdminServicePaymentListing {
  id: string;

  title: string;
  status: string;

  expiresAt: string | null;
}

export interface AdminServicePaymentPublicationPeriod {
  id: string;

  sourceType: string;
  publicationAction: string;

  durationSeconds: number;

  startsAt: string;
  endsAt: string;
  appliedAt: string;
}

export interface AdminServicePayment {
  id: string;

  serviceListingId: string;
  providerId: string;

  publicationAction: string;

  amount: number;
  currency: string;

  publicationDurationSeconds: number;

  paymentStatus: string;

  midtransOrderId: string;

  midtransTransactionId: string | null;

  paymentMethod: string | null;

  paymentExpiresAt: string | null;

  renewalBaseExpiresAt: string | null;

  paidAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  expiredAt: string | null;

  publicationAppliedAt: string | null;

  createdAt: string;
  updatedAt: string;

  listing: AdminServicePaymentListing | null;

  provider: AdminServicePaymentProvider | null;

  publicationPeriod: AdminServicePaymentPublicationPeriod | null;
}

export interface AdminServicePaymentListResponse {
  items: AdminServicePayment[];

  page: number;
  pageSize: number;

  total: number;
  totalPages: number;
}
