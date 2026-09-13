export const ADMIN_REPORT_STATUSES = [
  "PENDING",
  "REVIEWED",
  "RESOLVED",
  "REJECTED",
] as const;

export type AdminReportStatus = (typeof ADMIN_REPORT_STATUSES)[number];

export type AdminReportContext = "TASK" | "SERVICE_LISTING" | "USER";

export interface AdminReportUser {
  id: string;

  full_name: string | null;

  verification_status: string | null;
}

export interface AdminReportTask {
  id: string;

  title: string;
  status: string;

  budget: number | null;
}

export interface AdminReportServiceListing {
  id: string;

  provider_id: string;

  title: string;
  category: string;

  status: string;

  blocked_at: string | null;
  blocked_reason: string | null;

  expires_at: string | null;
}

export interface AdminReport {
  id: string;

  reporter_id: string;

  reported_user_id: string | null;

  task_id: string | null;

  service_listing_id: string | null;

  reason: string;

  description: string | null;

  status: string;

  admin_notes: string | null;

  created_at: string;

  reviewed_at: string | null;

  context: AdminReportContext;

  reporter: AdminReportUser | null;

  reported_user: AdminReportUser | null;

  task: AdminReportTask | null;

  service_listing: AdminReportServiceListing | null;
}
