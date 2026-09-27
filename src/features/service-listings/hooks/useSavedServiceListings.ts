"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuthStore } from "@/store/auth.store";

import { getSavedServiceListingIdsService } from "../services/get-saved-service-listing-ids.service";

import { saveServiceListingService } from "../services/save-service-listing.service";

import { unsaveServiceListingService } from "../services/unsave-service-listing.service";

export type ToggleSavedServiceResult =
  | "SAVED"
  | "UNSAVED"
  | "AUTH_REQUIRED"
  | "PENDING";

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.message.trim().length > 0
  ) {
    return error.message;
  }

  return "Jasa belum dapat disimpan. Coba lagi.";
}

export function useSavedServiceListings() {
  const authUserId =
    useAuthStore(
      (state) =>
        state.user?.id ?? null,
    );

  const authLoading =
    useAuthStore(
      (state) =>
        state.loading,
    );

  const [
    savedListingIds,
    setSavedListingIds,
  ] = useState<Set<string>>(
    () => new Set(),
  );

  const [
    pendingListingIds,
    setPendingListingIds,
  ] = useState<Set<string>>(
    () => new Set(),
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

  const savedIdsRef =
    useRef<Set<string>>(
      new Set(),
    );

  const pendingIdsRef =
    useRef<Set<string>>(
      new Set(),
    );

  const loadRequestIdRef =
    useRef(0);

  const replaceSavedIds =
    useCallback(
      (
        next:
          ReadonlySet<string>,
      ) => {
        const normalized =
          new Set(next);

        savedIdsRef.current =
          normalized;

        setSavedListingIds(
          new Set(normalized),
        );
      },
      [],
    );

  const setSavedState =
    useCallback(
      (
        listingId: string,
        saved: boolean,
      ) => {
        const next =
          new Set(
            savedIdsRef.current,
          );

        if (saved) {
          next.add(
            listingId,
          );
        } else {
          next.delete(
            listingId,
          );
        }

        replaceSavedIds(
          next,
        );
      },
      [
        replaceSavedIds,
      ],
    );

  const setPendingState =
    useCallback(
      (
        listingId: string,
        pending: boolean,
      ) => {
        const next =
          new Set(
            pendingIdsRef.current,
          );

        if (pending) {
          next.add(
            listingId,
          );
        } else {
          next.delete(
            listingId,
          );
        }

        pendingIdsRef.current =
          next;

        setPendingListingIds(
          new Set(next),
        );
      },
      [],
    );

  useEffect(() => {
    const requestId =
      ++loadRequestIdRef.current;

    let cancelled =
      false;

    const timer =
      window.setTimeout(() => {
        if (
          cancelled ||
          requestId !==
            loadRequestIdRef.current
        ) {
          return;
        }

        if (authLoading) {
          setLoading(true);

          return;
        }

        if (!authUserId) {
          replaceSavedIds(
            new Set(),
          );

          pendingIdsRef.current =
            new Set();

          setPendingListingIds(
            new Set(),
          );

          setErrorMessage(
            null,
          );

          setLoading(
            false,
          );

          return;
        }

        setLoading(true);

        setErrorMessage(
          null,
        );

        void getSavedServiceListingIdsService()
          .then((ids) => {
            if (
              cancelled ||
              requestId !==
                loadRequestIdRef.current
            ) {
              return;
            }

            replaceSavedIds(
              new Set(ids),
            );
          })
          .catch((error) => {
            if (
              cancelled ||
              requestId !==
                loadRequestIdRef.current
            ) {
              return;
            }

            console.error(
              "LOAD SAVED SERVICE LISTING IDS ERROR:",
              error,
            );

            replaceSavedIds(
              new Set(),
            );

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
                loadRequestIdRef.current
            ) {
              return;
            }

            setLoading(
              false,
            );
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
    authLoading,
    authUserId,
    replaceSavedIds,
  ]);

  const isSaved =
    useCallback(
      (
        listingId: string,
      ): boolean =>
        savedListingIds.has(
          listingId,
        ),
      [
        savedListingIds,
      ],
    );

  const isPending =
    useCallback(
      (
        listingId: string,
      ): boolean =>
        pendingListingIds.has(
          listingId,
        ),
      [
        pendingListingIds,
      ],
    );

  const toggleSaved =
    useCallback(
      async (
        listingId: string,
      ): Promise<ToggleSavedServiceResult> => {
        if (
          authLoading ||
          !authUserId
        ) {
          return "AUTH_REQUIRED";
        }

        if (
          pendingIdsRef.current.has(
            listingId,
          )
        ) {
          return "PENDING";
        }

        const wasSaved =
          savedIdsRef.current.has(
            listingId,
          );

        const nextSaved =
          !wasSaved;

        setErrorMessage(
          null,
        );

        setPendingState(
          listingId,
          true,
        );

        setSavedState(
          listingId,
          nextSaved,
        );

        try {
          if (nextSaved) {
            await saveServiceListingService(
              listingId,
            );

            return "SAVED";
          }

          await unsaveServiceListingService(
            listingId,
          );

          return "UNSAVED";
        } catch (error) {
          console.error(
            "TOGGLE SAVED SERVICE LISTING ERROR:",
            error,
          );

          setSavedState(
            listingId,
            wasSaved,
          );

          setErrorMessage(
            getErrorMessage(
              error,
            ),
          );

          throw error;
        } finally {
          setPendingState(
            listingId,
            false,
          );
        }
      },
      [
        authLoading,
        authUserId,
        setPendingState,
        setSavedState,
      ],
    );

  return {
    savedListingIds,

    pendingListingIds,

    loading,

    errorMessage,

    authLoading,

    isAuthenticated:
      authUserId !== null,

    isSaved,

    isPending,

    toggleSaved,
  };
}