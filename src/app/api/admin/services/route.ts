import { NextRequest, NextResponse } from "next/server";

import { getAdminServiceListingsService } from "@/features/admin/service-listings/services/get-admin-service-listings.service";
import { getAdminServiceListingErrorResponse } from "@/features/admin/service-listings/utils/admin-service-listing-api-error";

function parseOptionalNumber(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }

  return Number(value);
}

export async function GET(request: NextRequest) {
  try {
    const result = await getAdminServiceListingsService({
      page: parseOptionalNumber(request.nextUrl.searchParams.get("page")),

      pageSize: parseOptionalNumber(
        request.nextUrl.searchParams.get("pageSize"),
      ),

      status: request.nextUrl.searchParams.get("status"),

      search: request.nextUrl.searchParams.get("search"),
    });

    return NextResponse.json(result, {
      status: 200,

      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return getAdminServiceListingErrorResponse(
      error,
      "Admin Service Listing list API error:",
    );
  }
}
