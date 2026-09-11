"use client";

import {
  supabase,
} from "@/lib/supabase/client";

import {
  parseDeleteServiceListingMediaResult,
  parseUploadServiceListingMediaResult,
} from "../mappers/service-listing-media.mapper";

import type {
  DeleteServiceListingMediaResult,
  UploadServiceListingMediaResult,
} from "../types/service-listing-media.types";

import {
  validateAndNormalizeServiceListingImageId,
  validateAndNormalizeServiceListingMediaListingId,
  validateServiceListingMediaFile,
} from "../validators/validate-service-listing-media";

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function readApiErrorMessage(
  value: unknown,
  fallback: string,
): string {
  if (
    !isRecord(
      value,
    ) ||
    typeof value.message !==
      "string" ||
    !value.message.trim()
  ) {
    return fallback;
  }

  return value.message;
}

async function getAccessToken(): Promise<string> {
  const {
    data: {
      session,
    },
    error,
  } =
    await supabase.auth.getSession();

  if (
    error ||
    !session
  ) {
    throw new Error(
      "User belum terautentikasi.",
    );
  }

  return session.access_token;
}

async function readJsonResponse(
  response: Response,
): Promise<unknown> {
  try {
    const payload: unknown =
      await response.json();

    return payload;
  } catch {
    return null;
  }
}

async function uploadMedia(
  listingId: string,
  file: File,
  target:
    | "cover"
    | "portfolio",
): Promise<UploadServiceListingMediaResult> {
  const normalizedListingId =
    validateAndNormalizeServiceListingMediaListingId(
      listingId,
    );

  validateServiceListingMediaFile(
    file,
  );

  const accessToken =
    await getAccessToken();

  const formData =
    new FormData();

  formData.append(
    "file",
    file,
  );

  const response =
    await fetch(
      `/api/service-listings/${encodeURIComponent(
        normalizedListingId,
      )}/media/${target}`,
      {
        method:
          "POST",

        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },

        body:
          formData,
      },
    );

  const payload =
    await readJsonResponse(
      response,
    );

  if (
    !response.ok
  ) {
    throw new Error(
      readApiErrorMessage(
        payload,
        "Gagal mengupload gambar jasa.",
      ),
    );
  }

  return parseUploadServiceListingMediaResult(
    payload,
  );
}

export async function uploadServiceListingCoverClient(
  listingId: string,
  file: File,
): Promise<UploadServiceListingMediaResult> {
  return uploadMedia(
    listingId,
    file,
    "cover",
  );
}

export async function uploadServiceListingPortfolioImageClient(
  listingId: string,
  file: File,
): Promise<UploadServiceListingMediaResult> {
  return uploadMedia(
    listingId,
    file,
    "portfolio",
  );
}

export async function deleteServiceListingImageClient(
  listingId: string,
  imageId: string,
): Promise<DeleteServiceListingMediaResult> {
  const normalizedListingId =
    validateAndNormalizeServiceListingMediaListingId(
      listingId,
    );

  const normalizedImageId =
    validateAndNormalizeServiceListingImageId(
      imageId,
    );

  const accessToken =
    await getAccessToken();

  const response =
    await fetch(
      `/api/service-listings/${encodeURIComponent(
        normalizedListingId,
      )}/media/${encodeURIComponent(
        normalizedImageId,
      )}`,
      {
        method:
          "DELETE",

        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
    );

  const payload =
    await readJsonResponse(
      response,
    );

  if (
    !response.ok
  ) {
    throw new Error(
      readApiErrorMessage(
        payload,
        "Gagal menghapus gambar jasa.",
      ),
    );
  }

  return parseDeleteServiceListingMediaResult(
    payload,
  );
}