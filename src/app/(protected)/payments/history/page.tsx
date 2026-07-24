import { createServerSupabaseClient }
    from "@/lib/supabase/server";

import { getTransactionHistory }
    from "@/lib/payments/server/history.service";

import PaymentHistoryClient
    from "@/features/payments/components/history/PaymentHistoryClient";

import PaymentHistoryHeader
    from "@/features/payments/components/history/PaymentHistoryHeader";

export default async function PaymentHistoryPage() {

    const supabase =
        await createServerSupabaseClient();

    const {

        data: {

            user,

        },

    } = await supabase.auth.getUser();

    if (!user) {

        return (

            <main className="p-6">

                Silakan login.

            </main>

        );

    }

    const {

        transactions,

        nextCursor,

        hasMore,

    } = await getTransactionHistory(

        user.id,

    );

    return (

        <main
            className="
              mx-auto
              max-w-5xl
              p-6
            "
        >

            <PaymentHistoryHeader />

            <PaymentHistoryClient

                transactions={transactions}

                nextCursor={nextCursor}

                hasMore={hasMore}

            />

        </main >

    );

}