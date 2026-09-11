export const ServiceListingImageKind = {
  COVER: "COVER",

  PORTFOLIO: "PORTFOLIO",
} as const;

export type ServiceListingImageKindValue =
  (typeof ServiceListingImageKind)[keyof typeof ServiceListingImageKind];