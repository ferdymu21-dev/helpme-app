import SimulatorField from "./SimulatorField";

import SimulatorSelect from "./SimulatorSelect";

import SimulatorButton from "./SimulatorButton";

import SimulatorResponse from "./SimulatorResponse";

import {
    TRANSACTION_TYPES,
    PAYMENT_METHODS,
    TRANSACTION_STATUSES,

} from "../constants/paymentSimulator";

import type {
    usePaymentSimulator,
} from "../hooks/usePaymentSimulator";

interface Props {

    simulator: ReturnType<
        typeof usePaymentSimulator
    >;

}

export default function SimulatorForm({

    simulator,

}: Props) {

    return (

        <div
            className="
                space-y-6
                p-6
            "
        >

            <SimulatorField

                label="Order ID"

                placeholder="HELPME-DONATION-..."

                value={
                    simulator.orderId
                }

                onChange={
                    simulator.setOrderId
                }

            />

            <SimulatorSelect

                label="Transaction Type"

                options={
                    TRANSACTION_TYPES
                }

                value={
                    simulator.transactionType
                }

                onChange={
                    simulator.setTransactionType
                }

            />

            <SimulatorSelect

                label="Payment Method"

                options={
                    PAYMENT_METHODS
                }

                value={
                    simulator.paymentMethod
                }

                onChange={
                    simulator.setPaymentMethod
                }

            />

            <SimulatorSelect

                label="Transaction Status"

                options={
                    TRANSACTION_STATUSES
                }

                value={
                    simulator.transactionStatus
                }

                onChange={
                    simulator.setTransactionStatus
                }

            />

            <SimulatorField
                label="Amount"
                placeholder="5000"
                value={
                    simulator.amount
                }
                onChange={
                    simulator.setAmount
                }
            />

            <SimulatorButton

                loading={

                    simulator.loading

                }

                onClick={

                    simulator.handleSubmit

                }

            />

            <SimulatorResponse

                result={

                    simulator.result

                }

            />

        </div>

    );

}