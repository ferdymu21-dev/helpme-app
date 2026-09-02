"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Eye,
  Flag,
  Inbox,
  Search,
  UserRound,
  ClipboardList,
  XCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

import { REPORT_REASONS } from "@/features/reports/constants/report-reasons";

interface RelatedUser {
  id: string;
  full_name: string;
}

interface RelatedTask {
  id: string;
  title: string;
  status: string;
}

interface Report {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  admin_notes: string | null;
  task_id: string | null;

  reporter: RelatedUser | null;

  reported_user: RelatedUser | null;

  task: RelatedTask | null;
}

function getSingleRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

type StatusFilter = "ALL" | "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED";

const STATUS_FILTERS: {
  value: StatusFilter;
  label: string;
}[] = [
  {
    value: "ALL",
    label: "Semua",
  },
  {
    value: "PENDING",
    label: "Perlu Ditinjau",
  },
  {
    value: "REVIEWED",
    label: "Sedang Ditinjau",
  },
  {
    value: "RESOLVED",
    label: "Selesai",
  },
  {
    value: "REJECTED",
    label: "Ditolak",
  },
];

function getReasonLabel(reason: string) {
  return REPORT_REASONS.find((item) => item.value === reason)?.label || reason;
}

function getStatusLabel(status: string) {
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

function getStatusColor(status: string) {
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

function formatDate(date: string) {
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("reports")
        .select(
          `
                id,
                reason,
                description,
                status,
                created_at,
                admin_notes,
                task_id,
                reporter:users!reports_reporter_id_fkey (
                  id,
                  full_name
                ),
                reported_user:users!reports_reported_user_id_fkey (
                  id,
                  full_name
                ),
                task:tasks (
                  id,
                  title,
                  status
                )
              `,
        )
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(error);

        return;
      }

      const normalizedReports: Report[] = (data ?? []).map((item) => ({
        id: item.id,
        reason: item.reason,
        description: item.description,
        status: item.status,
        created_at: item.created_at,
        admin_notes: item.admin_notes,
        task_id: item.task_id,

        reporter: getSingleRelation<RelatedUser>(item.reporter),

        reported_user: getSingleRelation<RelatedUser>(item.reported_user),

        task: getSingleRelation<RelatedTask>(item.task),
      }));

      setReports(normalizedReports);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReports();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadReports]);

  const statistics = useMemo(
    () => ({
      total: reports.length,

      pending: reports.filter((report) => report.status === "PENDING").length,

      reviewed: reports.filter((report) => report.status === "REVIEWED").length,

      resolved: reports.filter((report) => report.status === "RESOLVED").length,

      rejected: reports.filter((report) => report.status === "REJECTED").length,
    }),
    [reports],
  );

  const filteredReports = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return reports.filter((report) => {
      if (statusFilter !== "ALL" && report.status !== statusFilter) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const searchableText = [
        getReasonLabel(report.reason),
        report.description || "",
        report.reporter?.full_name || "",
        report.reported_user?.full_name || "",
        report.task?.title || "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [reports, search, statusFilter]);

  return (
    <div
      className="
        mx-auto
        max-w-7xl
        space-y-7
      "
    >
      {/* INTRO */}
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
            items-start
            gap-4
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-indigo-50
              text-indigo-600
            "
          >
            <Flag className="h-5 w-5" strokeWidth={2.2} />
          </div>

          <div>
            <h2
              className="
                text-xl
                font-black
                text-slate-900
              "
            >
              Pusat Moderasi Laporan
            </h2>

            <p
              className="
                mt-1
                max-w-3xl
                text-sm
                leading-6
                text-slate-500
              "
            >
              Tinjau laporan yang dikirim pengguna sebelum mengambil tindakan
              terhadap task atau akun.
            </p>
          </div>
        </div>

        {/* WORKFLOW */}
        <div
          className="
            mt-6
            grid
            gap-3
            lg:grid-cols-3
          "
        >
          {[
            {
              number: "1",
              title: "Buka laporan",
              description: "Pilih laporan yang perlu diperiksa.",
            },
            {
              number: "2",
              title: "Periksa konteks",
              description: "Lihat pelapor, pengguna, task, dan detail laporan.",
            },
            {
              number: "3",
              title: "Ambil keputusan",
              description:
                "Tandai status dan lakukan moderasi jika diperlukan.",
            },
          ].map((step) => (
            <div
              key={step.number}
              className="
                flex
                gap-3
                rounded-2xl
                bg-slate-50
                p-4
              "
            >
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-900
                  text-xs
                  font-black
                  text-white
                "
              >
                {step.number}
              </div>

              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-slate-900
                  "
                >
                  {step.title}
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STATISTICS */}
      <section
        className="
          grid
          gap-4
          md:grid-cols-2
          xl:grid-cols-5
        "
      >
        <StatCard icon={Flag} label="Total Laporan" value={statistics.total} />

        <StatCard
          icon={Clock3}
          label="Perlu Ditinjau"
          value={statistics.pending}
        />

        <StatCard
          icon={Eye}
          label="Sedang Ditinjau"
          value={statistics.reviewed}
        />

        <StatCard
          icon={CheckCircle2}
          label="Selesai"
          value={statistics.resolved}
        />

        <StatCard icon={XCircle} label="Ditolak" value={statistics.rejected} />
      </section>

      {/* FILTER */}
      <section
        className="
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >
          <div
            className="
              relative
              w-full
              xl:max-w-md
            "
          >
            <Search
              className="
                absolute
                top-1/2
                left-4
                h-4
                w-4
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari alasan, pengguna, atau task..."
              className="
                h-12
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                pr-4
                pl-11
                text-sm
                outline-none
                transition
                focus:border-indigo-300
                focus:bg-white
                focus:ring-4
                focus:ring-indigo-50
              "
            />
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setStatusFilter(item.value)}
                className={`
                    rounded-xl
                    px-4
                    py-2.5
                    text-xs
                    font-bold
                    transition

                    ${
                      statusFilter === item.value
                        ? `
                            bg-slate-900
                            text-white
                          `
                        : `
                            bg-slate-100
                            text-slate-600
                            hover:bg-slate-200
                          `
                    }
                  `}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <p
          className="
            mt-4
            text-xs
            text-slate-400
          "
        >
          Menampilkan {filteredReports.length} dari {reports.length} laporan
        </p>
      </section>

      {/* REPORT LIST */}
      <section>
        {loading ? (
          <div
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-10
              text-center
              text-sm
              text-slate-500
            "
          >
            Memuat laporan...
          </div>
        ) : filteredReports.length === 0 ? (
          <div
            className="
              rounded-3xl
              border
              border-dashed
              border-slate-300
              bg-white
              p-12
              text-center
            "
          >
            <Inbox
              className="
                mx-auto
                h-10
                w-10
                text-slate-300
              "
            />

            <h3
              className="
                mt-4
                font-bold
                text-slate-900
              "
            >
              Tidak ada laporan
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Tidak ada laporan yang cocok dengan filter saat ini.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => {
              const isTaskReport = Boolean(report.task_id || report.task);

              return (
                <article
                  key={report.id}
                  className="
                      rounded-3xl
                      border
                      border-slate-200
                      bg-white
                      p-5
                      shadow-sm
                      transition
                      hover:border-slate-300
                      hover:shadow-md
                    "
                >
                  <div
                    className="
                        flex
                        flex-col
                        gap-5
                        xl:flex-row
                        xl:items-center
                        xl:justify-between
                      "
                  >
                    <div
                      className="
                          min-w-0
                          flex-1
                        "
                    >
                      {/* BADGES */}
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
                              gap-1.5
                              rounded-full
                              px-3
                              py-1.5
                              text-[11px]
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

                          {isTaskReport ? "Laporan Task" : "Laporan Pengguna"}
                        </span>

                        <span
                          className={`
                              inline-flex
                              rounded-full
                              border
                              px-3
                              py-1.5
                              text-[11px]
                              font-bold
                              ${getStatusColor(report.status)}
                            `}
                        >
                          {getStatusLabel(report.status)}
                        </span>
                      </div>

                      <h3
                        className="
                            mt-3
                            text-base
                            font-black
                            text-slate-900
                          "
                      >
                        {getReasonLabel(report.reason)}
                      </h3>

                      <p
                        className="
                            mt-1
                            line-clamp-2
                            max-w-3xl
                            text-sm
                            leading-6
                            text-slate-500
                          "
                      >
                        {report.description ||
                          "Tidak ada keterangan tambahan dari pelapor."}
                      </p>

                      {/* CONTEXT */}
                      <div
                        className="
                            mt-4
                            flex
                            flex-wrap
                            gap-x-6
                            gap-y-2
                            text-xs
                            text-slate-500
                          "
                      >
                        <span>
                          <strong className="text-slate-700">Pelapor:</strong>{" "}
                          {report.reporter?.full_name || "-"}
                        </span>

                        <span>
                          <strong className="text-slate-700">
                            Dilaporkan:
                          </strong>{" "}
                          {report.reported_user?.full_name || "-"}
                        </span>

                        {report.task && (
                          <span>
                            <strong className="text-slate-700">Task:</strong>{" "}
                            {report.task.title}
                          </span>
                        )}

                        <span>{formatDate(report.created_at)}</span>
                      </div>
                    </div>

                    <Link
                      href={`/admin/reports/${report.id}`}
                      className="
                          inline-flex
                          h-11
                          shrink-0
                          items-center
                          justify-center
                          gap-2
                          rounded-2xl
                          bg-indigo-600
                          px-5
                          text-sm
                          font-bold
                          text-white
                          transition
                          hover:bg-indigo-700
                          active:scale-[0.98]
                        "
                    >
                      Tinjau Laporan
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Flag;
  label: string;
  value: number;
}) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
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
          <p
            className="
              text-xs
              font-semibold
              text-slate-500
            "
          >
            {label}
          </p>

          <p
            className="
              mt-2
              text-3xl
              font-black
              text-slate-900
            "
          >
            {value}
          </p>
        </div>

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
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}