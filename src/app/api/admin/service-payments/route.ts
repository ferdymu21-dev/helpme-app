import { NextRequest, NextResponse } from "next/server";

import { getAdminServicePaymentsService } from "@/features/admin/service-payments/services/get-admin-service-payments.service";
import { getAdminServicePaymentErrorResponse } from "@/features/admin/service-payments/utils/admin-service-payment-api-error";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const data = await getAdminServicePaymentsService({
      page: searchParams.get("page"),

      pageSize: searchParams.get("pageSize"),

      status: searchParams.get("status"),

      action: searchParams.get("action"),

      query: searchParams.get("q"),
    });

    return NextResponse.json(data, {
      status: 200,

      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return getAdminServicePaymentErrorResponse(
      error,
      "Admin Service Payment list API error:",
    );
  }
}
