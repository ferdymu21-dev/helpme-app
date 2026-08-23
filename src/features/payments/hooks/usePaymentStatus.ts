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
  paymentType: "DONATION" | "URGENT_TASK";
  taskId?: string | null;
}

export function usePaymentStatus({
  enabled,
  orderId,
  interval = 3000,
}: Options) {
  const [status, setStatus] =
    useState<PaymentStatus>("PENDING");

  const [paymentType, setPaymentType] =
    useState<"DONATION" | "URGENT_TASK" | null>(null);

  const [taskId, setTaskId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const timerRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!orderId) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/payments/status/${orderId}`,
      );

      if (!response.ok) {
        return;
      }

      const data =
        (await response.json()) as PaymentStatusResponse;

      setStatus(data.status);
      setPaymentType(data.paymentType ?? null);
      setTaskId(data.taskId ?? null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!enabled || !orderId) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      if (cancelled) {
        return;
      }

      await fetchStatus();
    };

    void run();

    timerRef.current = setInterval(() => {
      void run();
    }, interval);

    return () => {
      cancelled = true;

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    enabled,
    orderId,
    interval,
    fetchStatus,
  ]);

  useEffect(() => {
    if (status === "PENDING") {
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
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