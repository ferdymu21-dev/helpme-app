import "server-only";

import type {
  User,
} from "@supabase/supabase-js";

import {
  getCurrentUser,
} from "@/lib/auth/server/getCurrentUser";

import {
  ServiceListingMediaError,
  ServiceListingMediaErrorCode,
} from "../errors/service-listing-media.error";

export async function requireServiceListingApiUser(
  request: Request,
): Promise<User> {
  const authorization =
    request.headers.get(
      "authorization",
    );

  if (
    !authorization ||
    !authorization.startsWith(
      "Bearer ",
    )
  ) {
    throw new ServiceListingMediaError(
      ServiceListingMediaErrorCode.UNAUTHORIZED,
      "Anda belum login.",
    );
  }

  const accessToken =
    authorization
      .slice(
        "Bearer ".length,
      )
      .trim();

  if (
    !accessToken
  ) {
    throw new ServiceListingMediaError(
      ServiceListingMediaErrorCode.UNAUTHORIZED,
      "Anda belum login.",
    );
  }

  try {
    return await getCurrentUser(
      accessToken,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "Unauthorized"
    ) {
      throw new ServiceListingMediaError(
        ServiceListingMediaErrorCode.UNAUTHORIZED,
        "Anda belum login.",
      );
    }

    throw error;
  }
}