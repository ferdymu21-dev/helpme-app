import { NextRequest, NextResponse } from "next/server";

import { getAdminServiceRequestDetailService } from "@/features/admin/service-requests/services/get-admin-service-request-detail.service";
import { getAdminServiceRequestErrorResponse } from "@/features/admin/service-requests/utils/admin-service-request-api-error";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const result = await getAdminServiceRequestDetailService(id);

    return NextResponse.json(result, {
      status: 200,

      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return getAdminServiceRequestErrorResponse(
      error,
      "Admin Service Request detail API error:",
    );
  }
}
