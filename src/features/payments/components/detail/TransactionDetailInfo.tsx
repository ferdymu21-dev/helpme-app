"use client";

import {
    CalendarDays,
    Clock3,
    Copy,
    CreditCard,
    FileText,
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

/* =========================
   FORMAT DATE
========================= */

function formatDate(
    date: string,
) {
    return new Intl.DateTimeFormat(
        "id-ID",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
        },
    ).format(
        new Date(date),
    );
}

/* =========================
   FORMAT TIME
========================= */

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
                timeZone: "Asia/Jakarta",
            },
        ).format(
            new Date(date),
        ) + " WIB"
    );
}

/* =========================
   FORMAT PAYMENT METHOD
========================= */

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

/* =========================
   INFO ROW
========================= */

interface InfoRowProps {
    label: string;
    value: string;
    icon: LucideIcon;
    iconClassName: string;
    iconBackground: string;
    canCopy?: boolean;
    bold?: boolean;
}

function InfoRow({
    label,
    value,
    icon: Icon,
    iconClassName,
    iconBackground,
    canCopy = false,
    bold = false,
}: InfoRowProps) {
    const copyValue = async () => {
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
                items-center
                gap-3
                border-b
                border-dashed
                border-slate-200
                py-4
                last:border-b-0
            "
        >
            {/* Icon */}

            <div
                className={`
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    ${iconBackground}
                `}
            >
                <Icon
                    size={15}
                    strokeWidth={2}
                    className={
                        iconClassName
                    }
                />
            </div>

            {/* Label */}

            <span
                className="
                    min-w-0
                    flex-1
                    text-[12px]
                    text-slate-500
                "
            >
                {label}
            </span>

            {/* Value */}

            <div
                className="
                    flex
                    min-w-0
                    max-w-[55%]
                    items-center
                    justify-end
                    gap-2
                "
            >
                <span
                    className={`
                        break-all
                        text-right
                        text-[12px]
                        text-slate-900
                        ${
                            bold
                                ? "font-bold"
                                : "font-medium"
                        }
                    `}
                >
                    {value}
                </span>

                {canCopy && (
                    <button
                        type="button"
                        aria-label="Salin Order ID"
                        onClick={copyValue}
                        className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            text-slate-400
                            transition
                            hover:bg-primary-50
                            hover:text-primary-600
                            active:scale-95
                        "
                    >
                        <Copy
                            size={17}
                            strokeWidth={2.2}
                        />
                    </button>
                )}
            </div>
        </div>
    );
}

/* =========================
   TRANSACTION DETAIL INFO
========================= */

export default function TransactionDetailInfo({
    transaction,
}: Props) {
    return (
        <section
            className="
                mt-6
                rounded-3xl
                border
                border-slate-100
                bg-white
                px-5
                py-5
                shadow-sm
            "
        >
            {/* Section Title */}

            <h2
                className="
                    mb-2
                    text-sm
                    text-text-main
                "
            >
                Ringkasan Transaksi
            </h2>

            {/* Order ID */}

            <InfoRow
                label="Order ID"
                value={
                    transaction.orderId
                }
                icon={FileText}
                iconBackground="bg-violet-100"
                iconClassName="text-violet-600"
                canCopy
            />

            {/* Payment Method */}

            <InfoRow
                label="Metode Pembayaran"
                value={
                    formatPaymentMethod(
                        transaction.paymentMethod,
                    )
                }
                icon={CreditCard}
                iconBackground="bg-blue-100"
                iconClassName="text-blue-600"
            />

            {/* Date */}

            <InfoRow
                label="Tanggal"
                value={
                    formatDate(
                        transaction.createdAt,
                    )
                }
                icon={CalendarDays}
                iconBackground="bg-emerald-100"
                iconClassName="text-emerald-600"
            />

            {/* Time */}

            <InfoRow
                label="Waktu"
                value={
                    formatTime(
                        transaction.createdAt,
                    )
                }
                icon={Clock3}
                iconBackground="bg-amber-100"
                iconClassName="text-amber-600"
            />
        </section>
    );
}