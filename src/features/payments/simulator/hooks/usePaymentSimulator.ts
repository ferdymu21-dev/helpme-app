"use client";

import {
  loadPaymentTypes,
  loadPayments,
  syncPaymentWithMidtrans,
} from "../services/paymentSimulator.service";

import {
  validateSimulatorOrderId,
} from "../../utils/simulator.validator";

import type {
  SimulatorResult,
} from "../types/simulatorResult";

import {
  useEffect,
  useState,
} from "react";

import {
  copyToClipboard,
} from "../../utils/clipboard";

import type {
  SimulationHistoryItem,
} from "../types/simulationHistory";

import type {
  SimulatorPayment,
} from "../types/paymentSimulator";

export function usePaymentSimulator() {
  const [
    orderId,
    setOrderId,
  ] = useState("");

  const [
    amount,
    setAmount,
  ] = useState("");

  const [
    transactionType,
    setTransactionType,
  ] = useState("");

  const [
    paymentTypes,
    setPaymentTypes,
  ] = useState<string[]>([]);

  const [
    selectedPayment,
    setSelectedPayment,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    result,
    setResult,
  ] =
    useState<SimulatorResult>({
      status: "PENDING",

      response: "",

      executionTime: 0,
    });

  const [
    history,
    setHistory,
  ] =
    useState<
      SimulationHistoryItem[]
    >([]);

  const [
    payments,
    setPayments,
  ] =
    useState<
      SimulatorPayment[]
    >([]);

  /*
   * Load payment types.
   */
  useEffect(() => {
    async function fetchPaymentTypes() {
      try {
        const types =
          await loadPaymentTypes();

        setPaymentTypes(
          types,
        );

        if (
          types.length > 0
        ) {
          setTransactionType(
            (current) =>
              current ||
              types[0],
          );
        }
      } catch (error) {
        console.error(
          error,
        );
      }
    }

    void fetchPaymentTypes();
  }, []);

  /*
   * Hanya tampilkan payment HelpMe
   * yang masih PENDING.
   */
  useEffect(() => {
    async function fetchPayments() {
      if (
        !transactionType
      ) {
        setPayments([]);

        return;
      }

      try {
        const data =
          await loadPayments(
            transactionType,
          );

        setPayments(
          data.filter(
            (payment) =>
              payment
                .payment_status ===
              "PENDING",
          ),
        );
      } catch (error) {
        console.error(
          error,
        );
      }
    }

    void fetchPayments();
  }, [transactionType]);

  function handlePaymentSelection(
    paymentId: string,
  ) {
    setSelectedPayment(
      paymentId,
    );

    const payment =
      payments.find(
        (item) =>
          item.id ===
          paymentId,
      );

    if (!payment) {
      setOrderId("");

      setAmount("");

      return;
    }

    setOrderId(
      payment.midtrans_order_id,
    );

    setAmount(
      String(
        payment.amount,
      ),
    );
  }

  /*
   * Nama dipertahankan sementara agar
   * consumer UI existing tidak rusak.
   *
   * Sekarang fungsinya hanya reset
   * selection, bukan generate fake
   * transaction ID.
   */
  function generateNewIds() {
    setSelectedPayment("");

    setOrderId("");

    setAmount("");

    setResult({
      status: "PENDING",

      response: "",

      executionTime: 0,
    });
  }

  async function copyPayload() {
    await copyToClipboard(
      JSON.stringify(
        {
          transactionType,

          orderId,
        },
        null,
        2,
      ),
    );
  }

  async function copyResponse() {
    if (!result.response) {
      return;
    }

    await copyToClipboard(
      result.response,
    );
  }

  async function handleSubmit() {
    try {
      if (
        !selectedPayment
      ) {
        setResult({
          status: "ERROR",

          response:
            "Silakan pilih payment terlebih dahulu.",

          executionTime: 0,
        });

        return;
      }

      const orderIdError =
        validateSimulatorOrderId(
          orderId,
        );

      if (orderIdError) {
        setResult({
          status: "ERROR",

          response:
            orderIdError,

          executionTime: 0,
        });

        return;
      }

      const startedAt =
        performance.now();

      setResult({
        status: "PENDING",

        response: "",

        executionTime: 0,
      });

      setLoading(true);

      const syncResult =
        await syncPaymentWithMidtrans(
          orderId,
        );

      const finishedAt =
        performance.now();

      const executionTime =
        Math.round(
          finishedAt -
            startedAt,
        );

      const response =
        JSON.stringify(
          syncResult,
          null,
          2,
        );

      setResult({
        status: "SUCCESS",

        response,

        executionTime,
      });

      setHistory(
        (previous) =>
          [
            {
              id:
                crypto.randomUUID(),

              createdAt:
                new Date(),

              orderId,

              amount:
                Number(
                  amount,
                ),

              result: {
                status:
                  "SUCCESS" as const,

                response,

                executionTime,
              },
            },

            ...previous,
          ].slice(
            0,
            10,
          ),
      );

      /*
       * Re-read database.
       *
       * Bila reconciliation mengubah
       * PENDING -> PAID/terminal,
       * payment akan hilang dari dropdown.
       */
      const refreshed =
        await loadPayments(
          transactionType,
        );

      const pending =
        refreshed.filter(
          (payment) =>
            payment
              .payment_status ===
            "PENDING",
        );

      setPayments(
        pending,
      );

      setSelectedPayment(
        (current) => {
          if (
            pending.some(
              (payment) =>
                payment.id ===
                current,
            )
          ) {
            return current;
          }

          return "";
        },
      );
    } catch (error) {
      setResult({
        status: "ERROR",

        response:
          error instanceof Error
            ? error.message
            : "Sinkronisasi payment gagal.",

        executionTime: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  return {
    orderId,

    amount,

    paymentTypes,

    transactionType,

    loading,

    result,

    payments,

    selectedPayment,

    setSelectedPayment:
      handlePaymentSelection,

    setOrderId,

    setAmount,

    setTransactionType,

    handleSubmit,

    generateNewIds,

    copyPayload,

    copyResponse,

    history,
  };
}