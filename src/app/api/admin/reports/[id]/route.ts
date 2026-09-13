import { NextRequest, NextResponse } from "next/server";

import { getAdminReportDetailService } from "@/features/admin/reports/services/get-admin-report-detail.service";
import { updateAdminReportService } from "@/features/admin/reports/services/update-admin-report.service";
import { getAdminReportErrorResponse } from "@/features/admin/reports/utils/admin-report-api-error";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const report = await getAdminReportDetailService(id);

    return NextResponse.json(report, {
      status: 200,

      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return getAdminReportErrorResponse(error, "Admin Report detail API error:");
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      throw new Error("INVALID_JSON");
    }

    await updateAdminReportService(id, body);

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,

        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    return getAdminReportErrorResponse(error, "Admin Report update API error:");
  }
}
