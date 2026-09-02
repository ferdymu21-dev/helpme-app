import { notFound, redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { getTransactionDetail } from "@/lib/payments/server/history.service";

import TransactionDetailHeader from "@/features/payments/components/detail/TransactionDetailHeader";
import TransactionDetailInfo from "@/features/payments/components/detail/TransactionDetailInfo";
import TransactionDetailActions from "@/features/payments/components/detail/TransactionDetailActions";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function TransactionDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let transaction;

  try {
    transaction = await getTransactionDetail(
      user.id,

      id,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Transaction tidak ditemukan."
    ) {
      notFound();
    }

    throw error;
  }

  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        px-4
        pb-12
        pt-6
        sm:px-6
        sm:pt-8
      "
    >
      <div
        className="
          mx-auto
          max-w-3xl
        "
      >
        <div className="mb-5">
          <p
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.14em]
              text-indigo-600
            "
          >
            Pembayaran
          </p>

          <h1
            className="
              mt-1
              text-xl
              font-black
              tracking-tight
              text-slate-950
              sm:text-2xl
            "
          >
            Detail Transaksi
          </h1>

          <p
            className="
              mt-1
              text-xs
              leading-5
              text-slate-500
            "
          >
            Lihat status dan informasi lengkap transaksi Anda.
          </p>
        </div>

        <TransactionDetailHeader transaction={transaction} />

        <TransactionDetailInfo transaction={transaction} />

        <TransactionDetailActions transaction={transaction} />
      </div>
    </main>
  );
}