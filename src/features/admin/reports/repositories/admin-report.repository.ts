import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

import type {
  AdminReport,
  AdminReportContext,
  AdminReportServiceListing,
  AdminReportTask,
  AdminReportUser,
} from "../types/admin-report.types";

interface AdminReportRow {
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
}

interface AdminReportUserRow {
  id: string;

  full_name: string | null;

  verification_status: string | null;
}

interface AdminReportTaskRow {
  id: string;

  title: string;
  status: string;

  budget: number | null;
}

interface AdminReportServiceListingRow {
  id: string;

  provider_id: string;

  title: string;
  category: string;

  status: string;

  blocked_at: string | null;
  blocked_reason: string | null;

  expires_at: string | null;
}

interface QueryResult<T> {
  data: T[] | null;
  error: Error | null;
}

async function getAllRows<T>(
  queryFactory: (from: number, to: number) => Promise<QueryResult<T>>,
): Promise<T[]> {
  const rows: T[] = [];

  const pageSize = 1000;

  let from = 0;

  while (true) {
    const to = from + pageSize - 1;

    const { data, error } = await queryFactory(from, to);

    if (error) {
      throw error;
    }

    const batch = data ?? [];

    rows.push(...batch);

    if (batch.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return rows;
}

function mapUser(row: AdminReportUserRow): AdminReportUser {
  return {
    id: row.id,

    full_name: row.full_name,

    verification_status: row.verification_status,
  };
}

function mapTask(row: AdminReportTaskRow): AdminReportTask {
  return {
    id: row.id,

    title: row.title,
    status: row.status,

    budget: row.budget,
  };
}

function mapServiceListing(
  row: AdminReportServiceListingRow,
): AdminReportServiceListing {
  return {
    id: row.id,

    provider_id: row.provider_id,

    title: row.title,
    category: row.category,

    status: row.status,

    blocked_at: row.blocked_at,

    blocked_reason: row.blocked_reason,

    expires_at: row.expires_at,
  };
}

async function getUsersByIds(
  ids: string[],
): Promise<Map<string, AdminReportUser>> {
  const uniqueIds = [...new Set(ids)];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const { data, error } = await adminSupabase
    .from("users")
    .select(
      `
          id,
          full_name,
          verification_status
        `,
    )
    .in("id", uniqueIds)
    .returns<AdminReportUserRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((row) => [row.id, mapUser(row)]));
}

async function getTasksByIds(
  ids: string[],
): Promise<Map<string, AdminReportTask>> {
  const uniqueIds = [...new Set(ids)];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const { data, error } = await adminSupabase
    .from("tasks")
    .select(
      `
          id,
          title,
          status,
          budget
        `,
    )
    .in("id", uniqueIds)
    .returns<AdminReportTaskRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((row) => [row.id, mapTask(row)]));
}

async function getServiceListingsByIds(
  ids: string[],
): Promise<Map<string, AdminReportServiceListing>> {
  const uniqueIds = [...new Set(ids)];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const { data, error } = await adminSupabase
    .from("service_listings")
    .select(
      `
          id,
          provider_id,
          title,
          category,
          status,
          blocked_at,
          blocked_reason,
          expires_at
        `,
    )
    .in("id", uniqueIds)
    .returns<AdminReportServiceListingRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((row) => [row.id, mapServiceListing(row)]));
}

function getContext(row: AdminReportRow): AdminReportContext {
  if (row.service_listing_id) {
    return "SERVICE_LISTING";
  }

  if (row.task_id) {
    return "TASK";
  }

  return "USER";
}

function hydrateReport(
  row: AdminReportRow,
  users: Map<string, AdminReportUser>,
  tasks: Map<string, AdminReportTask>,
  serviceListings: Map<string, AdminReportServiceListing>,
): AdminReport {
  return {
    ...row,

    context: getContext(row),

    reporter: users.get(row.reporter_id) ?? null,

    reported_user: row.reported_user_id
      ? (users.get(row.reported_user_id) ?? null)
      : null,

    task: row.task_id ? (tasks.get(row.task_id) ?? null) : null,

    service_listing: row.service_listing_id
      ? (serviceListings.get(row.service_listing_id) ?? null)
      : null,
  };
}

async function hydrateReports(rows: AdminReportRow[]): Promise<AdminReport[]> {
  const userIds = rows.flatMap((row) => {
    const ids = [row.reporter_id];

    if (row.reported_user_id) {
      ids.push(row.reported_user_id);
    }

    return ids;
  });

  const taskIds = rows.flatMap((row) => (row.task_id ? [row.task_id] : []));

  const serviceListingIds = rows.flatMap((row) =>
    row.service_listing_id ? [row.service_listing_id] : [],
  );

  const [users, tasks, serviceListings] = await Promise.all([
    getUsersByIds(userIds),

    getTasksByIds(taskIds),

    getServiceListingsByIds(serviceListingIds),
  ]);

  return rows.map((row) => hydrateReport(row, users, tasks, serviceListings));
}

export async function getAdminReportsRepository(): Promise<AdminReport[]> {
  const rows = await getAllRows<AdminReportRow>(async (from, to) => {
    const { data, error } = await adminSupabase
      .from("reports")
      .select(
        `
                id,
                reporter_id,
                reported_user_id,
                task_id,
                service_listing_id,
                reason,
                description,
                status,
                admin_notes,
                created_at,
                reviewed_at
              `,
      )
      .order("created_at", {
        ascending: false,
      })
      .range(from, to)
      .returns<AdminReportRow[]>();

    return {
      data,

      error: error ? new Error(error.message) : null,
    };
  });

  return hydrateReports(rows);
}

export async function getAdminReportDetailRepository(
  reportId: string,
): Promise<AdminReport | null> {
  const { data, error } = await adminSupabase
    .from("reports")
    .select(
      `
          id,
          reporter_id,
          reported_user_id,
          task_id,
          service_listing_id,
          reason,
          description,
          status,
          admin_notes,
          created_at,
          reviewed_at
        `,
    )
    .eq("id", reportId)
    .maybeSingle<AdminReportRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const reports = await hydrateReports([data]);

  return reports[0] ?? null;
}

export async function updateAdminReportRepository(
  reportId: string,
  status: string,
  adminNotes: string | null,
): Promise<void> {
  const { data, error } = await adminSupabase
    .from("reports")
    .update({
      status,

      admin_notes: adminNotes,

      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("REPORT_NOT_FOUND");
  }
}
