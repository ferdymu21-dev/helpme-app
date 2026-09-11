import {
  ServiceListingMediaError,
  ServiceListingMediaErrorCode,
} from "../errors/service-listing-media.error";

export const SERVICE_LISTING_MEDIA_MAX_FILE_SIZE_BYTES =
  5 * 1024 * 1024;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ValidatedServiceListingMediaFile {
  extension:
    | "jpg"
    | "png"
    | "webp";

  contentType:
    | "image/jpeg"
    | "image/png"
    | "image/webp";
}

function invalidInput(
  message: string,
): ServiceListingMediaError {
  return new ServiceListingMediaError(
    ServiceListingMediaErrorCode.INVALID_INPUT,
    message,
  );
}

function normalizeUuidIdentifier(
  value: unknown,
  label: string,
): string {
  if (
    typeof value !== "string"
  ) {
    throw invalidInput(
      `${label} tidak valid.`,
    );
  }

  const normalized =
    value.trim();

  if (
    !normalized ||
    !UUID_PATTERN.test(
      normalized,
    )
  ) {
    throw invalidInput(
      `${label} tidak valid.`,
    );
  }

  return normalized;
}

export function validateAndNormalizeServiceListingMediaListingId(
  value: unknown,
): string {
  return normalizeUuidIdentifier(
    value,
    "ID jasa",
  );
}

export function validateAndNormalizeServiceListingImageId(
  value: unknown,
): string {
  return normalizeUuidIdentifier(
    value,
    "ID gambar jasa",
  );
}

export function validateAndNormalizeServiceProviderId(
  value: unknown,
): string {
  return normalizeUuidIdentifier(
    value,
    "ID provider jasa",
  );
}

export function requireServiceListingMediaFile(
  value: unknown,
): File {
  if (
    typeof File === "undefined" ||
    !(value instanceof File)
  ) {
    throw invalidInput(
      "File gambar jasa wajib diisi.",
    );
  }

  return value;
}

export function validateServiceListingMediaFile(
  value: unknown,
): ValidatedServiceListingMediaFile {
  const file =
    requireServiceListingMediaFile(
      value,
    );

  if (
    file.size <= 0
  ) {
    throw invalidInput(
      "File gambar jasa kosong.",
    );
  }

  if (
    file.size >
    SERVICE_LISTING_MEDIA_MAX_FILE_SIZE_BYTES
  ) {
    throw invalidInput(
      "Ukuran gambar jasa maksimal 5 MB.",
    );
  }

  switch (
    file.type
  ) {
    case "image/jpeg":
      return {
        extension:
          "jpg",

        contentType:
          "image/jpeg",
      };

    case "image/png":
      return {
        extension:
          "png",

        contentType:
          "image/png",
      };

    case "image/webp":
      return {
        extension:
          "webp",

        contentType:
          "image/webp",
      };

    default:
      throw invalidInput(
        "Format gambar jasa tidak didukung. Gunakan JPG, PNG, atau WEBP.",
      );
  }
}