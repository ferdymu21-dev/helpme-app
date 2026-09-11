import {
  ServiceListingImageKind,
} from "../constants/service-listing-image-kind";

import type {
  ServiceListingImageKindValue,
} from "../constants/service-listing-image-kind";

import type {
  DeleteServiceListingMediaResult,
  ProviderServiceListingMedia,
  ServiceListingMediaRpcRow,
  UploadServiceListingMediaResult,
} from "../types/service-listing-media.types";

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function requireRecord(
  value: unknown,
  label: string,
): Record<string, unknown> {
  if (
    !isRecord(
      value,
    )
  ) {
    throw new Error(
      `${label} tidak valid.`,
    );
  }

  return value;
}

function readString(
  value:
    Record<string, unknown>,
  field: string,
): string {
  const fieldValue =
    value[field];

  if (
    typeof fieldValue !==
      "string" ||
    !fieldValue.trim()
  ) {
    throw new Error(
      `Response media jasa tidak valid: ${field}.`,
    );
  }

  return fieldValue;
}

function readInteger(
  value:
    Record<string, unknown>,
  field: string,
): number {
  const fieldValue =
    value[field];

  if (
    typeof fieldValue !==
      "number" ||
    !Number.isSafeInteger(
      fieldValue,
    )
  ) {
    throw new Error(
      `Response media jasa tidak valid: ${field}.`,
    );
  }

  return fieldValue;
}

function readImageKind(
  value:
    Record<string, unknown>,
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
    throw new Error(
      "Jenis media jasa tidak valid.",
    );
  }

  return kind;
}

function validateSortOrder(
  kind:
    ServiceListingImageKindValue,
  sortOrder: number,
): void {
  if (
    sortOrder < 0 ||
    sortOrder > 4
  ) {
    throw new Error(
      "Urutan media jasa tidak valid.",
    );
  }

  if (
    kind ===
      ServiceListingImageKind.COVER &&
    sortOrder !== 0
  ) {
    throw new Error(
      "Urutan cover jasa tidak valid.",
    );
  }
}

export function parseServiceListingMediaRpcRow(
  value: unknown,
): ServiceListingMediaRpcRow {
  const row =
    requireRecord(
      value,
      "Service listing media row",
    );

  const kind =
    readImageKind(
      row,
      "kind",
    );

  const sortOrder =
    readInteger(
      row,
      "sort_order",
    );

  validateSortOrder(
    kind,
    sortOrder,
  );

  return {
    id:
      readString(
        row,
        "id",
      ),

    service_listing_id:
      readString(
        row,
        "service_listing_id",
      ),

    storage_path:
      readString(
        row,
        "storage_path",
      ),

    kind,

    sort_order:
      sortOrder,

    created_at:
      readString(
        row,
        "created_at",
      ),
  };
}

export function parseServiceListingMediaRpcRows(
  value: unknown,
): ServiceListingMediaRpcRow[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    throw new Error(
      "Response daftar media jasa tidak valid.",
    );
  }

  return value.map(
    parseServiceListingMediaRpcRow,
  );
}

export function mapServiceListingMediaRpcRow(
  row:
    ServiceListingMediaRpcRow,
  publicUrl: string,
): ProviderServiceListingMedia {
  return {
    id:
      row.id,

    serviceListingId:
      row.service_listing_id,

    storagePath:
      row.storage_path,

    kind:
      row.kind,

    sortOrder:
      row.sort_order,

    createdAt:
      row.created_at,

    publicUrl,
  };
}

export function parseUploadServiceListingMediaResult(
  value: unknown,
): UploadServiceListingMediaResult {
  const row =
    requireRecord(
      value,
      "Upload media jasa response",
    );

  const kind =
    readImageKind(
      row,
      "kind",
    );

  const sortOrder =
    readInteger(
      row,
      "sortOrder",
    );

  validateSortOrder(
    kind,
    sortOrder,
  );

  return {
    imageId:
      readString(
        row,
        "imageId",
      ),

    kind,

    sortOrder,

    publicUrl:
      readString(
        row,
        "publicUrl",
      ),
  };
}

export function parseDeleteServiceListingMediaResult(
  value: unknown,
): DeleteServiceListingMediaResult {
  const row =
    requireRecord(
      value,
      "Delete media jasa response",
    );

  return {
    imageId:
      readString(
        row,
        "imageId",
      ),

    kind:
      readImageKind(
        row,
        "kind",
      ),
  };
}