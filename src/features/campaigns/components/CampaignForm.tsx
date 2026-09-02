"use client";

import Image from "next/image";
import { useState } from "react";

import { NotificationCategory } from "@/features/notifications/constants/notification-category";

import type { NotificationCategoryValue } from "@/features/notifications/constants/notification-category";

import { NotificationType } from "@/features/notifications/constants/notification-type";

import type { NotificationTypeValue } from "@/features/notifications/constants/notification-type";

import { CampaignAction } from "../constants/campaign-action";

import type { CampaignActionValue } from "../constants/campaign-action";

import { CampaignStatus } from "../constants/campaign-status";

import { CampaignStatusConfig } from "../constants/campaign-status-config";

import type { CampaignStatusValue } from "../constants/campaign-status";

import { CampaignTarget } from "../constants/campaign-target";

import type { CampaignTargetValue } from "../constants/campaign-target";

import type { CampaignFormController } from "../forms/campaign-form.props";

import {
  formatCampaignEnumLabel,
  formatCampaignTarget,
} from "../utils/campaign-display";

type CampaignFormMode = "create" | "edit";

interface CampaignFormProps {
  campaign: CampaignFormController;

  mode: CampaignFormMode;

  currentStatus?: CampaignStatusValue;

  onCancel(): void;
}

const CATEGORY_OPTIONS = Object.values(
  NotificationCategory,
) as NotificationCategoryValue[];

const TYPE_OPTIONS = Object.values(NotificationType) as NotificationTypeValue[];

const TARGET_OPTIONS = Object.values(CampaignTarget) as CampaignTargetValue[];

const ACTION_OPTIONS: {
  value: CampaignActionValue;
  label: string;
  description: string;
}[] = [
  {
    value: CampaignAction.DRAFT,
    label: "Simpan sebagai Draft",
    description: "Simpan campaign tanpa mengirimkannya kepada pengguna.",
  },
  {
    value: CampaignAction.PUBLISH,
    label: "Publikasikan Sekarang",
    description: "Campaign akan diproses dan dikirim segera setelah disimpan.",
  },
  {
    value: CampaignAction.SCHEDULE,
    label: "Jadwalkan",
    description: "Tentukan waktu publikasi campaign secara otomatis.",
  },
];

const baseFieldClassName = `
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
  disabled:cursor-not-allowed
  disabled:bg-slate-100
  disabled:text-slate-500
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
  disabled:cursor-not-allowed
  disabled:bg-slate-100
  disabled:text-slate-500
`;

function formatLocalDateTime(value?: string) {
  if (!value) {
    return "Belum diatur";
  }

  const [datePart, timePart] = value.split("T");

  if (!datePart) {
    return value;
  }

  const [year, month, day] = datePart.split("-");

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  const monthIndex = Number(month) - 1;

  if (!year || !day || monthIndex < 0 || monthIndex > 11) {
    return value.replace("T", " · ");
  }

  return `${day} ${monthNames[monthIndex]} ${year} · ${timePart ?? ""}`;
}

function getActionLabel(action: CampaignActionValue) {
  return ACTION_OPTIONS.find((item) => item.value === action)?.label ?? action;
}

