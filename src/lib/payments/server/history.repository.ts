import { adminSupabase } from "@/lib/supabase/admin";

export async function getDonationTransactions(

    userId: string,

    cursor?: string,

    limit: number = 10,

) {

    let query =

        adminSupabase

            .from("support_donations")

            .select(`
            id,
            amount,
            payment_status,
            payment_method,
            midtrans_order_id,
            created_at
        `)

            .eq("user_id", userId)

            .order(
                "created_at",
                {
                    ascending: false,
                },
            )

            .limit(limit);

    if (cursor) {

        query = query.lt(

            "created_at",

            cursor,

        );

    }

    const {

        data,

        error,

    } = await query;

    if (error) {

        throw error;

    }

    return data;

}

export async function getTaskTransactions(

    userId: string,

    cursor?: string,

    limit: number = 10,

) {

    let query =

        adminSupabase

            .from("task_payments")

            .select(`
                id,
                task_id,
                payment_type,
                amount,
                payment_status,
                payment_method,
                midtrans_order_id,
                created_at,
                tasks (
                    title
                )
            `)

            .eq(

                "user_id",

                userId,

            )

            .order(

                "created_at",

                {

                    ascending: false,

                },

            )

            .limit(

                limit,

            );

    if (cursor) {

        query =

            query.lt(

                "created_at",

                cursor,

            );

    }

    const {

        data,

        error,

    }

        =

        await query;

    if (

        error

    ) {

        throw error;

    }

    return data;

}

export async function getDonationTransactionById(

    id: string,

) {

    const {

        data,

        error,

    } = await adminSupabase

        .from("support_donations")

        .select(`
            id,
            amount,
            payment_status,
            payment_method,
            midtrans_order_id,
            created_at
        `)

        .eq("id", id)

        .single();

    if (error) {

        throw error;

    }

    return data;

}

export async function getTaskTransactionById(

    id: string,

) {

    const {

        data,

        error,

    }

        =

        await adminSupabase

            .from("task_payments")

            .select(`
                id,
                task_id,
                payment_type,
                amount,
                payment_status,
                payment_method,
                midtrans_order_id,
                created_at,
                tasks (
                  title
                )
            `)

            .eq(

                "id",

                id,

            )

            .maybeSingle();

    if (error) {

        throw error;

    }

    return data;

}