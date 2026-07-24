import SimulatorField from "./SimulatorField";

import SimulatorSelect from "./SimulatorSelect";

import SimulatorButton from "./SimulatorButton";

import SimulatorResponse from "./SimulatorResponse";

import {
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

    console.log(
        "Simulator payments:",
        simulator.payments
    );

    return (

        <div
            className="
                space-y-6
                p-6
            "
        >

            <SimulatorSelect
                label="Transaction Type"
                options={
                    simulator.paymentTypes.map(
                        item => ({
                            label: item,
                            value: item,
                        })
                    )
                }
                value={
                    simulator.transactionType
                }
                onChange={
                    simulator.setTransactionType
                }
            />

            <SimulatorSelect
                label="Select Existing Payment"
                options={
                    simulator.payments.map(payment => ({
                        label:
                            `${payment.midtrans_order_id}
                            • Rp ${payment.amount.toLocaleString("id-ID")}
                            • ${payment.payment_method ?? "-"}
                            • ${payment.payment_status}`,
                        value: payment.id,
                    }))
                }
                value={
                    simulator.selectedPayment
                }
                onChange={
                    simulator.setSelectedPayment
                }
            />

            <SimulatorSelect
                label="Payment Method"
                options={
                    PAYMENT_METHODS.map(
                        item => ({
                            label: item,
                            value: item,
                        })
                    )
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
                    TRANSACTION_STATUSES.map(
                        item => ({
                            label: item,
                            value: item,
                        })
                    )
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
                value={simulator.amount}
                onChange={simulator.setAmount}
                disabled
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