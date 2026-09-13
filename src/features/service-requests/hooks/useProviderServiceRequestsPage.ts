"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ServiceRequestStatusValue } from "../constants/service-request-status";

import { getProviderServiceRequestsService } from "../services/get-provider-service-requests.service";

import type { ProviderServiceRequestPage } from "../types/service-request-read.types";

const PAGE_SIZE = 20;

export function useProviderServiceRequestsPage() {
  const [page, setPage] = useState(1);

  const [status, setStatus] = useState<ServiceRequestStatusValue | null>(null);

  const [data, setData] = useState<ProviderServiceRequestPage | null>(null);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestVersion = useRef(0);

  const load = useCallback(async () => {
    const version = requestVersion.current + 1;

    requestVersion.current = version;

    setLoading(true);

    setErrorMessage(null);

    try {
      const result = await getProviderServiceRequestsService({
        page,

        pageSize: PAGE_SIZE,

        status,
      });

      if (requestVersion.current !== version) {
        return;
      }

      setData(result);
    } catch (error) {
      if (requestVersion.current !== version) {
        return;
      }

      console.error("GET PROVIDER SERVICE REQUESTS ERROR:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Permintaan Jasa belum dapat dimuat.",
      );
    } finally {
      if (requestVersion.current === version) {
        setLoading(false);
      }
    }
  }, [page, status]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(loadTimer);

      requestVersion.current += 1;
    };
  }, [load]);

  const totalPages = Math.max(
    1,
    Math.ceil((data?.totalCount ?? 0) / PAGE_SIZE),
  );

  function handleStatusChange(nextStatus: ServiceRequestStatusValue | null) {
    setPage(1);

    setStatus(nextStatus);
  }

  function handlePreviousPage() {
    setPage((current) => Math.max(1, current - 1));
  }

  function handleNextPage() {
    setPage((current) => Math.min(totalPages, current + 1));
  }

  return {
    items: data?.items ?? [],

    totalCount: data?.totalCount ?? 0,

    page,

    totalPages,

    status,

    loading,

    errorMessage,

    refresh: load,

    onStatusChange: handleStatusChange,

    onPreviousPage: handlePreviousPage,

    onNextPage: handleNextPage,
  };
}