"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { ServiceListingConfig } from "../constants/service-listing-config";

import { ServiceMode } from "../constants/service-mode";

import type { ServiceModeValue } from "../constants/service-mode";

import { getPublicServiceListingsService } from "../services/get-public-service-listings.service";

import type { PublicServiceListingCard } from "../types/service-listing-read.types";

const SEARCH_DEBOUNCE_MS = 350;

const PAGE_SIZE = ServiceListingConfig.pagination.defaultPageSize;

const DEFAULT_PAGE = ServiceListingConfig.pagination.defaultPage;

interface DiscoveryUrlState {
  search: string;

  serviceMode: ServiceModeValue | null;

  page: number;
}

function getDiscoveryErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Jasa belum dapat dimuat. Coba lagi.";
}

function parseServiceMode(value: string | null): ServiceModeValue | null {
  switch (value) {
    case ServiceMode.ONLINE:
      return ServiceMode.ONLINE;

    case ServiceMode.OFFLINE:
      return ServiceMode.OFFLINE;

    case ServiceMode.BOTH:
      return ServiceMode.BOTH;

    default:
      return null;
  }
}

function parsePage(value: string | null): number {
  if (!value || !/^[1-9]\d*$/.test(value)) {
    return DEFAULT_PAGE;
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return DEFAULT_PAGE;
  }

  return parsed;
}

