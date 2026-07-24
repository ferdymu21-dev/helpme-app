import {
    ArrowDownCircle,
    ArrowUpCircle,
    Heart,
    Receipt,
    Zap,
    Wallet,
} from "lucide-react";

import type {
    TransactionType,
} from "../../types/history";

interface Props {
    type: TransactionType;
}

export default function TransactionTypeIcon({
    type,
}: Props) {

    switch (type) {

        case "DONATION":

            return (

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100">

                    <Heart
                        size={23}
                        strokeWidth={2.3}
                        className="fill-rose-500 text-rose-500"
                    />

                </div>

            );

        case "URGENT_TASK":

            return (

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">

                    <Zap
                        size={22}
                        strokeWidth={2.4}
                        className="text-amber-600"
                    />

                </div>

            );

        case "ESCROW":

            return (

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100">

                    <Receipt
                        size={23}
                        strokeWidth={2.3}
                        className="text-violet-600"
                    />

                </div>

            );

        case "TOPUP":

            return (

                <div className="
                         flex h-12 
                         w-12 items-center 
                         justify-center 
                         rounded-2xl 
                         bg-emerald-100
                    "
                >

                    <Wallet
                        size={22}
                        className="text-emerald-600"
                    />

                </div>

            );

        case "WITHDRAW":

            return (

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">

                    <ArrowUpCircle
                        size={23}
                        strokeWidth={2.3}
                        className="text-blue-600"
                    />

                </div>

            );

        case "REFUND":

            return (

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">

                    <ArrowDownCircle
                        size={23}
                        strokeWidth={2.3}
                        className="text-orange-600"
                    />

                </div>

            );

        default:

            return (

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">

                    <Receipt
                        size={22}
                        className="text-slate-500"
                    />

                </div>

            );

    }

}