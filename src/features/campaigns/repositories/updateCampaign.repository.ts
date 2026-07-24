import {
    adminSupabase,
} from "@/lib/supabase/admin";

import type {
    UpdateCampaignPayload,
    NotificationCampaign,
} from "../types/campaign.types";

export async function updateCampaignRepository(

    payload: UpdateCampaignPayload,

): Promise<NotificationCampaign> {

    const {

        id,

        ...updates

    } = payload;

    const dbPayload = {

        ...(updates.title && {

            title: updates.title,

        }),

        ...(updates.message && {

            message: updates.message,

        }),

        ...(updates.imageUrl !== undefined && {

            image_url: updates.imageUrl,

        }),

        ...(updates.redirectUrl !== undefined && {

            redirect_url: updates.redirectUrl,

        }),

        ...(updates.status && {

            status: updates.status,

        }),

        ...(updates.targetType && {

            target_type: updates.targetType,

        }),

        ...(updates.targetValue !== undefined && {

            target_value: updates.targetValue,

        }),

        ...(updates.scheduledAt !== undefined && {

            scheduled_at: updates.scheduledAt,

        }),

        ...(updates.expiresAt !== undefined && {

            expires_at: updates.expiresAt,

        }),

    };

    const {

        data,

        error,

    } = await adminSupabase

        .from("notification_campaigns")

        .update(dbPayload)

        .eq("id", id)

        .select()

        .single();

    if (error) {

        throw error;

    }

    return data;

}