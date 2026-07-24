import {
    adminSupabase,
} from "@/lib/supabase/admin";

import type {
    CreateNotificationPayload,
} from "../types/notification.types";

import {
    NotificationTypeCategoryMap,
} from "../constants/notification-type-category-map";

/* =========================
   CREATE NOTIFICATION
   (SERVER)
========================= */

export async function createNotificationServer({

    userId,
    title,
    message,
    type,
    taskId,
    redirectUrl,
}: CreateNotificationPayload) {

    const category =

        NotificationTypeCategoryMap[
        type
        ];

    const { error } =

        await adminSupabase

            .from("notifications")

            .insert({
                user_id: userId,
                title,
                message,
                category,
                type,
                task_id:
                    taskId ?? null,
                redirect_url:
                    redirectUrl ?? null,
                is_read: false,

            });

    if (error) {

        console.error(error);

        throw error;

    }

}