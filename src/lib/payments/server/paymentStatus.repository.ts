import {
    adminSupabase,
} from "@/lib/supabase/admin";

export async function getPaymentStatus(
    orderId: string,
) {

    /*
    |--------------------------------------------------------------------------
    | DONATION
    |--------------------------------------------------------------------------
    */

    const {
        data: donation,
    } =
        await adminSupabase
            .from("support_donations")
            .select(`
               payment_status,
               id
            `)
            .eq(
                "midtrans_order_id",
                orderId,
            )
            .maybeSingle();

    if (donation) {

        return {
            paymentType: "DONATION",
            status: donation.payment_status,
        };

    }

    /*
    |--------------------------------------------------------------------------
    | URGENT TASK
    |--------------------------------------------------------------------------
    */

    const {
        data: taskPayment,
    } =
        await adminSupabase
            .from("task_payments")
            .select(`
               payment_status,
               task_id
            `)
            .eq(
                "midtrans_order_id",
                orderId,
            )
            .maybeSingle();

    if (taskPayment) {

        return {
            paymentType: "URGENT_TASK",
            status: taskPayment.payment_status,
            taskId: taskPayment.task_id,
        };

    }

    throw new Error(
        "Payment tidak ditemukan."
    );

}