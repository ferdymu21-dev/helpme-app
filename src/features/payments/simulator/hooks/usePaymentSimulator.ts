"use client";

import {
  loadPaymentTypes,
  loadPayments,
  simulateWebhook,
} from "../services/paymentSimulator.service";

import { generateSimulatorTransactionId } from "../../utils/simulator.generator";

import {
  validateSimulatorAmount,
  validateSimulatorOrderId,
} from "../../utils/simulator.validator";

import type { SimulatorResult } from "../types/simulatorResult";

import { useEffect, useState } from "react";

import { copyToClipboard } from "../../utils/clipboard";

import type { SimulationHistoryItem } from "../types/simulationHistory";

import type { SimulatorPayment } from "../types/paymentSimulator";

export function usePaymentSimulator() {
  const [orderId, setOrderId] = useState("");

  const [amount, setAmount] = useState("5000");

  const [transactionType, setTransactionType] = useState("");

  const [paymentTypes, setPaymentTypes] = useState<string[]>([]);

  const [paymentMethod, setPaymentMethod] = useState("QRIS");

  const [transactionStatus, setTransactionStatus] = useState("SETTLEMENT");

  const [transactionId, setTransactionId] = useState(
    generateSimulatorTransactionId(),
  );

  const [selectedPayment, setSelectedPayment] = useState("");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<SimulatorResult>({
    status: "PENDING",
    response: "",
    executionTime: 0,
  });

  const [history, setHistory] = useState<SimulationHistoryItem[]>([]);

  const [payments, setPayments] = useState<SimulatorPayment[]>([]);

  /*
   * Load transaction types.
   */
  useEffect(() => {
    async function fetchPaymentTypes() {
      try {
        const types = await loadPaymentTypes();

        setPaymentTypes(types);

        if (types.length > 0) {
          setTransactionType((current) => current || types[0]);
        }
      } catch (error) {
        console.error(error);
      }
    }

    void fetchPaymentTypes();
  }, []);

  /*
   * Load pending payments berdasarkan transaction type.
   */
  useEffect(() => {
    async function fetchPayments() {
      if (!transactionType) {
        setPayments([]);
        return;
      }

      try {
        const data = await loadPayments(transactionType);

        const pendingPayments = data.filter(
          (payment) => payment.payment_status === "PENDING",
        );

        setPayments(pendingPayments);
      } catch (error) {
        console.error(error);
      }
    }

    void fetchPayments();
  }, [transactionType]);

  /*
   * Ketika user memilih payment dari dropdown,
   * isi Order ID dan Amount dari payment tersebut.
   *
   * Payment Method juga diisi dari payment awal,
   * tetapi tetap dapat diubah secara manual oleh user.
   */
  function handlePaymentSelection(paymentId: string) {
    setSelectedPayment(paymentId);

    const payment = payments.find(
      (item) => item.id === paymentId,
    );

    if (!payment) {
      return;
    }

    setOrderId(payment.midtrans_order_id);

    setAmount(String(payment.amount));

    setPaymentMethod(
      payment.payment_method
        ? payment.payment_method.toUpperCase()
        : "QRIS",
    );
  }

  function generateNewIds() {
    setSelectedPayment("");

    setOrderId("");

    setAmount("");

    setPaymentMethod("QRIS");

    setTransactionId(generateSimulatorTransactionId());

    setResult({
      status: "PENDING",
      response: "",
      executionTime: 0,
    });
  }

  async function copyPayload() {
    const payload = {
      orderId,

      transactionId,

      transactionType,

      paymentMethod,

      transactionStatus,

      amount,
    };

    await copyToClipboard(
      JSON.stringify(payload, null, 2),
    );
  }

  async function copyResponse() {
    if (!result.response) {
      return;
    }

    await copyToClipboard(result.response);
  }

  async function handleSubmit() {
    try {
      if (!selectedPayment) {
        setResult({
          status: "ERROR",

          response: "Silakan pilih payment terlebih dahulu.",

          executionTime: 0,
        });

        return;
      }

      const startedAt = performance.now();

      const amountError = validateSimulatorAmount(amount);

      if (amountError) {
        setResult({
          status: "ERROR",

          response: amountError,

          executionTime: 0,
        });

        return;
      }

      const orderIdError = validateSimulatorOrderId(orderId);

      if (orderIdError) {
        setResult({
          status: "ERROR",

          response: orderIdError,

          executionTime: 0,
        });

        return;
      }

      setResult({
        status: "PENDING",

        response: "",

        executionTime: 0,
      });

      setLoading(true);

      const simulationResult = await simulateWebhook({
        orderId,

        amount: Number(amount),

        paymentMethod,

        transactionStatus,

        transactionId,
      });

      const finishedAt = performance.now();

      const executionTime = Math.round(
        finishedAt - startedAt,
      );

      const response = JSON.stringify(
        simulationResult,
        null,
        2,
      );

      setResult({
        status: "SUCCESS",

        response,

        executionTime,
      });

      setHistory((previous) =>
        [
          {
            id: crypto.randomUUID(),

            createdAt: new Date(),

            orderId,

            amount: Number(amount),

            result: {
              status: "SUCCESS" as const,

              response,

              executionTime,
            },
          },

          ...previous,
        ].slice(0, 10),
      );

      /*
       * Refresh daftar payment setelah simulasi.
       */
      const refreshed = await loadPayments(
        transactionType,
      );

      const pending = refreshed.filter(
        (payment) =>
          payment.payment_status === "PENDING",
      );

      setPayments(pending);

      /*
       * Jika payment yang sebelumnya dipilih
       * masih pending, pertahankan selection.
       *
       * Jika sudah tidak pending, kosongkan selection.
       */
      setSelectedPayment((current) => {
        if (
          pending.some(
            (payment) => payment.id === current,
          )
        ) {
          return current;
        }

        return "";
      });
    } catch (error) {
      if (error instanceof Error) {
        setResult({
          status: "ERROR",

          response: error.message,

          executionTime: 0,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    orderId,

    amount,

    paymentTypes,

    transactionType,

    paymentMethod,

    transactionStatus,

    transactionId,

    loading,

    result,

    payments,

    selectedPayment,

    setSelectedPayment: handlePaymentSelection,

    setOrderId,

    setAmount,

    setTransactionType,

    setPaymentMethod,

    setTransactionStatus,

    handleSubmit,

    generateNewIds,

    copyPayload,

    copyResponse,

    history,
  };
}