"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import TransactionStatusBadge from "./TransactionStatusBadge";
import TransactionTypeIcon from "./TransactionTypeIcon";

import type {
    TransactionHistoryItem,
} from "../../types/history";

interface Props {
    transaction: TransactionHistoryItem;
}

function formatDateTime(date: string) {
    return new Intl.DateTimeFormat(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Jakarta",
        },
    )
        .format(new Date(date))
        .replace(",", " •");
}

export default function TransactionCard({
    transaction,
}: Props) {
    const router = useRouter();

    const transactionTitle =

        transaction.type === "URGENT_TASK"

            ? "Layanan Prioritas"

            : "Donasi HelpMe";

    

    const transactionBadge =

        transaction.type === "URGENT_TASK"

            ? "Layanan Prioritas"

            : "Donasi";

    return (
        <button
            type="button"
            onClick={() =>
                router.push(
                    `/payments/history/${transaction.id}`,
                )
            }
            className="
                group
                flex
                rounded-xl
                w-full
                cursor-pointer
                items-center
                gap-3
                border-b
                border-slate-100
                bg-white
                px-4
                py-4
                text-left
                transition-colors
                duration-200
                last:border-b-0
                hover:bg-slate-50/80
                active:bg-slate-100
            "
        >
            {/* Transaction Icon */}

            <div className="shrink-0">
                <TransactionTypeIcon
                    type={transaction.type}
                />
            </div>

            {/* Transaction Information */}

            <div className="min-w-0 flex-1">
                <h3
                    className="
                        truncate
                        text-[13px]
                        font-semibold
                        text-text-main
                    "
                >
                    {transactionTitle}
                </h3>

                <div
                    className="
                        mt-2.5
                        flex
                        min-w-0
                        items-center
                        gap-2
                    "
                >
                    <p
                        className="
                            truncate
                            text-[11px]
                            text-text-soft
                        "
                    >
                        {formatDateTime(
                            transaction.createdAt,
                        )}
                    </p>

                    <span
                        className="
                            hidden
                            shrink-0
                            rounded-md
                            bg-slate-100
                            px-1.5
                            py-0.5
                            text-[8px]
                            font-medium
                            text-slate-500
                            min-[380px]:inline-flex
                        "
                    >
                        {transactionBadge}
                    </span>
                </div>
            </div>

            {/* Amount & Status */}

            <div
                className="
                    flex
                    shrink-0
                    items-center
                    gap-2
                "
            >
                <div className="text-right">
                    <p
                        className="
                            whitespace-nowrap
                            text-[13px]
                            font-bold
                            text-text-main
                        "
                    >
                        Rp{" "}
                        {transaction.amount.toLocaleString(
                            "id-ID",
                        )}
                    </p>

                    <div
                        className="
                            mt-1.5
                            flex
                            justify-end
                        "
                    >
                        <TransactionStatusBadge
                            status={transaction.status}
                        />
                    </div>
                </div>

                <ChevronRight
                    size={17}
                    strokeWidth={2.2}
                    className="
                        shrink-0
                        text-slate-400
                        transition-transform
                        duration-200
                        group-hover:translate-x-0.5
                        group-hover:text-primary-600
                    "
                />
            </div>
        </button>
    );
}