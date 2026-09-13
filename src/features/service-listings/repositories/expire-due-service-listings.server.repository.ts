import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

export async function expireDueServiceListingsRepository(): Promise<number> {
  const { data, error } = await adminSupabase.rpc(
    "expire_due_service_listings",
  );

  if (error) {
    throw error;
  }

  if (typeof data !== "number" || !Number.isInteger(data) || data < 0) {
    throw new Error("Hasil expiration Service Listing tidak valid.");
  }

  return data;
}
