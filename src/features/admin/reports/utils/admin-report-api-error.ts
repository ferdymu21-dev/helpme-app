import "server-only";

import { NextResponse } from "next/server";

function getErrorMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

export function getAdminReportErrorResponse(error: unknown, logLabel: string) {
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
    message === "INVALID_REPORT_ID" ||
    message === "INVALID_REPORT_PAYLOAD" ||
    message === "INVALID_REPORT_STATUS" ||
    message === "INVALID_ADMIN_NOTES" ||
    message === "ADMIN_NOTES_TOO_LONG" ||
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

  if (message === "REPORT_NOT_FOUND") {
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
