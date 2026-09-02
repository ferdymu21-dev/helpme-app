import { NextResponse } from "next/server";

import { getAdminAnalyticsService } from "@/features/admin/analytics/services/getAdminAnalytics.service";

function getErrorResponse(
  error: unknown,
) {
  if (
    error instanceof Error &&
    error.message ===
      "UNAUTHORIZED"
  ) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  if (
    error instanceof Error &&
    (
      error.message ===
        "FORBIDDEN" ||
      error.message ===
        "BANNED"
    )
  ) {
    return NextResponse.json(
      {
        error: "Forbidden",
      },
      {
        status: 403,
      },
    );
  }

  console.error(
    "Admin analytics API error:",
    error,
  );

  return NextResponse.json(
    {
      error:
        "Failed to load analytics",
    },
    {
      status: 500,
    },
  );
}

export async function GET() {
  try {
    const analytics =
      await getAdminAnalyticsService();

    return NextResponse.json(
      analytics,
      {
        status: 200,
        headers: {
          "Cache-Control":
            "private, no-store",
        },
      },
    );
  } catch (error) {
    return getErrorResponse(
      error,
    );
  }
}