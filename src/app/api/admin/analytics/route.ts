import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

interface UserRow {
  id: string;
  created_at: string | null;
  verification_status: string | null;
  is_suspended: boolean | null;
  is_banned: boolean | null;
  role: string | null;
}

interface HelperRelation {
  id: string;
  full_name: string | null;
}

interface TaskRow {
  created_at: string | null;
  category: string | null;
  status: string | null;
  selected_helper_id: string | null;
  users: HelperRelation | HelperRelation[] | null;
}

interface ReportRow {
  created_at: string | null;
  status: string | null;
  reported_user_id: string | null;
  reported_user:
    | {
        full_name: string | null;
      }
    | {
        full_name: string | null;
      }[]
    | null;
}

interface GrowthPoint {
  day: string;
  users?: number;
  tasks?: number;
  reports?: number;
}

interface CategoryStat {
  name: string;
  total: number;
}

interface HelperStat {
  id: string;
  full_name: string;
  total_tasks: number;
}

interface ReportedUserStat {
  id: string;
  name: string;
  total: number;
}

interface AnalyticsResponse {
  stats: {
    totalUsers: number;
    verifiedUsers: number;
    suspendedUsers: number;
    bannedUsers: number;

    totalTasks: number;
    openTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    cancelledTasks: number;
    removedTasks: number;

    totalReports: number;
    pendingReports: number;
    reviewedReports: number;
    resolvedReports: number;
    rejectedReports: number;
  };

  userChartData: GrowthPoint[];
  taskChartData: GrowthPoint[];
  reportChartData: GrowthPoint[];

  topCategories: CategoryStat[];
  topHelpers: HelperStat[];
  topReportedUsers: ReportedUserStat[];
}

interface QueryResult<T> {
  data: T[] | null;
  error: Error | null;
}

/*
 * ============================================================
 * GET ALL ROWS
 * ============================================================
 *
 * Supabase biasanya memiliki limit jumlah row yang dikembalikan.
 * Helper ini mengambil data secara bertahap supaya analytics
 * tidak tiba-tiba salah ketika jumlah data > 1000.
 */
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

/*
 * ============================================================
 * LAST 7 DAYS
 * ============================================================
 */

function getLast7Days() {
  const result: {
    date: string;
    label: string;
  }[] = [];

  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);

    date.setDate(now.getDate() - i);

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    result.push({
      date: `${year}-${month}-${day}`,

      label: `${day}/${month}`,
    });
  }

  return result;
}

/*
 * ============================================================
 * FORMAT DATE
 * ============================================================
 */

