import { supabase }
    from "@/lib/supabase/client";

export async function checkUserModeration() {

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const {
        data,
        error,
    } = await supabase
        .from("users")
        .select(`
            is_suspended,
            suspended_until,
            suspension_reason,
            is_banned
        `)
        .eq("id", user.id)
        .single();

    if (error) {
        throw error;
    }

    if (!data) {
        return null;
    }

    if (data.is_banned) {

        throw new Error(
            "Akun Anda telah diblokir permanen."
        );

    }

    if (
        data.is_suspended &&
        data.suspended_until &&
        new Date(
            data.suspended_until
        ) > new Date()
    ) {

        throw new Error(
            `Akun Anda disuspend hingga ${new Date(
                data.suspended_until
            ).toLocaleDateString("id-ID")}`
        );

    }

    return data;
}