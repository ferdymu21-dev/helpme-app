import { NextRequest, NextResponse } from "next/server";

import { getAdminServiceRequestsService } from "@/features/admin/service-requests/services/get-admin-service-requests.service";
import { getAdminServiceRequestErrorResponse } from "@/features/admin/service-requests/utils/admin-service-request-api-error";

function parseOptionalNumber(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }

  return Number(value);
}

export async function GET(request: NextRequest) {
  try {
    const result = await getAdminServiceRequestsService({
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
    return getAdminServiceRequestErrorResponse(
      error,
      "Admin Service Request list API error:",
    );
  }
}
