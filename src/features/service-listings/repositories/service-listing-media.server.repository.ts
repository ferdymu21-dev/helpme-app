import "server-only";

import {
  adminSupabase,
} from "@/lib/supabase/admin";

import {
  ServiceListingImageKind,
} from "../constants/service-listing-image-kind";

import type {
  ServiceListingImageKindValue,
} from "../constants/service-listing-image-kind";

import {
  ServiceListingMediaError,
  ServiceListingMediaErrorCode,
} from "../errors/service-listing-media.error";

const SERVICE_MEDIA_BUCKET =
  "service-media";

interface RepositoryErrorLike {
  code?: string | null;

  message: string;
}

interface SetCoverMetadataResult {
  imageId: string;

  replacedStoragePath:
    | string
    | null;
}

interface AddPortfolioMetadataResult {
  imageId: string;

  sortOrder: number;
}

interface DeleteImageMetadataResult {
  storagePath: string;

  kind:
    ServiceListingImageKindValue;
}

function createRpcError(
  action: string,
  error:
    RepositoryErrorLike,
): ServiceListingMediaError {
  switch (
    error.code
  ) {
    case "P0002":
      return new ServiceListingMediaError(
        ServiceListingMediaErrorCode.NOT_FOUND,
        error.message,
      );

    case "42501":
      return new ServiceListingMediaError(
        ServiceListingMediaErrorCode.FORBIDDEN,
        error.message,
      );

    case "22023":
      return new ServiceListingMediaError(
        ServiceListingMediaErrorCode.INVALID_INPUT,
        error.message,
      );

    case "55000":
    case "54000":
    case "40001":
    case "23505":
      return new ServiceListingMediaError(
        ServiceListingMediaErrorCode.CONFLICT,
        error.message,
      );

    default:
      return new ServiceListingMediaError(
        ServiceListingMediaErrorCode.INTERNAL,
        `${action}: ${error.message}`,
      );
  }
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function readString(
  value: unknown,
  field: string,
): string {
  if (
    !isRecord(
      value,
    ) ||
    typeof value[field] !==
      "string"
  ) {
    throw new ServiceListingMediaError(
      ServiceListingMediaErrorCode.INTERNAL,
      `Response media jasa tidak valid: ${field}.`,
    );
  }

  return value[field];
}

function readNullableString(
  value: unknown,
  field: string,
): string | null {
  if (
    !isRecord(
      value,
    )
  ) {
    throw new ServiceListingMediaError(
      ServiceListingMediaErrorCode.INTERNAL,
      "Response media jasa tidak valid.",
    );
  }

  const fieldValue =
    value[field];

  if (
    fieldValue === null
  ) {
    return null;
  }

  if (
    typeof fieldValue !==
      "string"
  ) {
    throw new ServiceListingMediaError(
      ServiceListingMediaErrorCode.INTERNAL,
      `Response media jasa tidak valid: ${field}.`,
    );
  }

  return fieldValue;
}

function readInteger(
  value: unknown,
  field: string,
): number {
  if (
    !isRecord(
      value,
    )
  ) {
    throw new ServiceListingMediaError(
      ServiceListingMediaErrorCode.INTERNAL,
      "Response media jasa tidak valid.",
    );
  }

  const fieldValue =
    value[field];

  if (
    typeof fieldValue !==
      "number" ||
    !Number.isSafeInteger(
      fieldValue,
    )
  ) {
    throw new ServiceListingMediaError(
      ServiceListingMediaErrorCode.INTERNAL,
      `Response media jasa tidak valid: ${field}.`,
    );
  }

  return fieldValue;
}

function readImageKind(
  value: unknown,
  field: string,
): ServiceListingImageKindValue {
  const kind =
    readString(
      value,
      field,
    );

  if (
    kind !==
      ServiceListingImageKind.COVER &&
    kind !==
      ServiceListingImageKind.PORTFOLIO
  ) {
    throw new ServiceListingMediaError(
      ServiceListingMediaErrorCode.INTERNAL,
      "Jenis media jasa tidak valid.",
    );
  }

  return kind;
}

export async function uploadServiceListingMediaObject(
  storagePath: string,
  file: File,
  contentType: string,
): Promise<void> {
  const {
    error,
  } = await adminSupabase.storage
    .from(
      SERVICE_MEDIA_BUCKET,
    )
    .upload(
      storagePath,
      file,
      {
        contentType,
        upsert:
          false,
      },
    );

  if (
    error
  ) {
    throw new ServiceListingMediaError(
      ServiceListingMediaErrorCode.STORAGE_FAILURE,
      `Gagal mengupload gambar jasa: ${error.message}`,
    );
  }
}

export async function removeServiceListingMediaObject(
  storagePath: string,
): Promise<void> {
  const {
    error,
  } = await adminSupabase.storage
    .from(
      SERVICE_MEDIA_BUCKET,
    )
    .remove([
      storagePath,
    ]);

  if (
    error
  ) {
    throw new ServiceListingMediaError(
      ServiceListingMediaErrorCode.STORAGE_FAILURE,
      `Gagal menghapus objek gambar jasa: ${error.message}`,
    );
  }
}

export function getServiceListingMediaPublicUrl(
  storagePath: string,
): string {
  const {
    data,
  } = adminSupabase.storage
    .from(
      SERVICE_MEDIA_BUCKET,
    )
    .getPublicUrl(
      storagePath,
    );

  return data.publicUrl;
}

export async function setServiceListingCoverMetadataRepository(
  listingId: string,
  providerId: string,
  storagePath: string,
): Promise<SetCoverMetadataResult> {
  const {
    data,
    error,
  } = await adminSupabase
    .rpc(
      "set_service_listing_cover",
      {
        p_listing_id:
          listingId,

        p_provider_id:
          providerId,

        p_storage_path:
          storagePath,
      },
    )
    .single();

  if (
    error
  ) {
    throw createRpcError(
      "Gagal menyimpan cover jasa",
      error,
    );
  }

  return {
    imageId:
      readString(
        data,
        "image_id",
      ),

    replacedStoragePath:
      readNullableString(
        data,
        "replaced_storage_path",
      ),
  };
}

export async function addServiceListingPortfolioMetadataRepository(
  listingId: string,
  providerId: string,
  storagePath: string,
): Promise<AddPortfolioMetadataResult> {
  const {
    data,
    error,
  } = await adminSupabase
    .rpc(
      "add_service_listing_portfolio_image",
      {
        p_listing_id:
          listingId,

        p_provider_id:
          providerId,

        p_storage_path:
          storagePath,
      },
    )
    .single();

  if (
    error
  ) {
    throw createRpcError(
      "Gagal menyimpan portfolio jasa",
      error,
    );
  }

  return {
    imageId:
      readString(
        data,
        "image_id",
      ),

    sortOrder:
      readInteger(
        data,
        "sort_order",
      ),
  };
}

export async function deleteServiceListingImageMetadataRepository(
  listingId: string,
  providerId: string,
  imageId: string,
): Promise<DeleteImageMetadataResult> {
  const {
    data,
    error,
  } = await adminSupabase
    .rpc(
      "delete_service_listing_image",
      {
        p_listing_id:
          listingId,

        p_provider_id:
          providerId,

        p_image_id:
          imageId,
      },
    )
    .single();

  if (
    error
  ) {
    throw createRpcError(
      "Gagal menghapus metadata gambar jasa",
      error,
    );
  }

  return {
    storagePath:
      readString(
        data,
        "storage_path",
      ),

    kind:
      readImageKind(
        data,
        "kind",
      ),
  };
}