"use client";

import SimulatorHeader from "./SimulatorHeader";

import SimulatorForm from "./SimulatorForm";

import SimulatorToolbar from "./SimulatorToolbar";

import {
    usePaymentSimulator,
} from "../hooks/usePaymentSimulator";

import SimulationHistory from "./SimulationHistory";

export default function PaymentWebhookSimulator() {

    const simulator =
        usePaymentSimulator();

    return (

        <div
            className="
                mt-8
                overflow-hidden
                rounded-3xl
                border
                border-slate-200
                bg-white
                shadow-sm
            "
        >

            <SimulatorHeader />

            <SimulatorToolbar

                onGenerateIds={

                    simulator.generateNewIds

                }

                onCopyPayload={

                    simulator.copyPayload

                }

                onCopyResponse={

                    simulator.copyResponse

                }

            />

            <SimulatorForm
                simulator={simulator}
            />

            <SimulationHistory
                history={
                    simulator.history
                }
            />

        </div>

    );

}