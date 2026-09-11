"use client";

import type {
  FormEvent,
} from "react";

import {
  ArrowLeft,
  BriefcaseBusiness,
  ShieldCheck,
} from "lucide-react";

import ServiceListingForm from "./components/form/ServiceListingForm";

import type {
  ServiceModeValue,
} from "./constants/service-mode";

import type {
  ServiceListingFormValues,
} from "./types/service-listing-form.types";

import type {
  ProviderServiceListingMedia,
} from "./types/service-listing-media.types";

interface CreateServiceListingPageUIProps {
  values:
    ServiceListingFormValues;

  submitting: boolean;

  errorMessage:
    string
    | null;

  onBack:
    () => void;

  onSubmit:
    (
      event:
        FormEvent<HTMLFormElement>,
    ) => void;

  onTitleChange:
    (value: string) => void;

  onCategoryChange:
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

  onUnavailableMedia:
    () => void;
}

const EMPTY_MEDIA:
  ProviderServiceListingMedia[] =
    [];

export default function CreateServiceListingPageUI({
  values,
  submitting,
  errorMessage,
  onBack,
  onSubmit,
  onTitleChange,
  onCategoryChange,
  onDescriptionChange,
  onDeliverablesChange,
  onCustomerPreparationChange,
  onPriceFromChange,
  onNegotiableChange,
  onServiceModeChange,
  onLocationNameChange,
  onUnavailableMedia,
}: CreateServiceListingPageUIProps) {
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
            disabled={submitting}
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
            <ArrowLeft
              size={19}
              strokeWidth={2.2}
            />
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
              Tawarkan Jasa
            </h1>

            <p
              className="
                mt-0.5
                text-[11px]
                text-slate-500
              "
            >
              Buat draft jasa baru
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
              overflow-hidden
              rounded-[28px]
              bg-linear-to-br
              from-indigo-600
              via-indigo-600
              to-violet-600
              p-6
              text-white
              shadow-[0_20px_50px_rgba(79,70,229,0.20)]
              sm:p-8
            "
          >
            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                bg-white/15
                px-2.5
                py-1.5
                text-[10px]
                font-semibold
                ring-1
                ring-white/20
              "
            >
              <BriefcaseBusiness
                size={13}
                strokeWidth={2}
              />

              Jasa baru
            </span>

            <h2
              className="
                mt-3
                max-w-md
                text-xl
                font-bold
                tracking-tight
                sm:text-3xl
              "
            >
              Ubah keahlian Anda menjadi
              layanan yang mudah ditemukan
            </h2>

            <p
              className="
                mt-2
                max-w-lg
                text-[13px]
                leading-5
                text-indigo-100
              "
            >
              Jelaskan layanan, harga, cara
              pengerjaan, dan hasil yang akan
              diterima pelanggan.
            </p>

            <div
              className="
                mt-5
                flex
                items-start
                gap-2.5
                rounded-2xl
                bg-white/10
                p-3
                ring-1
                ring-white/10
              "
            >
              <ShieldCheck
                size={17}
                strokeWidth={2}
                className="
                  mt-0.5
                  shrink-0
                  text-indigo-100
                "
              />

              <p
                className="
                  text-[11px]
                  leading-5
                  text-indigo-100
                "
              >
                Membuat dan mengedit draft
                gratis. Biaya publikasi tidak
                diproses pada tahap ini.
              </p>
            </div>
          </div>
        </section>

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

        <ServiceListingForm
          formId="create-service-listing-form"
          values={values}
          loading={submitting}
          submitLabel="Simpan Draft"
          loadingLabel="Menyimpan draft..."
          media={EMPTY_MEDIA}
          mediaEnabled={false}
          mediaBusy={false}
          onTitleChange={
            onTitleChange
          }
          onCategoryChange={
            onCategoryChange
          }
          onDescriptionChange={
            onDescriptionChange
          }
          onDeliverablesChange={
            onDeliverablesChange
          }
          onCustomerPreparationChange={
            onCustomerPreparationChange
          }
          onPriceFromChange={
            onPriceFromChange
          }
          onNegotiableChange={
            onNegotiableChange
          }
          onServiceModeChange={
            onServiceModeChange
          }
          onLocationNameChange={
            onLocationNameChange
          }
          onSubmit={onSubmit}
          onUploadCover={
            onUnavailableMedia
          }
          onUploadPortfolio={
            onUnavailableMedia
          }
          onDeleteImage={
            onUnavailableMedia
          }
        />
      </div>
    </main>
  );
}