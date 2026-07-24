import { supabase } from "@/lib/supabase/client";

export async function subscribeNotifications(

    onNotification: () => void,

) {

    const {

        data: { user },

    } = await supabase.auth.getUser();

    if (!user) {

        return () => {};

    }

    const channel = supabase.channel(

    `notifications-${user.id}-${Date.now()}`

);

    channel.on(

        "postgres_changes",

        {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
        },

        (payload) => {

            console.log(
                "[Notification INSERT]"
            );

            onNotification();

        }

    );

    channel.subscribe((status) => {

        console.log(
            "[Realtime]",
            status
        );

    });

    return () => {

        supabase.removeChannel(channel);

    };

}