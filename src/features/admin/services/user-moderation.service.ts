import { supabase }
    from "@/lib/supabase/client";

export async function suspendUser(

    userId: string,

    days: number,

    reason: string

) {

    const suspendedUntil =
        new Date();

    suspendedUntil.setDate(
        suspendedUntil.getDate() +
        days
    );

    const { error } =
        await supabase
            .from("users")
            .update({

                is_suspended: true,

                suspended_until:
                    suspendedUntil.toISOString(),

                suspension_reason:
                    reason,

            })
            .eq(
                "id",
                userId
            );

    if (error) {
        throw error;
    }
}

export async function unsuspendUser(
    userId: string
) {

    const { error } =
        await supabase
            .from("users")
            .update({

                is_suspended: false,

                suspended_until: null,

                suspension_reason: null,

            })
            .eq(
                "id",
                userId
            );

    if (error) {
        throw error;
    }
}

export async function banUser(
    userId: string
) {

    const { error } =
        await supabase
            .from("users")
            .update({

                is_banned: true,

            })
            .eq(
                "id",
                userId
            );

    if (error) {
        throw error;
    }
}

export async function unbanUser(
    userId: string
) {

    const { error } =
        await supabase
            .from("users")
            .update({

                is_banned: false,

            })
            .eq(
                "id",
                userId
            );

    if (error) {
        throw error;
    }
}