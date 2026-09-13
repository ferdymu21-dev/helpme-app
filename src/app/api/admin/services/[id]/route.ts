import { NextRequest, NextResponse } from "next/server";

import { getAdminServiceListingDetailService } from "@/features/admin/service-listings/services/get-admin-service-listing-detail.service";
import { getAdminServiceListingErrorResponse } from "@/features/admin/service-listings/utils/admin-service-listing-api-error";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const result = await getAdminServiceListingDetailService(id);

    return NextResponse.json(result, {
      status: 200,

      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return getAdminServiceListingErrorResponse(
      error,
      "Admin Service Listing detail API error:",
    );
  }
}
