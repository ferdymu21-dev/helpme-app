import type {
    SimulationHistoryItem,
} from "../types/simulationHistory";

interface Props {

    history:

        SimulationHistoryItem[];

}

export default function SimulationHistory({

    history,

}: Props) {

    if (

        history.length === 0

    ) {

        return null;

    }

    return (

        <div
            className="
                mt-6
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
            "
        >

            <h3
                className="
                    mb-4
                    text-lg
                    font-semibold
                "
            >

                Simulation History

            </h3>

            <div
                className="
                    space-y-3
                "
            >

                {

                    history.map(

                        item => (

                            <div

                                key={item.id}

                                className="
                                    rounded-xl
                                    border
                                    border-slate-200
                                    p-4
                                "

                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                    "
                                >

                                    <span>

                                        {

                                            item.result.status

                                        }

                                    </span>

                                    <span
                                        className="
                                            text-xs
                                            text-slate-500
                                        "
                                    >

                                        {

                                            item.createdAt

                                                .toLocaleTimeString()

                                        }

                                    </span>

                                </div>

                                <div
                                    className="
                                        mt-2
                                        text-sm
                                    "
                                >

                                    {

                                        item.orderId

                                    }

                                </div>

                                <div
                                    className="
                                        mt-1
                                        text-sm
                                        text-slate-500
                                    "
                                >

                                    Rp

                                    {" "}

                                    {

                                        item.amount

                                            .toLocaleString()

                                    }

                                </div>

                            </div>

                        )

                    )

                }

            </div>

        </div>

    );

}