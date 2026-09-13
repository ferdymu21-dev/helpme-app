import "server-only";

import { requireAdmin } from "@/features/admin/server/requireAdmin";

import { getAdminReportsRepository } from "../repositories/admin-report.repository";

import type { AdminReport } from "../types/admin-report.types";

export async function getAdminReportsService(): Promise<AdminReport[]> {
  await requireAdmin();

  return getAdminReportsRepository();
}
