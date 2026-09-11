export function validateAndNormalizeServiceListingId(
  value: unknown,
): string {
  if (typeof value !== "string") {
    throw new Error(
      "Service Listing identity tidak valid.",
    );
  }

  const normalized =
    value.trim();

  if (normalized.length === 0) {
    throw new Error(
      "Service Listing identity wajib diisi.",
    );
  }

  return normalized;
}