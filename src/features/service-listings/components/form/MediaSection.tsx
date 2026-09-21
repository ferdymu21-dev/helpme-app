"use client";

import type { ChangeEvent } from "react";

import { ImagePlus, Images, Trash2 } from "lucide-react";

import { ServiceListingImageKind } from "../../constants/service-listing-image-kind";

import { ServiceListingConfig } from "../../constants/service-listing-config";

import type { ProviderServiceListingMedia } from "../../types/service-listing-media.types";

interface MediaSectionProps {
  media: ProviderServiceListingMedia[];

  enabled: boolean;

  disabled: boolean;

  busy: boolean;

  onUploadCover: (file: File) => void;

  onUploadPortfolio: (file: File) => void;

  onDeleteImage: (imageId: string) => void;
}

function getBackgroundImage(publicUrl: string) {
  return `url(${JSON.stringify(publicUrl)})`;
}

export default function MediaSection({
  media,
  enabled,
  disabled,
  busy,
  onUploadCover,
  onUploadPortfolio,
  onDeleteImage,
}: MediaSectionProps) {
  const cover =
    media.find((item) => item.kind === ServiceListingImageKind.COVER) ?? null;

  const portfolio = media
    .filter((item) => item.kind === ServiceListingImageKind.PORTFOLIO)
    .slice()
    .sort((first, second) => first.sortOrder - second.sortOrder);

  const portfolioFull =
    portfolio.length >= ServiceListingConfig.maxPortfolioImages;

  const mediaDisabled =
    disabled ||
    busy;

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    onUploadCover(file);
  }

  function handlePortfolioChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    onUploadPortfolio(file);
  }

  return (
    <section
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        sm:p-6
      "
    >
      <div>
        <p
          className="
      text-[10px]
      font-black
      tracking-[0.14em]
      text-indigo-600
      uppercase
    "
        >
          Foto Jasa
        </p>

        <h2
          className="
      mt-1
      text-base
      font-black
      tracking-tight
      text-slate-950
    "
        >
          Tampilkan kualitas layanan Anda
        </h2>

        <p
          className="
      mt-0.5
      text-[11px]
      leading-4
      text-slate-500
    "
        >
          Tambahkan cover dan portfolio untuk membantu pelanggan mengenali hasil
          pekerjaan Anda.
        </p>
      </div>

      {!enabled && (
        <div
          className="
      mt-6
      overflow-hidden
      rounded-2xl
      border
      border-indigo-100
      bg-indigo-50/50
    "
        >
          <div
            className="
        p-5
        text-center
        sm:p-6
      "
          >
            <div
              className="
          mx-auto
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-white
          text-xl
          shadow-sm
          ring-1
          ring-indigo-100
        "
              aria-hidden="true"
            >
              🖼️
            </div>

            <h3
              className="
          mt-4
          text-sm
          font-black
          text-slate-900
        "
            >
              Upload foto tersedia setelah draft
              tersimpan
            </h3>

            <p
              className="
          mx-auto
          mt-1.5
          max-w-sm
          text-xs
          leading-5
          text-slate-500
        "
            >
              Selesaikan informasi jasa terlebih
              dahulu. Setelah disimpan, Anda akan
              diarahkan ke tahap berikutnya untuk
              menambahkan cover dan portfolio.
            </p>
          </div>

          <div
            className="
        grid
        grid-cols-2
        border-t
        border-indigo-100
        bg-white/70
      "
          >
            <div
              className="
          border-r
          border-indigo-100
          p-4
        "
            >
              <p
                className="
            text-xs
            font-bold
            text-slate-800
          "
              >
                Cover
              </p>

              <p
                className="
            mt-1
            text-[10px]
            leading-4
            text-slate-500
          "
              >
                Digunakan sebagai foto utama jasa.
              </p>

              <span
                className="
            mt-2
            inline-block
            text-[9px]
            font-bold
            text-indigo-600
          "
              >
                Diperlukan sebelum publikasi
              </span>
            </div>

            <div className="p-4">
              <p
                className="
            text-xs
            font-bold
            text-slate-800
          "
              >
                Portfolio
              </p>

              <p
                className="
            mt-1
            text-[10px]
            leading-4
            text-slate-500
          "
              >
                Tampilkan beberapa contoh hasil pekerjaan.
              </p>

              <span
                className="
            mt-2
            inline-block
            text-[9px]
            font-bold
            text-slate-400
          "
              >
                Opsional
              </span>
            </div>
          </div>
        </div>
      )}

      {enabled && (
        <>
          <div className="mt-6">
            <div
              className="
            flex
            items-center
            justify-between
            gap-3
          "
            >
              <div>
                <h3
                  className="
                text-sm
                font-bold
                text-slate-900
              "
                >
                  Cover
                </h3>

                <p
                  className="
                mt-0.5
                text-xs
                text-slate-500
              "
                >
                  Maksimal 5 MB · JPG, PNG, WEBP
                </p>
              </div>

              <label
                htmlFor="service-cover-upload"
                className={`
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              px-4
              text-xs
              font-bold
              transition

              ${
                enabled &&
                  !mediaDisabled
                  ? `
                    cursor-pointer
                    bg-indigo-600
                    text-white
                    hover:bg-indigo-700
                  `
                  : `
                    cursor-not-allowed
                    bg-slate-100
                    text-slate-400
                  `
              }
            `}
              >
                <ImagePlus size={16} strokeWidth={2} />

                {cover ? "Ganti cover" : "Tambah cover"}
              </label>

              <input
                id="service-cover-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={
                  !enabled ||
                  mediaDisabled
                }
                onChange={handleCoverChange}
                className="hidden"
              />
            </div>

            <div
              className="
            mt-3
            overflow-hidden
            rounded-2xl
            border
            border-dashed
            border-slate-200
            bg-slate-50
          "
            >
              {cover ? (
                <div className="relative">
                  <div
                    role="img"
                    aria-label="Cover jasa"
                    style={{
                      backgroundImage: getBackgroundImage(cover.publicUrl),
                    }}
                    className="
                  aspect-video
                  w-full
                  bg-slate-100
                  bg-cover
                  bg-center
                "
                  />

                  <button
                    type="button"
                    disabled={mediaDisabled}
                    onClick={() => onDeleteImage(cover.id)}
                    className="
                  absolute
                  right-3
                  top-3
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-white/95
                  text-rose-600
                  shadow-md
                  backdrop-blur
                  transition
                  hover:bg-white
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                    aria-label="Hapus cover jasa"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              ) : (
                <div
                  className="
                flex
                aspect-video
                flex-col
                items-center
                justify-center
                p-6
                text-center
              "
                >
                  <span
                    className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white
                  text-slate-400
                  shadow-sm
                "
                  >
                    <ImagePlus size={21} strokeWidth={1.8} />
                  </span>

                  <p
                    className="
                  mt-3
                  text-sm
                  font-semibold
                  text-slate-600
                "
                  >
                    Belum ada cover
                  </p>

                  <p
                    className="
                  mt-1
                  max-w-xs
                  text-xs
                  leading-5
                  text-slate-400
                "
                  >
                    Gunakan foto yang mewakili layanan atau hasil pekerjaan
                    Anda.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            className="
          mt-7
          border-t
          border-slate-100
          pt-6
        "
          >
            <div
              className="
            flex
            items-center
            justify-between
            gap-3
          "
            >
              <div>
                <h3
                  className="
                text-sm
                font-bold
                text-slate-900
              "
                >
                  Portfolio
                </h3>

                <p
                  className="
                mt-0.5
                text-xs
                text-slate-500
              "
                >
                  {portfolio.length}
                  {" / "}
                  {ServiceListingConfig.maxPortfolioImages}
                  {" foto"}
                </p>
              </div>

              <label
                htmlFor="service-portfolio-upload"
                className={`
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              px-4
              text-xs
              font-bold
              transition

              ${
                enabled &&
                  !mediaDisabled &&
                  !portfolioFull
                  ? `
                    cursor-pointer
                    border
                    border-slate-200
                    bg-white
                    text-slate-700
                    hover:border-indigo-200
                    hover:text-indigo-700
                  `
                  : `
                    cursor-not-allowed
                    border
                    border-slate-100
                    bg-slate-50
                    text-slate-400
                  `
              }
            `}
              >
                <Images size={16} strokeWidth={2} />
                Tambah foto
              </label>

              <input
                id="service-portfolio-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={
                  !enabled ||
                  mediaDisabled ||
                  portfolioFull
                }
                onChange={handlePortfolioChange}
                className="hidden"
              />
            </div>

            {portfolio.length > 0 ? (
              <div
                className="
              mt-4
              grid
              grid-cols-2
              gap-3
              sm:grid-cols-3
            "
              >
                {portfolio.map((image) => (
                  <div
                    key={image.id}
                    className="
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-100
                  "
                  >
                    <div
                      role="img"
                      aria-label={`Portfolio jasa ${image.sortOrder + 1}`}
                      style={{
                        backgroundImage: getBackgroundImage(image.publicUrl),
                      }}
                      className="
                      aspect-square
                      w-full
                      bg-cover
                      bg-center
                    "
                    />

                    <button
                      type="button"
                      disabled={mediaDisabled}
                      onClick={() => onDeleteImage(image.id)}
                      className="
                      absolute
                      right-2
                      top-2
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      bg-white/95
                      text-rose-600
                      shadow
                      transition
                      hover:bg-white
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                      aria-label="Hapus foto portfolio"
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="
              mt-4
              rounded-2xl
              border
              border-dashed
              border-slate-200
              bg-slate-50/70
              p-5
              text-center
            "
              >
                <p
                  className="
                text-xs
                leading-5
                text-slate-500
              "
                >
                  Tambahkan hingga {ServiceListingConfig.maxPortfolioImages}{" "}
                  foto untuk menunjukkan contoh hasil pekerjaan Anda.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}