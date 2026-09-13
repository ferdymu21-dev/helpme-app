export const ServiceRequestStatus = {
  PENDING_PROVIDER: "PENDING_PROVIDER",

  NEGOTIATING: "NEGOTIATING",

  AGREEMENT_PENDING: "AGREEMENT_PENDING",

  AGREED: "AGREED",

  IN_PROGRESS: "IN_PROGRESS",

  SUBMITTED: "SUBMITTED",

  COMPLETED: "COMPLETED",

  DECLINED: "DECLINED",

  CANCELLED: "CANCELLED",
} as const;

export type ServiceRequestStatusValue =
  (typeof ServiceRequestStatus)[keyof typeof ServiceRequestStatus];

export const SERVICE_REQUEST_STATUSES: readonly ServiceRequestStatusValue[] =
  Object.values(ServiceRequestStatus);
