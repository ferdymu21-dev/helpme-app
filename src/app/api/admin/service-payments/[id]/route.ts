import { NextRequest, NextResponse } from "next/server";

import { getAdminServicePaymentDetailService } from "@/features/admin/service-payments/services/get-admin-service-payment-detail.service";
import { getAdminServicePaymentErrorResponse } from "@/features/admin/service-payments/utils/admin-service-payment-api-error";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const data = await getAdminServicePaymentDetailService(id);

    return NextResponse.json(data, {
      status: 200,

      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return getAdminServicePaymentErrorResponse(
      error,
      "Admin Service Payment detail API error:",
    );
  }
}
