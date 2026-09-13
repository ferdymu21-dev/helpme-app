import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

import type {
  AdminServicePayment,
  AdminServicePaymentListing,
  AdminServicePaymentListResponse,
  AdminServicePaymentProvider,
  AdminServicePaymentPublicationPeriod,
} from "../types/admin-service-payment.types";

interface AdminServicePaymentRow {
  id: string;

  service_listing_id: string;
  provider_id: string;

  publication_action: string;

  amount: number;
  currency: string;

  publication_duration_seconds: number;

  payment_status: string;

  midtrans_order_id: string;

  midtrans_transaction_id: string | null;

  payment_method: string | null;

  payment_expires_at: string | null;

  renewal_base_expires_at: string | null;

  paid_at: string | null;

  failed_at: string | null;

  cancelled_at: string | null;

  expired_at: string | null;

  publication_applied_at: string | null;

  created_at: string;
  updated_at: string;
}

interface AdminServicePaymentListingRow {
  id: string;

  title: string;
  status: string;

  expires_at: string | null;
}

interface AdminServicePaymentProviderRow {
  id: string;

  full_name: string | null;

  username: string | null;
}

interface AdminServicePaymentPublicationPeriodRow {
  id: string;

  payment_id: string | null;

  source_type: string;

  publication_action: string;

  duration_seconds: number;

  starts_at: string;
  ends_at: string;
  applied_at: string;
}

export interface AdminServicePaymentListFilters {
  page: number;
  pageSize: number;

  status: string | null;

  action: string | null;

  query: string | null;
}

function mapListing(
  row: AdminServicePaymentListingRow,
): AdminServicePaymentListing {
  return {
    id: row.id,

    title: row.title,
    status: row.status,

    expiresAt: row.expires_at,
  };
}

function mapProvider(
  row: AdminServicePaymentProviderRow,
): AdminServicePaymentProvider {
  return {
    id: row.id,

    fullName: row.full_name,

    username: row.username,
  };
}

function mapPublicationPeriod(
  row: AdminServicePaymentPublicationPeriodRow,
): AdminServicePaymentPublicationPeriod {
  return {
    id: row.id,

    sourceType: row.source_type,

    publicationAction: row.publication_action,

    durationSeconds: row.duration_seconds,

    startsAt: row.starts_at,

    endsAt: row.ends_at,

    appliedAt: row.applied_at,
  };
}

