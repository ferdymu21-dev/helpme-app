import SimulatorField from "./SimulatorField";

import SimulatorSelect from "./SimulatorSelect";

import SimulatorButton from "./SimulatorButton";

import SimulatorResponse from "./SimulatorResponse";

import type {
  usePaymentSimulator,
} from "../hooks/usePaymentSimulator";

interface Props {
  simulator:
    ReturnType<
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
      <SimulatorSelect
        label="Transaction Type"
        options={
          simulator
            .paymentTypes
            .map(
              (item) => ({
                label:
                  item,

                value:
                  item,
              }),
            )
        }
        value={
          simulator
            .transactionType
        }
        onChange={
          simulator
            .setTransactionType
        }
      />

      <SimulatorSelect
        label="Select Existing Payment"
        options={
          simulator
            .payments
            .map(
              (payment) => ({
                label:
                  `${payment.midtrans_order_id}
                  • Rp ${payment.amount.toLocaleString("id-ID")}
                  • ${payment.payment_status}`,

                value:
                  payment.id,
              }),
            )
        }
        value={
          simulator
            .selectedPayment
        }
        onChange={
          simulator
            .setSelectedPayment
        }
      />

      <SimulatorField
        label="Order ID"
        value={
          simulator.orderId
        }
        onChange={
          simulator.setOrderId
        }
        disabled
      />

      <SimulatorField
        label="Amount"
        value={
          simulator.amount
        }
        onChange={
          simulator.setAmount
        }
        disabled
      />

      <div
        className="
          rounded-xl
          border
          border-slate-200
          bg-slate-50
          p-4
          text-sm
          leading-6
          text-slate-600
        "
      >
        Tool ini tidak mengubah
        status transaksi Midtrans.
        Status pembayaran tetap
        ditentukan oleh Midtrans
        Sandbox dan kemudian
        disinkronkan ke HelpMe.
      </div>

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