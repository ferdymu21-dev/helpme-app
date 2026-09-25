"use client";

import type {
  FormEvent,
} from "react";

import {
  ArrowLeft,
  CircleAlert,
  PencilLine,
} from "lucide-react";

import ServiceListingForm from "./components/form/ServiceListingForm";

import {
  ServiceListingStatus,
} from "./constants/service-listing-status";

import type {
  ServiceModeValue,
} from "./constants/service-mode";

import type {
  ServiceListingFormValues,
} from "./types/service-listing-form.types";

import type {
  ProviderServiceListingMedia,
} from "./types/service-listing-media.types";

import type {
  ProviderServiceListing,
} from "./types/service-listing-read.types";

interface EditServiceListingPageUIProps {
  listing:
    ProviderServiceListing
    | null;

  values:
    ServiceListingFormValues;

  media:
    ProviderServiceListingMedia[];

  loading: boolean;

  saving: boolean;

  mediaBusy: boolean;

  editingDisabled: boolean;

  hasUnsavedChanges: boolean;

  errorMessage:
    string
    | null;

  successMessage:
    string
    | null;

  onBack:
    () => void;

  onPreview:
    () => void;

  onSubmit:
    (
      event:
        FormEvent<HTMLFormElement>,
    ) => void;

  onUploadCover:
    (file: File) => void;

  onUploadPortfolio:
    (file: File) => void;

  onDeleteImage:
    (imageId: string) => void;

  onTitleChange:
    (value: string) => void;

  onCategoryChange:
    (value: string) => void;

  onCustomCategoryChange:
    (value: string) => void;

  onDescriptionChange:
    (value: string) => void;

  onDeliverablesChange:
    (value: string) => void;

  onCustomerPreparationChange:
    (value: string) => void;

  onPriceFromChange:
    (value: string) => void;

  onNegotiableChange:
    (value: boolean) => void;

  onServiceModeChange:
    (value: ServiceModeValue) => void;

  onLocationNameChange:
    (value: string) => void;
}

function getStatusLabel(
  status:
    ProviderServiceListing["status"],
): string {
  switch (
    status
  ) {
    case ServiceListingStatus.DRAFT:
      return "Draft";

    case ServiceListingStatus.PAYMENT_PENDING:
      return "Menunggu Publikasi";

    case ServiceListingStatus.ACTIVE:
      return "Aktif";

    case ServiceListingStatus.PAUSED:
      return "Dijeda";

    case ServiceListingStatus.EXPIRED:
      return "Kedaluwarsa";

    case ServiceListingStatus.BLOCKED:
      return "Diblokir";

    case ServiceListingStatus.ARCHIVED:
      return "Diarsipkan";
  }
}

