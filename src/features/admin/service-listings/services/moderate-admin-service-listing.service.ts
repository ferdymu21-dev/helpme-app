import "server-only";

import { requireAdmin } from "@/features/admin/server/requireAdmin";

import {
  blockAdminServiceListingRepository,
  unblockAdminServiceListingRepository,
} from "../repositories/admin-service-listing-moderation.repository";

import type { AdminServiceListingModerationResult } from "../types/admin-service-listing.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function moderateAdminServiceListingService(
  serviceListingId: string,
  input: unknown,
): Promise<AdminServiceListingModerationResult> {
  await requireAdmin();

  if (!UUID_PATTERN.test(serviceListingId)) {
    throw new Error("INVALID_SERVICE_LISTING_ID");
  }

  if (!isRecord(input)) {
    throw new Error("INVALID_MODERATION_PAYLOAD");
  }

  const action = input.action;

  if (action !== "BLOCK" && action !== "UNBLOCK") {
    throw new Error("INVALID_MODERATION_ACTION");
  }

  if (action === "UNBLOCK") {
    return unblockAdminServiceListingRepository(serviceListingId);
  }

  const reason = typeof input.reason === "string" ? input.reason.trim() : "";

  if (!reason) {
    throw new Error("BLOCK_REASON_REQUIRED");
  }

  if (reason.length > 500) {
    throw new Error("BLOCK_REASON_TOO_LONG");
  }

  return blockAdminServiceListingRepository(serviceListingId, reason);
}
