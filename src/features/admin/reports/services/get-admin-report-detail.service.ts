import "server-only";

import { requireAdmin } from "@/features/admin/server/requireAdmin";

import { getAdminReportDetailRepository } from "../repositories/admin-report.repository";

import type { AdminReport } from "../types/admin-report.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getAdminReportDetailService(
  reportId: string,
): Promise<AdminReport> {
  await requireAdmin();

  if (!UUID_PATTERN.test(reportId)) {
    throw new Error("INVALID_REPORT_ID");
  }

  const report = await getAdminReportDetailRepository(reportId);

  if (!report) {
    throw new Error("REPORT_NOT_FOUND");
  }

  return report;
}
