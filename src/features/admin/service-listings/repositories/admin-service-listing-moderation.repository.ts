import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

import {
  ADMIN_SERVICE_LISTING_STATUSES,
  type AdminServiceListingModerationResult,
  type AdminServiceListingStatus,
} from "../types/admin-service-listing.types";

interface ModerationRpcRow {
  service_listing_id: string;

  status: AdminServiceListingStatus;

  blocked_at: string | null;
  blocked_reason: string | null;
  blocked_from_status: string | null;

  expires_at: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isAdminServiceListingStatus(
  value: unknown,
): value is AdminServiceListingStatus {
  return (
    typeof value === "string" &&
    ADMIN_SERVICE_LISTING_STATUSES.some((status) => status === value)
  );
}

function parseModerationRpcRow(value: unknown): ModerationRpcRow {
  if (!isRecord(value)) {
    throw new Error("INVALID_SERVICE_LISTING_MODERATION_RESULT");
  }

  if (
    typeof value.service_listing_id !== "string" ||
    !isAdminServiceListingStatus(value.status) ||
    !isNullableString(value.blocked_at) ||
    !isNullableString(value.blocked_reason) ||
    !isNullableString(value.blocked_from_status) ||
    !isNullableString(value.expires_at)
  ) {
    throw new Error("INVALID_SERVICE_LISTING_MODERATION_RESULT");
  }

  return {
    service_listing_id: value.service_listing_id,

    status: value.status,

    blocked_at: value.blocked_at,

    blocked_reason: value.blocked_reason,

    blocked_from_status: value.blocked_from_status,

    expires_at: value.expires_at,
  };
}

function mapModerationResult(
  value: unknown,
): AdminServiceListingModerationResult {
  if (!Array.isArray(value) || value.length !== 1) {
    throw new Error("SERVICE_LISTING_MODERATION_NO_RESULT");
  }

  const row = parseModerationRpcRow(value[0]);

  return {
    serviceListingId: row.service_listing_id,

    status: row.status,

    blockedAt: row.blocked_at,

    blockedReason: row.blocked_reason,

    blockedFromStatus: row.blocked_from_status,

    expiresAt: row.expires_at,
  };
}

export async function blockAdminServiceListingRepository(
  serviceListingId: string,
  reason: string,
): Promise<AdminServiceListingModerationResult> {
  const { data, error } = await adminSupabase.rpc(
    "admin_block_service_listing",
    {
      p_service_listing_id: serviceListingId,

      p_reason: reason,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return mapModerationResult(data);
}

export async function unblockAdminServiceListingRepository(
  serviceListingId: string,
): Promise<AdminServiceListingModerationResult> {
  const { data, error } = await adminSupabase.rpc(
    "admin_unblock_service_listing",
    {
      p_service_listing_id: serviceListingId,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return mapModerationResult(data);
}
