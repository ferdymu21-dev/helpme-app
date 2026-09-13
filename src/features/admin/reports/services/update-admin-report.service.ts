import "server-only";

import { requireAdmin } from "@/features/admin/server/requireAdmin";

import { updateAdminReportRepository } from "../repositories/admin-report.repository";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function updateAdminReportService(
  reportId: string,
  input: unknown,
): Promise<void> {
  await requireAdmin();

  if (!UUID_PATTERN.test(reportId)) {
    throw new Error("INVALID_REPORT_ID");
  }

  if (!isRecord(input)) {
    throw new Error("INVALID_REPORT_PAYLOAD");
  }

  const status = input.status;

  if (status !== "REVIEWED" && status !== "RESOLVED" && status !== "REJECTED") {
    throw new Error("INVALID_REPORT_STATUS");
  }

  if (
    input.adminNotes !== undefined &&
    input.adminNotes !== null &&
    typeof input.adminNotes !== "string"
  ) {
    throw new Error("INVALID_ADMIN_NOTES");
  }

  const adminNotes =
    typeof input.adminNotes === "string" ? input.adminNotes.trim() : "";

  if (adminNotes.length > 5000) {
    throw new Error("ADMIN_NOTES_TOO_LONG");
  }

  await updateAdminReportRepository(reportId, status, adminNotes || null);
}
