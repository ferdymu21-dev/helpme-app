import AutoHideMobileBottomNavbar from "@/components/layout/mobile/AutoHideMobileBottomNavbar";

import PaymentHistoryClient from "@/features/payments/components/history/PaymentHistoryClient";

import PaymentHistoryHeader from "@/features/payments/components/history/PaymentHistoryHeader";

import { getTransactionHistory } from "@/lib/payments/server/history.service";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PaymentHistoryPage() {
  const supabase =
    await createServerSupabaseClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

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
  } =
    await getTransactionHistory(
      user.id,
    );

  return (
    <main
      className="
        mx-auto
        min-h-screen
        max-w-5xl
        px-6
        pt-6
        pb-32
        lg:pb-6
      "
    >
      <PaymentHistoryHeader />

      <PaymentHistoryClient
        transactions={
          transactions
        }
        nextCursor={
          nextCursor
        }
        hasMore={hasMore}
      />

      {/* MOBILE BOTTOM NAVBAR */}
      <AutoHideMobileBottomNavbar />
    </main>
  );
}