import {
    adminSupabase,
} from "@/lib/supabase/admin";

import type {
    NotificationCampaign,
} from "../types/campaign.types";

export async function getCampaignsRepository()

: Promise<NotificationCampaign[]> {

    const {

        data,

        error,

    } = await adminSupabase

        .from("notification_campaigns")

        .select("*")

        .order(

            "created_at",

            {

                ascending: false,

            }

        );

    if (error) {

        throw error;

    }

    return data ?? [];

}