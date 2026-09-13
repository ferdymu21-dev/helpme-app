import { supabase } from "@/lib/supabase/client";

const SERVICE_MEDIA_BUCKET = "service-media";

export function getServiceListingMediaPublicUrl(
  storagePath: string | null | undefined,
): string | null {
  if (storagePath === null || storagePath === undefined) {
    return null;
  }

  const normalizedStoragePath = storagePath.trim();

  if (normalizedStoragePath.length === 0) {
    return null;
  }

  const { data } = supabase.storage
    .from(SERVICE_MEDIA_BUCKET)
    .getPublicUrl(normalizedStoragePath);

  return data.publicUrl;
}
