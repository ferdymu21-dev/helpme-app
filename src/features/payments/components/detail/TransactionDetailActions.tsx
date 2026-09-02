"use client";

import {
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

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

  const canViewTask =
    transaction.type ===
      "URGENT_TASK" &&
    !!transaction.taskId;

  return (
    <section
      className="
        mt-4
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-[0_8px_24px_rgba(15,23,42,0.03)]
      "
    >
      <div
        className="
          flex
          flex-col
          gap-2.5
          sm:flex-row
        "
      >
        <button
          type="button"
          onClick={() =>
            router.push(
              "/payments/history",
            )
          }
          className={`
            group
            inline-flex
            h-11
            items-center
            justify-center
            gap-2
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-5
            text-xs
            font-bold
            text-slate-600
            transition
            hover:bg-slate-50

            ${
              canViewTask
                ? "sm:flex-1"
                : "w-full"
            }
          `}
        >
          <ArrowLeft
            className="
              h-4
              w-4
              transition-transform
              group-hover:-translate-x-0.5
            "
            strokeWidth={2}
          />

          Kembali ke Riwayat
        </button>

        {canViewTask && (
          <button
            type="button"
            onClick={() =>
              router.push(
                `/tasks/${transaction.taskId}`,
              )
            }
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-indigo-600
              px-5
              text-xs
              font-black
              text-white
              shadow-[0_8px_22px_rgba(79,70,229,0.18)]
              transition
              hover:bg-indigo-700
              active:scale-[0.99]
              sm:flex-1
            "
          >
            Lihat Task

            <ExternalLink
              className="h-3.5 w-3.5"
              strokeWidth={2}
            />
          </button>
        )}
      </div>
    </section>
  );
}