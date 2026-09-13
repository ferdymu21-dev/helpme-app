import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

export interface AnalyticsUserRow {
  id: string;
  full_name: string | null;

  created_at: string | null;

  verification_status: string | null;

  is_suspended: boolean | null;
  is_banned: boolean | null;
}

export interface AnalyticsTaskRow {
  id: string;

  created_at: string | null;

  category: string | null;
  status: string | null;

  selected_helper_id: string | null;
}

export interface AnalyticsApplicationRow {
  id: string;

  task_id: string;
  helper_id: string;

  status: string;

  created_at: string | null;
}

export interface AnalyticsReviewRow {
  id: string;

  task_id: string;

  reviewer_id: string;
  reviewee_id: string;

  rating: number;

  created_at: string | null;
}

export interface AnalyticsReportRow {
  id: string;

  created_at: string | null;

  status: string | null;

  reported_user_id: string | null;
  service_listing_id: string | null;
}

export interface AnalyticsServiceListingRow {
  id: string;
  status: string;
}

export interface AnalyticsServiceRequestRow {
  id: string;
  status: string;
}

export interface AnalyticsServicePaymentRow {
  id: string;

  payment_status: string;
  amount: number;
}
export interface AdminAnalyticsSourceData {
  users: AnalyticsUserRow[];

  tasks: AnalyticsTaskRow[];

  applications: AnalyticsApplicationRow[];

  reviews: AnalyticsReviewRow[];

  serviceListings: AnalyticsServiceListingRow[];

  serviceRequests: AnalyticsServiceRequestRow[];

  servicePayments: AnalyticsServicePaymentRow[];

  reports: AnalyticsReportRow[];
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

export async function getAdminAnalyticsRepository(): Promise<AdminAnalyticsSourceData> {
  const [
    users,
    tasks,
    applications,
    reviews,
    serviceListings,
    serviceRequests,
    servicePayments,
    reports,
  ] = await Promise.all([
    getAllRows<AnalyticsUserRow>(async (from, to) => {
      const { data, error } = await adminSupabase
        .from("users")
        .select(
          `
                id,
                full_name,
                created_at,
                verification_status,
                is_suspended,
                is_banned
              `,
        )
        .order("id", {
          ascending: true,
        })
        .range(from, to);

      return {
        data,
        error: error ? new Error(error.message) : null,
      };
    }),

    getAllRows<AnalyticsTaskRow>(async (from, to) => {
      const { data, error } = await adminSupabase
        .from("tasks")
        .select(
          `
                id,
                created_at,
                category,
                status,
                selected_helper_id
              `,
        )
        .order("id", {
          ascending: true,
        })
        .range(from, to);

      return {
        data,
        error: error ? new Error(error.message) : null,
      };
    }),

    getAllRows<AnalyticsApplicationRow>(async (from, to) => {
      const { data, error } = await adminSupabase
        .from("task_applications")
        .select(
          `
                id,
                task_id,
                helper_id,
                status,
                created_at
              `,
        )
        .order("id", {
          ascending: true,
        })
        .range(from, to);

      return {
        data,
        error: error ? new Error(error.message) : null,
      };
    }),

    getAllRows<AnalyticsReviewRow>(async (from, to) => {
      const { data, error } = await adminSupabase
        .from("reviews")
        .select(
          `
                id,
                task_id,
                reviewer_id,
                reviewee_id,
                rating,
                created_at
              `,
        )
        .order("id", {
          ascending: true,
        })
        .range(from, to);

      return {
        data,
        error: error ? new Error(error.message) : null,
      };
    }),

    getAllRows<AnalyticsServiceListingRow>(async (from, to) => {
      const { data, error } = await adminSupabase
        .from("service_listings")
        .select(
          `
                id,
                status
              `,
        )
        .order("id", {
          ascending: true,
        })
        .range(from, to);

      return {
        data,
        error: error ? new Error(error.message) : null,
      };
    }),

    getAllRows<AnalyticsServiceRequestRow>(async (from, to) => {
      const { data, error } = await adminSupabase
        .from("service_requests")
        .select(
          `
                id,
                status
              `,
        )
        .order("id", {
          ascending: true,
        })
        .range(from, to);

      return {
        data,
        error: error ? new Error(error.message) : null,
      };
    }),

    getAllRows<AnalyticsServicePaymentRow>(async (from, to) => {
      const { data, error } = await adminSupabase
        .from("service_listing_payments")
        .select(
          `
                id,
                payment_status,
                amount
              `,
        )
        .order("id", {
          ascending: true,
        })
        .range(from, to);

      return {
        data,
        error: error ? new Error(error.message) : null,
      };
    }),
    getAllRows<AnalyticsReportRow>(async (from, to) => {
      const { data, error } = await adminSupabase
        .from("reports")
        .select(
          `
                id,
                created_at,
                status,
                reported_user_id,
                service_listing_id
              `,
        )
        .order("id", {
          ascending: true,
        })
        .range(from, to);

      return {
        data,
        error: error ? new Error(error.message) : null,
      };
    }),
  ]);

  return {
    users,
    tasks,
    applications,
    reviews,
    serviceListings,
    serviceRequests,
    servicePayments,
    reports,
  };
}
