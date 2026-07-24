import {
    adminSupabase,
} from "@/lib/supabase/admin";

export async function getPaymentHistory(

    userId: string,

) {

    const { data, error } =
     await adminSupabase

        .from("support_donations")

        .select(`
            id,
            amount,
            payment_status,
            payment_method,
            midtrans_order_id,
            created_at,
            paid_at
        `)

        .eq("user_id", userId)

        .order("created_at", {
                ascending: false,
            }

        );

    if (

        error

    ) {

        throw error;

    }

    return data;

}