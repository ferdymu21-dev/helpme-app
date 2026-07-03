import {
    notFound,
} from "next/navigation";

import PaymentWebhookSimulator
from "@/features/payments/components/PaymentWebhookSimulator";

export default function DeveloperPaymentPage() {

    if (

        process.env.NODE_ENV === "production"

    ) {

        notFound();

    }

    return (

        <main className="mx-auto max-w-5xl p-10">

            <h1 className="text-3xl font-bold">

                Developer Payment Simulator

            </h1>

            <p className="mt-2 text-gray-500">

                Simulate Midtrans Webhook without opening Midtrans Dashboard.

            </p>

            <PaymentWebhookSimulator />

        </main>

    );

}