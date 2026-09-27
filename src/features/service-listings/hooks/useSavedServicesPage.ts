"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { getSavedServiceListingsService } from "../services/get-saved-service-listings.service";

import type {
  PublicServiceListingCard,
} from "../types/service-listing-read.types";

const PAGE_SIZE = 12;

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.message.trim().length > 0
  ) {
    return error.message;
  }

  return "Jasa tersimpan belum dapat dimuat. Coba lagi.";
}

export function useSavedServicesPage() {
  const [
    items,
    setItems,
  ] = useState<
    PublicServiceListingCard[]
  >([]);

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    totalCount,
    setTotalCount,
  ] = useState<number | null>(
    0,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  );

  const [
    refreshVersion,
    setRefreshVersion,
  ] = useState(0);

  const requestIdRef =
    useRef(0);

  useEffect(() => {
    const requestId =
      ++requestIdRef.current;

    let cancelled =
      false;

    const timer =
      window.setTimeout(() => {
        if (
          cancelled ||
          requestId !==
            requestIdRef.current
        ) {
          return;
        }

        setLoading(true);
        setErrorMessage(null);

        void getSavedServiceListingsService({
          page: currentPage,
          pageSize: PAGE_SIZE,
        })
          .then((result) => {
            if (
              cancelled ||
              requestId !==
                requestIdRef.current
            ) {
              return;
            }

            setItems(
              result.items,
            );

            if (
              result.totalCount !==
              null
            ) {
              setTotalCount(
                result.totalCount,
              );
            }
          })
          .catch((error) => {
            if (
              cancelled ||
              requestId !==
                requestIdRef.current
            ) {
              return;
            }

            console.error(
              "LOAD SAVED SERVICES PAGE ERROR:",
              error,
            );

            setItems([]);

            setErrorMessage(
              getErrorMessage(
                error,
              ),
            );
          })
          .finally(() => {
            if (
              cancelled ||
              requestId !==
                requestIdRef.current
            ) {
              return;
            }

            setLoading(false);
          });
      }, 0);

    return () => {
      cancelled =
        true;

      window.clearTimeout(
        timer,
      );
    };
  }, [
    currentPage,
    refreshVersion,
  ]);

  const totalPages =
    totalCount === null
      ? Math.max(
          1,
          currentPage,
        )
      : Math.max(
          1,
          Math.ceil(
            totalCount /
              PAGE_SIZE,
          ),
        );

  const removeItem =
    useCallback(
      (
        listingId: string,
      ) => {
        setItems(
          (currentItems) =>
            currentItems.filter(
              (item) =>
                item.id !==
                listingId,
            ),
        );

        setTotalCount(
          (currentTotal) =>
            currentTotal === null
              ? null
              : Math.max(
                  0,
                  currentTotal - 1,
                ),
        );
      },
      [],
    );

  function previousPage() {
    setCurrentPage(
      (page) =>
        Math.max(
          1,
          page - 1,
        ),
    );
  }

  function nextPage() {
    setCurrentPage(
      (page) =>
        Math.min(
          totalPages,
          page + 1,
        ),
    );
  }

  function refresh() {
    setRefreshVersion(
      (version) =>
        version + 1,
    );
  }

  return {
    items,

    currentPage,

    pageSize:
      PAGE_SIZE,

    totalCount,

    totalPages,

    loading,

    errorMessage,

    canGoPrevious:
      currentPage > 1,

    canGoNext:
      currentPage <
      totalPages,

    previousPage,

    nextPage,

    removeItem,

    refresh,
  };
}