function getDiscoveryUrl({
  search,
  serviceMode,
  page,
}: DiscoveryUrlState): string {
  const params = new URLSearchParams();

  const normalizedSearch = search.trim();

  if (normalizedSearch.length > 0) {
    params.set("q", normalizedSearch);
  }

  if (serviceMode) {
    params.set("mode", serviceMode);
  }

  if (page > DEFAULT_PAGE) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/services?${query}` : "/services";
}

export function useServiceDiscovery() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const searchParamsKey = searchParams.toString();

  const searchQuery = (searchParams.get("q") ?? "").trim();

  const serviceMode = parseServiceMode(searchParams.get("mode"));

  const currentPage = parsePage(searchParams.get("page"));

  const [items, setItems] = useState<PublicServiceListingCard[]>([]);

  const [searchInput, setSearchInput] = useState(searchQuery);

  const [totalCount, setTotalCount] = useState<number | null>(0);

  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [refreshVersion, setRefreshVersion] = useState(0);

  const requestIdRef = useRef(0);

  const searchDebounceRef = useRef<number | null>(null);

  const lastUrlSearchRef = useRef(searchQuery);

  /*
   * Normalize URL into the supported
   * discovery contract.
   *
   * Examples:
   * ?page=1        -> removed
   * ?page=abc      -> removed
   * ?mode=INVALID  -> removed
   * ?q=            -> removed
   */
  useEffect(() => {
    const canonicalUrl = getDiscoveryUrl({
      search: searchQuery,

      serviceMode,

      page: currentPage,
    });

    const currentUrl = searchParamsKey
      ? `/services?${searchParamsKey}`
      : "/services";

    if (canonicalUrl === currentUrl) {
      return;
    }

    router.replace(canonicalUrl, {
      scroll: false,
    });
  }, [currentPage, router, searchParamsKey, searchQuery, serviceMode]);

  /*
   * Back/Forward or a deep-link can
   * change q without going through the
   * search input handler.
   *
   * Synchronize the visible input only
   * when the URL search itself changes.
   */
  useEffect(() => {
    if (lastUrlSearchRef.current === searchQuery) {
      return;
    }

    lastUrlSearchRef.current = searchQuery;

    if (searchDebounceRef.current !== null) {
      window.clearTimeout(searchDebounceRef.current);

      searchDebounceRef.current = null;
    }

    const timeoutId = window.setTimeout(() => {
      setSearchInput(searchQuery);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current !== null) {
        window.clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    let cancelled = false;

    let keepLoading = false;

    /*
     * User actions set loading
     * immediately. This timer also
     * covers URL changes caused by
     * browser Back/Forward.
     */
    const loadingTimer = window.setTimeout(() => {
      if (cancelled || requestId !== requestIdRef.current) {
        return;
      }

      setError(null);

      setLoading(true);
    }, 0);

    void getPublicServiceListingsService({
      page: currentPage,

      pageSize: PAGE_SIZE,

      search: searchQuery,

      serviceMode,
    })
      .then((result) => {
        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }

        const resolvedTotalPages =
          result.totalCount === null
            ? Math.max(1, currentPage)
            : Math.max(1, Math.ceil(result.totalCount / PAGE_SIZE));

        /*
         * Listing dapat expired saat
         * user sedang berpindah halaman.
         *
         * Jangan tinggalkan user pada
         * halaman URL yang sudah tidak
         * valid.
         */
        if (result.items.length === 0 && currentPage > 1) {
          keepLoading = true;

          const targetPage =
            result.totalCount === null
              ? Math.max(DEFAULT_PAGE, currentPage - 1)
              : Math.min(currentPage, resolvedTotalPages);

          router.replace(
            getDiscoveryUrl({
              search: searchQuery,

              serviceMode,

              page: targetPage,
            }),
            {
              scroll: false,
            },
          );

          return;
        }

        setItems(result.items);

        setTotalCount(result.totalCount);

        setTotalPages(resolvedTotalPages);

        setError(null);
      })
      .catch((loadError) => {
        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }

        setError(getDiscoveryErrorMessage(loadError));
      })
      .finally(() => {
        window.clearTimeout(loadingTimer);

        if (!cancelled && requestId === requestIdRef.current && !keepLoading) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;

      window.clearTimeout(loadingTimer);
    };
  }, [currentPage, refreshVersion, router, searchQuery, serviceMode]);

  function handleSearchChange(value: string) {
    setSearchInput(value);

    if (searchDebounceRef.current !== null) {
      window.clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = window.setTimeout(() => {
      searchDebounceRef.current = null;

      const nextSearch = value.trim();

      if (nextSearch === searchQuery) {
        return;
      }

      setError(null);

      setLoading(true);

      router.push(
        getDiscoveryUrl({
          search: nextSearch,

          serviceMode,

          page: DEFAULT_PAGE,
        }),
        {
          scroll: false,
        },
      );
    }, SEARCH_DEBOUNCE_MS);
  }

  function handleServiceModeChange(value: ServiceModeValue | null) {
    if (value === serviceMode) {
      return;
    }

    setError(null);

    setLoading(true);

    router.push(
      getDiscoveryUrl({
        search: searchQuery,

        serviceMode: value,

        page: DEFAULT_PAGE,
      }),
      {
        scroll: false,
      },
    );
  }

  function handlePreviousPage() {
    if (currentPage <= DEFAULT_PAGE) {
      return;
    }

    setError(null);

    setLoading(true);

    router.push(
      getDiscoveryUrl({
        search: searchQuery,

        serviceMode,

        page: Math.max(DEFAULT_PAGE, currentPage - 1),
      }),
      {
        scroll: false,
      },
    );
  }

  function handleNextPage() {
    if (currentPage >= totalPages) {
      return;
    }

    setError(null);

    setLoading(true);

    router.push(
      getDiscoveryUrl({
        search: searchQuery,

        serviceMode,

        page: Math.min(totalPages, currentPage + 1),
      }),
      {
        scroll: false,
      },
    );
  }

  function clearFilters() {
    if (searchDebounceRef.current !== null) {
      window.clearTimeout(searchDebounceRef.current);

      searchDebounceRef.current = null;
    }

    setSearchInput("");

    setError(null);

    setLoading(true);

    router.push("/services", {
      scroll: false,
    });
  }

  function refresh() {
    setError(null);

    setLoading(true);

    setRefreshVersion((version) => version + 1);
  }

  return {
    items,

    searchInput,

    serviceMode,

    currentPage,

    totalCount,

    totalPages,

    pageSize: PAGE_SIZE,

    loading,

    error,

    hasActiveFilters: searchQuery.length > 0 || serviceMode !== null,

    canGoPrevious: currentPage > DEFAULT_PAGE,

    canGoNext: currentPage < totalPages,

    onSearchChange: handleSearchChange,

    onServiceModeChange: handleServiceModeChange,

    onPreviousPage: handlePreviousPage,

    onNextPage: handleNextPage,

    clearFilters,

    refresh,
  };
}
