"use client";

import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import type {
    TransactionDetail,
} from "../../types/transactionDetail";

interface Props {

    transaction: TransactionDetail;

}

export default function TransactionDetailActions({

    transaction,

}: Props) {

    const router = useRouter();

    return (
        <section className="mt-8">

            {transaction.type === "URGENT_TASK" &&
                transaction.taskId && (
                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                `/tasks/${transaction.taskId}`,
                            )
                        }
                        className="
                            mb-3
                            not-only-of-type:flex
                h-10
                w-full
                items-center
                justify-center
                rounded-4xl
                border
                border-primary-600
                bg-white
                text-sm
                font-semibold
                text-primary-600
                transition
                hover:bg-primary-50
            "
                    >
                        Lihat Task
                    </button>
                )
            }

            <button
                type="button"
                onClick={() => router.push("/payments/history")}
                className="
                    group
                    flex
                    h-10
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-4xl
                    bg-primary-600
                    px-5
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-primary-500/20
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:bg-primary-700
                    hover:shadow-xl
                    hover:shadow-primary-500/30
                    active:translate-y-0
                    active:scale-[0.98]
                "
            >

                <span
                    className="
                        flex
                        h-5
                        w-5
                        items-center
                        justify-center
                        rounded-full
                        bg-white/20
                        transition-transform
                        duration-200
                        group-hover:-translate-x-1
                    "
                >
                    <ArrowLeft
                        size={16}
                        strokeWidth={2.5}
                    />
                </span>

                <span>
                    Kembali ke Riwayat
                </span>

            </button>

        </section>
    );
}