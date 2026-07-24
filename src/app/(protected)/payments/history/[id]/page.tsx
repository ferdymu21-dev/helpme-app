import {
    getTransactionDetail,
} from "@/lib/payments/server/history.service";

import TransactionDetailHeader
    from "@/features/payments/components/detail/TransactionDetailHeader";

import TransactionDetailInfo
    from "@/features/payments/components/detail/TransactionDetailInfo";

import TransactionDetailActions
    from "@/features/payments/components/detail/TransactionDetailActions";

interface Props {

    params: Promise<{

        id: string;

    }>;

}

export default async function TransactionDetailPage({

    params,

}: Props) {

    const {
        id,
    } = await params;

    const transaction =
        await getTransactionDetail(
            id
        );

    return (

        <main
            className="
            p-6
        "
        >

            <TransactionDetailHeader
                transaction={transaction}
            />

            <TransactionDetailInfo
                transaction={transaction}
            />

            <TransactionDetailActions
                transaction={transaction}
            />

        </main>

    );

}