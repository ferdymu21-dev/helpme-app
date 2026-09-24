"use client";

import { useEffect, useRef, useState } from "react";

import type {
  ServiceCategoryValue,
} from "../constants/service-categories";

import { getPublicServiceListingsService } from "../services/get-public-service-listings.service";

import type { PublicServiceListingCard } from "../types/service-listing-read.types";

const HOME_SERVICE_PAGE_SIZE = 6;

function getLoadErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Jasa belum dapat dimuat. Coba lagi.";
}

export function useHomeServiceFeed() {
  const [category, setCategory] =
    useState<ServiceCategoryValue | null>(
      null,
    );

  const [items, setItems] = useState<PublicServiceListingCard[]>([]);

  const [totalCount, setTotalCount] = useState<number | null>(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [refreshVersion, setRefreshVersion] = useState(0);

  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    let cancelled = false;

    void getPublicServiceListingsService({
      page: 1,

      pageSize: HOME_SERVICE_PAGE_SIZE,

      category,
    })
      .then((result) => {
        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }

        setItems(result.items);

        setTotalCount(result.totalCount);

        setError(null);
      })
      .catch((loadError) => {
        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }

        setError(getLoadErrorMessage(loadError));
      })
      .finally(() => {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    category,
    refreshVersion,
  ]);

  function changeCategory(
    value: ServiceCategoryValue | null,
  ) {
    if (value === category) {
      return;
    }

    setError(null);

    setLoading(true);

    setCategory(value);
  }

  function refresh() {
    setError(null);

    setLoading(true);

    setRefreshVersion((version) => version + 1);
  }

  return {
    category,

    items,

    totalCount,

    loading,

    error,

    onCategoryChange:
      changeCategory,

    refresh,
  };
}
