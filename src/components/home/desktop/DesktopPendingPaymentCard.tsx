"use client";

import {
  ArrowRight,
  Clock3,
  Heart,
  Zap,
} from "lucide-react";

import type {
  PendingPaymentSummary,
} from "@/features/payments/types/pendingPayment";

interface Props {
  payment: PendingPaymentSummary;

  loading: boolean;

  onResume: () => void;
}

function formatRupiah(
  amount: number,
) {
  return new Intl.NumberFormat(
    "id-ID",
  ).format(amount);
}

export default function DesktopPendingPaymentCard({
  payment,
  loading,
  onResume,
}: Props) {
  const donation =
    payment.paymentType ===
    "DONATION";

  const PaymentIcon =
    donation
      ? Heart
      : Zap;

  return (
    <button
      type="button"
      disabled={loading}
      onClick={onResume}
      className="
        group
        flex
        min-w-0
        max-w-xl
        items-center
        gap-3
        rounded-2xl
        border
        border-amber-200
        bg-linear-to-r
        from-amber-50
        via-white
        to-orange-50
        px-4
        py-2.5
        text-left
        shadow-sm
        transition
        hover:border-amber-300
        hover:shadow-md
        disabled:cursor-wait
        disabled:opacity-70
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-amber-500
          text-white
        "
      >
        <Clock3
          className="h-5 w-5"
          strokeWidth={2}
        />
      </div>

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <p
          className="
            text-[10px]
            font-bold
            text-amber-700
          "
        >
          Pembayaran menunggu
        </p>

        <div
          className="
            mt-0.5
            flex
            min-w-0
            items-center
            gap-1.5
          "
        >
          <PaymentIcon
            className="
              h-3.5
              w-3.5
              shrink-0
              text-slate-500
            "
          />

          <span
            className="
              truncate
              text-xs
              font-black
              text-slate-900
            "
          >
            {donation
              ? "Dukungan HelpMe"
              : "Prioritas Task"}
          </span>

          <span
            className="
              shrink-0
              text-xs
              font-black
              text-slate-900
            "
          >
            · Rp
            {formatRupiah(
              payment.amount,
            )}
          </span>
        </div>
      </div>

      <div
        className="
          flex
          shrink-0
          items-center
          gap-1.5
          text-xs
          font-black
          text-amber-700
        "
      >
        {loading
          ? "Membuka..."
          : "Lanjutkan"}

        <ArrowRight
          className="
            h-4
            w-4
            transition
            group-hover:translate-x-1
          "
        />
      </div>
    </button>
  );
}