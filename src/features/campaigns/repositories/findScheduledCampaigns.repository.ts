import {
    adminSupabase,
} from "@/lib/supabase/admin";

import {
    CampaignStatus,
} from "../constants/campaign-status";

import type {
    NotificationCampaign,
} from "../types/campaign.types";

export async function findScheduledCampaignsRepository() {

    const now = new Date().toISOString();

    const {

        data,

        error,

    } = await adminSupabase

        .from("notification_campaigns")

        .select("*")

        .eq(
            "status",
            CampaignStatus.SCHEDULED,
        )

        .lte(
            "scheduled_at",
            now,
        );

    if (error) {

        throw error;

    }

    return data as NotificationCampaign[];

}