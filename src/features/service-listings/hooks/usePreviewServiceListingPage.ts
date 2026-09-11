"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { useMidtrans } from "@/features/payments/hooks/useMidtrans";

import { usePaymentStatus } from "@/features/payments/hooks/usePaymentStatus";

import { ServiceListingStatus } from "../constants/service-listing-status";

import { getMyServiceListingDetailService } from "../services/get-my-service-listing-detail.service";

import { getMyServiceListingMediaService } from "../services/get-my-service-listing-media.service";

import { pauseServiceListingService } from "../services/pause-service-listing.service";

import { requestServiceListingPublicationClient } from "../services/service-listing-publication.client.service";

import { resumeServiceListingService } from "../services/resume-service-listing.service";

import type { ProviderServiceListingMedia } from "../types/service-listing-media.types";

import type { ProviderServiceListing } from "../types/service-listing-read.types";

import { tryNormalizeServiceListingRouteId } from "../utils/service-listing-route";

export function usePreviewServiceListingPage(listingId: string) {
  const router = useRouter();

  const { openPayment, hidePayment } = useMidtrans();

  const normalizedListingId = tryNormalizeServiceListingRouteId(listingId);

  const [listing, setListing] = useState<ProviderServiceListing | null>(null);

  const [media, setMedia] = useState<ProviderServiceListingMedia[]>([]);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [publicationBusy, setPublicationBusy] = useState(false);

  const [lifecycleBusy, setLifecycleBusy] = useState(false);

  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(
    null,
  );

  const [actionSuccessMessage, setActionSuccessMessage] = useState<
    string | null
  >(null);

  const [actionInfoMessage, setActionInfoMessage] = useState<string | null>(
    null,
  );

  const [publicationOrderId, setPublicationOrderId] = useState("");

  const [publicationAmount, setPublicationAmount] = useState(0);

  const handledPaymentRef = useRef(false);

  const {
    status: publicationPaymentStatus,

    paymentType: publicationPaymentType,
  } = usePaymentStatus({
    enabled: publicationOrderId !== "",

    orderId: publicationOrderId,
  });

  const refreshListing = useCallback(async () => {
    if (!normalizedListingId) {
      throw new Error("ID jasa tidak valid.");
    }

    const nextListing = await getMyServiceListingDetailService({
      listingId: normalizedListingId,
    });

    if (!nextListing) {
      throw new Error(
        "Jasa tidak ditemukan atau Anda tidak memiliki akses ke jasa ini.",
      );
    }

    setListing(nextListing);

    return nextListing;
  }, [normalizedListingId]);

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      setLoading(true);

      setErrorMessage(null);

      if (!normalizedListingId) {
        setListing(null);

        setMedia([]);

        setErrorMessage("ID jasa tidak valid.");

        setLoading(false);

        return;
      }

      try {
        const [nextListing, nextMedia] = await Promise.all([
          getMyServiceListingDetailService({
            listingId: normalizedListingId,
          }),

          getMyServiceListingMediaService(normalizedListingId),
        ]);

        if (cancelled) {
          return;
        }

        if (!nextListing) {
          setListing(null);

          setMedia([]);

          setErrorMessage(
            "Jasa tidak ditemukan atau Anda tidak memiliki akses ke jasa ini.",
          );

          return;
        }

        setListing(nextListing);

        setMedia(nextMedia);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("LOAD SERVICE LISTING PREVIEW ERROR:", error);

        setErrorMessage(
          error instanceof Error ? error.message : "Gagal memuat preview jasa.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [normalizedListingId]);

  useEffect(() => {
    if (
      !publicationOrderId ||
      publicationPaymentStatus === "PENDING" ||
      handledPaymentRef.current
    ) {
      return;
    }

    if (
      publicationPaymentType !== null &&
      publicationPaymentType !== "SERVICE_LISTING"
    ) {
      return;
    }

    handledPaymentRef.current = true;

    async function handleSettledPayment() {
      hidePayment();

      setActionInfoMessage(null);

      try {
        await refreshListing();

        switch (publicationPaymentStatus) {
          case "PAID":
            setActionErrorMessage(null);

            setActionSuccessMessage(
              "Pembayaran berhasil dikonfirmasi. Status publikasi jasa telah diperbarui.",
            );

            break;

          case "FAILED":
            setActionSuccessMessage(null);

            setActionErrorMessage(
              "Pembayaran gagal. Anda dapat mencoba publikasi kembali.",
            );

            break;

          case "EXPIRED":
            setActionSuccessMessage(null);

            setActionErrorMessage(
              "Sesi pembayaran sudah kedaluwarsa. Silakan mulai publikasi kembali.",
            );

            break;

          case "CANCELLED":
            setActionSuccessMessage(null);

            setActionErrorMessage(
              "Pembayaran dibatalkan. Anda dapat mencoba kembali.",
            );

            break;

          case "PENDING":
            break;
        }
      } catch (error) {
        console.error("REFRESH SERVICE LISTING AFTER PAYMENT ERROR:", error);

        setActionSuccessMessage(null);

        setActionErrorMessage(
          "Status pembayaran berubah, tetapi data jasa belum berhasil dimuat ulang.",
        );
      } finally {
        setPublicationOrderId("");

        setPublicationAmount(0);
      }
    }

    void handleSettledPayment();
  }, [
    hidePayment,
    publicationOrderId,
    publicationPaymentStatus,
    publicationPaymentType,
    refreshListing,
  ]);

  function clearActionFeedback() {
    setActionErrorMessage(null);

    setActionSuccessMessage(null);

    setActionInfoMessage(null);
  }

  async function refreshListingBestEffort() {
    try {
      await refreshListing();
    } catch (error) {
      console.error("REFRESH SERVICE LISTING AFTER PUBLICATION ERROR:", error);
    }
  }

  async function handlePublication() {
    if (!listing || !normalizedListingId || publicationBusy || lifecycleBusy) {
      return;
    }

    setPublicationBusy(true);

    clearActionFeedback();

    try {
      const result =
        await requestServiceListingPublicationClient(normalizedListingId);

      switch (result.kind) {
        case "FIRST_FREE_ACTIVATED":
          await refreshListing();

          setActionSuccessMessage(
            "Jasa berhasil dipublikasikan dan aktif selama 30 hari.",
          );

          return;

        case "PAYMENT_APPLIED":
          await refreshListing();

          setActionSuccessMessage(
            "Pembayaran sudah dikonfirmasi dan publikasi jasa telah diperbarui.",
          );

          return;

        case "PAYMENT_CREATING":
          await refreshListingBestEffort();

          setActionInfoMessage(
            "Sesi pembayaran sedang disiapkan. Coba lagi beberapa saat lagi untuk melanjutkan sesi pembayaran yang sama.",
          );

          return;

        case "PAYMENT_REQUIRED":
          handledPaymentRef.current = false;

          setPublicationOrderId(result.orderId);

          setPublicationAmount(result.amount);

          setActionInfoMessage(
            result.created
              ? "Sesi pembayaran berhasil dibuat. Selesaikan pembayaran untuk melanjutkan publikasi."
              : "Melanjutkan sesi pembayaran publikasi yang masih aktif.",
          );

          await refreshListingBestEffort();

          await openPayment({
            snapToken: result.snapToken,

            onSuccess() {
              setActionInfoMessage(
                "Pembayaran sedang dikonfirmasi oleh server.",
              );
            },

            onPending() {
              setActionInfoMessage(
                "Pembayaran masih menunggu penyelesaian atau konfirmasi.",
              );
            },

            onError() {
              setActionInfoMessage(
                "Status pembayaran akan dikonfirmasi kembali oleh server.",
              );
            },

            onClose() {
              setActionInfoMessage(
                "Pembayaran belum selesai. Anda dapat melanjutkan sesi yang sama selama masih aktif.",
              );
            },
          });

          return;
      }
    } catch (error) {
      console.error("SERVICE LISTING PUBLICATION ERROR:", error);

      setActionSuccessMessage(null);

      setActionInfoMessage(null);

      setActionErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal memproses publikasi jasa.",
      );
    } finally {
      setPublicationBusy(false);
    }
  }

  async function handlePause() {
    if (
      !listing ||
      !normalizedListingId ||
      publicationBusy ||
      lifecycleBusy ||
      listing.status !== ServiceListingStatus.ACTIVE
    ) {
      return;
    }

    setLifecycleBusy(true);

    clearActionFeedback();

    try {
      await pauseServiceListingService({
        listingId: normalizedListingId,
      });

      await refreshListing();

      setActionSuccessMessage(
        "Jasa berhasil dijeda. Masa aktif tetap berjalan selama jasa dijeda.",
      );
    } catch (error) {
      console.error("PAUSE SERVICE LISTING ERROR:", error);

      setActionErrorMessage(
        error instanceof Error ? error.message : "Gagal menjeda jasa.",
      );
    } finally {
      setLifecycleBusy(false);
    }
  }

  async function handleResume() {
    if (
      !listing ||
      !normalizedListingId ||
      publicationBusy ||
      lifecycleBusy ||
      listing.status !== ServiceListingStatus.PAUSED
    ) {
      return;
    }

    setLifecycleBusy(true);

    clearActionFeedback();

    try {
      await resumeServiceListingService({
        listingId: normalizedListingId,
      });

      await refreshListing();

      setActionSuccessMessage("Jasa berhasil diaktifkan kembali.");
    } catch (error) {
      console.error("RESUME SERVICE LISTING ERROR:", error);

      setActionErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal mengaktifkan kembali jasa.",
      );
    } finally {
      setLifecycleBusy(false);
    }
  }

  function handleBack() {
    if (publicationBusy || lifecycleBusy) {
      return;
    }

    router.back();
  }

  function handleEdit() {
    if (!normalizedListingId || publicationBusy || lifecycleBusy) {
      return;
    }

    router.push(`/my-services/${encodeURIComponent(normalizedListingId)}/edit`);
  }

  return {
    listing,

    media,

    loading,

    errorMessage,

    publicationBusy,

    lifecycleBusy,

    actionErrorMessage,

    actionSuccessMessage,

    actionInfoMessage,

    publicationAmount,

    publicationPaymentStatus: publicationOrderId
      ? publicationPaymentStatus
      : null,

    onBack: handleBack,

    onEdit: handleEdit,

    onPublication: handlePublication,

    onPause: handlePause,

    onResume: handleResume,
  };
}