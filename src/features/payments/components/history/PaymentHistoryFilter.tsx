const FILTERS = [

    "ALL",

    "DONATION",

    "ESCROW",

    "WALLET",

    "WITHDRAW",

    "REFUND",

] as const;

const LABELS = {

    ALL: "Semua",

    DONATION: "Donasi",

    ESCROW: "Escrow",

    WALLET: "Wallet",

    WITHDRAW: "Withdraw",

    REFUND: "Refund",

} as const;

interface Props {

    selected:

        typeof FILTERS[number];

    onChange: (

        value:

        typeof FILTERS[number]

    ) => void;

}

export default function PaymentHistoryFilter({

    selected,

    onChange,

}: Props) {

    return (

        <div
            className="
                mt-6
                flex
                gap-3
                overflow-x-auto
            "
        >

            {

                FILTERS.map(filter => (

                    <button

                        key={filter}

                        onClick={() =>

                            onChange(

                                filter

                            )

                        }

                        className={`

    whitespace-nowrap
    rounded-full
    border
    px-5
    py-2
    text-sm
    transition-colors

    ${selected === filter

                                ?

                                `
            border-primary-600
            bg-primary-600
            text-white
            `

                                :

                                `
            border-border
            bg-white
            text-slate-600
            hover:bg-primary-50
            `

                            }

`}

                    >

                        {LABELS[filter]}

                    </button>

                ))

            }

        </div>

    );

}