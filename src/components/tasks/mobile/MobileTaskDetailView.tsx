"use client";

import imageCompression from "browser-image-compression";

import { uploadTaskCompletionProof } from "@/lib/supabase/storage";
import { supabase } from "@/lib/supabase/client";

import Link from "next/link";
import Image from "next/image";

import {
  ArrowLeft,
  BadgeAlert,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Lock,
  MessageCircle,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";

import { useState } from "react";

import ReportTaskModal from "@/features/reports/components/ReportTaskModal";

import {
  getTaskCategoryDefinition,
  getTaskCategoryHeroImage,
} from "@/features/tasks/constants/task-categories";

import { useTaskCompletionProofUrl } from "@/features/task-completion/hooks/useTaskCompletionProofUrl";

interface TaskDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;

  location_type?: string;
  location_name?: string;
  manual_address?: string;

  latitude?: number;
  longitude?: number;

  owner_latitude?: number;
  owner_longitude?: number;

  user_id: string;
  status: string;
  selected_helper_id: string | null;

  completion_proof_photo?: string | null;

  is_urgent?: boolean;
  scheduled_at?: string | null;

  users?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    verification_status?: string | null;
  } | null;
}

interface Applicant {
  id: string;
  helper_id: string;
  status: string;
  created_at: string;

  helper: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  } | null;

  reputation?: {
    averageRating?: number | string;
    totalReviews?: number;
    completedTasks?: number;
  };
}

interface Props {
  task: TaskDetail;

  applications: Applicant[];

  currentUserId: string;

  hasApplied: boolean;

  applying: boolean;

  acceptingHelperId: string | null;

  handleApplyTask: () => void;

  handleAcceptHelper: (helperId: string) => void;

  handleCompleteTask: (proofUrl: string) => void;

  handleConfirmCompletion: () => void;

  handleCancelTask: () => void;
}

