"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import { useParams } from "next/navigation";

import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  ClipboardList,
  Clock3,
  ExternalLink,
  FileText,
  Flag,
  Loader2,
  ShieldAlert,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  banUser,
  suspendUser,
} from "@/features/admin/services/user-moderation.service";

import { removeTask } from "@/features/admin/services/task-moderation.service";

import { updateReportStatus } from "@/features/admin/services/report-admin.service";

import { REPORT_REASONS } from "@/features/reports/constants/report-reasons";

import { supabase } from "@/lib/supabase/client";

interface ReportUser {
  id: string;
  full_name: string;
  verification_status:
    | string
    | null;
}

interface ReportTask {
  id: string;
  title: string;
  status: string;
  budget: number | null;
}

interface Report {
  id: string;

  reporter_id: string;

  reported_user_id: string;

  reason: string;

  description: string | null;

  status:
    | "PENDING"
    | "REVIEWED"
    | "RESOLVED"
    | "REJECTED"
    | string;

  admin_notes: string | null;

  created_at: string;

  reporter: ReportUser | null;

  reported_user:
    | ReportUser
    | null;

  task: ReportTask | null;
}

function getSingleRelation<T>(
  value: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function getReasonLabel(
  reason: string,
) {
  return (
    REPORT_REASONS.find(
      (item) =>
        item.value === reason,
    )?.label || reason
  );
}

function getStatusLabel(
  status: string,
) {
  switch (status) {
    case "PENDING":
      return "Perlu Ditinjau";

    case "REVIEWED":
      return "Sedang Ditinjau";

    case "RESOLVED":
      return "Selesai";

    case "REJECTED":
      return "Ditolak";

    default:
      return status;
  }
}

function getStatusColor(
  status: string,
) {
  switch (status) {
    case "PENDING":
      return `
        border-amber-200
        bg-amber-50
        text-amber-700
      `;

    case "REVIEWED":
      return `
        border-blue-200
        bg-blue-50
        text-blue-700
      `;

    case "RESOLVED":
      return `
        border-emerald-200
        bg-emerald-50
        text-emerald-700
      `;

    case "REJECTED":
      return `
        border-red-200
        bg-red-50
        text-red-700
      `;

    default:
      return `
        border-slate-200
        bg-slate-50
        text-slate-700
      `;
  }
}

export default function ReportDetailPage() {
  const params = useParams();

  const reportId =
    Array.isArray(params.id)
      ? params.id[0]
      : params.id;

  const [report, setReport] =
    useState<Report | null>(null);

  const [
    adminNotes,
    setAdminNotes,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    processingStatus,
    setProcessingStatus,
  ] = useState<string | null>(
    null,
  );

  const [
    moderationAction,
    setModerationAction,
  ] = useState<string | null>(
    null,
  );

  const loadReport =
    useCallback(async () => {
      if (!reportId) {
        return;
      }

      try {
        setLoading(true);

        const { data, error } =
          await supabase
            .from("reports")
            .select(
              `
                id,
                reporter_id,
                reported_user_id,
                reason,
                description,
                status,
                admin_notes,
                created_at,
                reporter:users!reports_reporter_id_fkey (
                  id,
                  full_name,
                  verification_status
                ),
                reported_user:users!reports_reported_user_id_fkey (
                  id,
                  full_name,
                  verification_status
                ),
                task:tasks (
                  id,
                  title,
                  status,
                  budget
                )
              `,
            )
            .eq(
              "id",
              reportId,
            )
            .single();

        if (error) {
          console.error(error);

          setReport(null);

          return;
        }

        const reportData: Report = {
  id: data.id,

  reporter_id:
    data.reporter_id,

  reported_user_id:
    data.reported_user_id,

  reason: data.reason,

  description:
    data.description,

  status: data.status,

  admin_notes:
    data.admin_notes,

  created_at:
    data.created_at,

  reporter:
    getSingleRelation<ReportUser>(
      data.reporter,
    ),

  reported_user:
    getSingleRelation<ReportUser>(
      data.reported_user,
    ),

  task:
    getSingleRelation<ReportTask>(
      data.task,
    ),
};

setReport(reportData);

setAdminNotes(
  reportData.admin_notes || "",
);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, [reportId]);

  useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadReport();
  }, 0);

  return () => {
    window.clearTimeout(timer);
  };
}, [loadReport]);

  async function handleUpdateStatus(
    status:
      | "REVIEWED"
      | "RESOLVED"
      | "REJECTED",
  ) {
    if (!report) {
      return;
    }

    try {
      setProcessingStatus(
        status,
      );

      await updateReportStatus(
        report.id,
        status,
        adminNotes,
      );

      alert(
        "Status laporan berhasil diperbarui",
      );

      await loadReport();
    } catch (error) {
      console.error(error);

      alert(
        "Gagal memperbarui laporan",
      );
    } finally {
      setProcessingStatus(
        null,
      );
    }
  }

  async function handleRemoveTask() {
    const taskId =
      report?.task?.id;

    if (!taskId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Hapus task ini dari platform? Tindakan ini tidak dapat dianggap sebagai sekadar perubahan status laporan.",
      );

    if (!confirmed) {
      return;
    }

    try {
      setModerationAction(
        "REMOVE_TASK",
      );

      await removeTask(taskId);

      alert(
        "Task berhasil dihapus",
      );

      await loadReport();
    } catch (error) {
      console.error(error);

      alert(
        "Gagal menghapus task",
      );
    } finally {
      setModerationAction(
        null,
      );
    }
  }

  async function handleSuspendUser(
    days: number,
  ) {
    const userId =
      report?.reported_user?.id;

    if (!userId || !report) {
      return;
    }

    const confirmed =
      window.confirm(
        `Suspend pengguna selama ${days} hari?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setModerationAction(
        `SUSPEND_${days}`,
      );

      await suspendUser(
        userId,
        days,
        report.reason,
      );

      alert(
        `Pengguna berhasil disuspend ${days} hari`,
      );
    } catch (error) {
      console.error(error);

      alert(
        "Gagal suspend pengguna",
      );
    } finally {
      setModerationAction(
        null,
      );
    }
  }

  async function handleBanUser() {
    const userId =
      report?.reported_user?.id;

    if (!userId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Ban pengguna secara permanen?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setModerationAction(
        "BAN",
      );

      await banUser(userId);

      alert(
        "Pengguna berhasil dibanned",
      );
    } catch (error) {
      console.error(error);

      alert(
        "Gagal ban pengguna",
      );
    } finally {
      setModerationAction(
        null,
      );
    }
  }

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-80
          items-center
          justify-center
          text-sm
          text-slate-500
        "
      >
        Memuat laporan...
      </div>
    );
  }

  if (!report) {
    return (
      <div
        className="
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-10
          text-center
        "
      >
        <h2 className="font-bold text-slate-900">
          Laporan tidak ditemukan
        </h2>

        <Link
          href="/admin/reports"
          className="
            mt-4
            inline-flex
            text-sm
            font-bold
            text-indigo-600
          "
        >
          Kembali ke Reports
        </Link>
      </div>
    );
  }

  const isTaskReport =
    Boolean(report.task);

  const statusBusy =
    processingStatus !== null;

  const moderationBusy =
    moderationAction !== null;

  return (
    <div
      className="
        mx-auto
        max-w-7xl
        space-y-6
      "
    >
      {/* BACK + TITLE */}
      <section>
        <Link
          href="/admin/reports"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-slate-500
            transition
            hover:text-slate-900
          "
        >
          <ArrowLeft className="h-4 w-4" />

          Kembali ke daftar laporan
        </Link>

        <div
          className="
            mt-5
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-start
            lg:justify-between
          "
        >
          <div>
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
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

                  ${
                    isTaskReport
                      ? `
                          bg-indigo-50
                          text-indigo-700
                        `
                      : `
                          bg-violet-50
                          text-violet-700
                        `
                  }
                `}
              >
                {isTaskReport ? (
                  <ClipboardList className="h-3.5 w-3.5" />
                ) : (
                  <UserRound className="h-3.5 w-3.5" />
                )}

                {isTaskReport
                  ? "Laporan Task"
                  : "Laporan Pengguna"}
              </span>

              <span
                className={`
                  inline-flex
                  rounded-full
                  border
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  ${getStatusColor(
                    report.status,
                  )}
                `}
              >
                {getStatusLabel(
                  report.status,
                )}
              </span>
            </div>

            <h1
              className="
                mt-3
                text-3xl
                font-black
                tracking-tight
                text-slate-900
              "
            >
              {getReasonLabel(
                report.reason,
              )}
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-slate-500
              "
            >
              Report ID:{" "}
              <span
                className="
                  font-mono
                  text-slate-700
                "
              >
                {report.id}
              </span>
            </p>
          </div>

          <div
            className="
              flex
              items-center
              gap-2
              text-sm
              text-slate-500
            "
          >
            <Clock3 className="h-4 w-4" />

            {new Date(
              report.created_at,
            ).toLocaleString(
              "id-ID",
            )}
          </div>
        </div>
      </section>

      {/* MAIN INFORMATION */}
      <div
        className="
          grid
          gap-6
          xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]
        "
      >
        {/* LEFT */}
        <div className="space-y-6">
          {/* DESCRIPTION */}
          <section
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-sm
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-2xl
                  bg-slate-100
                  text-slate-600
                "
              >
                <FileText className="h-4 w-4" />
              </div>

              <div>
                <h2
                  className="
                    font-black
                    text-slate-900
                  "
                >
                  Keterangan Pelapor
                </h2>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-slate-500
                  "
                >
                  Informasi yang diberikan saat laporan dibuat.
                </p>
              </div>
            </div>

            <div
              className="
                mt-5
                rounded-2xl
                bg-slate-50
                p-5
                text-sm
                leading-7
                text-slate-700
              "
            >
              {report.description ||
                "Pelapor tidak memberikan keterangan tambahan."}
            </div>
          </section>

          {/* ADMIN REVIEW */}
          <section
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-sm
            "
          >
            <div>
              <h2
                className="
                  text-lg
                  font-black
                  text-slate-900
                "
              >
                Hasil Peninjauan Admin
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Tulis hasil pemeriksaan sebelum menentukan status
                laporan.
              </p>
            </div>

            <textarea
              value={adminNotes}
              disabled={statusBusy}
              onChange={(event) =>
                setAdminNotes(
                  event.target.value,
                )
              }
              placeholder="Contoh: laporan telah diperiksa, bukti dan konteks task telah ditinjau..."
              className="
                mt-5
                min-h-36
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
                focus:border-indigo-300
                focus:bg-white
                focus:ring-4
                focus:ring-indigo-50
                disabled:opacity-60
              "
            />

            <p
              className="
                mt-2
                text-xs
                text-slate-400
              "
            >
              Catatan akan disimpan ketika Anda memilih status laporan.
            </p>

            {/* STATUS ACTIONS */}
            <div
              className="
                mt-6
                border-t
                border-slate-100
                pt-6
              "
            >
              <h3
                className="
                  text-sm
                  font-black
                  text-slate-900
                "
              >
                Tentukan Status
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                Status menunjukkan progres penanganan laporan, bukan
                tindakan moderasi terhadap akun atau task.
              </p>

              <div
                className="
                  mt-4
                  grid
                  gap-3
                  md:grid-cols-3
                "
              >
                <StatusButton
                  label="Mulai Tinjau"
                  icon={Clock3}
                  active={
                    report.status ===
                    "REVIEWED"
                  }
                  loading={
                    processingStatus ===
                    "REVIEWED"
                  }
                  disabled={
                    statusBusy
                  }
                  className="
                    border-blue-200
                    bg-blue-50
                    text-blue-700
                    hover:bg-blue-100
                  "
                  onClick={() =>
                    handleUpdateStatus(
                      "REVIEWED",
                    )
                  }
                />

                <StatusButton
                  label="Selesaikan"
                  icon={CheckCircle2}
                  active={
                    report.status ===
                    "RESOLVED"
                  }
                  loading={
                    processingStatus ===
                    "RESOLVED"
                  }
                  disabled={
                    statusBusy
                  }
                  className="
                    border-emerald-200
                    bg-emerald-50
                    text-emerald-700
                    hover:bg-emerald-100
                  "
                  onClick={() =>
                    handleUpdateStatus(
                      "RESOLVED",
                    )
                  }
                />

                <StatusButton
                  label="Tolak Laporan"
                  icon={XCircle}
                  active={
                    report.status ===
                    "REJECTED"
                  }
                  loading={
                    processingStatus ===
                    "REJECTED"
                  }
                  disabled={
                    statusBusy
                  }
                  className="
                    border-red-200
                    bg-red-50
                    text-red-700
                    hover:bg-red-100
                  "
                  onClick={() =>
                    handleUpdateStatus(
                      "REJECTED",
                    )
                  }
                />
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT CONTEXT */}
        <aside className="space-y-6">
          {/* PEOPLE */}
          <section
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-sm
            "
          >
            <h2
              className="
                font-black
                text-slate-900
              "
            >
              Pihak Terkait
            </h2>

            <div
              className="
                mt-5
                space-y-5
              "
            >
              <UserInfo
                label="Pelapor"
                user={
                  report.reporter
                }
              />

              <div
                className="
                  border-t
                  border-slate-100
                "
              />

              <UserInfo
                label="Pengguna Dilaporkan"
                user={
                  report.reported_user
                }
                showProfileLink
              />
            </div>
          </section>

          {/* TASK */}
          {report.task && (
            <section
              className="
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-sm
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <ClipboardList
                  className="
                    h-5
                    w-5
                    text-indigo-600
                  "
                />

                <h2
                  className="
                    font-black
                    text-slate-900
                  "
                >
                  Task Dilaporkan
                </h2>
              </div>

              <h3
                className="
                  mt-5
                  font-bold
                  text-slate-900
                "
              >
                {report.task.title}
              </h3>

              <div
                className="
                  mt-3
                  flex
                  flex-wrap
                  gap-2
                "
              >
                <span
                  className="
                    rounded-full
                    bg-slate-100
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-slate-600
                  "
                >
                  {report.task.status}
                </span>

                {report.task.budget !==
                  null && (
                  <span
                    className="
                      rounded-full
                      bg-emerald-50
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      text-emerald-700
                    "
                  >
                    Rp{" "}
                    {report.task.budget.toLocaleString(
                      "id-ID",
                    )}
                  </span>
                )}
              </div>

              <Link
                href={`/tasks/${report.task.id}`}
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-bold
                  text-indigo-600
                  hover:text-indigo-700
                "
              >
                Buka detail task

                <ExternalLink className="h-4 w-4" />
              </Link>
            </section>
          )}
        </aside>
      </div>

      {/* MODERATION */}
      <section
        className="
          rounded-3xl
          border
          border-red-200
          bg-red-50/40
          p-6
        "
      >
        <div
          className="
            flex
            items-start
            gap-3
          "
        >
          <ShieldAlert
            className="
              mt-0.5
              h-5
              w-5
              shrink-0
              text-red-600
            "
          />

          <div>
            <h2
              className="
                text-lg
                font-black
                text-red-900
              "
            >
              Tindakan Moderasi
            </h2>

            <p
              className="
                mt-1
                max-w-3xl
                text-sm
                leading-6
                text-red-700
              "
            >
              Gunakan tindakan berikut hanya setelah laporan diperiksa.
              Moderasi akun atau task terpisah dari perubahan status
              laporan.
            </p>
          </div>
        </div>

        <div
          className="
            mt-6
            grid
            gap-5
            xl:grid-cols-2
          "
        >
          {/* TASK MODERATION */}
          {report.task && (
            <div
              className="
                rounded-2xl
                border
                border-red-100
                bg-white
                p-5
              "
            >
              <h3
                className="
                  font-black
                  text-slate-900
                "
              >
                Moderasi Task
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                Hapus task apabila melanggar aturan platform.
              </p>

              <button
                type="button"
                disabled={
                  moderationBusy
                }
                onClick={
                  handleRemoveTask
                }
                className="
                  mt-4
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-red-600
                  px-4
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-red-700
                  disabled:opacity-50
                "
              >
                {moderationAction ===
                "REMOVE_TASK" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}

                Hapus Task
              </button>
            </div>
          )}

          {/* USER MODERATION */}
          <div
            className="
              rounded-2xl
              border
              border-red-100
              bg-white
              p-5
            "
          >
            <h3
              className="
                font-black
                text-slate-900
              "
            >
              Moderasi Pengguna
            </h3>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-slate-500
              "
            >
              Suspend sementara atau ban pengguna jika pelanggaran telah
              terverifikasi.
            </p>

            <div
              className="
                mt-4
                flex
                flex-wrap
                gap-2
              "
            >
              {[3, 7, 30].map(
                (days) => (
                  <button
                    key={days}
                    type="button"
                    disabled={
                      moderationBusy
                    }
                    onClick={() =>
                      handleSuspendUser(
                        days,
                      )
                    }
                    className="
                      h-10
                      rounded-xl
                      border
                      border-amber-200
                      bg-amber-50
                      px-4
                      text-xs
                      font-bold
                      text-amber-700
                      transition
                      hover:bg-amber-100
                      disabled:opacity-50
                    "
                  >
                    {moderationAction ===
                    `SUSPEND_${days}`
                      ? "Memproses..."
                      : `Suspend ${days} Hari`}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={
                  moderationBusy
                }
                onClick={
                  handleBanUser
                }
                className="
                  inline-flex
                  h-10
                  items-center
                  gap-2
                  rounded-xl
                  bg-slate-950
                  px-4
                  text-xs
                  font-bold
                  text-white
                  transition
                  hover:bg-black
                  disabled:opacity-50
                "
              >
                {moderationAction ===
                "BAN" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Ban className="h-3.5 w-3.5" />
                )}

                Ban Permanen
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function UserInfo({
  label,
  user,
  showProfileLink = false,
}: {
  label: string;

  user: ReportUser | null;

  showProfileLink?: boolean;
}) {
  return (
    <div>
      <p
        className="
          text-xs
          font-semibold
          text-slate-400
        "
      >
        {label}
      </p>

      <div
        className="
          mt-2
          flex
          items-center
          gap-3
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-slate-100
            text-slate-600
          "
        >
          <UserRound className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            <p
              className="
                truncate
                text-sm
                font-bold
                text-slate-900
              "
            >
              {user?.full_name ||
                "Tidak diketahui"}
            </p>

            {user?.verification_status ===
              "VERIFIED" && (
              <span
                className="
                  rounded-full
                  bg-emerald-50
                  px-2
                  py-1
                  text-[9px]
                  font-black
                  text-emerald-700
                "
              >
                VERIFIED
              </span>
            )}
          </div>

          {showProfileLink &&
            user?.id && (
              <Link
                href={`/users/${user.id}`}
                className="
                  mt-1
                  inline-flex
                  items-center
                  gap-1
                  text-xs
                  font-semibold
                  text-indigo-600
                "
              >
                Buka profil

                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
        </div>
      </div>
    </div>
  );
}

function StatusButton({
  label,
  icon: Icon,
  loading,
  active,
  disabled,
  onClick,
  className,
}: {
  label: string;

  icon: typeof Flag;

  loading: boolean;

  active: boolean;

  disabled: boolean;

  onClick: () => void;

  className: string;
}) {
  return (
    <button
      type="button"
      disabled={
        disabled || active
      }
      onClick={onClick}
      className={`
        flex
        h-12
        items-center
        justify-center
        gap-2
        rounded-2xl
        border
        px-4
        text-sm
        font-bold
        transition
        disabled:cursor-not-allowed
        disabled:opacity-50

        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}

      {active
        ? "Status Saat Ini"
        : label}
    </button>
  );
}