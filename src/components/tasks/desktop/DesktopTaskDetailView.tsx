"use client";

import { useState } from "react";

import { Camera, Lock, CheckCircle2 } from "lucide-react";

import imageCompression from "browser-image-compression";

import { uploadTaskCompletionProof } from "@/lib/supabase/storage";

import { supabase } from "@/lib/supabase/client";

import Link from "next/link";

import ReportTaskModal from "@/features/reports/components/ReportTaskModal";

import FinishTaskDialog from "@/features/tasks/components/dialog/FinishTaskDialog";

import {
  getTaskCategoryDefinition,
  getTaskCategoryHeroImage,
} from "@/features/tasks/constants/task-categories";

interface TaskUser {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  verification_status?: string | null;
}

interface TaskDetail {
  id: string;
  user_id: string;
  selected_helper_id?: string | null;

  category: string;
  title: string;
  description: string;
  status: string;
  budget: number;

  is_urgent?: boolean | null;
  scheduled_at?: string | null;

  location_type?: string;
  location_name?: string | null;
  manual_address?: string | null;

  completion_proof_photo?: string | null;

  users?: TaskUser | null;
}

interface TaskApplication {
  id: string;
  helper_id: string;

  helper?: TaskUser | null;

  reputation?: {
    averageRating?: number | null;
    totalReviews?: number | null;
    completedTasks?: number | null;
  } | null;
}

interface Props {
  task: TaskDetail;

  applications: TaskApplication[];

  currentUserId: string;

  hasApplied: boolean;

  applying: boolean;

  acceptingHelperId: string | null;

  handleApplyTask: () => void;

  handleAcceptHelper: (helperId: string) => void;

  handleCompleteTask: (proofUrl: string) => Promise<void>;

  handleCancelTask: () => void;

  handleConfirmCompletion: () => Promise<void>;
}

