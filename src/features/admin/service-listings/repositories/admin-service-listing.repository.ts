import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

import type {
  AdminServiceListingDetail,
  AdminServiceListingListResponse,
  AdminServiceListingStatus,
  AdminServiceListingSummary,
  AdminServiceProviderSummary,
} from "../types/admin-service-listing.types";

interface AdminServiceListingListRow {
  id: string;
  provider_id: string;

  title: string;
  category: string;

  price_from: number;
  is_negotiable: boolean;

  service_mode: string;
  location_name: string | null;

  status: AdminServiceListingStatus;

  published_at: string | null;
  activated_at: string | null;
  expires_at: string | null;
  paused_at: string | null;

  blocked_at: string | null;
  blocked_reason: string | null;
  blocked_from_status: string | null;

  archived_at: string | null;

  created_at: string;
  updated_at: string;
}

interface AdminServiceListingDetailRow extends AdminServiceListingListRow {
  description: string;
  deliverables: string;
  customer_preparation: string | null;
}

interface AdminServiceProviderRow {
  id: string;

  full_name: string | null;
  username: string | null;
  avatar_url: string | null;

  verification_status: string | null;
}

export interface GetAdminServiceListingsRepositoryInput {
  page: number;
  pageSize: number;

  status: AdminServiceListingStatus | null;
  search: string | null;
}

function mapProvider(
  row: AdminServiceProviderRow,
): AdminServiceProviderSummary {
  return {
    id: row.id,
    fullName: row.full_name,
    username: row.username,
    avatarUrl: row.avatar_url,
    verificationStatus: row.verification_status,
  };
}

async function getProvidersByIds(
  providerIds: string[],
): Promise<Map<string, AdminServiceProviderSummary>> {
  const uniqueProviderIds = [...new Set(providerIds)];

  if (uniqueProviderIds.length === 0) {
    return new Map();
  }

  const { data, error } = await adminSupabase
    .from("users")
    .select(
      `
          id,
          full_name,
          username,
          avatar_url,
          verification_status
        `,
    )
    .in("id", uniqueProviderIds)
    .returns<AdminServiceProviderRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((row) => [row.id, mapProvider(row)]));
}

function mapListingSummary(
  row: AdminServiceListingListRow,
  providers: Map<string, AdminServiceProviderSummary>,
): AdminServiceListingSummary {
  return {
    id: row.id,
    providerId: row.provider_id,

    provider: providers.get(row.provider_id) ?? null,

    title: row.title,
    category: row.category,

    priceFrom: row.price_from,
    isNegotiable: row.is_negotiable,

    serviceMode: row.service_mode,
    locationName: row.location_name,

    status: row.status,

    publishedAt: row.published_at,
    activatedAt: row.activated_at,
    expiresAt: row.expires_at,
    pausedAt: row.paused_at,

    blockedAt: row.blocked_at,
    blockedReason: row.blocked_reason,
    blockedFromStatus: row.blocked_from_status,

    archivedAt: row.archived_at,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAdminServiceListingsRepository(
  input: GetAdminServiceListingsRepositoryInput,
): Promise<AdminServiceListingListResponse> {
  const from = (input.page - 1) * input.pageSize;

  const to = from + input.pageSize - 1;

  let query = adminSupabase.from("service_listings").select(
    `
          id,
          provider_id,
          title,
          category,
          price_from,
          is_negotiable,
          service_mode,
          location_name,
          status,
          published_at,
          activated_at,
          expires_at,
          paused_at,
          blocked_at,
          blocked_reason,
          blocked_from_status,
          archived_at,
          created_at,
          updated_at
        `,
    {
      count: "exact",
    },
  );

  if (input.status) {
    query = query.eq("status", input.status);
  }

  if (input.search) {
    query = query.ilike("title", `%${input.search}%`);
  }

  const { data, error, count } = await query
    .order("created_at", {
      ascending: false,
    })
    .range(from, to)
    .returns<AdminServiceListingListRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];

  const providers = await getProvidersByIds(rows.map((row) => row.provider_id));

  const totalCount = count ?? 0;

  return {
    items: rows.map((row) => mapListingSummary(row, providers)),

    page: input.page,

    pageSize: input.pageSize,

    totalCount,

    totalPages: Math.ceil(totalCount / input.pageSize),
  };
}

export async function getAdminServiceListingDetailRepository(
  serviceListingId: string,
): Promise<AdminServiceListingDetail | null> {
  const { data, error } = await adminSupabase
    .from("service_listings")
    .select(
      `
          id,
          provider_id,
          title,
          category,
          description,
          deliverables,
          customer_preparation,
          price_from,
          is_negotiable,
          service_mode,
          location_name,
          status,
          published_at,
          activated_at,
          expires_at,
          paused_at,
          blocked_at,
          blocked_reason,
          blocked_from_status,
          archived_at,
          created_at,
          updated_at
        `,
    )
    .eq("id", serviceListingId)
    .maybeSingle<AdminServiceListingDetailRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const providers = await getProvidersByIds([data.provider_id]);

  return {
    ...mapListingSummary(data, providers),

    description: data.description,

    deliverables: data.deliverables,

    customerPreparation: data.customer_preparation,
  };
}
