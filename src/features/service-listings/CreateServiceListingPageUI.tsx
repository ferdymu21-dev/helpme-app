"use client";

import type {
  FormEvent,
} from "react";

import {
  ArrowLeft,
  BriefcaseBusiness,
  ImagePlus,
  Rocket,
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
  onCustomCategoryChange,
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
    border-b
    border-slate-200/80
    bg-white/95
    backdrop-blur-xl
    sm:static
    sm:border-b-0
    sm:bg-transparent
    sm:backdrop-blur-none
  "
        >
          <div
            className="
      flex
      items-center
      gap-3
      px-4
      py-3
      sm:px-6
      sm:pt-8
    "
          >
            <button
              type="button"
              disabled={submitting}
              onClick={onBack}
              aria-label="Kembali"
              className="
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-xl
        border
        border-slate-200
        bg-white
        text-slate-600
        transition
        hover:border-slate-300
        hover:bg-slate-50
        hover:text-slate-950
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
            >
              <ArrowLeft size={17} strokeWidth={2} />
            </button>

            <div className="min-w-0">
              <h1
                className="
          text-base
          font-black
          tracking-tight
          text-slate-950
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
                Buat layanan baru
              </p>
            </div>
          </div>
        </header>

        <section
          className="
    px-4
    pb-4
    pt-5
    sm:px-6
    sm:pt-6
  "
        >
          <div
            className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-5
      shadow-sm
      sm:p-6
    "
          >
            <div
              className="
        flex
        flex-wrap
        items-center
        justify-between
        gap-2
      "
            >
              <span
                className="
          inline-flex
          items-center
          gap-1.5
          rounded-lg
          bg-indigo-50
          px-2.5
          py-1.5
          text-[10px]
          font-bold
          text-indigo-700
        "
              >
                <BriefcaseBusiness size={13} strokeWidth={2} />
                Draft baru
              </span>

              <span
                className="
          text-[10px]
          font-semibold
          text-slate-400
        "
              >
                Belum dipublikasikan
              </span>
            </div>

            <h2
              className="
        mt-4
        max-w-xl
        text-xl
        font-black
        tracking-tight
        text-slate-950
        sm:text-2xl
      "
            >
              Buat layanan yang jelas dan siap ditemukan pelanggan
            </h2>

            <p
              className="
        mt-2
        max-w-xl
        text-sm
        leading-6
        text-slate-500
      "
            >
              Lengkapi informasi utama terlebih dahulu. Foto, preview, dan
              publikasi dapat diatur setelah draft tersimpan.
            </p>

            <div
              className="
        mt-5
        grid
        grid-cols-3
        gap-2
      "
            >
              <div
                className="
          rounded-xl
          border
          border-indigo-200
          bg-indigo-50
          p-3
        "
              >
                <BriefcaseBusiness
                  aria-hidden="true"
                  className="
            h-4
            w-4
            text-indigo-600
          "
                />

                <p
                  className="
            mt-2
            text-[10px]
            font-black
            text-indigo-700
            sm:text-xs
          "
                >
                  1. Detail jasa
                </p>

                <p
                  className="
            mt-0.5
            hidden
            text-[10px]
            leading-4
            text-indigo-600
            sm:block
          "
                >
                  Lengkapi informasi layanan
                </p>
              </div>

              <div
                className="
          rounded-xl
          border
          border-slate-200
          bg-slate-50
          p-3
        "
              >
                <ImagePlus
                  aria-hidden="true"
                  className="
            h-4
            w-4
            text-slate-500
          "
                />

                <p
                  className="
            mt-2
            text-[10px]
            font-black
            text-slate-700
            sm:text-xs
          "
                >
                  2. Foto & preview
                </p>

                <p
                  className="
            mt-0.5
            hidden
            text-[10px]
            leading-4
            text-slate-500
            sm:block
          "
                >
                  Setelah draft tersimpan
                </p>
              </div>

              <div
                className="
          rounded-xl
          border
          border-slate-200
          bg-slate-50
          p-3
        "
              >
                <Rocket
                  aria-hidden="true"
                  className="
            h-4
            w-4
            text-slate-500
          "
                />

                <p
                  className="
            mt-2
            text-[10px]
            font-black
            text-slate-700
            sm:text-xs
          "
                >
                  3. Publikasikan
                </p>

                <p
                  className="
            mt-0.5
            hidden
            text-[10px]
            leading-4
            text-slate-500
            sm:block
          "
                >
                  Setelah layanan siap
                </p>
              </div>
            </div>

            <div
              className="
        mt-4
        flex
        items-start
        gap-2.5
        rounded-xl
        bg-slate-50
        px-3
        py-3
      "
            >
              <ShieldCheck
                aria-hidden="true"
                className="
          mt-0.5
          h-4
          w-4
          shrink-0
          text-slate-500
        "
              />

              <p
                className="text-[11px] leading-5 text-slate-500">
                Menyimpan draft gratis dan tidak memulai proses pembayaran atau
                publikasi.
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
          submitLabel="Simpan & Lanjut"
          loadingLabel="Menyimpan..."
          media={EMPTY_MEDIA}
          mediaEnabled={false}
          mediaBusy={false}
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
          onUploadCover={onUnavailableMedia}
          onUploadPortfolio={onUnavailableMedia}
          onDeleteImage={onUnavailableMedia}
        />
      </div>
    </main>
  );
}