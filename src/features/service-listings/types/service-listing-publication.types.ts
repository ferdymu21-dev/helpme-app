export type ServiceListingPublicationAction =
  | "INITIAL_PUBLICATION"
  | "EXPIRED_RENEWAL"
  | "EARLY_RENEWAL";

export type ServiceListingCheckoutPaymentStatus = "CREATING" | "PENDING";

export interface FirstFreeServiceListingPublicationResult {
  activated: boolean;

  listingId: string;

  publicationPeriodId: string | null;

  startsAt: string | null;

  endsAt: string | null;
}

export interface ReservedServiceListingPublicationPayment {
  created: boolean;

  paymentId: string;

  paymentStatus: ServiceListingCheckoutPaymentStatus;

  publicationAction: ServiceListingPublicationAction;

  orderId: string;

  snapToken: string | null;

  paymentUrl: string | null;

  paymentExpiresAt: string | null;

  renewalBaseExpiresAt: string | null;
}

export interface ServiceListingFirstFreeActivatedResult {
  kind: "FIRST_FREE_ACTIVATED";

  listingId: string;

  publicationPeriodId: string;

  startsAt: string;

  endsAt: string;
}

export interface ServiceListingPaymentRequiredResult {
  kind: "PAYMENT_REQUIRED";

  created: boolean;

  listingId: string;

  paymentId: string;

  publicationAction: ServiceListingPublicationAction;

  paymentStatus: "PENDING";

  orderId: string;

  amount: number;

  snapToken: string;

  redirectUrl: string;

  paymentExpiresAt: string;
}

export interface ServiceListingPaymentCreatingResult {
  kind: "PAYMENT_CREATING";

  created: false;

  listingId: string;

  paymentId: string;

  publicationAction: ServiceListingPublicationAction;

  paymentStatus: "CREATING";

  orderId: string;

  amount: number;
}

export interface ServiceListingPaymentAppliedResult {
  kind: "PAYMENT_APPLIED";

  created: false;

  listingId: string;

  paymentId: string;

  publicationAction: ServiceListingPublicationAction;

  paymentStatus: "PAID";

  orderId: string;

  amount: number;
}

export type CreateServiceListingPublicationResult =
  | ServiceListingFirstFreeActivatedResult
  | ServiceListingPaymentRequiredResult
  | ServiceListingPaymentCreatingResult
  | ServiceListingPaymentAppliedResult;
