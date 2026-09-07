"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  fetchPendingPayment,
} from "../services/pendingPayment.client";

import type {
  PendingPaymentSummary,
} from "../types/pendingPayment";

const REFRESH_INTERVAL = 5000;

export function usePendingPayment() {
  const [
    payment,
    setPayment,
  ] =
    useState<PendingPaymentSummary | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(null);

  const requestIdRef =
    useRef(0);

  const refreshInFlightRef =
    useRef(false);

  const refresh =
    useCallback(async () => {
      /*
       * Jangan mulai request baru jika
       * request pending-payment sebelumnya
       * masih berjalan.
       */
      if (
        refreshInFlightRef.current
      ) {
        return;
      }

      refreshInFlightRef.current =
        true;

      const requestId =
        ++requestIdRef.current;

      try {
        const result =
          await fetchPendingPayment();

        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        setPayment(result);

        setError(null);
      } catch (fetchError) {
        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        console.error(
          "Gagal memuat pending payment:",
          fetchError,
        );

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Gagal memuat pembayaran.",
        );
      } finally {
        if (
          requestId ===
          requestIdRef.current
        ) {
          setLoading(false);
        }

        refreshInFlightRef.current =
          false;
      }
    }, []);

  useEffect(() => {
  /*
   * Jadwalkan initial fetch melalui
   * browser task agar state update tidak
   * dilakukan langsung dari body effect.
   */
  const initialRefreshId =
    window.setTimeout(() => {
      void refresh();
    }, 0);

  function handleVisibilityChange() {
    if (
      document.visibilityState ===
      "visible"
    ) {
      void refresh();
    }
  }

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange,
  );

  return () => {
    window.clearTimeout(
      initialRefreshId,
    );

    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );
  };
}, [refresh]);

  /*
   * Polling 5 detik hanya berjalan
   * ketika memang ada transaksi pending.
   */
  useEffect(() => {
  if (!payment) {
    return;
  }

  const intervalId =
    window.setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL);

  return () => {
    window.clearInterval(
      intervalId,
    );
  };
}, [
  payment,
  refresh,
]);

  useEffect(() => {
  if (!payment) {
    return;
  }

  const expiresAt =
    Date.parse(
      payment.paymentExpiresAt,
    );

  if (
    Number.isNaN(
      expiresAt,
    )
  ) {
    return;
  }

  const delay =
    expiresAt -
    Date.now();

  /*
   * Refresh sedikit setelah deadline.
   *
   * Jika deadline sudah lewat ketika
   * effect dijalankan, timer menjadi 0
   * sehingga refresh tetap dilakukan
   * melalui callback browser, bukan
   * langsung dari body effect.
   */
  const timeoutDelay =
    Math.max(
      delay + 250,
      0,
    );

  const timeoutId =
    window.setTimeout(() => {
      void refresh();
    }, timeoutDelay);

  return () => {
    window.clearTimeout(
      timeoutId,
    );
  };
}, [
  payment,
  refresh,
]);

  return {
    payment,
    loading,
    error,
    refresh,
  };
}