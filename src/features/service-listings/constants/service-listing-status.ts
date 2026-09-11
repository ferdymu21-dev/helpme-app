export const ServiceListingStatus = {
  DRAFT: "DRAFT",

  PAYMENT_PENDING: "PAYMENT_PENDING",

  ACTIVE: "ACTIVE",

  PAUSED: "PAUSED",

  EXPIRED: "EXPIRED",

  BLOCKED: "BLOCKED",

  ARCHIVED: "ARCHIVED",
} as const;

export type ServiceListingStatusValue =
  (typeof ServiceListingStatus)[keyof typeof ServiceListingStatus];