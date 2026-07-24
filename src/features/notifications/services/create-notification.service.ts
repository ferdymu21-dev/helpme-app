import { supabase }
    from "@/lib/supabase/client";

import type {
    CreateNotificationPayload,
} from "../types/notification.types";

/* =========================
   CREATE NOTIFICATION
========================= */

export async function createNotification({

    userId,

    title,

    message,

    type,

    taskId,

    redirectUrl,

}: CreateNotificationPayload) {

    const { error } =
        await supabase
            .from("notifications")
            .insert({

                user_id: userId,

                title,

                message,

                type,

                task_id:
                    taskId || null,

                redirect_url:
                    redirectUrl || null,

                is_read: false,

            });

    if (error) {

        console.error(error);

        throw error;

    }

}