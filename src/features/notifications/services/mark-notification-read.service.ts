import { supabase }
    from "@/lib/supabase/client";

/* =========================
   MARK AS READ
========================= */

export async function markNotificationAsRead(
    notificationId: string
) {

    const { error } =
        await supabase
            .from("notifications")
            .update({

                is_read: true,

            })
            .eq(
                "id",
                notificationId
            );

    if (error) {

        throw error;

    }

}

/* =========================
   MARK ALL AS READ
========================= */

export async function markAllNotificationsAsRead() {

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } =
        await supabase
            .from("notifications")
            .update({

                is_read: true,

            })
            .eq(
                "user_id",
                user.id
            )
            .eq(
                "is_read",
                false
            );

    if (error) {

        throw error;

    }

}