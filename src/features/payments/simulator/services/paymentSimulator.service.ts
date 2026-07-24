import type {
    SimulatorPayment,
} from "../types/paymentSimulator";

export async function loadPaymentTypes(): Promise<string[]> {

    const response =
        await fetch(
            "/api/dev/payment/types"
        );

    if (!response.ok) {

        throw new Error(
            "Failed to load payment types."
        );

    }

    return await response.json();

}

export async function loadPayments(
    paymentType: string
): Promise<SimulatorPayment[]> {

    const response = await fetch(

        `/api/dev/payment/list?paymentType=${paymentType}`

    );

    if (!response.ok) {

        throw new Error(
            "Failed to load payments."
        );

    }

    return await response.json();

}

export interface SimulateWebhookPayload {

    orderId: string;

    amount: number;

    paymentMethod: string;

    transactionStatus: string;

    transactionId: string;

}

export async function simulateWebhook(

    payload: SimulateWebhookPayload

) {

    const response =

        await fetch(

            "/api/dev/payment/simulate",

            {

                method: "POST",

                headers: {

                    "Content-Type":

                        "application/json",

                },

                body: JSON.stringify({

                    order_id:

                        payload.orderId,

                    transaction_id:

                        payload.transactionId,

                    transaction_status:

                        payload.transactionStatus.toLowerCase(),

                    payment_type:

                        payload.paymentMethod.toLowerCase(),

                    gross_amount:

                        payload.amount.toFixed(2),

                    status_code:

                        payload.transactionStatus === "SETTLEMENT"

                            ? "200"

                            : "201",

                    fraud_status:

                        "accept",

                    settlement_time:

                        new Date().toISOString(),

                    expiry_time:

                        new Date().toISOString(),

                    signature_key:

                        "",

                }),

            }

        );

    if (

        !response.ok

    ) {

        throw new Error(

            "Simulation failed."

        );

    }

    return await response.json();

}