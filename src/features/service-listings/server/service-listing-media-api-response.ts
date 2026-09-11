import "server-only";

import {
  NextResponse,
} from "next/server";

import {
  ServiceListingMediaError,
  ServiceListingMediaErrorCode,
} from "../errors/service-listing-media.error";

export function createServiceListingMediaErrorResponse(
  error: unknown,
  fallbackMessage: string,
) {
  if (
    error instanceof
      ServiceListingMediaError
  ) {
    switch (
      error.code
    ) {
      case ServiceListingMediaErrorCode.UNAUTHORIZED:
        return NextResponse.json(
          {
            message:
              error.message,
          },
          {
            status:
              401,
          },
        );

      case ServiceListingMediaErrorCode.INVALID_INPUT:
        return NextResponse.json(
          {
            message:
              error.message,
          },
          {
            status:
              400,
          },
        );

      case ServiceListingMediaErrorCode.NOT_FOUND:
        return NextResponse.json(
          {
            message:
              error.message,
          },
          {
            status:
              404,
          },
        );

      case ServiceListingMediaErrorCode.FORBIDDEN:
        return NextResponse.json(
          {
            message:
              error.message,
          },
          {
            status:
              403,
          },
        );

      case ServiceListingMediaErrorCode.CONFLICT:
        return NextResponse.json(
          {
            message:
              error.message,
          },
          {
            status:
              409,
          },
        );

      case ServiceListingMediaErrorCode.STORAGE_FAILURE:
      case ServiceListingMediaErrorCode.INTERNAL:
        return NextResponse.json(
          {
            message:
              fallbackMessage,
          },
          {
            status:
              500,
          },
        );
    }
  }

  return NextResponse.json(
    {
      message:
        fallbackMessage,
    },
    {
      status:
        500,
    },
  );
}