import {
  HeartHandshake,
  Zap,
} from "lucide-react";

import TransactionStatusBadge from "../history/TransactionStatusBadge";

import type {
  TransactionDetail,
} from "../../types/transactionDetail";

interface Props {
  transaction: TransactionDetail;
}

export default function TransactionDetailHeader({
  transaction,
}: Props) {
  const isUrgentTask =
    transaction.type ===
    "URGENT_TASK";

  const title =
    isUrgentTask
      ? "Prioritas Task"
      : "Dukungan HelpMe";

  const description =
    isUrgentTask
      ? "Biaya tambahan untuk meningkatkan prioritas dan visibilitas task Anda."
      : "Dukungan sukarela untuk membantu pengembangan dan operasional HelpMe.";

  const Icon =
    isUrgentTask
      ? Zap
      : HeartHandshake;

  return (
    <section
      className="
        overflow-hidden
        rounded-[28px]
        border
        border-slate-200
        bg-white
        shadow-[0_10px_30px_rgba(15,23,42,0.04)]
      "
    >
      <div
        className={`
          border-b
          border-slate-100
          px-5
          py-6
          sm:px-7
          sm:py-7

          ${
            isUrgentTask
              ? `
                bg-linear-to-br
                from-amber-50
                via-white
                to-orange-50/50
              `
              : `
                bg-linear-to-br
                from-indigo-50
                via-white
                to-violet-50/60
              `
          }
        `}
      >
        <div
          className="
            flex
            flex-col
            items-center
            text-center
          "
        >
          <div
            className={`
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-[20px]

              ${
                isUrgentTask
                  ? `
                    bg-amber-100
                    text-amber-600
                  `
                  : `
                    bg-indigo-100
                    text-indigo-600
                  `
              }
            `}
          >
            <Icon
              className="h-7 w-7"
              strokeWidth={2}
            />
          </div>

          <p
            className="
              mt-4
              text-[10px]
              font-black
              uppercase
              tracking-[0.12em]
              text-slate-400
            "
          >
            Jenis transaksi
          </p>

          <h2
            className="
              mt-1
              text-lg
              font-black
              tracking-tight
              text-slate-950
            "
          >
            {title}
          </h2>

          <p
            className="
              mt-1.5
              max-w-md
              text-[11px]
              leading-5
              text-slate-500
            "
          >
            {description}
          </p>
        </div>
      </div>

      <div
        className="
          px-5
          py-5
          text-center
          sm:px-7
        "
      >
        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.12em]
            text-slate-400
          "
        >
          Total transaksi
        </p>

        <p
          className="
            mt-1
            text-3xl
            font-black
            tracking-tight
            text-slate-950
          "
        >
          Rp{" "}
          {transaction.amount.toLocaleString(
            "id-ID",
          )}
        </p>

        <div
          className="
            mt-3
            flex
            justify-center
          "
        >
          <TransactionStatusBadge
            status={
              transaction.status
            }
          />
        </div>
      </div>
    </section>
  );
}