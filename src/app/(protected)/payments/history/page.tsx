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
        relative
        mx-auto
        min-h-screen
        w-full
        max-w-md
        bg-slate-50
        px-4
        pt-5
        pb-32
        lg:shadow-xl
        lg:ring-1
        lg:ring-slate-200
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