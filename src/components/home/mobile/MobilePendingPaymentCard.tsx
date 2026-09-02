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

export default function MobilePendingPaymentCard({
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
    <section
      className="
        px-4
        pt-4
      "
    >
      <button
        type="button"
        disabled={loading}
        onClick={onResume}
        className="
          group
          w-full
          overflow-hidden
          rounded-3xl
          border
          border-amber-200
          bg-linear-to-br
          from-amber-50
          via-white
          to-orange-50
          text-left
          shadow-sm
          transition
          hover:border-amber-300
          hover:shadow-md
          active:scale-[0.99]
          disabled:cursor-wait
          disabled:opacity-70
        "
      >
        <div
          className="
            flex
            items-start
            gap-3
            p-4
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
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
            <div
              className="
                flex
                items-center
                gap-1.5
                text-[10px]
                font-bold
                text-amber-700
              "
            >
              <Clock3
                className="h-3 w-3"
              />

              Menunggu pembayaran
            </div>

            <div
              className="
                mt-1.5
                flex
                items-center
                gap-1.5
              "
            >
              <PaymentIcon
                className="
                  h-4
                  w-4
                  text-slate-500
                "
              />

              <p
                className="
                  text-[12px]
                  font-black
                  text-slate-900
                "
              >
                {donation
                  ? "Dukungan HelpMe"
                  : "Prioritas Task"}
              </p>
            </div>

            <p
              className="
                mt-1
                text-[15px]
                font-black
                tracking-tight
                text-slate-950
              "
            >
              Rp
              {formatRupiah(
                payment.amount,
              )}
            </p>

            <p
              className="
                mt-2
                text-[8px]
                leading-1.5
                text-slate-500
              "
            >
              Transaksi ini belum
              selesai, Kamu dapat
              melanjutkan pembayaran.
            </p>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            justify-between
            border-t
            border-amber-100
            bg-white/70
            px-4
            py-2
          "
        >
          <span
            className="
              text-[11px]
              font-black
              text-amber-700
            "
          >
            {loading
              ? "Membuka pembayaran..."
              : "Lanjutkan pembayaran"}
          </span>

          <ArrowRight
            className="
              h-4
              w-4
              text-amber-600
              transition
              group-hover:translate-x-1
            "
          />
        </div>
      </button>
    </section>
  );
}