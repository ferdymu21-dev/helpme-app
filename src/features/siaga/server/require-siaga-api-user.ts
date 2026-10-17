import "server-only";

import type { User } from "@supabase/supabase-js";

import {
  getCurrentUser,
} from "@/lib/auth/server/getCurrentUser";

export type SiagaApiErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_INPUT";

export class SiagaApiError extends Error {
  constructor(
    readonly code: SiagaApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SiagaApiError";
  }
}

export async function requireSiagaApiUser(
  request: Request,
): Promise<User> {
  const authorization =
    request.headers.get("authorization");

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    throw new SiagaApiError(
      "UNAUTHORIZED",
      "Anda belum login.",
    );
  }

  const accessToken = authorization
    .slice("Bearer ".length)
    .trim();

  if (!accessToken) {
    throw new SiagaApiError(
      "UNAUTHORIZED",
      "Anda belum login.",
    );
  }

  try {
    return await getCurrentUser(accessToken);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Unauthorized"
    ) {
      throw new SiagaApiError(
        "UNAUTHORIZED",
        "Anda belum login.",
      );
    }

    throw error;
  }
}
