"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getMyServiceListingStatusCountsService,
  getMyServiceListingsService,
} from "../services/get-my-service-listings.service";

import type {
  MyServiceListingStatusCounts,
  PaginatedServiceListingResult,
  ProviderServiceListing,
} from "../types/service-listing-read.types";

const PAGE_SIZE = 20;

const EMPTY_STATUS_COUNTS: MyServiceListingStatusCounts = {
  totalCount: 0,

  activeCount: 0,

  draftCount: 0,

  paymentPendingCount: 0,

  pausedCount: 0,

  expiredCount: 0,

  blockedCount: 0,

  archivedCount: 0,
};

export function useMyServicesPage() {
  const [page, setPage] = useState(1);

  const [selectedStatus, setSelectedStatus] = useState<
    ProviderServiceListing["status"] | null
  >(null);

  const [data, setData] =
    useState<PaginatedServiceListingResult<ProviderServiceListing> | null>(
      null,
    );

  const [statusCounts, setStatusCounts] =
    useState<MyServiceListingStatusCounts>(EMPTY_STATUS_COUNTS);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestVersion = useRef(0);

  const load = useCallback(async () => {
    const version = requestVersion.current + 1;

    requestVersion.current = version;

    setLoading(true);

    setErrorMessage(null);

    try {
      const [result, counts] = await Promise.all([
        getMyServiceListingsService({
          page,

          pageSize: PAGE_SIZE,

          status: selectedStatus,
        }),

        getMyServiceListingStatusCountsService(),
      ]);

      if (requestVersion.current !== version) {
        return;
      }

      if (page > 1 && result.items.length === 0 && result.totalCount === null) {
        setPage((current) => Math.max(1, current - 1));

        return;
      }

      setData(result);
      setStatusCounts(counts);
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
  }, [page, selectedStatus]);

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

  function handleStatusChange(status: ProviderServiceListing["status"] | null) {
    if (status === selectedStatus) {
      return;
    }

    setData(null);

    setPage(1);

    setSelectedStatus(status);
  }

  function handlePreviousPage() {
    setPage((current) => Math.max(1, current - 1));
  }

  function handleNextPage() {
    setPage((current) => Math.min(totalPages, current + 1));
  }

  return {
    items: data?.items ?? [],

    totalCount,

    statusCounts,

    selectedStatus,

    page,

    totalPages,

    loading,

    errorMessage,

    refresh: load,

    onStatusChange: handleStatusChange,

    onPreviousPage: handlePreviousPage,

    onNextPage: handleNextPage,
  };
}