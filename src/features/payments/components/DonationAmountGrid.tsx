import DonationAmountCard

    from "./DonationAmountCard";

const amounts = [

    5000,

    10000,

    20000,

    50000,

];

interface Props {

    selectedAmount: number;

    onSelect: (

        amount: number

    ) => void;

}

export default function DonationAmountGrid({

    selectedAmount,

    onSelect,

}: Props) {

    return (

        <div className="p-6">

            <h3 className="mb-4 font-bold">

                Pilih Nominal

            </h3>

            <div className="grid grid-cols-2 gap-3">

                {amounts.map(

                    amount => (

                        <DonationAmountCard

                            key={amount}

                            amount={amount}

                            selected={

                                selectedAmount

                                ===

                                amount

                            }

                            onSelect={

                                onSelect

                            }

                        />

                    )

                )}

            </div>

        </div>

    );

}