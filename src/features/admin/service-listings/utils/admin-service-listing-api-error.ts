import "server-only";

import { NextResponse } from "next/server";

function getErrorMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

export function getAdminServiceListingErrorResponse(
  error: unknown,
  logLabel: string,
) {
  const message = getErrorMessage(error);

  if (message === "UNAUTHORIZED") {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  if (message === "FORBIDDEN" || message === "BANNED") {
    return NextResponse.json(
      {
        error: "Forbidden",
      },
      {
        status: 403,
      },
    );
  }

  if (
    message === "INVALID_PAGE" ||
    message === "INVALID_PAGE_SIZE" ||
    message === "INVALID_SERVICE_LISTING_STATUS" ||
    message === "SEARCH_TOO_LONG" ||
    message === "INVALID_SERVICE_LISTING_ID" ||
    message === "INVALID_MODERATION_PAYLOAD" ||
    message === "INVALID_MODERATION_ACTION" ||
    message === "BLOCK_REASON_REQUIRED" ||
    message === "BLOCK_REASON_TOO_LONG" ||
    message === "INVALID_JSON"
  ) {
    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      },
    );
  }

  if (message === "SERVICE_LISTING_NOT_FOUND") {
    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 404,
      },
    );
  }

  if (
    message === "SERVICE_LISTING_ALREADY_BLOCKED" ||
    message === "SERVICE_LISTING_NOT_BLOCKED" ||
    message === "INVALID_BLOCKED_FROM_STATUS" ||
    message === "BLOCKED_SERVICE_LISTING_MISSING_EXPIRY" ||
    message?.startsWith("SERVICE_LISTING_CANNOT_BE_BLOCKED_FROM_")
  ) {
    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 409,
      },
    );
  }

  console.error(logLabel, error);

  return NextResponse.json(
    {
      error: "Internal server error",
    },
    {
      status: 500,
    },
  );
}