async function hydratePayments(
  rows: AdminServicePaymentRow[],
): Promise<AdminServicePayment[]> {
  if (rows.length === 0) {
    return [];
  }

  const listingIds = [...new Set(rows.map((row) => row.service_listing_id))];

  const providerIds = [...new Set(rows.map((row) => row.provider_id))];

  const paymentIds = rows.map((row) => row.id);

  const [listingsResult, providersResult, periodsResult] = await Promise.all([
    adminSupabase
      .from("service_listings")
      .select(
        `
            id,
            title,
            status,
            expires_at
          `,
      )
      .in("id", listingIds)
      .returns<AdminServicePaymentListingRow[]>(),

    adminSupabase
      .from("users")
      .select(
        `
            id,
            full_name,
            username
          `,
      )
      .in("id", providerIds)
      .returns<AdminServicePaymentProviderRow[]>(),

    adminSupabase
      .from("service_listing_publication_periods")
      .select(
        `
            id,
            payment_id,
            source_type,
            publication_action,
            duration_seconds,
            starts_at,
            ends_at,
            applied_at
          `,
      )
      .in("payment_id", paymentIds)
      .returns<AdminServicePaymentPublicationPeriodRow[]>(),
  ]);

  if (listingsResult.error) {
    throw new Error(listingsResult.error.message);
  }

  if (providersResult.error) {
    throw new Error(providersResult.error.message);
  }

  if (periodsResult.error) {
    throw new Error(periodsResult.error.message);
  }

  const listings = new Map(
    (listingsResult.data ?? []).map((row) => [row.id, mapListing(row)]),
  );

  const providers = new Map(
    (providersResult.data ?? []).map((row) => [row.id, mapProvider(row)]),
  );

  const periods = new Map(
    (periodsResult.data ?? [])
      .filter(
        (
          row,
        ): row is AdminServicePaymentPublicationPeriodRow & {
          payment_id: string;
        } => row.payment_id !== null,
      )
      .map((row) => [row.payment_id, mapPublicationPeriod(row)]),
  );

  return rows.map((row) => ({
    id: row.id,

    serviceListingId: row.service_listing_id,

    providerId: row.provider_id,

    publicationAction: row.publication_action,

    amount: row.amount,

    currency: row.currency,

    publicationDurationSeconds: row.publication_duration_seconds,

    paymentStatus: row.payment_status,

    midtransOrderId: row.midtrans_order_id,

    midtransTransactionId: row.midtrans_transaction_id,

    paymentMethod: row.payment_method,

    paymentExpiresAt: row.payment_expires_at,

    renewalBaseExpiresAt: row.renewal_base_expires_at,

    paidAt: row.paid_at,

    failedAt: row.failed_at,

    cancelledAt: row.cancelled_at,

    expiredAt: row.expired_at,

    publicationAppliedAt: row.publication_applied_at,

    createdAt: row.created_at,

    updatedAt: row.updated_at,

    listing: listings.get(row.service_listing_id) ?? null,

    provider: providers.get(row.provider_id) ?? null,

    publicationPeriod: periods.get(row.id) ?? null,
  }));
}

function escapeLikePattern(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

export async function getAdminServicePaymentsRepository(
  filters: AdminServicePaymentListFilters,
): Promise<AdminServicePaymentListResponse> {
  const from = (filters.page - 1) * filters.pageSize;

  const to = from + filters.pageSize - 1;

  let query = adminSupabase
    .from("service_listing_payments")
    .select(
      `
          id,
          service_listing_id,
          provider_id,
          publication_action,
          amount,
          currency,
          publication_duration_seconds,
          payment_status,
          midtrans_order_id,
          midtrans_transaction_id,
          payment_method,
          payment_expires_at,
          renewal_base_expires_at,
          paid_at,
          failed_at,
          cancelled_at,
          expired_at,
          publication_applied_at,
          created_at,
          updated_at
        `,
      {
        count: "exact",
      },
    )
    .order("created_at", {
      ascending: false,
    });

  if (filters.status) {
    query = query.eq("payment_status", filters.status);
  }

  if (filters.action) {
    query = query.eq("publication_action", filters.action);
  }

  if (filters.query) {
    query = query.ilike(
      "midtrans_order_id",
      `%${escapeLikePattern(filters.query)}%`,
    );
  }

  const { data, error, count } = await query
    .range(from, to)
    .returns<AdminServicePaymentRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  const items = await hydratePayments(data ?? []);

  const total = count ?? 0;

  return {
    items,

    page: filters.page,

    pageSize: filters.pageSize,

    total,

    totalPages: total === 0 ? 0 : Math.ceil(total / filters.pageSize),
  };
}

export async function getAdminServicePaymentDetailRepository(
  paymentId: string,
): Promise<AdminServicePayment | null> {
  const { data, error } = await adminSupabase
    .from("service_listing_payments")
    .select(
      `
          id,
          service_listing_id,
          provider_id,
          publication_action,
          amount,
          currency,
          publication_duration_seconds,
          payment_status,
          midtrans_order_id,
          midtrans_transaction_id,
          payment_method,
          payment_expires_at,
          renewal_base_expires_at,
          paid_at,
          failed_at,
          cancelled_at,
          expired_at,
          publication_applied_at,
          created_at,
          updated_at
        `,
    )
    .eq("id", paymentId)
    .maybeSingle<AdminServicePaymentRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const items = await hydratePayments([data]);

  return items[0] ?? null;
}
