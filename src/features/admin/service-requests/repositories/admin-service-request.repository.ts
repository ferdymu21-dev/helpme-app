import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

import type {
  AdminServiceRequestDetail,
  AdminServiceRequestListing,
  AdminServiceRequestListResponse,
  AdminServiceRequestParticipant,
  AdminServiceRequestStatus,
  AdminServiceRequestSummary,
} from "../types/admin-service-request.types";

interface AdminServiceRequestListRow {
  id: string;

  service_listing_id: string;

  customer_id: string;
  provider_id: string;

  request_description: string;

  needed_at: string;

  service_mode: string;
  location_name: string | null;

  budget: number | null;

  status: AdminServiceRequestStatus;

  created_at: string;
  updated_at: string;
}

interface AdminServiceRequestDetailRow extends AdminServiceRequestListRow {
  agreed_at: string | null;
  started_at: string | null;
  submitted_at: string | null;
  completed_at: string | null;

  declined_at: string | null;
  declined_reason: string | null;

  cancelled_at: string | null;
  cancelled_by: string | null;

  cancellation_reason: string | null;
}

interface AdminServiceRequestUserRow {
  id: string;

  full_name: string | null;
  username: string | null;
  avatar_url: string | null;

  verification_status: string | null;
}

interface AdminServiceRequestListingRow {
  id: string;

  title: string;
  category: string;

  status: string;
}

export interface GetAdminServiceRequestsRepositoryInput {
  page: number;
  pageSize: number;

  status: AdminServiceRequestStatus | null;

  search: string | null;
}

function mapParticipant(
  row: AdminServiceRequestUserRow,
): AdminServiceRequestParticipant {
  return {
    id: row.id,

    fullName: row.full_name,

    username: row.username,

    avatarUrl: row.avatar_url,

    verificationStatus: row.verification_status,
  };
}

function mapListing(
  row: AdminServiceRequestListingRow,
): AdminServiceRequestListing {
  return {
    id: row.id,

    title: row.title,
    category: row.category,

    status: row.status,
  };
}

async function getParticipantsByIds(
  ids: string[],
): Promise<Map<string, AdminServiceRequestParticipant>> {
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
          username,
          avatar_url,
          verification_status
        `,
    )
    .in("id", uniqueIds)
    .returns<AdminServiceRequestUserRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((row) => [row.id, mapParticipant(row)]));
}

async function getListingsByIds(
  ids: string[],
): Promise<Map<string, AdminServiceRequestListing>> {
  const uniqueIds = [...new Set(ids)];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const { data, error } = await adminSupabase
    .from("service_listings")
    .select(
      `
          id,
          title,
          category,
          status
        `,
    )
    .in("id", uniqueIds)
    .returns<AdminServiceRequestListingRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((row) => [row.id, mapListing(row)]));
}

function mapSummary(
  row: AdminServiceRequestListRow,
  participants: Map<string, AdminServiceRequestParticipant>,
  listings: Map<string, AdminServiceRequestListing>,
): AdminServiceRequestSummary {
  return {
    id: row.id,

    serviceListingId: row.service_listing_id,

    listing: listings.get(row.service_listing_id) ?? null,

    customerId: row.customer_id,

    customer: participants.get(row.customer_id) ?? null,

    providerId: row.provider_id,

    provider: participants.get(row.provider_id) ?? null,

    requestDescription: row.request_description,

    neededAt: row.needed_at,

    serviceMode: row.service_mode,

    locationName: row.location_name,

    budget: row.budget,

    status: row.status,

    createdAt: row.created_at,

    updatedAt: row.updated_at,
  };
}

export async function getAdminServiceRequestsRepository(
  input: GetAdminServiceRequestsRepositoryInput,
): Promise<AdminServiceRequestListResponse> {
  const from = (input.page - 1) * input.pageSize;

  const to = from + input.pageSize - 1;

  let query = adminSupabase.from("service_requests").select(
    `
          id,
          service_listing_id,
          customer_id,
          provider_id,
          request_description,
          needed_at,
          service_mode,
          location_name,
          budget,
          status,
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
    query = query.ilike("request_description", `%${input.search}%`);
  }

  const { data, error, count } = await query
    .order("created_at", {
      ascending: false,
    })
    .range(from, to)
    .returns<AdminServiceRequestListRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];

  const [participants, listings] = await Promise.all([
    getParticipantsByIds(
      rows.flatMap((row) => [row.customer_id, row.provider_id]),
    ),

    getListingsByIds(rows.map((row) => row.service_listing_id)),
  ]);

  const totalCount = count ?? 0;

  return {
    items: rows.map((row) => mapSummary(row, participants, listings)),

    page: input.page,

    pageSize: input.pageSize,

    totalCount,

    totalPages: Math.ceil(totalCount / input.pageSize),
  };
}

export async function getAdminServiceRequestDetailRepository(
  serviceRequestId: string,
): Promise<AdminServiceRequestDetail | null> {
  const { data, error } = await adminSupabase
    .from("service_requests")
    .select(
      `
          id,
          service_listing_id,
          customer_id,
          provider_id,
          request_description,
          needed_at,
          service_mode,
          location_name,
          budget,
          status,
          agreed_at,
          started_at,
          submitted_at,
          completed_at,
          declined_at,
          declined_reason,
          cancelled_at,
          cancelled_by,
          cancellation_reason,
          created_at,
          updated_at
        `,
    )
    .eq("id", serviceRequestId)
    .maybeSingle<AdminServiceRequestDetailRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const participantIds = [data.customer_id, data.provider_id];

  if (data.cancelled_by) {
    participantIds.push(data.cancelled_by);
  }

  const [participants, listings] = await Promise.all([
    getParticipantsByIds(participantIds),

    getListingsByIds([data.service_listing_id]),
  ]);

  return {
    ...mapSummary(data, participants, listings),

    agreedAt: data.agreed_at,

    startedAt: data.started_at,

    submittedAt: data.submitted_at,

    completedAt: data.completed_at,

    declinedAt: data.declined_at,

    declinedReason: data.declined_reason,

    cancelledAt: data.cancelled_at,

    cancelledById: data.cancelled_by,

    cancelledBy: data.cancelled_by
      ? (participants.get(data.cancelled_by) ?? null)
      : null,

    cancellationReason: data.cancellation_reason,
  };
}
