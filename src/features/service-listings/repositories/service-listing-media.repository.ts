import { supabase } from "@/lib/supabase/client";

import {
  mapServiceListingMediaRpcRow,
  parseServiceListingMediaRpcRows,
} from "../mappers/service-listing-media.mapper";

import type { ProviderServiceListingMedia } from "../types/service-listing-media.types";

const SERVICE_MEDIA_BUCKET = "service-media";

function getPublicUrl(storagePath: string): string {
  const { data } = supabase.storage
    .from(SERVICE_MEDIA_BUCKET)
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

export async function getMyServiceListingMediaRepository(
  listingId: string,
): Promise<ProviderServiceListingMedia[]> {
  const { data, error } = await supabase.rpc("get_my_service_listing_media", {
    p_listing_id: listingId,
  });

  if (error) {
    throw error;
  }

  const rows = parseServiceListingMediaRpcRows(data ?? []);

  return rows.map((row) =>
    mapServiceListingMediaRpcRow(row, getPublicUrl(row.storage_path)),
  );
}

export async function getPublicServiceListingMediaRepository(
  listingId: string,
): Promise<ProviderServiceListingMedia[]> {
  const { data, error } = await supabase.rpc(
    "get_public_service_listing_media",
    {
      p_listing_id: listingId,
    },
  );

  if (error) {
    throw error;
  }

  const rows = parseServiceListingMediaRpcRows(data ?? []);

  return rows.map((row) =>
    mapServiceListingMediaRpcRow(row, getPublicUrl(row.storage_path)),
  );
}