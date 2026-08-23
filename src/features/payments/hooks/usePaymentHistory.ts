"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  fetchPaymentHistory,
} from "../services/paymentHistory.service";

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  payment_status: string;
  payment_method: string;
  midtrans_order_id: string;
  created_at: string;
  paid_at: string | null;
}

export function usePaymentHistory() {
  const [history, setHistory] =
    useState<PaymentHistoryItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result =
        await fetchPaymentHistory();

      setHistory(result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unknown Error",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (cancelled) {
        return;
      }

      await loadHistory();
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadHistory]);

  return {
    history,
    loading,
    error,
    reload: loadHistory,
  };
}