export default function CampaignForm({
  campaign,
  mode,
  currentStatus,
  onCancel,
}: CampaignFormProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  const isCreateMode = mode === "create";

  const isScheduledEdit =
    mode === "edit" && currentStatus === CampaignStatus.SCHEDULED;

  const showScheduleFields = isCreateMode
    ? campaign.form.action === CampaignAction.SCHEDULE
    : isScheduledEdit;

  const requiresTargetValue = campaign.form.targetType === CampaignTarget.CITY;

  const isBusy = campaign.loading || campaign.uploadingImage;

  const currentImageUrl = campaign.form.imageUrl ?? "";

  const imageAvailable =
    Boolean(currentImageUrl) && failedImageUrl !== currentImageUrl;

  const submitLabel =
    mode === "edit"
      ? "Simpan Perubahan"
      : campaign.form.action === CampaignAction.DRAFT
        ? "Simpan Draft"
        : campaign.form.action === CampaignAction.PUBLISH
          ? "Publikasikan Campaign"
          : "Jadwalkan Campaign";

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await campaign.uploadImage(file);
  }

  function handleTargetChange(target: CampaignTargetValue) {
    campaign.setField("targetType", target);

    if (target !== CampaignTarget.CITY) {
      campaign.setField("targetValue", "");
    }
  }

  function handleActionChange(action: CampaignActionValue) {
    campaign.setField("action", action);

    /*
     * Jangan menyisakan tanggal
     * tersembunyi jika admin beralih
     * dari Schedule ke Draft/Publish.
     */
    if (action !== CampaignAction.SCHEDULE) {
      campaign.setField("scheduledAt", "");

      campaign.setField("expiresAt", "");
    }
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();

        await campaign.submit();
      }}
      className="space-y-6"
    >
      {/* HEADER */}

      <section className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900 disabled:opacity-50"
          >
            <span aria-hidden="true">←</span>

            {mode === "create" ? "Kembali ke Campaign" : "Kembali ke Detail"}
          </button>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            {mode === "create" ? "New Campaign" : "Edit Campaign"}
          </p>

          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            {mode === "create" ? "Buat Campaign Baru" : "Edit Campaign"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {mode === "create"
              ? "Siapkan konten, tentukan audience, dan pilih kapan campaign akan dikirim kepada pengguna HelpMe."
              : "Perbarui informasi campaign tanpa mengubah alur publikasi yang sedang berjalan."}
          </p>
        </div>

        {mode === "edit" && currentStatus && (
          <div className="w-fit rounded-full bg-white p-1 shadow-sm">
            <span
              className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  ${CampaignStatusConfig[currentStatus].color}
                `}
            >
              <span
                className={`
                    h-2
                    w-2
                    rounded-full
                    ${CampaignStatusConfig[currentStatus].dot}
                  `}
              />

              {CampaignStatusConfig[currentStatus].label}
            </span>
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
        {/* LEFT */}

        <div className="space-y-6">
          {/* 01 CONTENT */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm font-black text-indigo-600">
                01
              </div>

              <h2 className="mt-4 text-lg font-black text-slate-950">
                Konten Campaign
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Informasi utama yang akan diterima pengguna melalui notifikasi.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="campaign-title"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Judul Campaign
                </label>

                <input
                  id="campaign-title"
                  disabled={campaign.loading}
                  type="text"
                  required
                  placeholder="Contoh: Informasi Terbaru HelpMe"
                  value={campaign.form.title}
                  onChange={(event) =>
                    campaign.setField("title", event.target.value)
                  }
                  className={baseFieldClassName}
                />

                {campaign.errors.title && (
                  <p className="mt-2 text-xs font-medium text-rose-600">
                    {campaign.errors.title}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="campaign-message"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Pesan
                </label>

                <textarea
                  id="campaign-message"
                  disabled={campaign.loading}
                  required
                  rows={5}
                  value={campaign.form.message}
                  onChange={(event) =>
                    campaign.setField("message", event.target.value)
                  }
                  placeholder="Tulis pesan yang akan diterima pengguna..."
                  className={textareaClassName}
                />

                {campaign.errors.message && (
                  <p className="mt-2 text-xs font-medium text-rose-600">
                    {campaign.errors.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="campaign-image"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Gambar Campaign
                </label>

                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                  <input
                    id="campaign-image"
                    type="file"
                    accept="image/*"
                    disabled={isBusy}
                    onChange={handleImageUpload}
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
                      disabled:opacity-50
                    "
                  />

                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Gambar bersifat opsional. Tunggu proses upload selesai
                    sebelum menyimpan campaign.
                  </p>

                  {campaign.uploadingImage && (
                    <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                      <p className="text-xs font-bold text-indigo-700">
                        Mengupload gambar...
                      </p>
                    </div>
                  )}

                  {!campaign.uploadingImage && currentImageUrl && (
                    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                      <p className="text-xs font-bold text-emerald-700">
                        Gambar siap digunakan
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="campaign-redirect"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Redirect URL
                </label>

                <input
                  id="campaign-redirect"
                  disabled={campaign.loading}
                  type="url"
                  value={campaign.form.redirectUrl}
                  onChange={(event) =>
                    campaign.setField("redirectUrl", event.target.value)
                  }
                  placeholder="https://..."
                  className={baseFieldClassName}
                />

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Opsional. Pengguna akan diarahkan ke URL ini ketika membuka
                  campaign.
                </p>
              </div>
            </div>
          </section>

          {/* 02 AUDIENCE */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm font-black text-indigo-600">
                02
              </div>

              <h2 className="mt-4 text-lg font-black text-slate-950">
                Audience
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Tentukan kelompok pengguna yang akan menerima campaign.
              </p>
            </div>

            <div>
              <label
                htmlFor="campaign-target"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Target Audience
              </label>

              <select
                id="campaign-target"
                disabled={campaign.loading}
                value={campaign.form.targetType}
                onChange={(event) =>
                  handleTargetChange(event.target.value as CampaignTargetValue)
                }
                className={baseFieldClassName}
              >
                {TARGET_OPTIONS.map((target) => (
                  <option
                    key={target}
                    value={target}
                    disabled={target === CampaignTarget.RADIUS}
                  >
                    {target === CampaignTarget.RADIUS
                      ? "Berdasarkan Radius — Belum tersedia"
                      : formatCampaignTarget(target)}
                  </option>
                ))}
              </select>

              {campaign.errors.targetType && (
                <p className="mt-2 text-xs font-medium text-rose-600">
                  {campaign.errors.targetType}
                </p>
              )}
            </div>

            {requiresTargetValue && (
              <div className="mt-5">
                <label
                  htmlFor="campaign-target-value"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Kota Target
                </label>

                <input
                  id="campaign-target-value"
                  disabled={campaign.loading}
                  type="text"
                  required
                  value={campaign.form.targetValue}
                  onChange={(event) =>
                    campaign.setField("targetValue", event.target.value)
                  }
                  placeholder="Contoh: Surabaya"
                  className={baseFieldClassName}
                />

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Masukkan nama kota yang menjadi target penerima campaign.
                </p>

                {campaign.errors.targetValue && (
                  <p className="mt-2 text-xs font-medium text-rose-600">
                    {campaign.errors.targetValue}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* 03 CLASSIFICATION */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm font-black text-indigo-600">
                03
              </div>

              <h2 className="mt-4 text-lg font-black text-slate-950">
                Klasifikasi
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Tentukan kategori dan jenis notifikasi yang digunakan.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <label
                  htmlFor="campaign-category"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Kategori
                </label>

                <select
                  id="campaign-category"
                  disabled={campaign.loading || !isCreateMode}
                  value={campaign.form.category}
                  onChange={(event) =>
                    campaign.setField(
                      "category",
                      event.target.value as NotificationCategoryValue,
                    )
                  }
                  className={baseFieldClassName}
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {formatCampaignEnumLabel(category)}
                    </option>
                  ))}
                </select>

                {!isCreateMode && (
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Kategori tidak diubah pada alur Edit Campaign saat ini.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="campaign-type"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Jenis Notifikasi
                </label>

                <select
                  id="campaign-type"
                  disabled={campaign.loading || !isCreateMode}
                  value={campaign.form.type}
                  onChange={(event) =>
                    campaign.setField(
                      "type",
                      event.target.value as NotificationTypeValue,
                    )
                  }
                  className={baseFieldClassName}
                >
                  {TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {formatCampaignEnumLabel(type)}
                    </option>
                  ))}
                </select>

                {!isCreateMode && (
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Jenis notifikasi tidak diubah pada alur Edit Campaign saat
                    ini.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* 04 PUBLICATION */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm font-black text-indigo-600">
                04
              </div>

              <h2 className="mt-4 text-lg font-black text-slate-950">
                Publikasi
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Atur bagaimana dan kapan campaign akan dipublikasikan.
              </p>
            </div>

            {isCreateMode ? (
              <div className="grid gap-3 lg:grid-cols-3">
                {ACTION_OPTIONS.map((action) => {
                  const selected = campaign.form.action === action.value;

                  return (
                    <label
                      key={action.value}
                      className={`
                          cursor-pointer
                          rounded-2xl
                          border
                          p-4
                          transition
                          ${
                            selected
                              ? "border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }
                        `}
                    >
                      <input
                        type="radio"
                        name="campaign-action"
                        value={action.value}
                        checked={selected}
                        disabled={campaign.loading}
                        onChange={() => handleActionChange(action.value)}
                        className="
    h-4
    w-4
    shrink-0
    cursor-pointer
    accent-indigo-600
    disabled:cursor-not-allowed
  "
                      />

                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-slate-900">
                          {action.label}
                        </p>
                      </div>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {action.description}
                      </p>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Status publikasi
                </p>

                <p className="mt-2 text-sm font-black text-slate-900">
                  {currentStatus
                    ? CampaignStatusConfig[currentStatus].label
                    : "Campaign"}
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Status campaign tidak diubah melalui halaman Edit. Gunakan
                  tindakan campaign pada halaman detail bila tersedia.
                </p>
              </div>
            )}

            {showScheduleFields && (
              <div className="mt-6 grid gap-5 border-t border-slate-100 pt-6 lg:grid-cols-2">
                <div>
                  <label
                    htmlFor="campaign-schedule"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Waktu Publikasi
                  </label>

                  <input
                    id="campaign-schedule"
                    disabled={campaign.loading}
                    type="datetime-local"
                    value={campaign.form.scheduledAt ?? ""}
                    onChange={(event) =>
                      campaign.setField("scheduledAt", event.target.value)
                    }
                    className={baseFieldClassName}
                  />

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Input mengikuti zona waktu perangkat/browser. Dashboard
                    admin menampilkan waktu dalam WIB.
                  </p>

                  {campaign.errors.scheduledAt && (
                    <p className="mt-2 text-xs font-medium text-rose-600">
                      {campaign.errors.scheduledAt}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="campaign-expire"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Waktu Berakhir
                  </label>

                  <input
                    id="campaign-expire"
                    disabled={campaign.loading}
                    type="datetime-local"
                    value={campaign.form.expiresAt ?? ""}
                    onChange={(event) =>
                      campaign.setField("expiresAt", event.target.value)
                    }
                    className={baseFieldClassName}
                  />

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Opsional. Jika diisi, waktu berakhir harus setelah waktu
                    publikasi.
                  </p>

                  {campaign.errors.expiresAt && (
                    <p className="mt-2 text-xs font-medium text-rose-600">
                      {campaign.errors.expiresAt}
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT */}

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          {/* PREVIEW */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-sm font-black text-slate-900">
                Preview Campaign
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Gambaran konten notifikasi yang sedang disiapkan.
              </p>
            </div>

            {currentImageUrl && (
              <div className="p-5 pb-0">
                <div className="relative aspect-16/8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  {imageAvailable ? (
                    <Image
                      key={currentImageUrl}
                      src={currentImageUrl}
                      alt={campaign.form.title || "Campaign"}
                      fill
                      unoptimized
                      sizes="420px"
                      className="object-cover"
                      onError={() => setFailedImageUrl(currentImageUrl)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                      <p className="text-xs font-bold text-slate-400">
                        Preview gambar tidak tersedia.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                  {formatCampaignEnumLabel(campaign.form.category)}
                </span>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                  {formatCampaignEnumLabel(campaign.form.type)}
                </span>
              </div>

              <h3 className="mt-4 text-base font-black leading-6 text-slate-950">
                {campaign.form.title || "Judul campaign"}
              </h3>

              <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-500">
                {campaign.form.message || "Pesan campaign akan tampil di sini."}
              </p>

              {campaign.form.redirectUrl && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Redirect
                  </p>

                  <p className="mt-1 break-all text-xs font-medium leading-5 text-indigo-600">
                    {campaign.form.redirectUrl}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* SUMMARY */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-black text-slate-900">Ringkasan</p>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs text-slate-500">Audience</p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {formatCampaignTarget(campaign.form.targetType)}
                </p>

                {requiresTargetValue && campaign.form.targetValue && (
                  <p className="mt-1 text-xs text-slate-500">
                    {campaign.form.targetValue}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">Publikasi</p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {isCreateMode
                    ? getActionLabel(campaign.form.action)
                    : currentStatus
                      ? CampaignStatusConfig[currentStatus].label
                      : "Edit Campaign"}
                </p>
              </div>

              {showScheduleFields && (
                <>
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-500">Dijadwalkan</p>

                    <p className="mt-1 text-sm font-bold leading-5 text-slate-800">
                      {formatLocalDateTime(campaign.form.scheduledAt)}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-500">Berakhir</p>

                    <p className="mt-1 text-sm font-bold leading-5 text-slate-800">
                      {formatLocalDateTime(campaign.form.expiresAt)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>

          {isCreateMode && (
            <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
              <p className="text-sm font-black text-indigo-900">
                Sebelum menyimpan
              </p>

              <p className="mt-2 text-xs leading-6 text-indigo-700">
                Periksa kembali audience, konten, redirect, dan waktu publikasi.
                Campaign yang dipublikasikan akan mengirim notifikasi kepada
                penerima yang sesuai.
              </p>
            </section>
          )}
        </aside>
      </div>

      {/* ACTION BAR */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">
            {campaign.uploadingImage
              ? "Tunggu hingga upload gambar selesai."
              : mode === "create"
                ? "Periksa kembali konfigurasi campaign sebelum melanjutkan."
                : "Simpan hanya setelah perubahan campaign sudah sesuai."}
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isBusy}
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
              disabled={isBusy}
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
              {campaign.loading
                ? "Menyimpan..."
                : campaign.uploadingImage
                  ? "Menunggu Upload..."
                  : submitLabel}
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}