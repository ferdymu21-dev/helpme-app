import "server-only";

import { NextResponse } from "next/server";

function getMessage(error: unknown) {
  return error instanceof Error ? error.message : null;
}

export function getAdminServicePaymentErrorResponse(
  error: unknown,
  logLabel: string,
) {
  const message = getMessage(error);

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
    message === "INVALID_PAGINATION" ||
    message === "INVALID_PAYMENT_STATUS" ||
    message === "INVALID_PUBLICATION_ACTION" ||
    message === "PAYMENT_QUERY_TOO_LONG" ||
    message === "INVALID_PAYMENT_ID"
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

  if (message === "SERVICE_PAYMENT_NOT_FOUND") {
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
