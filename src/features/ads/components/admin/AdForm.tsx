"use client";

import { FormEvent, useState } from "react";
import type { Ad, AdPosition } from "../../types/ad.types";

interface AdFormProps {
  ad?: Ad | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function toDatetimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();

  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

export default function AdForm({ ad, onSuccess, onCancel }: AdFormProps) {
  const isEditMode = Boolean(ad);

  const [title, setTitle] = useState(ad?.title ?? "");

  const [description, setDescription] = useState(ad?.description ?? "");

  const [imageUrl, setImageUrl] = useState(ad?.image_url ?? "");

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [buttonText, setButtonText] = useState(
    ad?.button_text ?? "Lihat Promo",
  );

  const [linkUrl, setLinkUrl] = useState(ad?.link_url ?? "");

  const [position, setPosition] = useState<AdPosition>(
    ad?.position ?? "home_desktop",
  );

  const [isActive, setIsActive] = useState(ad?.is_active ?? true);

  const [startAt, setStartAt] = useState(toDatetimeLocal(ad?.start_at ?? null));

  const [endAt, setEndAt] = useState(toDatetimeLocal(ad?.end_at ?? null));

  const [sortOrder, setSortOrder] = useState(String(ad?.sort_order ?? 0));

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function uploadImage(file: File) {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch("/api/ads/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Anda belum login.");
      }

      if (response.status === 403) {
        throw new Error("Anda tidak memiliki akses admin.");
      }

      throw new Error(data?.message ?? "Gagal mengupload gambar.");
    }

    return data.publicUrl as string;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const oldImageUrl = isEditMode ? (ad?.image_url ?? null) : null;

      let finalImageUrl = imageUrl;

      if (!isEditMode && !imageFile) {
        throw new Error("Gambar iklan wajib dipilih.");
      }

      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      if (!finalImageUrl) {
        throw new Error("Gambar iklan wajib dipilih.");
      }

      const payload = {
        title,
        description: description.trim() || null,
        image_url: finalImageUrl,
        button_text: buttonText,
        link_url: linkUrl,
        position,
        is_active: isActive,
        start_at: startAt ? new Date(startAt).toISOString() : null,
        end_at: endAt ? new Date(endAt).toISOString() : null,
        sort_order: Number(sortOrder) || 0,
      };

      const response = await fetch(
        isEditMode ? `/api/ads/${ad?.id}` : "/api/ads",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Anda belum login.");
        }

        if (response.status === 403) {
          throw new Error("Anda tidak memiliki akses admin.");
        }

        if (response.status === 404) {
          throw new Error("Iklan tidak ditemukan.");
        }

        if (response.status === 400 && data?.errors?.fieldErrors) {
          const fieldErrors = data.errors.fieldErrors;

          const firstError = Object.values(fieldErrors)
            .flat()
            .find((message) => typeof message === "string");

          throw new Error(firstError ?? "Data iklan tidak valid.");
        }

        throw new Error(
          data?.message ??
            (isEditMode ? "Gagal memperbarui iklan." : "Gagal membuat iklan."),
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
        oldImageUrl !== finalImageUrl
      ) {
        try {
          const deleteImageResponse = await fetch("/api/ads/image", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imageUrl: oldImageUrl,
            }),
          });

          if (!deleteImageResponse.ok) {
            console.error(
              "Gambar lama berhasil diabaikan dari proses update, tetapi gagal dihapus dari storage.",
            );
          }
        } catch (deleteImageError) {
          console.error("Gagal menghapus gambar lama:", deleteImageError);
        }
      }

      onSuccess();
    } catch (error) {
      console.error(
        isEditMode ? "Update ad error:" : "Create ad error:",
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
      className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-xl font-black">
          {isEditMode ? "Edit Iklan" : "Buat Iklan"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {isEditMode
            ? "Perbarui informasi iklan HelpMe."
            : "Tambahkan iklan baru untuk ditampilkan di HelpMe."}
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="ad-title" className="mb-2 block text-sm font-bold">
            Judul iklan
          </label>

          <input
            id="ad-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={150}
            required
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-slate-900"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="ad-description"
            className="mb-2 block text-sm font-bold"
          >
            Deskripsi
          </label>

          <textarea
            id="ad-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            rows={3}
            className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none focus:border-slate-900"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="ad-image-file"
            className="mb-2 block text-sm font-bold"
          >
            Materi Gambar iklan
          </label>

          <input
            id="ad-image-file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required={!isEditMode}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;

              setImageFile(file);
            }}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-slate-900"
          />

          <p className="mt-2 text-xs text-slate-500">
            JPG, PNG, atau WebP. Maksimal 5 MB.
          </p>

          {isEditMode && imageUrl && !imageFile && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-bold text-slate-500">
                Gambar saat ini
              </p>

              <img
                src={imageUrl}
                alt={title}
                className="h-32 w-56 rounded-xl object-cover"
              />
            </div>
          )}

          {imageFile && (
            <p className="mt-2 text-xs text-slate-600">
              File dipilih: {imageFile.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="ad-button-text"
            className="mb-2 block text-sm font-bold"
          >
            Teks tombol
          </label>

          <input
            id="ad-button-text"
            type="text"
            value={buttonText}
            onChange={(event) => setButtonText(event.target.value)}
            maxLength={50}
            required
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label htmlFor="ad-link-url" className="mb-2 block text-sm font-bold">
            Link iklan
          </label>

          <input
            id="ad-link-url"
            type="url"
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            required
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-slate-900"
            placeholder="https://..."
          />
        </div>

        <div>
          <label htmlFor="ad-position" className="mb-2 block text-sm font-bold">
            Posisi
          </label>

          <select
            id="ad-position"
            value={position}
            onChange={(event) => setPosition(event.target.value as AdPosition)}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-slate-900"
          >
            <option value="home_desktop">Home Desktop</option>

            <option value="home_mobile">Home Mobile</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="ad-sort-order"
            className="mb-2 block text-sm font-bold"
          >
            Urutan
          </label>

          <input
            id="ad-sort-order"
            type="number"
            min={0}
            step={1}
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label htmlFor="ad-start-at" className="mb-2 block text-sm font-bold">
            Mulai tayang
          </label>

          <input
            id="ad-start-at"
            type="datetime-local"
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label htmlFor="ad-end-at" className="mb-2 block text-sm font-bold">
            Berakhir
          </label>

          <input
            id="ad-end-at"
            type="datetime-local"
            value={endAt}
            onChange={(event) => setEndAt(event.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-slate-900"
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
          className="h-4 w-4"
        />

        <span className="text-sm font-bold">Iklan aktif</span>
      </label>

      <div className="flex justify-end gap-3 border-t pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border px-5 py-3 text-sm font-bold transition hover:bg-slate-50 disabled:opacity-50"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Menyimpan..."
            : isEditMode
              ? "Simpan Perubahan"
              : "Simpan Iklan"}
        </button>
      </div>
    </form>
  );
}