export default function MobileTaskDetailView({
  task,
  applications,
  currentUserId,
  hasApplied,
  applying,
  acceptingHelperId,
  handleApplyTask,
  handleAcceptHelper,
  handleCompleteTask,
  handleConfirmCompletion,
  handleCancelTask,
}: Props) {
  const [showReportModal, setShowReportModal] = useState(false);

  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const [proofFile, setProofFile] = useState<File | null>(null);

  const [proofPreview, setProofPreview] = useState("");

  const [uploadingProof, setUploadingProof] = useState(false);

  const [confirmingCompletion, setConfirmingCompletion] = useState(false);

  async function getConversationByTask(taskId: string) {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("task_id", taskId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  async function handleOpenChat() {
    try {
      const conversation = await getConversationByTask(task.id);

      if (!conversation) return;

      window.location.href = `/messages/${conversation.id}`;
    } catch (error) {
      console.error(error);

      alert("Gagal membuka percakapan.");
    }
  }

  async function handleProofSelected(file: File) {
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });

      setProofFile(compressed as File);

      setProofPreview(URL.createObjectURL(compressed));
    } catch (error) {
      console.error(error);

      alert("Gagal memproses foto.");
    }
  }

  async function handleFinishTask() {
    if (!proofFile) {
      alert("Upload foto bukti terlebih dahulu");

      return;
    }

    try {
      setUploadingProof(true);

      const path = await uploadTaskCompletionProof(task.id, proofFile);

      await handleCompleteTask(path);

      setShowCompleteModal(false);

      setProofFile(null);

      setProofPreview("");
    } catch (error) {
      console.error(error);

      alert("Gagal mengupload bukti.");
    } finally {
      setUploadingProof(false);
    }
  }

  async function onConfirmCompletion() {
    try {
      setConfirmingCompletion(true);

      await handleConfirmCompletion();
    } catch (error) {
      console.error(error);

      alert("Gagal mengonfirmasi task.");
    } finally {
      setConfirmingCompletion(false);
    }
  }

  const isOwner = task.user_id === currentUserId;

  const isSelectedHelper = task.selected_helper_id === currentUserId;

  const shouldLoadCompletionProof =
    isOwner &&
    task.status === "WAITING_CONFIRMATION" &&
    Boolean(task.completion_proof_photo);

  const category = getTaskCategoryDefinition(task.category);

  const heroImage = getTaskCategoryHeroImage(task.category);

  const { url: completionProofUrl, loading: completionProofLoading } =
    useTaskCompletionProofUrl(
      shouldLoadCompletionProof ? task.completion_proof_photo : null,
    );

  const location =
    task.location_type === "SEARCH"
      ? task.location_name || "Lokasi tidak tersedia"
      : task.manual_address || "Alamat tidak tersedia";

  const formattedBudget = task.budget.toLocaleString("id-ID");

  const selectedHelper = applications.find(
    (application) => application.helper_id === task.selected_helper_id,
  )?.helper;

  const statusLabel =
    task.status === "OPEN"
      ? "Terbuka"
      : task.status === "ACCEPTED"
        ? "Sedang Dibantu"
        : task.status === "WAITING_CONFIRMATION"
          ? "Menunggu Konfirmasi"
          : task.status === "COMPLETED"
            ? "Selesai"
            : task.status === "CANCELLED"
              ? "Dibatalkan"
              : task.status === "EXPIRED"
                ? "Kadaluarsa"
                : task.status;

  return (
    <main className="min-h-screen bg-white pb-32 lg:hidden">
      {/* =====================================================
          PAGE CONTAINER
      ===================================================== */}

      <div className="mx-auto w-full max-w-md px-4 pt-3">
        {/* =====================================================
            TOP BAR
        ===================================================== */}

        <header className="flex h-12 items-center justify-between">
          <button
            type="button"
            onClick={() => window.history.back()}
            aria-label="Kembali"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              text-slate-900
              transition
              active:scale-90
            "
          >
            <ArrowLeft size={23} strokeWidth={2} />
          </button>

          <div className="text-[13px] font-bold text-slate-900">
            Detail Task
          </div>

          <div className="w-10" />
        </header>

        {/* =====================================================
            HERO
        ===================================================== */}
        <section
          className="
            relative
            mt-2
            overflow-hidden
            rounded-[26px]
            bg-linear-to-br
            from-slate-100
            via-slate-50
            to-indigo-50
          "
        >
          {/* =====================================================
    HERO IMAGE
===================================================== */}

          <div
            className="
    relative
    h-55
    w-full
    overflow-hidden
  "
          >
            <Image
              src={heroImage}
              alt={`Kategori ${category.label}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-cover"
            />

            {/* Soft overlay agar badge tetap terbaca */}

            <div
              className="
      absolute
      inset-0
      bg-linear-to-t
      from-slate-950/45
      via-slate-950/5
      to-transparent
    "
            />

            {/* STATUS OVER HERO */}

            <div
              className="
      absolute
      bottom-4
      left-4
      right-4
      flex
      items-center
      justify-between
      gap-2
    "
            >
              <div className="flex min-w-0 flex-wrap gap-2">
                <span
                  className="
          inline-flex
          items-center
          rounded-full
          bg-indigo-600
          px-3
          py-2
          text-[10px]
          font-bold
          text-white
          shadow-sm
        "
                >
                  {category.label}
                </span>

                {task.is_urgent && (
                  <span
                    className="
            inline-flex
            items-center
            rounded-full
            bg-red-500
            px-3
            py-2
            text-[10px]
            font-bold
            text-white
            shadow-sm
          "
                  >
                    🔥 Mendesak
                  </span>
                )}
              </div>

              <span
                className={`
        shrink-0
        rounded-full
        px-3
        py-2
        text-[10px]
        font-bold
        shadow-sm

        ${
          task.status === "WAITING_CONFIRMATION"
            ? "bg-amber-400 text-slate-900"
            : task.status === "COMPLETED"
              ? "bg-emerald-400 text-slate-900"
              : task.status === "CANCELLED"
                ? "bg-red-500 text-white"
                : task.status === "EXPIRED"
                  ? "bg-slate-700 text-white"
                  : "bg-emerald-400 text-slate-900"
        }
      `}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          {/* HERO INFORMATION */}
          <div className="bg-white px-4 pb-5 pt-5">
            <h1
              className="
                text-[19px]
                font-extrabold
                leading-[1.15]
                tracking-[-0.5px]
                text-slate-950
              "
            >
              {task.title}
            </h1>

            <div
              className="
                mt-3
                flex
                items-start
                gap-2
                text-[10px]
                leading-5
                text-slate-500
              "
            >
              <Image
                src="/icons/detail-task/lokasi.svg"
                alt="Lokasi"
                width={13}
                height={13}
                className="mt-0.5 shrink-0"
              />

              <span>{location}</span>
            </div>
          </div>
        </section>

        {/* =====================================================
            BUDGET / SCHEDULE
        ===================================================== */}
        <section className="mt-4 rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_5px_22px_rgba(15,23,42,0.05)]">
          <div className="grid grid-cols-2">
            {/* BUDGET */}
            <div className="border-r border-slate-100 pr-4">
              <p className="text-[11px] font-semibold text-slate-500">Budget</p>

              <div className="mt-3 flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <Image
                    src="/icons/detail-task/budget.svg"
                    alt="Budget"
                    width={22}
                    height={22}
                  />
                </div>

                <p className="text-[15px] font-extrabold text-emerald-600">
                  Rp {formattedBudget}
                </p>
              </div>
            </div>

            {/* SCHEDULE */}

            <div className="pl-4">
              <p className="text-[11px] font-semibold text-slate-500">
                Pelaksanaan
              </p>

              {task.scheduled_at ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays
                      size={15}
                      strokeWidth={2}
                      className="text-slate-700"
                    />

                    <span className="text-[11px] font-semibold text-slate-700">
                      {new Date(task.scheduled_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock3
                      size={15}
                      strokeWidth={2}
                      className="text-slate-700"
                    />

                    <span className="text-[11px] font-semibold text-slate-700">
                      {new Date(task.scheduled_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      WIB
                    </span>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-400">Tidak ditentukan</p>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            DETAIL TUGAS
        ===================================================== */}
        <section className="mt-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users size={13} strokeWidth={2} />
            </div>

            <h2 className="text-[13px] font-semibold text-slate-950">
              Detail Tugas
            </h2>
          </div>

          <div className="mt-4">
            <p
              className={`
      text-[12.5px]
      leading-6
      text-slate-600
      ${isDescriptionExpanded ? "" : "line-clamp-4"}
    `}
            >
              {task.description}
            </p>

            {task.description.length > 180 && (
              <button
                type="button"
                onClick={() =>
                  setIsDescriptionExpanded((previous) => !previous)
                }
                className="
        mt-3
        flex
        items-center
        gap-1
        text-[12px]
        font-bold
        text-indigo-600
        transition
        active:scale-95
      "
              >
                {isDescriptionExpanded
                  ? "Lihat lebih sedikit"
                  : "Lihat selengkapnya"}

                <ChevronDown
                  size={15}
                  className={`
          transition-transform
          duration-200
          ${isDescriptionExpanded ? "rotate-180" : ""}
        `}
                />
              </button>
            )}
          </div>
        </section>

        {/* =====================================================
            SELECTED HELPER
        ===================================================== */}

        {task.selected_helper_id && selectedHelper && (
          <>
            <div className="my-6 h-px bg-slate-100" />

            <section>
              <div className="flex items-center gap-2.5">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-50
                    text-emerald-600
                  "
                >
                  <CheckCircle2 size={17} strokeWidth={2.5} />
                </div>

                <div>
                  <h2 className="text-[13px] font-bold text-slate-950">
                    Helper Terpilih
                  </h2>

                  <p className="mt-0.5 text-[10px] text-emerald-600">
                    Helper yang dipilih untuk task ini
                  </p>
                </div>
              </div>

              <Link
                href={`/users/${selectedHelper.id}`}
                className="
                  mt-4
                  flex
                  items-center
                  gap-3
                  rounded-[20px]
                  border
                  border-emerald-100
                  bg-emerald-50/50
                  p-3
                  transition
                  active:scale-[0.99]
                "
              >
                {/* AVATAR */}
                {selectedHelper.avatar_url ? (
                  <img
                    src={selectedHelper.avatar_url}
                    alt={selectedHelper.full_name}
                    className="
                      h-12
                      w-12
                      shrink-0
                      rounded-full
                      object-cover
                      ring-2
                      ring-white
                      shadow-sm
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-emerald-100
                      text-sm
                      font-extrabold
                      text-emerald-700
                    "
                  >
                    {selectedHelper.full_name?.charAt(0)?.toUpperCase()}
                  </div>
                )}

                {/* INFO */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-extrabold text-slate-950">
                      {selectedHelper.full_name}
                    </p>

                    <span
                      className="
                        shrink-0
                        rounded-full
                        bg-emerald-500
                        px-2
                        py-0.5
                        text-[9px]
                        font-extrabold
                        text-white
                      "
                    >
                      Terpilih
                    </span>
                  </div>

                  <p className="mt-1 text-[10px] font-semibold text-emerald-700">
                    Helper untuk task ini
                  </p>
                </div>

                <ChevronRight size={18} className="shrink-0 text-emerald-500" />
              </Link>
            </section>
          </>
        )}

        <div className="my-6 h-px bg-slate-100" />

        {/* =====================================================
            OWNER
        ===================================================== */}
        <section>
          <p className="text-[13px] font-bold text-slate-900">Diposting oleh</p>

          <Link
            href={`/users/${task.users?.id}`}
            className="
              mt-4
              flex
              items-center
              gap-3
            "
          >
            {task.users?.avatar_url ? (
              <img
                src={task.users.avatar_url}
                alt="Owner"
                className="h-12 w-12 shrink-0 rounded-full object-coverring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-extrabold text-indigo-700">
                {task.users?.full_name?.charAt(0)?.toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-extrabold text-slate-950">
                {task.users?.full_name}
              </p>

              {task.users?.verification_status === "VERIFIED" ? (
                <div className="mt-1 flex items-center gap-1.5">
                  <ShieldCheck
                    size={14}
                    fill="currentColor"
                    className="text-emerald-500"
                  />

                  <span className="text-[11px] font-semibold text-emerald-600">
                    Terverifikasi
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-[11px] text-slate-400">
                  Belum terverifikasi
                </p>
              )}
            </div>

            <ChevronRight size={20} className="text-slate-400" />
          </Link>
        </section>

        {/* =====================================================
            APPLICANTS
        ===================================================== */}
        {isOwner && (
          <>
            <div className="my-6 h-px bg-slate-100" />

            <section>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-50">
                    <Users size={14} className="text-indigo-600" />
                  </div>

                  <h2 className="text-[13px] font-bold text-slate-900">
                    Pelamar
                  </h2>
                </div>

                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                  {applications.length}
                </span>
              </div>

              {applications.length === 0 ? (
                <div className="mt-4 rounded-[20px] bg-slate-50 p-5 text-center">
                  <p className="text-xs text-slate-500">Belum ada pelamar.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-[20px] border border-slate-100 bg-white p-3 shadow-[0_4px_18px_rgba(15,23,42,0.04)]"
                    >
                      <div className="flex items-center gap-3">
                        {/* AVATAR */}
                        <Link
                          href={`/users/${app.helper?.id}`}
                          className="shrink-0"
                        >
                          {app.helper?.avatar_url ? (
                            <img
                              src={app.helper.avatar_url}
                              alt="Helper"
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-extrabold  text-slate-700">
                              {app.helper?.full_name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </Link>

                        {/* INFO */}
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/users/${app.helper?.id}`}
                            className="block truncate text-[13px] font-extrabold text-slate-950"
                          >
                            {app.helper?.full_name}
                          </Link>

                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-[13px] text-amber-400">
                              ★
                            </span>

                            <span className="text-[10px] font-semibold text-slate-600">
                              {app.reputation?.averageRating || "0.0"}
                            </span>

                            <span className="text-[10px] text-slate-300">
                              ({app.reputation?.totalReviews || 0} ulasan)
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                            <Trophy size={12} className="text-amber-500" />
                            {app.reputation?.completedTasks || 0} task selesai
                          </div>
                        </div>

                        {/* SELECT */}
                        {task.status === "OPEN" && (
                          <button
                            type="button"
                            onClick={() => handleAcceptHelper(app.helper_id)}
                            disabled={acceptingHelperId !== null}
                            className="
                              shrink-0
                              rounded-xl
                              bg-indigo-600
                              px-4
                              py-2.5
                              text-[11px]
                              font-extrabold
                              text-white
                              shadow-[0_5px_15px_rgba(79,70,229,0.2)]
                              transition
                              active:scale-95
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            {acceptingHelperId === app.helper_id
                              ? "Memilih..."
                              : "Pilih"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {applications.length > 3 && (
                <button
                  type="button"
                  className="
                    mt-4
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-1
                    text-[12px]
                    font-bold
                    text-indigo-600
                  "
                >
                  Lihat semua pelamar
                  <ChevronDown size={15} />
                </button>
              )}
            </section>
          </>
        )}

        {/* =====================================================
            COMPLETION PROOF — OWNER
        ===================================================== */}
        {isOwner &&
          task.status === "WAITING_CONFIRMATION" &&
          task.completion_proof_photo && (
            <>
              <div className="my-6 h-px bg-slate-100" />

              <section
                className="
                  rounded-[22px]
                  border
                  border-slate-100
                  bg-white
                  p-4
                  shadow-[0_5px_22px_rgba(15,23,42,0.05)]
                "
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[14px] font-extrabold text-slate-950">
                      Bukti Penyelesaian dari Helper
                    </h2>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Periksa sebelum mengonfirmasi
                    </p>
                  </div>

                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600">
                    Privat
                  </span>
                </div>

                {completionProofLoading ? (
                  <div className="mt-4 rounded-[18px] bg-slate-50 p-8 text-center">
                    <p className="text-xs text-slate-500">
                      Memuat bukti penyelesaian...
                    </p>
                  </div>
                ) : completionProofUrl ? (
                  <div className="mt-4 overflow-hidden rounded-[18px] bg-slate-100">
                    <img
                      src={completionProofUrl}
                      alt="Bukti Penyelesaian"
                      className="max-h-90 w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mt-4 rounded-[18px] bg-slate-50 p-8 text-center">
                    <p className="text-xs text-slate-500">
                      Bukti penyelesaian tidak dapat dimuat.
                    </p>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3">
                  <Lock size={13} className="shrink-0 text-slate-500" />

                  <p className="text-[10px] leading-4 text-slate-500">
                    Hanya Anda dan helper yang dapat melihat bukti ini.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onConfirmCompletion}
                  disabled={confirmingCompletion}
                  className="
                    mt-4
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-emerald-500
                    text-sm
                    font-extrabold
                    text-white
                    shadow-[0_6px_18px_rgba(16,185,129,0.18)]
                    transition
                    active:scale-[0.98]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <CheckCircle2 size={17} />

                  {confirmingCompletion
                    ? "Mengonfirmasi..."
                    : "Konfirmasi Penyelesaian"}
                </button>
              </section>
            </>
          )}

        {/* =====================================================
            HELPER WAITING CONFIRMATION
        ===================================================== */}
        {isSelectedHelper && task.status === "WAITING_CONFIRMATION" && (
          <>
            <div className="my-6 h-px bg-slate-100" />

            <section
              className="
                rounded-[22px]
                border
                border-amber-100
                bg-amber-50
                p-4
              "
            >
              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-amber-600
                  "
                >
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-amber-900">
                    Bukti berhasil dikirim
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-amber-800">
                    Bukti penyelesaian telah dikirim kepada pemilik task. Tunggu
                    konfirmasi dari pemilik.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* =======================================================
          BOTTOM ACTION BAR
      ======================================================= */}
      {/* OPEN — HELPER */}

      {task.status === "OPEN" && !isOwner && (
        <div
          className="
            fixed
            bottom-0
            left-0
            right-0
            z-40
            border-t
            border-slate-100
            bg-white/95
            px-4
            pb-[calc(1rem+env(safe-area-inset-bottom))]
            pt-3
            backdrop-blur-xl
          "
        >
          <div className="mx-auto flex max-w-md gap-3">
            {hasApplied ? (
              <div
                className="
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-emerald-50
                  text-xs
                  font-bold
                  text-emerald-700
                "
              >
                <CheckCircle2 size={16} />
                Kamu sudah melamar task ini
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  aria-label="Laporkan Task"
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-red-200
                    bg-white
                    text-red-500
                    transition
                    active:scale-95
                  "
                >
                  <BadgeAlert size={20} />
                </button>

                <button
                  type="button"
                  onClick={handleApplyTask}
                  disabled={applying}
                  className="
                    flex
                    h-12
                    flex-1
                    items-center
                    justify-center
                    rounded-2xl
                    bg-indigo-600
                    text-sm
                    font-extrabold
                    text-white
                    shadow-[0_7px_20px_rgba(79,70,229,0.2)]
                    transition
                    active:scale-[0.98]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {applying ? "Melamar..." : "Lamar Task"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* OWNER ACTION */}

      {isOwner && (task.status === "OPEN" || task.status === "ACCEPTED") && (
        <div
          className="
            fixed
            bottom-0
            left-0
            right-0
            z-40
            border-t
            border-slate-100
            bg-white/95
            px-4
            pb-[calc(1rem+env(safe-area-inset-bottom))]
            pt-3
            backdrop-blur-xl
          "
        >
          <div className="mx-auto flex max-w-md gap-3">
            {task.status === "ACCEPTED" && (
              <button
                type="button"
                onClick={handleOpenChat}
                className="
                  flex
                  h-12
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-indigo-600
                  text-sm
                  font-extrabold
                  text-white
                  shadow-[0_7px_20px_rgba(79,70,229,0.2)]
                  transition
                  active:scale-[0.98]
                "
              >
                <MessageCircle size={18} />
                Chat
              </button>
            )}

            <button
              type="button"
              onClick={handleCancelTask}
              className="
                flex
                h-12
                flex-1
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-red-300
                bg-white
                text-sm
                font-extrabold
                text-red-500
                transition
                active:scale-[0.98]
              "
            >
              Batalkan Task
            </button>
          </div>
        </div>
      )}

      {/* HELPER ACTION */}
      {isSelectedHelper &&
        (task.status === "ACCEPTED" ||
          task.status === "WAITING_CONFIRMATION") && (
          <div
            className="
              fixed
              bottom-0
              left-0
              right-0
              z-40
              border-t
              border-slate-100
              bg-white/95
              px-4
              pb-[calc(1rem+env(safe-area-inset-bottom))]
              pt-3
              backdrop-blur-xl
            "
          >
            <div className="mx-auto flex max-w-md gap-3">
              {task.status === "ACCEPTED" && (
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(true)}
                  className="
                    flex
                    h-12
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-emerald-500
                    text-sm
                    font-extrabold
                    text-white
                    shadow-[0_7px_20px_rgba(16,185,129,0.18)]
                    transition
                    active:scale-[0.98]
                  "
                >
                  <CheckCircle2 size={17} />
                  Task Selesai
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenChat}
                className="
                  flex
                  h-12
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-indigo-600
                  text-sm
                  font-extrabold
                  text-white
                  shadow-[0_7px_20px_rgba(79,70,229,0.2)]
                  transition
                  active:scale-[0.98]
                "
              >
                <MessageCircle size={17} />
                Chat
              </button>
            </div>
          </div>
        )}

      {/* =======================================================
          COMPLETE MODAL
      ======================================================= */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/50 backdrop-blur-sm">
          <div className="w-full rounded-t-[30px] bg-white px-5 pb-8 pt-5 shadow-2xl">
            <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-slate-200" />

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[18px] font-extrabold text-slate-950">
                  Upload Bukti Penyelesaian
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Kirim foto sebagai bukti task telah selesai.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCompleteModal(false)}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-100
                  text-slate-500
                  transition
                  active:scale-95
                "
              >
                ×
              </button>
            </div>

            <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-indigo-50 px-3.5 py-3">
              <Lock size={14} className="mt-0.5 shrink-0 text-indigo-600" />

              <p className="text-[10.5px] leading-4 text-indigo-800">
                Bukti bersifat privat dan hanya dapat dilihat oleh Anda dan
                pemilik task.
              </p>
            </div>

            {proofPreview && (
              <div className="mt-4 overflow-hidden rounded-[20px] border border-slate-100">
                <img
                  src={proofPreview}
                  alt="Preview bukti penyelesaian"
                  className="h-52 w-full object-cover"
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              className="
                mt-4
                w-full
                rounded-2xl
                border
                border-dashed
                border-slate-300
                bg-slate-50
                p-3
                text-xs
                text-slate-600

                file:mr-3
                file:rounded-xl
                file:border-0
                file:bg-white
                file:px-3
                file:py-2
                file:text-xs
                file:font-semibold
                file:text-slate-700

                cursor-pointer
              "
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                handleProofSelected(file);
              }}
            />

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCompleteModal(false)}
                className="
                  flex-1
                  rounded-2xl
                  border
                  border-slate-200
                  py-3
                  text-sm
                  font-bold
                  text-slate-700
                  transition
                  active:scale-[0.98]
                "
              >
                Batal
              </button>

              <button
                type="button"
                disabled={uploadingProof}
                onClick={handleFinishTask}
                className="
                  flex-1
                  rounded-2xl
                  bg-emerald-500
                  py-3
                  text-sm
                  font-extrabold
                  text-white
                  shadow-[0_6px_18px_rgba(16,185,129,0.18)]
                  transition
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {uploadingProof ? "Mengirim..." : "Kirim Bukti"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          REPORT MODAL
      ======================================================= */}
      <ReportTaskModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        taskId={task.id}
        taskOwnerId={task.user_id}
      />
    </main>
  );
}