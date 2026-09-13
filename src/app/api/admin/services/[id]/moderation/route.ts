import { NextRequest, NextResponse } from "next/server";

import { moderateAdminServiceListingService } from "@/features/admin/service-listings/services/moderate-admin-service-listing.service";
import { getAdminServiceListingErrorResponse } from "@/features/admin/service-listings/utils/admin-service-listing-api-error";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      throw new Error("INVALID_JSON");
    }

    const result = await moderateAdminServiceListingService(id, body);

    return NextResponse.json(result, {
      status: 200,

      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return getAdminServiceListingErrorResponse(
      error,
      "Admin Service Listing moderation API error:",
    );
  }
}
