"use client";

import { useEffect, useRef, useState } from "react";

import { ServiceListingImageKind } from "../constants/service-listing-image-kind";

import { getPublicServiceListingDetailService } from "../services/get-public-service-listing-detail.service";

import { getPublicServiceListingMediaService } from "../services/get-public-service-listing-media.service";

import type { ProviderServiceListingMedia } from "../types/service-listing-media.types";

import type { PublicServiceListingDetail } from "../types/service-listing-read.types";

import { tryNormalizeServiceListingRouteId } from "../utils/service-listing-route";

type PublicServiceListingDetailLoadStatus =
  | "IDLE"
  | "READY"
  | "NOT_FOUND"
  | "ERROR";

interface PublicServiceListingDetailLoadState {
  listingId: string | null;

  status: PublicServiceListingDetailLoadStatus;

  listing: PublicServiceListingDetail | null;

  media: ProviderServiceListingMedia[];

  errorMessage: string | null;
}

const INITIAL_STATE: PublicServiceListingDetailLoadState = {
  listingId: null,

  status: "IDLE",

  listing: null,

  media: [],

  errorMessage: null,
};

function getLoadErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Detail jasa belum dapat dimuat. Coba lagi.";
}

export function usePublicServiceListingDetail(listingId: string) {
  const normalizedListingId = tryNormalizeServiceListingRouteId(listingId);

  const [loadState, setLoadState] =
    useState<PublicServiceListingDetailLoadState>(INITIAL_STATE);

  const [refreshVersion, setRefreshVersion] = useState(0);

  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!normalizedListingId) {
      return;
    }

    const requestId = ++requestIdRef.current;

    let cancelled = false;

    void Promise.all([
      getPublicServiceListingDetailService(normalizedListingId),

      getPublicServiceListingMediaService(normalizedListingId),
    ])
      .then(([nextListing, nextMedia]) => {
        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }

        if (!nextListing) {
          setLoadState({
            listingId: normalizedListingId,

            status: "NOT_FOUND",

            listing: null,

            media: [],

            errorMessage: null,
          });

          return;
        }

        setLoadState({
          listingId: normalizedListingId,

          status: "READY",

          listing: nextListing,

          media: nextMedia,

          errorMessage: null,
        });
      })
      .catch((loadError) => {
        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }

        console.error("LOAD PUBLIC SERVICE LISTING DETAIL ERROR:", loadError);

        setLoadState({
          listingId: normalizedListingId,

          status: "ERROR",

          listing: null,

          media: [],

          errorMessage: getLoadErrorMessage(loadError),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [normalizedListingId, refreshVersion]);

  const stateMatchesCurrentListing =
    normalizedListingId !== null && loadState.listingId === normalizedListingId;

  const loading =
    normalizedListingId !== null &&
    (!stateMatchesCurrentListing || loadState.status === "IDLE");

  const notFound =
    normalizedListingId === null ||
    (stateMatchesCurrentListing && loadState.status === "NOT_FOUND");

  const errorMessage =
    stateMatchesCurrentListing && loadState.status === "ERROR"
      ? loadState.errorMessage
      : null;

  const listing =
    stateMatchesCurrentListing && loadState.status === "READY"
      ? loadState.listing
      : null;

  const media =
    stateMatchesCurrentListing && loadState.status === "READY"
      ? loadState.media
      : [];

  const cover =
    media.find((item) => item.kind === ServiceListingImageKind.COVER) ?? null;

  const portfolio = media
    .filter((item) => item.kind === ServiceListingImageKind.PORTFOLIO)
    .slice()
    .sort((first, second) => first.sortOrder - second.sortOrder);

  function refresh() {
    if (!normalizedListingId) {
      return;
    }

    setLoadState({
      listingId: normalizedListingId,

      status: "IDLE",

      listing: null,

      media: [],

      errorMessage: null,
    });

    setRefreshVersion((version) => version + 1);
  }

  return {
    listing,

    cover,

    portfolio,

    loading,

    notFound,

    errorMessage,

    refresh,
  };
}
