import { adminSupabase } from "@/lib/supabase/admin";

import { CampaignTarget } from "../constants/campaign-target";

interface FindCampaignRecipientsParams {
  targetType: string;

  targetValue?: string | null;
}

export async function findCampaignRecipientsRepository({
  targetType,

  targetValue,
}: FindCampaignRecipientsParams) {
  let query = adminSupabase

    .from("users")

    .select("id")

    .eq("is_banned", false)

    .eq("is_suspended", false);

  switch (targetType) {
    case CampaignTarget.ALL:
      break;

    case CampaignTarget.USER:
      query = query.eq(
        "role",

        "USER",
      );

      break;

    case CampaignTarget.HELPER:
      query = query.eq(
        "role",

        "HELPER",
      );

      break;

    case CampaignTarget.VERIFIED:
      query = query.eq(
        "verification_status",

        "VERIFIED",
      );

      break;

    case CampaignTarget.UNVERIFIED:
      query = query.neq(
        "verification_status",

        "VERIFIED",
      );

      break;

    case CampaignTarget.CITY:
      if (targetValue) {
        query = query.eq(
          "location",

          targetValue,
        );
      }

      break;

    case CampaignTarget.RADIUS:
      /**
       * Akan diimplementasikan
       * menggunakan PostGIS
       */

      break;
  }

  const {
    data,

    error,
  } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}