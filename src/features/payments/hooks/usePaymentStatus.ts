"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED";

interface Options {
  enabled: boolean;

  orderId: string;

  interval?: number;
}

interface PaymentStatusResponse {
  status: PaymentStatus;

  paymentType:
    | "DONATION"
    | "URGENT_TASK";

  taskId?: string | null;
}

interface PaymentSnapshot {
  orderId: string;

  status: PaymentStatus;

  paymentType:
    | "DONATION"
    | "URGENT_TASK"
    | null;

  taskId: string | null;
}

const INITIAL_SNAPSHOT: PaymentSnapshot =
  {
    orderId: "",

    status: "PENDING",

    paymentType: null,

    taskId: null,
  };

export function usePaymentStatus({
  enabled,
  orderId,
  interval = 3000,
}: Options) {
  const [
    snapshot,
    setSnapshot,
  ] =
    useState<PaymentSnapshot>(
      INITIAL_SNAPSHOT,
    );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const timerRef =
    useRef<
      ReturnType<
        typeof setInterval
      > | null
    >(null);

  const fetchStatus =
    useCallback(async () => {
      if (!orderId) {
        return;
      }

      setLoading(true);

      try {
        const response =
          await fetch(
            `/api/payments/status/${orderId}`,
          );

        if (!response.ok) {
          return;
        }

        const data =
          (await response.json()) as PaymentStatusResponse;

        /*
         * Status selalu disimpan bersama
         * orderId yang menghasilkan status.
         *
         * Ini mencegah PAID transaksi lama
         * dianggap sebagai status transaksi
         * baru.
         */
        setSnapshot({
          orderId,

          status:
            data.status,

          paymentType:
            data.paymentType ??
            null,

          taskId:
            data.taskId ??
            null,
        });
      } finally {
        setLoading(false);
      }
    }, [orderId]);

  const isCurrentOrder =
    snapshot.orderId ===
    orderId;

  const status:
    PaymentStatus =
    isCurrentOrder
      ? snapshot.status
      : "PENDING";

  const paymentType =
    isCurrentOrder
      ? snapshot.paymentType
      : null;

  const taskId =
    isCurrentOrder
      ? snapshot.taskId
      : null;

  useEffect(() => {
    if (
      !enabled ||
      !orderId
    ) {
      return;
    }

    let cancelled = false;

    const run =
      async () => {
        if (cancelled) {
          return;
        }

        await fetchStatus();
      };

    void run();

    timerRef.current =
      setInterval(() => {
        void run();
      }, interval);

    return () => {
      cancelled = true;

      if (
        timerRef.current
      ) {
        clearInterval(
          timerRef.current,
        );

        timerRef.current =
          null;
      }
    };
  }, [
    enabled,
    orderId,
    interval,
    fetchStatus,
  ]);

  useEffect(() => {
    if (
      status ===
      "PENDING"
    ) {
      return;
    }

    if (
      timerRef.current
    ) {
      clearInterval(
        timerRef.current,
      );

      timerRef.current =
        null;
    }
  }, [status]);

  return {
    status,
    paymentType,
    taskId,
    loading,
    reload: fetchStatus,
  };
}