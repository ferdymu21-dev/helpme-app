"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { requestResumePayment } from "../services/pendingPayment.client";

import { useMidtrans } from "./useMidtrans";

import { usePaymentResult } from "./usePaymentResult";

import { usePaymentStatus } from "./usePaymentStatus";

import type { PendingPaymentType } from "../types/pendingPayment";

interface Options {
  onPaymentSettled: () => void | Promise<void>;
}

export function useResumePaymentFlow({ onPaymentSettled }: Options) {
  const { openPayment, hidePayment } = useMidtrans();

  const { result, openResult, closeResult } = usePaymentResult();

  const [orderId, setOrderId] = useState("");

  const [amount, setAmount] = useState(0);

  const [paymentType, setPaymentType] = useState<PendingPaymentType | null>(
    null,
  );

  const [opening, setOpening] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const { status, taskId } = usePaymentStatus({
    enabled: orderId !== "",
    orderId,
  });

  const handledResultRef = useRef(false);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    if (handledResultRef.current) {
      return;
    }

    if (status === "PENDING") {
      return;
    }

    handledResultRef.current = true;

    hidePayment();

    switch (status) {
      case "PAID":
        openResult("SUCCESS", orderId, amount);
        break;

      case "FAILED":
        openResult("FAILED", orderId, amount);
        break;

      case "EXPIRED":
        openResult("EXPIRED", orderId, amount);
        break;

      case "CANCELLED":
        openResult("CANCELLED", orderId, amount);
        break;

      default:
        handledResultRef.current = false;

        return;
    }

    void onPaymentSettled();
  }, [status, orderId, amount, hidePayment, openResult, onPaymentSettled]);

  const resumePayment = useCallback(
    async (paymentOrderId: string) => {
      try {
        setOpening(true);

        setError(null);

        handledResultRef.current = false;

        const payment = await requestResumePayment(paymentOrderId);

        /*
         * Order dan token berasal dari
         * transaksi lama yang sama.
         *
         * Tidak membuat Midtrans
         * transaction baru.
         */
        setOrderId(payment.orderId);

        setAmount(payment.amount);

        setPaymentType(payment.paymentType);

        await openPayment({
          snapToken: payment.snapToken,

          onSuccess() {
            // Backend tetap source of truth.
          },

          onPending() {
            // Polling server dilanjutkan.
          },

          onError() {
            // Status final tetap dari server.
          },

          onClose() {
            /*
             * Menutup Snap bukan berarti
             * transaksi dibatalkan.
             *
             * Lepaskan lifecycle resume.
             * Jika transaksi masih PENDING,
             * Home Pending Payment Card
             * akan tetap menampilkannya.
             */
            setOrderId("");
          },
        });
      } catch (resumeError) {
        const message =
          resumeError instanceof Error
            ? resumeError.message
            : "Gagal melanjutkan pembayaran.";

        setError(message);

        throw new Error(message);
      } finally {
        setOpening(false);
      }
    },
    [openPayment],
  );

  const closeDialog = useCallback(() => {
    closeResult();

    setOrderId("");

    setAmount(0);

    setPaymentType(null);

    handledResultRef.current = false;
  }, [closeResult]);

  return {
    resumePayment,
    opening,
    error,
    result,
    paymentType,
    taskId,
    closeDialog,
  };
}