function getLocalDateString(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/*
 * ============================================================
 * GET
 * ============================================================
 */

export async function GET() {
  try {
    /*
     * ----------------------------------------------------
     * SERVER SUPABASE CLIENT
     * ----------------------------------------------------
     */

    const supabase = await createServerSupabaseClient();

    /*
     * ----------------------------------------------------
     * AUTHENTICATION
     * ----------------------------------------------------
     */

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * ----------------------------------------------------
     * ADMIN CHECK
     * ----------------------------------------------------
     *
     * Admin ditentukan dari users.role.
     *
     * Gunakan value "ADMIN" sesuai enum/status role
     * pada database Anda.
     */

    const { data: adminUser, error: adminError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (adminError) {
      console.error("Admin check error:", adminError);

      return NextResponse.json(
        {
          error: "Failed to verify admin access",
        },
        {
          status: 500,
        },
      );
    }

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * ----------------------------------------------------
     * LOAD ANALYTICS DATA
     * ----------------------------------------------------
     *
     * Semua query dijalankan secara parallel.
     * Ini lebih cepat dibanding menunggu query satu per satu.
     */

    const [users, tasks, reports] = await Promise.all([
      getAllRows<UserRow>(async (from, to) => {
        const { data, error } = await supabase
          .from("users")
          .select(
            `
          id,
          created_at,
          verification_status,
          is_suspended,
          is_banned,
          role
        `,
          )
          .range(from, to);

        return {
          data: data as UserRow[] | null,
          error: error ? new Error(error.message) : null,
        };
      }),

      getAllRows<TaskRow>(async (from, to) => {
        const { data, error } = await supabase
          .from("tasks")
          .select(
            `
          created_at,
          category,
          status,
          selected_helper_id,
          users!tasks_selected_helper_id_fkey (
            id,
            full_name
          )
        `,
          )
          .range(from, to);

        return {
          data: data as TaskRow[] | null,
          error: error ? new Error(error.message) : null,
        };
      }),

      getAllRows<ReportRow>(async (from, to) => {
        const { data, error } = await supabase
          .from("reports")
          .select(
            `
          created_at,
          status,
          reported_user_id,
          reported_user:users!reports_reported_user_id_fkey (
            full_name
          )
        `,
          )
          .range(from, to);

        return {
          data: data as ReportRow[] | null,
          error: error ? new Error(error.message) : null,
        };
      }),
    ]);

    /*
     * ====================================================
     * USER STATS
     * ====================================================
     */

    const totalUsers = users.length;

    const verifiedUsers = users.filter(
      (user) => user.verification_status === "VERIFIED",
    ).length;

    const suspendedUsers = users.filter(
      (user) => user.is_suspended === true,
    ).length;

    const bannedUsers = users.filter((user) => user.is_banned === true).length;

    /*
     * ====================================================
     * TASK STATS
     * ====================================================
     */

    const totalTasks = tasks.length;

    const openTasks = tasks.filter((task) => task.status === "OPEN").length;

    const inProgressTasks = tasks.filter(
      (task) =>
        task.status === "ACCEPTED" ||
        task.status === "WAITING_CONFIRMATION" ||
        task.status === "ON_PROGRESS",
    ).length;

    const completedTasks = tasks.filter(
      (task) => task.status === "COMPLETED" || task.status === "REVIEWED",
    ).length;

    const cancelledTasks = tasks.filter(
      (task) => task.status === "CANCELLED",
    ).length;

    const removedTasks = tasks.filter(
      (task) => task.status === "REMOVED",
    ).length;

    /*
     * ====================================================
     * REPORT STATS
     * ====================================================
     */

    const totalReports = reports.length;

    const pendingReports = reports.filter(
      (report) => report.status === "PENDING",
    ).length;

    const reviewedReports = reports.filter(
      (report) => report.status === "REVIEWED",
    ).length;

    const resolvedReports = reports.filter(
      (report) => report.status === "RESOLVED",
    ).length;

    const rejectedReports = reports.filter(
      (report) => report.status === "REJECTED",
    ).length;

    /*
     * ====================================================
     * USER GROWTH
     * ====================================================
     */

    const last7Days = getLast7Days();

    const userChartData = last7Days.map((item) => ({
      day: item.label,

      users: users.filter(
        (user) => getLocalDateString(user.created_at) === item.date,
      ).length,
    }));

    /*
     * ====================================================
     * TASK GROWTH
     * ====================================================
     */

    const taskChartData = last7Days.map((item) => ({
      day: item.label,

      tasks: tasks.filter(
        (task) => getLocalDateString(task.created_at) === item.date,
      ).length,
    }));

    /*
     * ====================================================
     * REPORT GROWTH
     * ====================================================
     */

    const reportChartData = last7Days.map((item) => ({
      day: item.label,

      reports: reports.filter(
        (report) => getLocalDateString(report.created_at) === item.date,
      ).length,
    }));

    /*
     * ====================================================
     * TOP CATEGORIES
     * ====================================================
     */

    const categoryMap: Record<string, number> = {};

    tasks.forEach((task) => {
      const category = task.category?.trim() || "OTHER";

      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    const topCategories = Object.entries(categoryMap)
      .map(([name, total]) => ({
        name,
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    /*
     * ====================================================
     * TOP ACTIVE HELPERS
     * ====================================================
     *
     * Hanya task COMPLETED.
     */

    const helperMap: Record<string, HelperStat> = {};

    tasks
      .filter((task) => task.status === "COMPLETED")
      .forEach((task) => {
        const helperId = task.selected_helper_id;

        if (!helperId) {
          return;
        }

        const relation = Array.isArray(task.users) ? task.users[0] : task.users;

        if (!helperMap[helperId]) {
          helperMap[helperId] = {
            id: helperId,

            full_name: relation?.full_name || "Unknown",

            total_tasks: 0,
          };
        }

        helperMap[helperId].total_tasks += 1;
      });

    const topHelpers = Object.values(helperMap)
      .sort((a, b) => b.total_tasks - a.total_tasks)
      .slice(0, 5);

    /*
     * ====================================================
     * TOP REPORTED USERS
     * ====================================================
     */

    const reportedUserMap: Record<string, ReportedUserStat> = {};

    reports.forEach((report) => {
      const userId = report.reported_user_id;

      if (!userId) {
        return;
      }

      const relation = Array.isArray(report.reported_user)
        ? report.reported_user[0]
        : report.reported_user;

      if (!reportedUserMap[userId]) {
        reportedUserMap[userId] = {
          id: userId,

          name: relation?.full_name || "Unknown",

          total: 0,
        };
      }

      reportedUserMap[userId].total += 1;
    });

    const topReportedUsers = Object.values(reportedUserMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    /*
     * ====================================================
     * FINAL RESPONSE
     * ====================================================
     */

    const response: AnalyticsResponse = {
      stats: {
        totalUsers,
        verifiedUsers,
        suspendedUsers,
        bannedUsers,

        totalTasks,
        openTasks,
        inProgressTasks,
        completedTasks,
        cancelledTasks,
        removedTasks,

        totalReports,
        pendingReports,
        reviewedReports,
        resolvedReports,
        rejectedReports,
      },

      userChartData,
      taskChartData,
      reportChartData,

      topCategories,
      topHelpers,
      topReportedUsers,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Admin analytics API error:", error);

    return NextResponse.json(
      {
        error: "Failed to load analytics",
      },
      {
        status: 500,
      },
    );
  }
}