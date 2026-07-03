interface Props {

    amount: number;

    selected: boolean;

    onSelect: (

        amount: number

    ) => void;

}

export default function DonationAmountCard({

    amount,

    selected,

    onSelect,

}: Props) {

    return (

        <button

            onClick={() =>

                onSelect(

                    amount

                )

            }

            className={`

                rounded-2xl

                border

                p-4

                transition

                ${

                    selected

                        ? "border-indigo-600 bg-indigo-50"

                        : "border-slate-200 bg-white"

                }

            `}

        >

            <p

                className="

                    text-lg

                    font-bold

                "

            >

                Rp

                {amount.toLocaleString(

                    "id-ID"

                )}

            </p>

        </button>

    );

}