import {
  validateAndNormalizeServiceListingMediaListingId,
} from "../validators/validate-service-listing-media";

export function tryNormalizeServiceListingRouteId(
  value: unknown,
): string | null {
  try {
    return validateAndNormalizeServiceListingMediaListingId(
      value,
    );
  } catch {
    return null;
  }
}