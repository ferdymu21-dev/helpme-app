"use client";

import {
    useMemo,
    useState,
} from "react";

import {
    ChevronDown,
    Loader2,
} from "lucide-react";

import TransactionCard
    from "./TransactionCard";

import PaymentHistorySearch
    from "./PaymentHistorySearch";

import PaymentHistoryEmpty
    from "./PaymentHistoryEmpty";

import type {
    TransactionHistoryItem,
} from "../../types/history";

interface Props {

    transactions: TransactionHistoryItem[];

    nextCursor: string | null;

    hasMore: boolean;

}

interface PaymentHistoryResponse {

    transactions:

    TransactionHistoryItem[];

    nextCursor:

    string | null;

    hasMore:

    boolean;

}

export default function PaymentHistoryClient({

    transactions,

    nextCursor,

    hasMore,

}: Props) {

    const [

        items,

        setItems,

    ] = useState(

        transactions,

    );

    const [

        cursor,

        setCursor,

    ] = useState(

        nextCursor,

    );

    const [

        canLoadMore,

        setCanLoadMore,

    ] = useState(

        hasMore,

    );

    const [

        loadingMore,

        setLoadingMore,

    ] = useState(

        false,

    );

    async function loadMore() {

        if (

            loadingMore ||

            !canLoadMore

        ) {

            return;

        }

        setLoadingMore(

            true,

        );

        try {

            const query = new URLSearchParams({

                limit: "10",

                cursor: cursor ?? "",

            });

            const response =

                await fetch(

                    `/api/payments/history?${query.toString()}`,

                );

            if (

                !response.ok

            ) {

                throw new Error(

                    "Gagal memuat transaksi.",

                );

            }

            const result:

                PaymentHistoryResponse =

                await response.json();

            setItems(

                previous => [

                    ...previous,

                    ...result.transactions,

                ],

            );

            setCursor(

                result.nextCursor,

            );

            setCanLoadMore(

                result.hasMore,

            );

        }

        catch (

        error

        ) {

            console.error(

                error,

            );

        }

        finally {

            setLoadingMore(

                false,

            );

        }

    }

    const [

        search,

        setSearch,

    ] = useState("");

    const filteredTransactions =

        useMemo(() => {

            return items.filter(

                transaction => {

                    const keyword =

                        search

                            .trim()

                            .toLowerCase();

                    if (

                        keyword === ""

                    ) {

                        return true;

                    }

                    return (

                        transaction.orderId
                            .toLowerCase()
                            .includes(keyword)

                        ||

                        transaction.title
                            .toLowerCase()
                            .includes(keyword)

                    );

                }

            );

        }, [

            items,

            search,

        ]);

    return (

        <>

            <PaymentHistorySearch
                value={search}
                onChange={setSearch}
            />

            <div
                className="
                    mt-8
                "
            >

                {
                    filteredTransactions.length === 0

                        ? (

                            <PaymentHistoryEmpty />

                        )

                        : (

                            <div
                                className="
                                    space-y-4
                                "
                            >

                                {

                                    filteredTransactions.map(

                                        transaction => (

                                            <TransactionCard

                                                key={transaction.id}

                                                transaction={transaction}

                                            />

                                        )

                                    )

                                }

                            </div>

                        )

                }

            </div>

            {
                canLoadMore && (

                    <div
                        className="
                mt-8
                flex
                justify-center
            "
                    >

                        <button
                            type="button"
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="
                    group
                    inline-flex
                    items-center
                    gap-2.5
                    rounded-full
                    border
                    border-slate-200
                    bg-white
                    px-2.5
                    py-1.5
                    text-[10px]
                    font-semibold
                    text-slate-700
                    shadow-sm
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-primary-200
                    hover:bg-primary-50
                    hover:text-primary-600
                    hover:shadow-md
                    active:translate-y-0
                    active:scale-[0.98]
                    disabled:pointer-events-none
                    disabled:opacity-60
                "
                        >

                            {
                                loadingMore
                                    ? (
                                        <>
                                            <Loader2
                                                size={17}
                                                className="animate-spin"
                                            />

                                            <span>
                                                Memuat transaksi...
                                            </span>
                                        </>
                                    )
                                    : (
                                        <>
                                            <span>
                                                Muat Lebih Banyak
                                            </span>

                                            <ChevronDown
                                                size={17}
                                                strokeWidth={2.3}
                                                className="
                                                  transition-transform
                                                  duration-200
                                                  group-hover:translate-y-0.5
                                                "
                                            />
                                        </>
                                    )
                            }

                        </button>

                    </div>

                )
            }

        </>

    );

}