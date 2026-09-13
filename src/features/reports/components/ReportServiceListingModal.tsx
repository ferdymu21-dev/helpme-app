"use client";

import {
  useState,
} from "react";

import {
  Flag,
  Loader2,
  X,
} from "lucide-react";

import { REPORT_REASONS } from "../constants/report-reasons";
import { submitServiceListingReport } from "../services/service-listing-report.service";

interface ReportServiceListingModalProps {
  open: boolean;

  serviceListingId: string;
  serviceTitle: string;

  onClose: () => void;
}

function getServiceReasonLabel(
  value: string,
  fallback: string,
) {
  if (
    value === "FAKE_TASK"
  ) {
    return "Jasa Palsu / Menyesatkan";
  }

  return fallback;
}

function getSubmitErrorMessage(
  error: unknown,
) {
  const message =
    error instanceof Error
      ? error.message
      : "";

  if (
    message.includes(
      "SERVICE_LISTING_REPORT_ALREADY_PENDING",
    )
  ) {
    return "Anda sudah memiliki laporan yang masih menunggu peninjauan untuk jasa ini.";
  }

  if (
    message.includes(
      "CANNOT_REPORT_OWN_SERVICE_LISTING",
    )
  ) {
    return "Anda tidak dapat melaporkan jasa milik sendiri.";
  }

  if (
    message.includes(
      "SERVICE_LISTING_NOT_REPORTABLE",
    )
  ) {
    return "Jasa ini sudah tidak tersedia untuk dilaporkan.";
  }

  if (
    message.includes(
      "UNAUTHORIZED",
    )
  ) {
    return "Silakan masuk ke akun terlebih dahulu untuk mengirim laporan.";
  }

  return "Laporan belum berhasil dikirim. Silakan coba lagi.";
}

export default function ReportServiceListingModal({
  open,
  serviceListingId,
  serviceTitle,
  onClose,
}: ReportServiceListingModalProps) {
  const [
    reason,
    setReason,
  ] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null,
    );

  if (!open) {
    return null;
  }

  function closeModal() {
    if (submitting) {
      return;
    }

    setReason("");
    setDescription("");
    setErrorMessage(null);

    onClose();
  }

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!reason.trim()) {
      setErrorMessage(
        "Pilih alasan laporan terlebih dahulu.",
      );

      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      await submitServiceListingReport(
        {
          serviceListingId,

          reason,

          description,
        },
      );

      window.alert(
        "Laporan jasa berhasil dikirim dan akan ditinjau oleh admin.",
      );

      setReason("");
      setDescription("");

      onClose();
    } catch (error) {
      setErrorMessage(
        getSubmitErrorMessage(
          error,
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-service-listing-title"
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-slate-950/50
        p-4
        backdrop-blur-sm
      "
    >
      <div
        className="
          max-h-[90vh]
          w-full
          max-w-lg
          overflow-y-auto
          rounded-3xl
          bg-white
          p-6
          shadow-2xl
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div>
            <div
              className="
                inline-flex
                h-10
                w-10
                items-center
                justify-center
                rounded-2xl
                bg-red-50
                text-red-600
              "
            >
              <Flag className="h-5 w-5" />
            </div>

            <h2
              id="report-service-listing-title"
              className="
                mt-4
                text-xl
                font-black
                text-slate-950
              "
            >
              Laporkan Jasa
            </h2>

            <p
              className="
                mt-1
                text-sm
                leading-6
                text-slate-500
              "
            >
              {serviceTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={submitting}
            aria-label="Tutup laporan"
            className="
              rounded-xl
              p-2
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
              disabled:opacity-50
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-6 space-y-5"
        >
          <div>
            <p
              className="
                text-sm
                font-bold
                text-slate-800
              "
            >
              Alasan laporan
            </p>

            <div
              className="
                mt-3
                grid
                grid-cols-2
                gap-2
              "
            >
              {REPORT_REASONS.map(
                (item) => (
                  <button
                    key={
                      item.value
                    }
                    type="button"
                    disabled={
                      submitting
                    }
                    onClick={() =>
                      setReason(
                        item.value,
                      )
                    }
                    className={`
                      rounded-xl
                      border
                      px-3
                      py-2.5
                      text-left
                      text-xs
                      font-semibold
                      transition

                      ${
                        reason ===
                        item.value
                          ? `
                              border-red-300
                              bg-red-50
                              text-red-700
                            `
                          : `
                              border-slate-200
                              bg-white
                              text-slate-600
                              hover:bg-slate-50
                            `
                      }
                    `}
                  >
                    {getServiceReasonLabel(
                      item.value,
                      item.label,
                    )}
                  </button>
                ),
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="service-listing-report-description"
              className="
                text-sm
                font-bold
                text-slate-800
              "
            >
              Keterangan tambahan
            </label>

            <textarea
              id="service-listing-report-description"
              value={
                description
              }
              disabled={
                submitting
              }
              onChange={(
                event,
              ) =>
                setDescription(
                  event.target
                    .value,
                )
              }
              placeholder="Jelaskan alasan atau konteks laporan..."
              className="
                mt-2
                min-h-32
                w-full
                resize-none
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                p-4
                text-sm
                leading-6
                outline-none
                transition
                focus:border-red-300
                focus:bg-white
                focus:ring-4
                focus:ring-red-50
                disabled:opacity-60
              "
            />
          </div>

          {errorMessage && (
            <p
              className="
                rounded-2xl
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-700
              "
            >
              {errorMessage}
            </p>
          )}

          <div
            className="
              flex
              justify-end
              gap-3
              border-t
              border-slate-100
              pt-5
            "
          >
            <button
              type="button"
              onClick={closeModal}
              disabled={
                submitting
              }
              className="
                h-11
                rounded-xl
                border
                border-slate-200
                px-5
                text-sm
                font-bold
                text-slate-600
                transition
                hover:bg-slate-50
                disabled:opacity-50
              "
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={
                submitting
              }
              className="
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-red-600
                px-5
                text-sm
                font-bold
                text-white
                transition
                hover:bg-red-700
                disabled:opacity-50
              "
            >
              {submitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              Kirim Laporan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}