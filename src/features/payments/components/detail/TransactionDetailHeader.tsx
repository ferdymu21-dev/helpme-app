import {
    CheckCircle2,
    Clock3,
    XCircle,
    AlertTriangle,
    Heart,
    Zap,
} from "lucide-react";

import TransactionStatusBadge
    from "../history/TransactionStatusBadge";

import type {
    TransactionDetail,
} from "../../types/transactionDetail";

interface Props {

    transaction: TransactionDetail;
}

function StatusIcon(

    status:

        TransactionDetail["status"]

) {

    switch (status) {

        case "PAID":

            return (
                <CheckCircle2
                    className="
                        h-16
                        w-16
                        text-emerald-500
                    "
                />
            );

        case "PENDING":

            return (
                <Clock3
                    className="
                        h-16
                        w-16
                        text-amber-500
                    "
                />
            );

        case "FAILED":

            return (
                <XCircle
                    className="
                        h-16
                        w-16
                        text-red-500
                    "
                />
            );

        default:

            return (
                <AlertTriangle
                    className="
                        h-16
                        w-16
                        text-slate-500
                    "
                />
            );
    }
}

export default function TransactionDetailHeader({

    transaction,

}: Props) {

    const isUrgentTask =
        transaction.type === "URGENT_TASK";

    return (

        <section

            className="
                rounded-3xl
                bg-white
                p-8
                shadow-sm
                text-center
            "
        >

            <div className="flex justify-center">

                <div
                    className={`
                        flex
                        h-20
                        w-20
                        items-center
                        justify-center
                        rounded-full
                        ${
                            isUrgentTask
                                ? "bg-amber-100"
                                : "bg-rose-100"
                        }
                 `}
            >
                    {isUrgentTask ? (
                        <Zap
                            className="
                                h-10 w-10 
                                text-amber-600
                            "
                        />
                    ) : (
                        <Heart
                            className="
                                h-10 w-10 
                                fill-rose-500 
                                text-rose-500
                            "
                        />
                    )}
                </div>

            </div>

            <h1
                className="
                    mt-6
                    text-xl
                    font-bold
                "
            >
                {
                    transaction.type === "URGENT_TASK"
                        ? "Layanan Prioritas"
                        : "Donasi HelpMe"
                }
            </h1>

            <p
                className="
                    mt-2
                    text-xs
                  text-slate-500
                "
            >
                {
                    transaction.type === "URGENT_TASK"
                        ? "Biaya untuk meningkatkan prioritas task Anda."
                        : "Terima kasih telah mendukung pengembangan HelpMe."
                }
            </p>

            <p

                className="
                    mt-4
                    text-2xl
                    text-green-600
                    font-bold
                "
            >

                Rp {

                    transaction.amount

                        .toLocaleString(

                            "id-ID"

                        )

                }

            </p>

            <div
                className="
                  mt-5
                  flex
                  justify-center
                "
            >

                <TransactionStatusBadge

                    status={transaction.status}

                />

            </div>

        </section>

    );

}