export default function EditServiceListingPageUI({
  listing,
  values,
  media,
  loading,
  saving,
  mediaBusy,
  editingDisabled,
  hasUnsavedChanges,
  errorMessage,
  successMessage,
  onBack,
  onPreview,
  onSubmit,
  onUploadCover,
  onUploadPortfolio,
  onDeleteImage,
  onTitleChange,
  onCategoryChange,
  onCustomCategoryChange,
  onDescriptionChange,
  onDeliverablesChange,
  onCustomerPreparationChange,
  onPriceFromChange,
  onNegotiableChange,
  onServiceModeChange,
  onLocationNameChange,
}: EditServiceListingPageUIProps) {
  if (
    loading
  ) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-slate-50/70
          px-4
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              h-8
              w-8
              animate-spin
              rounded-full
              border-2
              border-slate-200
              border-t-indigo-600
            "
          />

          <p
            className="
              mt-3
              text-sm
              text-slate-500
            "
          >
            Memuat jasa...
          </p>
        </div>
      </main>
    );
  }

  if (
    !listing
  ) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-slate-50/70
          px-4
        "
      >
        <div
          className="
            w-full
            max-w-md
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-6
            text-center
            shadow-sm
          "
        >
          <span
            className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-rose-50
              text-rose-600
            "
          >
            <CircleAlert
              size={22}
              strokeWidth={2}
            />
          </span>

          <h1
            className="
              mt-4
              text-lg
              font-bold
              text-slate-900
            "
          >
            Jasa tidak dapat dibuka
          </h1>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-500
            "
          >
            {errorMessage ??
              "Jasa tidak ditemukan atau Anda tidak memiliki akses."}
          </p>

          <button
            type="button"
            onClick={onBack}
            className="
              mt-5
              h-11
              rounded-xl
              bg-slate-900
              px-5
              text-sm
              font-bold
              text-white
              transition
              hover:bg-slate-800
            "
          >
            Kembali
          </button>
        </div>
      </main>
    );
  }

  const operationBusy =
    saving ||
    mediaBusy;

  return (
    <main
      className="
        min-h-screen
        bg-slate-50/70
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-3xl
        "
      >
        <header
          className="
            sticky
            top-0
            z-30
            flex
            items-center
            border-b
            border-slate-200/80
            bg-white/90
            px-4
            py-3
            backdrop-blur-xl
            sm:static
            sm:border-b-0
            sm:bg-transparent
            sm:px-6
            sm:pt-8
            sm:backdrop-blur-none
          "
        >
          <button
            type="button"
            disabled={operationBusy}
            onClick={onBack}
            aria-label="Kembali"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-slate-200
              bg-white
              text-slate-700
              shadow-sm
              transition
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <ArrowLeft size={19} strokeWidth={2.2} />
          </button>

          <div
            className="
              min-w-0
              flex-1
              px-3
              text-center
            "
          >
            <h1
              className="
                text-[15px]
                font-bold
                text-slate-900
              "
            >
              Edit Jasa
            </h1>

            <p
              className="
                mt-0.5
                text-[11px]
                text-slate-500
              "
            >
              {getStatusLabel(listing.status)}
            </p>
          </div>

          <div className="h-10 w-10" />
        </header>

        <section
          className="
            px-4
            pb-4
            pt-5
            sm:px-6
            sm:pt-8
          "
        >
          <div
            className="
              rounded-[28px]
              border
              border-slate-200/80
              bg-white
              p-5
              shadow-sm
              sm:p-6
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <span
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-50
                  text-indigo-600
                "
              >
                <PencilLine size={18} strokeWidth={2} />
              </span>

              <div>
                <h2
                  className="
                    text-base
                    font-bold
                    text-slate-900
                  "
                >
                  Perbarui informasi jasa
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-5
                    text-slate-500
                  "
                >
                  Perubahan konten tidak mengubah masa publikasi atau status
                  jasa.
                </p>
              </div>
            </div>
          </div>
        </section>

        {hasUnsavedChanges && !editingDisabled && (
          <div
            className="
        px-4
        pb-4
        sm:px-6
      "
            role="status"
            aria-live="polite"
          >
            <div
              className="
          rounded-2xl
          border
          border-amber-200
          bg-amber-50
          px-4
          py-3
        "
            >
              <p
                className="
            text-sm
            font-bold
            text-amber-900
          "
              >
                Ada perubahan yang belum disimpan
              </p>

              <p
                className="
            mt-1
            text-xs
            leading-5
            text-amber-700
          "
              >
                Simpan perubahan, lalu lanjutkan ke Kelola & Publikasikan untuk mengecek dan mempublikasikan jasa.
              </p>
            </div>
          </div>
        )}

        {editingDisabled && (
          <div
            className="
              px-4
              pb-4
              sm:px-6
            "
            role="alert"
          >
            <div
              className="
                rounded-2xl
                border
                border-amber-200
                bg-amber-50
                px-4
                py-3
              "
            >
              <p
                className="
                  text-sm
                  font-bold
                  text-amber-900
                "
              >
                Jasa tidak dapat diedit
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-amber-700
                "
              >
                Jasa dengan status {getStatusLabel(listing.status)} tidak dapat
                mengubah konten atau media.
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div
            className="
              px-4
              pb-4
              sm:px-6
            "
            role="alert"
            aria-live="polite"
          >
            <div
              className="
                rounded-2xl
                border
                border-rose-200
                bg-rose-50
                px-4
                py-3
                text-sm
                leading-5
                text-rose-700
              "
            >
              {errorMessage}
            </div>
          </div>
        )}

        {successMessage && (
          <div
            className="
              px-4
              pb-4
              sm:px-6
            "
            role="status"
            aria-live="polite"
          >
            <div
              className="
                rounded-2xl
                border
                border-emerald-200
                bg-emerald-50
                px-4
                py-3
                text-sm
                leading-5
                text-emerald-700
              "
            >
              {successMessage}
            </div>
          </div>
        )}

        <ServiceListingForm
          formId="edit-service-listing-form"
          values={values}
          loading={saving}
          disabled={editingDisabled}
          submitLabel="Simpan Perubahan"
          loadingLabel="Menyimpan perubahan..."
          media={media}
          mediaEnabled
          mediaBusy={mediaBusy}
          onTitleChange={onTitleChange}
          onCategoryChange={onCategoryChange}
          onCustomCategoryChange={
            onCustomCategoryChange
          }
          onDescriptionChange={onDescriptionChange}
          onDeliverablesChange={onDeliverablesChange}
          onCustomerPreparationChange={onCustomerPreparationChange}
          onPriceFromChange={onPriceFromChange}
          onNegotiableChange={onNegotiableChange}
          onServiceModeChange={onServiceModeChange}
          onLocationNameChange={onLocationNameChange}
          onSubmit={onSubmit}
          onUploadCover={onUploadCover}
          onUploadPortfolio={onUploadPortfolio}
          onDeleteImage={onDeleteImage}
          previewLabel="Kelola & Publikasikan"
          onPreview={onPreview}
        />
      </div>
    </main>
  );
}