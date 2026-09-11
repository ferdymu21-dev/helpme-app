export const ServiceListingMediaErrorCode = {
  UNAUTHORIZED:
    "UNAUTHORIZED",

  INVALID_INPUT:
    "INVALID_INPUT",

  NOT_FOUND:
    "NOT_FOUND",

  FORBIDDEN:
    "FORBIDDEN",

  CONFLICT:
    "CONFLICT",

  STORAGE_FAILURE:
    "STORAGE_FAILURE",

  INTERNAL:
    "INTERNAL",
} as const;

export type ServiceListingMediaErrorCodeValue =
  (typeof ServiceListingMediaErrorCode)[keyof typeof ServiceListingMediaErrorCode];

export class ServiceListingMediaError
  extends Error {
  readonly code:
    ServiceListingMediaErrorCodeValue;

  constructor(
    code:
      ServiceListingMediaErrorCodeValue,
    message: string,
  ) {
    super(
      message,
    );

    this.name =
      "ServiceListingMediaError";

    this.code =
      code;
  }
}