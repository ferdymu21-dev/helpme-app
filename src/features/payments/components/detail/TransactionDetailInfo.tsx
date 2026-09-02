"use client";

import {
  CalendarDays,
  Clock3,
  Copy,
  CreditCard,
  FileText,
  ReceiptText,
} from "lucide-react";

import type {
  LucideIcon,
} from "lucide-react";

import type {
  TransactionDetail,
} from "../../types/transactionDetail";

interface Props {
  transaction: TransactionDetail;
}

function formatDate(
  date: string,
) {
  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone:
        "Asia/Jakarta",
    },
  ).format(
    new Date(date),
  );
}

function formatTime(
  date: string,
) {
  return (
    new Intl.DateTimeFormat(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone:
          "Asia/Jakarta",
      },
    ).format(
      new Date(date),
    ) + " WIB"
  );
}

function formatPaymentMethod(
  method: string | null,
) {
  if (!method) {
    return "Belum dipilih";
  }

  switch (
    method.toLowerCase()
  ) {
    case "qris":
      return "QRIS";

    case "bank_transfer":
      return "Transfer Bank";

    case "credit_card":
      return "Kartu Kredit";

    case "gopay":
      return "GoPay";

    case "shopeepay":
      return "ShopeePay";

    case "bca_va":
      return "BCA Virtual Account";

    case "bni_va":
      return "BNI Virtual Account";

    case "bri_va":
      return "BRI Virtual Account";

    case "mandiri_va":
      return "Mandiri Virtual Account";

    default:
      return method;
  }
}

interface InfoRowProps {
  label: string;
  value: string;
  icon: LucideIcon;
  canCopy?: boolean;
  strong?: boolean;
}

function InfoRow({
  label,
  value,
  icon: Icon,
  canCopy = false,
  strong = false,
}: InfoRowProps) {
  const copyValue =
    async () => {
      if (!canCopy) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          value,
        );
      } catch {
        console.error(
          "Failed to copy value",
        );
      }
    };

  return (
    <div
      className="
        flex
        items-start
        gap-3
        border-b
        border-slate-100
        py-4
        first:pt-0
        last:border-b-0
        last:pb-0
      "
    >
      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-slate-50
          text-slate-500
        "
      >
        <Icon
          className="h-4 w-4"
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
            font-medium
            text-slate-400
          "
        >
          {label}
        </p>

        <div
          className="
            mt-1
            flex
            items-start
            gap-2
          "
        >
          <p
            className={`
              min-w-0
              flex-1
              break-all
              text-xs
              text-slate-800

              ${
                strong
                  ? "font-black"
                  : "font-semibold"
              }
            `}
          >
            {value}
          </p>

          {canCopy && (
            <button
              type="button"
              onClick={copyValue}
              aria-label={`Salin ${label}`}
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-slate-50
                text-slate-400
                transition
                hover:bg-indigo-50
                hover:text-indigo-600
                active:scale-95
              "
            >
              <Copy
                className="h-3.5 w-3.5"
                strokeWidth={2}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TransactionDetailInfo({
  transaction,
}: Props) {
  const transactionType =
    transaction.type ===
    "URGENT_TASK"
      ? "Prioritas Task"
      : "Dukungan HelpMe";

  return (
    <section
      className="
        mt-4
        rounded-[28px]
        border
        border-slate-200
        bg-white
        px-5
        py-5
        shadow-[0_8px_24px_rgba(15,23,42,0.03)]
        sm:px-6
        sm:py-6
      "
    >
      <div
        className="
          flex
          items-start
          gap-3
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
            rounded-2xl
            bg-indigo-50
            text-indigo-600
          "
        >
          <ReceiptText
            className="h-4.5 w-4.5"
            strokeWidth={2}
          />
        </div>

        <div>
          <h2
            className="
              text-sm
              font-black
              text-slate-900
            "
          >
            Ringkasan Transaksi
          </h2>

          <p
            className="
              mt-1
              text-[10px]
              leading-4
              text-slate-500
            "
          >
            Informasi pembayaran dan referensi
            transaksi Anda.
          </p>
        </div>
      </div>

      <div
        className="
          mt-5
          rounded-2xl
          border
          border-slate-100
          bg-white
          px-4
          py-4
        "
      >
        <InfoRow
          label="Jenis Transaksi"
          value={transactionType}
          icon={ReceiptText}
          strong
        />

        <InfoRow
          label="Order ID"
          value={
            transaction.orderId
          }
          icon={FileText}
          canCopy
        />

        <InfoRow
          label="Metode Pembayaran"
          value={formatPaymentMethod(
            transaction.paymentMethod,
          )}
          icon={CreditCard}
        />

        <InfoRow
          label="Tanggal"
          value={formatDate(
            transaction.createdAt,
          )}
          icon={CalendarDays}
        />

        <InfoRow
          label="Waktu"
          value={formatTime(
            transaction.createdAt,
          )}
          icon={Clock3}
        />
      </div>
    </section>
  );
}