"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getMyServiceListingsService } from "../services/get-my-service-listings.service";

import type {
  PaginatedServiceListingResult,
  ProviderServiceListing,
} from "../types/service-listing-read.types";

const PAGE_SIZE = 20;

export function useMyServicesPage() {
  const [page, setPage] = useState(1);

  const [data, setData] =
    useState<PaginatedServiceListingResult<ProviderServiceListing> | null>(
      null,
    );

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestVersion = useRef(0);

  const load = useCallback(async () => {
    const version = requestVersion.current + 1;

    requestVersion.current = version;

    setLoading(true);

    setErrorMessage(null);

    try {
      const result = await getMyServiceListingsService({
        page,

        pageSize: PAGE_SIZE,
      });

      if (requestVersion.current !== version) {
        return;
      }

      if (page > 1 && result.items.length === 0 && result.totalCount === null) {
        setPage((current) => Math.max(1, current - 1));

        return;
      }

      setData(result);
    } catch (error) {
      if (requestVersion.current !== version) {
        return;
      }

      console.error("GET MY SERVICE LISTINGS ERROR:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Jasa Anda belum dapat dimuat.",
      );
    } finally {
      if (requestVersion.current === version) {
        setLoading(false);
      }
    }
  }, [page]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(loadTimer);

      requestVersion.current += 1;
    };
  }, [load]);

  const totalCount = data?.totalCount ?? 0;

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function handlePreviousPage() {
    setPage((current) => Math.max(1, current - 1));
  }

  function handleNextPage() {
    setPage((current) => Math.min(totalPages, current + 1));
  }

  return {
    items: data?.items ?? [],

    totalCount,

    page,

    totalPages,

    loading,

    errorMessage,

    refresh: load,

    onPreviousPage: handlePreviousPage,

    onNextPage: handleNextPage,
  };
}
