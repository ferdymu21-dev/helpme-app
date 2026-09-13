import { NextResponse } from "next/server";

import { getAdminReportsService } from "@/features/admin/reports/services/get-admin-reports.service";
import { getAdminReportErrorResponse } from "@/features/admin/reports/utils/admin-report-api-error";

export async function GET() {
  try {
    const reports = await getAdminReportsService();

    return NextResponse.json(reports, {
      status: 200,

      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return getAdminReportErrorResponse(error, "Admin Reports list API error:");
  }
}
