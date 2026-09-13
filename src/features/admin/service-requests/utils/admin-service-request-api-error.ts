import "server-only";

import { NextResponse } from "next/server";

function getErrorMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

export function getAdminServiceRequestErrorResponse(
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
    message === "INVALID_SERVICE_REQUEST_STATUS" ||
    message === "INVALID_SERVICE_REQUEST_ID" ||
    message === "SEARCH_TOO_LONG"
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

  if (message === "SERVICE_REQUEST_NOT_FOUND") {
    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 404,
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
