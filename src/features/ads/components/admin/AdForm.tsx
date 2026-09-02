"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

import type {
  Ad,
  AdPosition,
} from "../../types/ad.types";

interface AdFormProps {
  ad?: Ad | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const fieldClassName = `
  h-12
  w-full
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4
  text-sm
  text-slate-900
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-indigo-400
  focus:ring-4
  focus:ring-indigo-50
`;

const textareaClassName = `
  w-full
  resize-none
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4
  py-3
  text-sm
  leading-6
  text-slate-900
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-indigo-400
  focus:ring-4
  focus:ring-indigo-50
`;

function toDatetimeLocal(
  value: string | null,
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset =
    date.getTimezoneOffset();

  const localDate = new Date(
    date.getTime() -
      offset * 60 * 1000,
  );

  return localDate
    .toISOString()
    .slice(0, 16);
}

function formatSchedulePreview(
  value: string,
) {
  if (!value) {
    return "Tidak diatur";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tidak valid";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function getPositionLabel(
  value: AdPosition,
) {
  return value === "home_desktop"
    ? "Home Desktop"
    : "Home Mobile";
}

export default function AdForm({
  ad,
  onSuccess,
  onCancel,
}: AdFormProps) {
  const isEditMode = Boolean(ad);

  const [title, setTitle] =
    useState(ad?.title ?? "");

  const [
    description,
    setDescription,
  ] = useState(
    ad?.description ?? "",
  );

  const [imageUrl] = useState(
    ad?.image_url ?? "",
  );

  const [
    imageFile,
    setImageFile,
  ] = useState<File | null>(
    null,
  );

  const [
    imagePreviewUrl,
    setImagePreviewUrl,
  ] = useState<string | null>(
    null,
  );

  const [
    imagePreviewFailed,
    setImagePreviewFailed,
  ] = useState(false);

  const [
    buttonText,
    setButtonText,
  ] = useState(
    ad?.button_text ??
      "Lihat Promo",
  );

  const [linkUrl, setLinkUrl] =
    useState(
      ad?.link_url ?? "",
    );

  const [position, setPosition] =
    useState<AdPosition>(
      ad?.position ??
        "home_desktop",
    );

  const [isActive, setIsActive] =
    useState(
      ad?.is_active ?? true,
    );

  const [startAt, setStartAt] =
    useState(
      toDatetimeLocal(
        ad?.start_at ?? null,
      ),
    );

  const [endAt, setEndAt] =
    useState(
      toDatetimeLocal(
        ad?.end_at ?? null,
      ),
    );

  const [
    sortOrder,
    setSortOrder,
  ] = useState(
    String(
      ad?.sort_order ?? 0,
    ),
  );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const previewImageUrl =
    imagePreviewUrl ?? imageUrl;

  async function uploadImage(
    file: File,
  ) {
    const formData =
      new FormData();

    formData.append(
      "file",
      file,
    );

    const response = await fetch(
      "/api/ads/upload",
      {
        method: "POST",
        body: formData,
      },
    );

    const data =
      await response.json();

    if (!response.ok) {
      if (
        response.status === 401
      ) {
        throw new Error(
          "Anda belum login.",
        );
      }

      if (
        response.status === 403
      ) {
        throw new Error(
          "Anda tidak memiliki akses admin.",
        );
      }

      throw new Error(
        data?.message ??
          "Gagal mengupload gambar.",
      );
    }

    return data.publicUrl as string;
  }

  function handleImageChange(
    file: File | null,
  ) {
    setImageFile(file);
    setImagePreviewFailed(false);

    if (!file) {
      setImagePreviewUrl(null);

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result ===
        "string"
      ) {
        setImagePreviewUrl(
          reader.result,
        );
      }
    };

    reader.readAsDataURL(file);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const oldImageUrl =
        isEditMode
          ? (ad?.image_url ??
            null)
          : null;

      let finalImageUrl =
        imageUrl;

      if (
        !isEditMode &&
        !imageFile
      ) {
        throw new Error(
          "Gambar iklan wajib dipilih.",
        );
      }

      if (imageFile) {
        finalImageUrl =
          await uploadImage(
            imageFile,
          );
      }

      if (!finalImageUrl) {
        throw new Error(
          "Gambar iklan wajib dipilih.",
        );
      }

      const payload = {
        title,

        description:
          description.trim() ||
          null,

        image_url:
          finalImageUrl,

        button_text:
          buttonText,

        link_url: linkUrl,

        position,

        is_active: isActive,

        start_at: startAt
          ? new Date(
              startAt,
            ).toISOString()
          : null,

        end_at: endAt
          ? new Date(
              endAt,
            ).toISOString()
          : null,

        sort_order:
          Number(sortOrder) || 0,
      };

      const response =
        await fetch(
          isEditMode
            ? `/api/ads/${ad?.id}`
            : "/api/ads",
          {
            method:
              isEditMode
                ? "PUT"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload,
              ),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        if (
          response.status ===
          401
        ) {
          throw new Error(
            "Anda belum login.",
          );
        }

        if (
          response.status ===
          403
        ) {
          throw new Error(
            "Anda tidak memiliki akses admin.",
          );
        }

        if (
          response.status ===
          404
        ) {
          throw new Error(
            "Iklan tidak ditemukan.",
          );
        }

        if (
          response.status ===
            400 &&
          data?.errors
            ?.fieldErrors
        ) {
          const fieldErrors =
            data.errors
              .fieldErrors;

          const firstError =
            Object.values(
              fieldErrors,
            )
              .flat()
              .find(
                (message) =>
                  typeof message ===
                  "string",
              );

          throw new Error(
            firstError ??
              "Data iklan tidak valid.",
          );
        }

        throw new Error(
          data?.message ??
            (isEditMode
              ? "Gagal memperbarui iklan."
              : "Gagal membuat iklan."),
        );
      }

      /*
       * Hapus gambar lama HANYA jika:
       * - sedang edit
       * - admin memilih gambar baru
       * - PUT berhasil
       */
      if (
        isEditMode &&
        imageFile &&
        oldImageUrl &&
        oldImageUrl !==
          finalImageUrl
      ) {
        try {
          const deleteImageResponse =
            await fetch(
              "/api/ads/image",
              {
                method:
                  "DELETE",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify({
                    imageUrl:
                      oldImageUrl,
                  }),
              },
            );

          if (
            !deleteImageResponse.ok
          ) {
            console.error(
              "Gambar lama berhasil diabaikan dari proses update, tetapi gagal dihapus dari storage.",
            );
          }
        } catch (
          deleteImageError
        ) {
          console.error(
            "Gagal menghapus gambar lama:",
            deleteImageError,
          );
        }
      }

      onSuccess();
    } catch (error) {
      console.error(
        isEditMode
          ? "Update ad error:"
          : "Create ad error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Gagal memperbarui iklan."
            : "Gagal membuat iklan.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* HEADER */}

      <section className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900 disabled:opacity-50"
          >
            <span aria-hidden="true">
              ←
            </span>

            Kembali ke iklan
          </button>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            {isEditMode
              ? "Edit Advertising"
              : "New Advertising"}
          </p>

          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            {isEditMode
              ? "Edit Iklan"
              : "Buat Iklan Baru"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {isEditMode
              ? "Perbarui konten, penempatan, dan jadwal penayangan iklan."
              : "Siapkan materi promosi dan tentukan bagaimana iklan ditampilkan kepada pengguna HelpMe."}
          </p>
        </div>

        <div className="hidden items-center gap-2 xl:flex">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isActive
                ? "bg-emerald-500"
                : "bg-slate-400"
            }`}
          />

          <span className="text-sm font-bold text-slate-600">
            {isActive
              ? "Iklan aktif"
              : "Iklan nonaktif"}
          </span>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-bold text-red-800">
            Iklan belum dapat
            disimpan
          </p>

          <p className="mt-1 text-sm text-red-700">
            {error}
          </p>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">

        {/* LEFT */}
        <div className="space-y-6">

          {/* CONTENT */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm font-black text-indigo-600">
                01
              </div>

              <h2 className="mt-4 text-lg font-black text-slate-950">
                Konten Iklan
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Informasi utama
                yang akan dilihat
                pengguna pada
                materi promosi.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="ad-title"
                    className="text-sm font-bold text-slate-800"
                  >
                    Judul iklan
                  </label>

                  <span className="text-xs text-slate-400">
                    {title.length}/150
                  </span>
                </div>

                <input
                  id="ad-title"
                  type="text"
                  value={title}
                  onChange={(
                    event,
                  ) =>
                    setTitle(
                      event.target
                        .value,
                    )
                  }
                  maxLength={150}
                  required
                  placeholder="Contoh: Promo Spesial HelpMe"
                  className={
                    fieldClassName
                  }
                />

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Gunakan judul
                  singkat yang
                  menjelaskan isi
                  promosi.
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="ad-description"
                    className="text-sm font-bold text-slate-800"
                  >
                    Deskripsi
                  </label>

                  <span className="text-xs text-slate-400">
                    {
                      description.length
                    }
                    /500
                  </span>
                </div>

                <textarea
                  id="ad-description"
                  value={
                    description
                  }
                  onChange={(
                    event,
                  ) =>
                    setDescription(
                      event.target
                        .value,
                    )
                  }
                  maxLength={500}
                  rows={4}
                  placeholder="Tambahkan informasi singkat mengenai promo atau penawaran."
                  className={
                    textareaClassName
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="ad-image-file"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Materi gambar
                </label>

                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                  <input
                    id="ad-image-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    required={
                      !isEditMode
                    }
                    onChange={(
                      event,
                    ) =>
                      handleImageChange(
                        event.target
                          .files?.[0] ??
                          null,
                      )
                    }
                    className="
                      block
                      w-full
                      text-sm
                      text-slate-600
                      file:mr-4
                      file:rounded-lg
                      file:border-0
                      file:bg-indigo-600
                      file:px-4
                      file:py-2.5
                      file:text-sm
                      file:font-bold
                      file:text-white
                      hover:file:bg-indigo-700
                    "
                  />

                  <div className="mt-4 flex flex-col gap-1 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      JPG, PNG,
                      atau WebP.
                      Maksimal 5 MB.
                    </span>

                    {isEditMode && (
                      <span>
                        Kosongkan
                        jika gambar
                        tidak ingin
                        diganti.
                      </span>
                    )}
                  </div>

                  {imageFile && (
                    <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                      <p className="text-xs font-bold text-indigo-700">
                        Gambar baru
                        dipilih
                      </p>

                      <p className="mt-1 truncate text-xs text-indigo-600">
                        {
                          imageFile.name
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm font-black text-indigo-600">
                02
              </div>

              <h2 className="mt-4 text-lg font-black text-slate-950">
                Tujuan & CTA
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Tentukan teks
                ajakan dan halaman
                yang dibuka ketika
                pengguna memilih
                iklan.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="ad-button-text"
                    className="text-sm font-bold text-slate-800"
                  >
                    Teks tombol
                  </label>

                  <span className="text-xs text-slate-400">
                    {
                      buttonText.length
                    }
                    /50
                  </span>
                </div>

                <input
                  id="ad-button-text"
                  type="text"
                  value={
                    buttonText
                  }
                  onChange={(
                    event,
                  ) =>
                    setButtonText(
                      event.target
                        .value,
                    )
                  }
                  maxLength={50}
                  required
                  placeholder="Lihat Promo"
                  className={
                    fieldClassName
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="ad-link-url"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Link tujuan
                </label>

                <input
                  id="ad-link-url"
                  type="url"
                  value={linkUrl}
                  onChange={(
                    event,
                  ) =>
                    setLinkUrl(
                      event.target
                        .value,
                    )
                  }
                  required
                  className={
                    fieldClassName
                  }
                  placeholder="https://..."
                />

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Pengguna akan
                  diarahkan ke link
                  ini setelah
                  menekan CTA.
                </p>
              </div>
            </div>
          </section>

          {/* PLACEMENT */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm font-black text-indigo-600">
                03
              </div>

              <h2 className="mt-4 text-lg font-black text-slate-950">
                Penempatan
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Pilih lokasi
                penayangan dan
                prioritas urutan
                iklan.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <label
                  htmlFor="ad-position"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Penempatan
                </label>

                <select
                  id="ad-position"
                  value={position}
                  onChange={(
                    event,
                  ) =>
                    setPosition(
                      event.target
                        .value as AdPosition,
                    )
                  }
                  className={
                    fieldClassName
                  }
                >
                  <option value="home_desktop">
                    Home Desktop
                  </option>

                  <option value="home_mobile">
                    Home Mobile
                  </option>
                </select>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Tentukan versi
                  halaman Home yang
                  menampilkan iklan.
                </p>
              </div>

              <div>
                <label
                  htmlFor="ad-sort-order"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Urutan tampil
                </label>

                <input
                  id="ad-sort-order"
                  type="number"
                  min={0}
                  step={1}
                  value={
                    sortOrder
                  }
                  onChange={(
                    event,
                  ) =>
                    setSortOrder(
                      event.target
                        .value,
                    )
                  }
                  className={
                    fieldClassName
                  }
                />

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Angka lebih kecil
                  memiliki prioritas
                  urutan lebih awal.
                </p>
              </div>
            </div>
          </section>

          {/* SCHEDULE */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm font-black text-indigo-600">
                04
              </div>

              <h2 className="mt-4 text-lg font-black text-slate-950">
                Jadwal & Status
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Atur kapan iklan
                dapat ditampilkan
                dan apakah iklan
                diaktifkan.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <label
                  htmlFor="ad-start-at"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Mulai tayang
                </label>

                <input
                  id="ad-start-at"
                  type="datetime-local"
                  value={startAt}
                  onChange={(
                    event,
                  ) =>
                    setStartAt(
                      event.target
                        .value,
                    )
                  }
                  className={
                    fieldClassName
                  }
                />

                <p className="mt-2 text-xs text-slate-400">
                  Kosongkan untuk
                  mulai tanpa jadwal
                  khusus.
                </p>
              </div>

              <div>
                <label
                  htmlFor="ad-end-at"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Berakhir
                </label>

                <input
                  id="ad-end-at"
                  type="datetime-local"
                  value={endAt}
                  onChange={(
                    event,
                  ) =>
                    setEndAt(
                      event.target
                        .value,
                    )
                  }
                  className={
                    fieldClassName
                  }
                />

                <p className="mt-2 text-xs text-slate-400">
                  Kosongkan jika
                  tidak ada tanggal
                  berakhir.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="flex cursor-pointer items-start justify-between gap-5">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    Aktifkan iklan
                  </p>

                  <p className="mt-1 max-w-lg text-xs leading-5 text-slate-500">
                    Iklan hanya
                    dapat ditampilkan
                    jika status aktif
                    dan jadwal
                    penayangannya
                    memenuhi waktu
                    yang ditentukan.
                  </p>
                </div>

                <span className="relative mt-1 inline-flex shrink-0">
                  <input
                    type="checkbox"
                    checked={
                      isActive
                    }
                    onChange={(
                      event,
                    ) =>
                      setIsActive(
                        event.target
                          .checked,
                      )
                    }
                    className="peer sr-only"
                  />

                  <span
                    className="
                      h-6
                      w-11
                      rounded-full
                      bg-slate-300
                      transition
                      peer-checked:bg-indigo-600
                      peer-focus-visible:ring-4
                      peer-focus-visible:ring-indigo-100
                      after:absolute
                      after:left-0.5
                      after:top-0.5
                      after:h-5
                      after:w-5
                      after:rounded-full
                      after:bg-white
                      after:shadow-sm
                      after:transition
                      after:content-['']
                      peer-checked:after:translate-x-5
                    "
                  />
                </span>
              </label>
            </div>
          </section>
        </div>

        {/* RIGHT */}

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          {/* PREVIEW */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-sm font-black text-slate-900">
                Preview Materi
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Gambaran konten
                yang sedang
                disiapkan.
              </p>
            </div>

            <div className="p-5">
              <div
                className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 ${
                  position ===
                  "home_desktop"
                    ? "aspect-16/7"
                    : "aspect-video"
                }`}
              >
                {previewImageUrl &&
                !imagePreviewFailed ? (
                  <Image
                    src={
                      previewImageUrl
                    }
                    alt={
                      title ||
                      "Preview iklan"
                    }
                    fill
                    unoptimized
                    sizes="420px"
                    className="object-cover"
                    onError={() =>
                      setImagePreviewFailed(
                        true,
                      )
                    }
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xs font-black text-indigo-600 shadow-sm">
                      AD
                    </div>

                    <p className="mt-3 text-xs font-bold text-slate-500">
                      {imagePreviewFailed
                        ? "Preview gambar tidak tersedia"
                        : "Pilih materi gambar untuk melihat preview"}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black text-slate-900">
                      {title ||
                        "Judul iklan"}
                    </h3>

                    <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-500">
                      {description ||
                        "Deskripsi iklan akan tampil di sini."}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                    {getPositionLabel(
                      position,
                    )}
                  </span>
                </div>

                <div className="mt-4">
                  <span className="inline-flex rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white">
                    {buttonText ||
                      "CTA"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SUMMARY */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-black text-slate-900">
              Ringkasan Penayangan
            </p>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-500">
                  Status
                </span>

                <span
                  className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isActive
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                    }`}
                  />

                  {isActive
                    ? "Aktif"
                    : "Nonaktif"}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">
                  Penempatan
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {getPositionLabel(
                    position,
                  )}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">
                  Urutan
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {Number(
                    sortOrder,
                  ) || 0}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">
                  Mulai tayang
                </p>

                <p className="mt-1 text-sm font-bold leading-5 text-slate-800">
                  {formatSchedulePreview(
                    startAt,
                  )}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">
                  Berakhir
                </p>

                <p className="mt-1 text-sm font-bold leading-5 text-slate-800">
                  {formatSchedulePreview(
                    endAt,
                  )}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">
                  Link tujuan
                </p>

                <p className="mt-1 break-all text-xs font-medium leading-5 text-slate-700">
                  {linkUrl ||
                    "Belum diisi"}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* ACTION BAR */}

      <section className="sticky bottom-0 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            Pastikan konten,
            link, penempatan,
            dan jadwal sudah
            sesuai sebelum
            menyimpan.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="
                flex-1
                rounded-xl
                border
                border-slate-200
                bg-white
                px-5
                py-3
                text-sm
                font-bold
                text-slate-700
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:flex-none
              "
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                flex-1
                rounded-xl
                bg-indigo-600
                px-5
                py-3
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-indigo-700
                focus:outline-none
                focus:ring-4
                focus:ring-indigo-100
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:flex-none
              "
            >
              {loading
                ? "Menyimpan..."
                : isEditMode
                  ? "Simpan Perubahan"
                  : "Simpan Iklan"}
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}