export default function DesktopTaskDetailView({
  task,
  applications,
  currentUserId,
  hasApplied,
  applying,
  acceptingHelperId,
  handleApplyTask,
  handleAcceptHelper,
  handleCompleteTask,
  handleCancelTask,
  handleConfirmCompletion,
}: Props) {
  const [showReportModal, setShowReportModal] = useState(false);

  const [showFinishDialog, setShowFinishDialog] = useState(false);

  const [proofFile, setProofFile] = useState<File | null>(null);

  const [proofPreview, setProofPreview] = useState("");

  const [uploadingProof, setUploadingProof] = useState(false);

  const [confirmingCompletion, setConfirmingCompletion] = useState(false);

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const isOwner = task.user_id === currentUserId;

  const isSelectedHelper = task.selected_helper_id === currentUserId;

  const canAccessChat =
    task.selected_helper_id === currentUserId || task.user_id === currentUserId;

  const category = getTaskCategoryDefinition(task.category);

  const categoryHeroImage = getTaskCategoryHeroImage(task.category);

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

  async function handleProofChange(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran foto maksimal 10MB");

      return;
    }

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

  async function handleFinish() {
    if (!proofFile) {
      alert("Upload foto bukti terlebih dahulu");

      return;
    }

    try {
      setUploadingProof(true);

      const imagePath = await uploadTaskCompletionProof(task.id, proofFile);

      await handleCompleteTask(imagePath);

      setShowFinishDialog(false);

      setProofFile(null);

      setProofPreview("");
    } catch (error) {
      console.error(error);

      alert("Gagal mengupload bukti");
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

  return (
    <main className="hidden min-h-screen bg-slate-50 pb-32 lg:block">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* =====================================================
            HERO
        ===================================================== */}

        <div
          className="
            overflow-hidden
            rounded-4xl
            border
            border-slate-200
            bg-white
            shadow-[0_20px_60px_rgba(15,23,42,0.06)]
          "
        >
          {/* =====================================================
              HERO IMAGE
          ===================================================== */}

          <div
            className="
              relative
              h-90
              overflow-hidden
              bg-slate-100
            "
          >
            <img
              src={categoryHeroImage}
              alt={`Kategori task ${category.label}`}
              className="
                h-full
                w-full
                object-cover
              "
              onError={(event) => {
                event.currentTarget.src = getTaskCategoryHeroImage("Lainnya");
              }}
            />

            {/* OVERLAY */}

            <div
              className="
                absolute
                inset-0
                bg-linear-to-t
                from-slate-950/70
                via-slate-950/10
                to-transparent
              "
            />

            {/* CATEGORY + STATUS */}

            <div
              className="
                absolute
                left-8
                right-8
                top-8
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <div
                className="
                  rounded-full
                  bg-white/90
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-slate-900
                  shadow-lg
                  backdrop-blur
                "
              >
                {category.label}
              </div>

              {task.is_urgent && (
                <div
                  className="
                    mt-5
                    inline-flex
                    rounded-full
                    bg-red-500
                    px-4
                    py-2
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                  "
                >
                  🔥 Mendesak
                </div>
              )}

              <div
                className={`
                  rounded-full
                  px-4
                  py-2
                  text-sm
                  font-bold
                  shadow-lg
                  backdrop-blur

                  ${
                    task.status === "WAITING_CONFIRMATION"
                      ? "bg-amber-400 text-slate-900"
                      : task.status === "COMPLETED"
                        ? "bg-emerald-400 text-slate-900"
                        : task.status === "CANCELLED"
                          ? "bg-red-500 text-white"
                          : task.status === "EXPIRED"
                            ? "bg-slate-800 text-white"
                            : "bg-white/90 text-slate-900"
                  }
                `}
              >
                {task.status === "OPEN"
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
                            : task.status}
              </div>
            </div>

            {/* HERO CONTENT */}

            <div
              className="
                absolute
                bottom-8
                left-8
                right-8
              "
            >
              <h1
                className="
                  max-w-4xl
                  text-4xl
                  font-extrabold
                  leading-tight
                  tracking-tight
                  text-white
                "
              >
                {task.title}
              </h1>

              {task.scheduled_at && (
                <div
                  className="
                    mt-5
                    flex
                    items-center
                    gap-4
                    text-sm
                    font-medium
                    text-white/90
                  "
                >
                  <span>
                    📅{" "}
                    {new Date(task.scheduled_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>

                  <span>•</span>

                  <span>
                    🕒{" "}
                    {new Date(task.scheduled_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* =====================================================
              HERO INFORMATION
          ===================================================== */}

          <div className="grid gap-6 p-8 md:grid-cols-2">
            {/* LOCATION */}

            <div
              className="
                rounded-3xl
                border
                border-slate-200
                bg-slate-50
                p-5
              "
            >
              <p className="text-sm text-slate-500">Lokasi</p>

              <h3
                className="
                  mt-2
                  break-all
                  text-[12px]
                  text-slate-900
                "
              >
                {" "}
                {task.location_type === "SEARCH"
                  ? task.location_name || "Lokasi tidak tersedia"
                  : task.manual_address || "Alamat tidak tersedia"}
              </h3>
            </div>

            {/* BUDGET */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Budget</p>

              <h3 className="mt-2 text-2xl font-extrabold text-emerald-500">
                Rp {task.budget.toLocaleString("id-ID")}
              </h3>
            </div>
          </div>
        </div>

        {/* =====================================================
            DESCRIPTION
        ===================================================== */}

        <div
          className="
            mt-6
            rounded-4xl
            border
            border-slate-200
            bg-white
            p-8
            shadow-[0_10px_30px_rgba(15,23,42,0.05)]
          "
        >
          <h2
            className="
              text-2xl
              font-bold
              tracking-tight
              text-[15px]
              text-slate-900
            "
          >
            Deskripsi
          </h2>

          <p
            className={`
              mt-5
              whitespace-pre-line
              leading-8
              text-slate-600

              ${descriptionExpanded ? "" : "line-clamp-4"}
            `}
          >
            {task.description}
          </p>

          {/* LIHAT SELENGKAPNYA */}
          {task.description.length > 250 && (
            <button
              type="button"
              onClick={() => setDescriptionExpanded((previous) => !previous)}
              className="mt-4 text-sm font-bold text-indigo-600 transition hover:text-indigo-700"
            >
              {descriptionExpanded ? "Tutup" : "Lihat selengkapnya"}
            </button>
          )}
        </div>

        {/* =====================================================
            OWNER
        ===================================================== */}

        <div className="mt-6">
          <h2
            className="
              text-xs
              font-black
              text-slate-900
            "
          >
            Diposting oleh
          </h2>

          <Link
            href={`/users/${task.users?.id}`}
            className="
              mt-5
              flex
              items-center
              gap-4
              rounded-[28px]
              bg-white
              p-6
              shadow-[0_10px_30px_rgba(15,23,42,0.05)]
            "
          >
            {task.users?.avatar_url ? (
              <img
                src={task.users.avatar_url}
                alt="Owner"
                className="
                  h-12
                  w-12
                  rounded-full
                  border
                  border-slate-200
                  object-cover
                "
              />
            ) : (
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-indigo-100
                  font-bold
                  text-indigo-600
                "
              >
                {task.users?.full_name?.charAt(0)?.toUpperCase()}
              </div>
            )}

            <div>
              <p
                className="
                  font-bold
                  text-slate-900
                "
              >
                {task.users?.full_name}
              </p>

              {task.users?.verification_status === "VERIFIED" ? (
                <span
                  className="
                    mt-1
                    inline-flex
                    rounded-full
                    bg-emerald-100
                    px-2
                    py-1
                    text-[10px]
                    font-bold
                    text-emerald-700
                  "
                >
                  ✓ Terverifikasi
                </span>
              ) : (
                <span
                  className="
                    text-[11px]
                    text-slate-400
                  "
                >
                  ⏳ Belum Terverifikasi
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* =====================================================
            APPLICANTS
        ===================================================== */}

        {isOwner && applications.length > 0 && (
          <div className="mt-6">
            <div>
              <h2
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  text-slate-900
                "
              >
                Pelamar
              </h2>

              <p className="mt-2 text-slate-500">Pilih helper terbaik</p>
            </div>

            <div className="mt-6 grid gap-4">
              {applications.map((application) => {
                /**
                 * Apakah helper ini yang sedang dipilih?
                 *
                 * Ini digunakan untuk menentukan helper mana
                 * yang menampilkan "Memilih...".
                 */
                const isAcceptingThisHelper =
                  acceptingHelperId === application.helper_id;

                /**
                 * Apakah helper ini benar-benar sudah
                 * terpilih berdasarkan data task?
                 */
                const isSelected =
                  task.selected_helper_id === application.helper_id;

                return (
                  <div
                    key={application.id}
                    className={`
                      flex
                      items-center
                      justify-between
                      rounded-[28px]
                      border
                      p-6
                      shadow-[0_10px_30px_rgba(15,23,42,0.05)]
                      transition

                      ${
                        isSelected
                          ? "border-emerald-300 bg-emerald-50/60"
                          : "border-slate-200 bg-white"
                      }
                    `}
                  >
                    {/* LEFT */}

                    <Link
                      href={`/users/${application.helper?.id}`}
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-4
                      "
                    >
                      {/* AVATAR */}

                      {application.helper?.avatar_url ? (
                        <img
                          src={application.helper.avatar_url}
                          alt="Helper"
                          className={`
                            h-14
                            w-14
                            shrink-0
                            rounded-full
                            border
                            object-cover

                            ${
                              isSelected
                                ? "border-emerald-400 ring-4 ring-emerald-100"
                                : "border-slate-200"
                            }
                          `}
                        />
                      ) : (
                        <div
                          className={`
                            flex
                            h-14
                            w-14
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            text-lg
                            font-bold

                            ${
                              isSelected
                                ? "bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50"
                                : "bg-indigo-100 text-indigo-700"
                            }
                          `}
                        >
                          {application.helper?.full_name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>
                      )}

                      {/* INFO */}

                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <h3
                            className="
                              truncate
                              text-lg
                              font-bold
                              text-slate-900
                            "
                          >
                            {application.helper?.full_name || "Unknown User"}
                          </h3>

                          {/* HELPER TERPILIH */}

                          {isSelected && (
                            <span
                              className="
                                inline-flex
                                shrink-0
                                items-center
                                gap-1
                                rounded-full
                                bg-emerald-100
                                px-3
                                py-1.5
                                text-xs
                                font-bold
                                text-emerald-700
                              "
                            >
                              <CheckCircle2 size={13} />
                              Helper Terpilih
                            </span>
                          )}
                        </div>

                        <div
                          className="
                            mt-1
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <p className="text-sm text-slate-500">
                            ⭐ {application.reputation?.averageRating || "0.0"}
                          </p>

                          <div
                            className="
                              h-1
                              w-1
                              rounded-full
                              bg-slate-300
                            "
                          />

                          <p className="text-sm text-slate-400">
                            {application.reputation?.totalReviews || 0} reviews
                          </p>
                        </div>

                        <p
                          className="
                            mt-1
                            text-sm
                            font-medium
                            text-indigo-600
                          "
                        >
                          🏆 {application.reputation?.completedTasks || 0} task
                          selesai
                        </p>
                      </div>
                    </Link>

                    {/* BUTTON */}

                    {task.status === "OPEN" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleAcceptHelper(application.helper_id)
                        }
                        disabled={acceptingHelperId !== null}
                        className={`
                          ml-6
                          shrink-0
                          rounded-2xl
                          px-5
                          py-3
                          text-sm
                          font-semibold
                          text-white
                          transition

                          ${
                            isSelected
                              ? "bg-emerald-500"
                              : "bg-indigo-600 hover:bg-indigo-700"
                          }

                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        `}
                      >
                        {isAcceptingThisHelper
                          ? "Memilih..."
                          : isSelected
                            ? "Terpilih"
                            : "Terima Helper"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =======================================================
          OWNER ACTIONS
      ======================================================= */}

      {isOwner && (task.status === "OPEN" || task.status === "ACCEPTED") && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleCancelTask}
            className="
                flex
                h-14
                w-56
                max-w-sm
                items-center
                justify-center
                rounded-2xl
                bg-red-500
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-red-600
              "
          >
            Batalkan Task
          </button>
        </div>
      )}

      {/* =======================================================
          CHAT / HELPER ACTION
      ======================================================= */}

      {task.status === "ACCEPTED" && canAccessChat && (
        <div
          className="
              fixed
              bottom-0
              left-0
              right-0
              z-40
              border-t
              border-slate-200
              bg-white/90
              p-4
              backdrop-blur
            "
        >
          <div className="mx-auto max-w-5xl">
            <div className="flex gap-3">
              {/* SELESAIKAN TASK */}

              {isSelectedHelper && (
                <button
                  type="button"
                  onClick={() => setShowFinishDialog(true)}
                  disabled={uploadingProof}
                  className="
                      flex
                      h-14
                      items-center
                      justify-center
                      rounded-[20px]
                      bg-emerald-600
                      px-6
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-emerald-700
                      disabled:opacity-50
                    "
                >
                  {uploadingProof ? "Mengirim..." : "Selesaikan Task"}
                </button>
              )}

              {/* CHAT */}

              <button
                type="button"
                onClick={async () => {
                  try {
                    const conversation = await getConversationByTask(task.id);

                    if (!conversation) return;

                    window.location.href = `/messages/${conversation.id}`;
                  } catch (error) {
                    console.error(error);

                    alert("Gagal membuka percakapan.");
                  }
                }}
                className="
                    flex
                    h-14
                    flex-1
                    items-center
                    justify-center
                    rounded-[20px]
                    bg-indigo-600
                    text-lg
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-indigo-600/20
                    transition
                    hover:bg-indigo-700
                  "
              >
                Buka Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          HELPER WAITING CONFIRMATION
      ======================================================= */}

      {isSelectedHelper && task.status === "WAITING_CONFIRMATION" && (
        <div
          className="
              fixed
              bottom-0
              left-70
              right-70
              z-20
              rounded-3xl
              border-slate-200
              bg-white/95
              p-4
              backdrop-blur
            "
        >
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-3">
              <div className="text-xl font-bold text-emerald-700">
                ✓ Bukti berhasil dikirim
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Bukti penyelesaian telah dikirim ke pemilik task.
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Saat ini Anda hanya perlu menunggu konfirmasi dari pemilik task.
              </p>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const conversation = await getConversationByTask(task.id);

                    if (!conversation) return;

                    window.location.href = `/messages/${conversation.id}`;
                  } catch (error) {
                    console.error(error);

                    alert("Gagal membuka percakapan.");
                  }
                }}
                className="
                    mt-5
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    rounded-2xl
                    bg-indigo-600
                    font-semibold
                    text-white
                    transition
                    hover:bg-indigo-700
                  "
              >
                Buka Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          STICKY APPLY BUTTON
      ======================================================= */}

      {!isOwner &&
        !isSelectedHelper &&
        !hasApplied &&
        task.status === "OPEN" && (
          <div
            className="
              fixed
              bottom-0
              left-0
              right-0
              z-40
              border-t
              border-slate-200
              bg-white/90
              p-4
              backdrop-blur
            "
          >
            <div className="mx-auto max-w-5xl">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="
                    flex
                    h-14
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-red-300
                    px-6
                    text-sm
                    font-bold
                    text-red-600
                  "
                >
                  Report
                </button>

                <button
                  type="button"
                  onClick={handleApplyTask}
                  disabled={applying}
                  className="
                    flex
                    h-14
                    flex-1
                    items-center
                    justify-center
                    rounded-2xl
                    bg-indigo-600
                    text-sm
                    font-bold
                    text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {applying ? "Melamar..." : "Lamar Task"}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =======================================================
          ALREADY APPLIED
      ======================================================= */}

      {!isOwner &&
        !isSelectedHelper &&
        hasApplied &&
        task.status === "OPEN" && (
          <div
            className="
              fixed
              bottom-0
              left-0
              right-0
              z-40
              border-t
              border-slate-200
              bg-white
              p-4
            "
          >
            <div className="mx-auto max-w-5xl">
              <div
                className="
                  flex
                  h-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-emerald-100
                  text-sm
                  font-bold
                  text-emerald-700
                "
              >
                ✓ Kamu sudah melamar task ini
              </div>
            </div>
          </div>
        )}

      {/* =======================================================
          TASK CLOSED INFO
      ======================================================= */}

      {!isOwner && !isSelectedHelper && task.status === "ACCEPTED" && (
        <div
          className="
              fixed
              bottom-0
              left-0
              right-0
              z-40
              border-t
              border-slate-200
              bg-white
              p-4
            "
        >
          <div className="mx-auto max-w-5xl">
            <div
              className="
                  flex
                  h-14
                  items-center
                  justify-center
                  rounded-[20px]
                  bg-slate-100
                  text-sm
                  font-semibold
                  text-slate-500
                "
            >
              Sudah ada yang membantu
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          COMPLETION PROOF — OWNER
      ======================================================= */}

      {isOwner &&
        task.status === "WAITING_CONFIRMATION" &&
        task.completion_proof_photo && (
          <div className="mx-auto max-w-5xl px-6">
            <div
              className="
                mt-6
                rounded-4xl
                border
                border-slate-200
                bg-white
                p-8
                shadow-[0_10px_30px_rgba(15,23,42,0.05)]
              "
            >
              {/* HEADER */}

              <div className="flex items-center justify-between">
                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-indigo-50
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-indigo-700
                  "
                >
                  <Camera className="h-4 w-4" />
                  Bukti dari Helper
                </div>
              </div>

              <h2 className="mt-6 text-2xl font-bold text-slate-900">
                Bukti Penyelesaian
              </h2>

              <p className="mt-3 text-base leading-7 text-slate-500">
                Helper telah mengirim bukti penyelesaian pekerjaan. Periksa foto
                berikut sebelum mengonfirmasi bahwa pekerjaan benar-benar telah
                selesai.
              </p>

              <img
                loading="lazy"
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/task-completion-proofs/${task.completion_proof_photo}`}
                alt="Completion Proof"
                className="
                  mt-6
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  object-cover
                "
                onError={(event) => {
                  event.currentTarget.src = "/images/image-error.png";
                }}
              />

              <div className="mt-5 flex items-center gap-2">
                <Lock
                  className="h-3 w-3 shrink-0 text-amber-600"
                  strokeWidth={2}
                />

                <p className="text-[12px] leading-6 text-amber-800">
                  Bukti penyelesaian bersifat privat dan hanya dapat dilihat
                  oleh Anda dan helper.
                </p>
              </div>

              <button
                type="button"
                onClick={onConfirmCompletion}
                disabled={confirmingCompletion}
                className="
                  mt-6
                  flex
                  h-14
                  w-full
                  items-center
                  justify-center
                  rounded-2xl
                  bg-emerald-600
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-emerald-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {confirmingCompletion
                  ? "Mengonfirmasi..."
                  : "Konfirmasi Penyelesaian"}
              </button>
            </div>
          </div>
        )}

      {/* =======================================================
          FINISH TASK DIALOG
      ======================================================= */}

      <FinishTaskDialog
        open={showFinishDialog}
        onClose={() => setShowFinishDialog(false)}
        proofPreview={proofPreview}
        uploadingProof={uploadingProof}
        handleProofChange={handleProofChange}
        handleFinish={handleFinish}
      />

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