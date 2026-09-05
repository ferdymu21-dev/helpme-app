"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import { getTaskCategoryLabel } from "@/features/tasks/constants/task-categories";

import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Clock3,
  FileClock,
  FolderOpen,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  WalletCards,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  category: string;
  budget: number;
  status: string;
  created_at: string;
  user_id: string;

  users?: {
    full_name: string;
  };
}

type TaskStatusFilter =
  | "ALL"
  | "OPEN"
  | "ACCEPTED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

type TaskSortOption =
  | "NEWEST"
  | "OLDEST"
  | "BUDGET_HIGH"
  | "BUDGET_LOW"
  | "TITLE";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<TaskStatusFilter>("ALL");

  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [sort, setSort] = useState<TaskSortOption>("NEWEST");

  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const [totalTasks, setTotalTasks] = useState(0);
  const [openTasks, setOpenTasks] = useState(0);
  const [acceptedTasks, setAcceptedTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [cancelledTasks, setCancelledTasks] = useState(0);

  const [expiredTasks, setExpiredTasks] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 20;

  async function loadTasks() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
            *,
            users!tasks_user_id_fkey (
              full_name
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

      const allTasks = (data ?? []) as Task[];

      setTasks(allTasks);

      setTotalTasks(allTasks.length);

      setOpenTasks(allTasks.filter((task) => task.status === "OPEN").length);

      setAcceptedTasks(
        allTasks.filter((task) => task.status === "ACCEPTED").length,
      );

      setCompletedTasks(
        allTasks.filter((task) => task.status === "COMPLETED").length,
      );

      setCancelledTasks(
        allTasks.filter((task) => task.status === "CANCELLED").length,
      );

      setExpiredTasks(
        allTasks.filter((task) => task.status === "EXPIRED").length,
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initializeTasks = async () => {
      await loadTasks();
    };

    void initializeTasks();
  }, []);

  async function handleDeleteTask(taskId: string, title: string) {
    const confirmDelete = window.confirm(
      `Hapus permanen task "${title}"?\n\nTindakan ini tidak dapat dibatalkan.`,
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingTaskId(taskId);

      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) {
        throw error;
      }

      alert("Task berhasil dihapus");

      await loadTasks();
    } catch (error) {
      console.error(error);

      alert("Gagal menghapus task");
    } finally {
      setDeletingTaskId(null);
    }
  }

  const normalizedSearch = search.trim().toLowerCase();

  const availableCategories = Array.from(
    new Set(tasks.map((task) => task.category).filter(Boolean)),
  ).sort((a, b) =>
    getTaskCategoryLabel(a).localeCompare(getTaskCategoryLabel(b), "id-ID"),
  );

  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch =
        !normalizedSearch ||
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.id.toLowerCase().includes(normalizedSearch) ||
        task.users?.full_name?.toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) {
        return false;
      }

      if (filter !== "ALL" && task.status !== filter) {
        return false;
      }

      if (categoryFilter !== "ALL" && task.category !== categoryFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sort === "OLDEST") {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }

      if (sort === "BUDGET_HIGH") {
        return Number(b.budget) - Number(a.budget);
      }

      if (sort === "BUDGET_LOW") {
        return Number(a.budget) - Number(b.budget);
      }

      if (sort === "TITLE") {
        return a.title.localeCompare(b.title, "id-ID");
      }

      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <main
      className="
      min-h-screen
      bg-slate-50/70
      p-4
      sm:p-6
      lg:p-8
    "
    >
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <header
          className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
        >
          <div className="max-w-3xl">
            <div
              className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-indigo-100
              bg-white
              px-3.5
              py-2
              text-xs
              font-bold
              text-indigo-700
              shadow-sm
            "
            >
              <ShieldCheck className="h-4 w-4" strokeWidth={2} />
              Marketplace Operations
            </div>

            <h1
              className="
              mt-4
              text-3xl
              font-black
              tracking-[-0.03em]
              text-slate-950
              sm:text-4xl
            "
            >
              Manajemen Task
            </h1>

            <p
              className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-slate-500
            "
            >
              Pantau lifecycle task, owner, nilai transaksi, serta moderasi task
              HelpMe dari satu halaman.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              void loadTasks();
            }}
            disabled={loading}
            className="
            inline-flex
            h-11
            items-center
            justify-center
            gap-2
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-4
            text-sm
            font-bold
            text-slate-700
            shadow-sm
            transition
            hover:border-indigo-200
            hover:text-indigo-700
            disabled:opacity-50
          "
          >
            <RefreshCw
              className={`
              h-4
              w-4
              ${loading ? "animate-spin" : ""}
            `}
              strokeWidth={2}
            />
            Muat Ulang
          </button>
        </header>

        {/* STATISTICS */}
        <section
          className="
          mt-7
          grid
          grid-cols-2
          gap-3
          md:grid-cols-3
          xl:grid-cols-6
          xl:gap-4
        "
        >
          {[
            {
              label: "Total",
              value: totalTasks,
              icon: FolderOpen,
              iconClass: "bg-indigo-50 text-indigo-600",
            },
            {
              label: "Open",
              value: openTasks,
              icon: WalletCards,
              iconClass: "bg-blue-50 text-blue-600",
            },
            {
              label: "Accepted",
              value: acceptedTasks,
              icon: Clock3,
              iconClass: "bg-amber-50 text-amber-600",
            },
            {
              label: "Completed",
              value: completedTasks,
              icon: CheckCircle2,
              iconClass: "bg-emerald-50 text-emerald-600",
            },
            {
              label: "Cancelled",
              value: cancelledTasks,
              icon: CircleX,
              iconClass: "bg-red-50 text-red-600",
            },
            {
              label: "Expired",
              value: expiredTasks,
              icon: FileClock,
              iconClass: "bg-slate-100 text-slate-600",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-4
                shadow-[0_8px_24px_rgba(15,23,42,0.035)]
              "
              >
                <div
                  className={`
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-2xl

                  ${stat.iconClass}
                `}
                >
                  <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                </div>

                <p
                  className="
                  mt-3
                  text-[11px]
                  font-semibold
                  text-slate-500
                "
                >
                  {stat.label}
                </p>

                <p
                  className="
                  mt-1
                  text-2xl
                  font-black
                  text-slate-950
                "
                >
                  {stat.value}
                </p>
              </div>
            );
          })}
        </section>

        {/* FILTER PANEL */}
        <section
          className="
          mt-6
          rounded-[28px]
          border
          border-slate-200
          bg-white
          p-4
          shadow-[0_8px_24px_rgba(15,23,42,0.035)]
          sm:p-5
        "
        >
          <div
            className="
            grid
            gap-3
            xl:grid-cols-[minmax(300px,1fr)_220px_190px]
          "
          >
            <div className="relative">
              <Search
                className="
                pointer-events-none
                absolute
                left-3.5
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-slate-400
              "
                strokeWidth={2}
              />

              <input
                type="search"
                value={search}
                placeholder="Cari judul, Task ID, atau owner..."
                onChange={(e) => {
                  setSearch(e.target.value);

                  setCurrentPage(1);
                }}
                className="
                h-11
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                pl-10
                pr-4
                text-sm
                text-slate-800
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-indigo-300
                focus:bg-white
                focus:ring-4
                focus:ring-indigo-50
              "
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);

                setCurrentPage(1);
              }}
              className="
              h-11
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-3
              text-sm
              font-semibold
              text-slate-600
              outline-none
            "
            >
              <option value="ALL">Semua kategori</option>

              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {getTaskCategoryLabel(category)}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as TaskSortOption);

                setCurrentPage(1);
              }}
              className="
              h-11
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-3
              text-sm
              font-semibold
              text-slate-600
              outline-none
            "
            >
              <option value="NEWEST">Terbaru</option>

              <option value="OLDEST">Terlama</option>

              <option value="BUDGET_HIGH">Budget tertinggi</option>

              <option value="BUDGET_LOW">Budget terendah</option>

              <option value="TITLE">Judul A–Z</option>
            </select>
          </div>

          {/* STATUS FILTER */}
          <div
            className="
            mt-4
            flex
            flex-wrap
            gap-2
            border-t
            border-slate-100
            pt-4
          "
          >
            {(
              [
                "ALL",
                "OPEN",
                "ACCEPTED",
                "COMPLETED",
                "CANCELLED",
                "EXPIRED",
              ] as TaskStatusFilter[]
            ).map((status) => {
              const selected = filter === status;

              const label =
                status === "ALL"
                  ? "Semua"
                  : status === "OPEN"
                    ? "Open"
                    : status === "ACCEPTED"
                      ? "Accepted"
                      : status === "COMPLETED"
                        ? "Completed"
                        : status === "CANCELLED"
                          ? "Cancelled"
                          : "Expired";

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setFilter(status);

                    setCurrentPage(1);
                  }}
                  className={`
                  rounded-full
                  border
                  px-4
                  py-2
                  text-xs
                  font-bold
                  transition

                  ${
                    selected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }
                `}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* RESULTS */}
        <div className="mt-6">
          <h2
            className="
            text-base
            font-black
            text-slate-900
          "
          >
            Daftar Task
          </h2>

          <p
            className="
            mt-1
            text-xs
            text-slate-500
          "
          >
            Menampilkan {paginatedTasks.length} dari {filteredTasks.length}{" "}
            task.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div
            className="
            mt-4
            flex
            min-h-56
            items-center
            justify-center
            rounded-[28px]
            border
            border-slate-200
            bg-white
          "
          >
            <div className="text-center">
              <LoaderCircle
                className="
                mx-auto
                h-7
                w-7
                animate-spin
                text-indigo-600
              "
                strokeWidth={2}
              />

              <p
                className="
                mt-3
                text-sm
                font-bold
                text-slate-700
              "
              >
                Memuat task
              </p>

              <p
                className="
                mt-1
                text-xs
                text-slate-400
              "
              >
                Menyiapkan data marketplace HelpMe.
              </p>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredTasks.length === 0 && (
          <div
            className="
              mt-4
              flex
              min-h-64
              items-center
              justify-center
              rounded-[28px]
              border
              border-slate-200
              bg-white
              px-6
              text-center
            "
          >
            <div>
              <FolderOpen
                className="
                  mx-auto
                  h-9
                  w-9
                  text-slate-300
                "
                strokeWidth={1.7}
              />

              <h3
                className="
                  mt-3
                  text-sm
                  font-black
                  text-slate-800
                "
              >
                Task tidak ditemukan
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                Coba ubah pencarian atau filter yang digunakan.
              </p>
            </div>
          </div>
        )}

        {/* TASK LIST */}
        {!loading && paginatedTasks.length > 0 && (
          <div
            className="
              mt-4
              space-y-3
            "
          >
            {paginatedTasks.map((task) => {
              const deleting = deletingTaskId === task.id;

              return (
                <article
                  key={task.id}
                  className="
                      rounded-[28px]
                      border
                      border-slate-200
                      bg-white
                      p-4
                      shadow-[0_8px_24px_rgba(15,23,42,0.03)]
                      sm:p-5
                    "
                >
                  <div
                    className="
                        flex
                        flex-col
                        gap-5
                        xl:flex-row
                        xl:items-start
                        xl:justify-between
                      "
                  >
                    {/* MAIN INFO */}
                    <div className="min-w-0 flex-1">
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
                              rounded-full
                              px-3
                              py-1.5
                              text-[10px]
                              font-black

                              ${
                                task.status === "OPEN"
                                  ? "bg-blue-50 text-blue-700"
                                  : task.status === "ACCEPTED"
                                    ? "bg-amber-50 text-amber-700"
                                    : task.status === "COMPLETED"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : task.status === "CANCELLED"
                                        ? "bg-red-50 text-red-600"
                                        : task.status === "EXPIRED"
                                          ? "bg-slate-100 text-slate-600"
                                          : "bg-slate-100 text-slate-600"
                              }
                            `}
                        >
                          {task.status}
                        </span>

                        <span
                          className="
                              rounded-full
                              bg-indigo-50
                              px-3
                              py-1.5
                              text-[10px]
                              font-bold
                              text-indigo-700
                            "
                        >
                          {getTaskCategoryLabel(task.category)}
                        </span>
                      </div>

                      <h2
                        className="
                            mt-3
                            text-lg
                            font-black
                            tracking-tight
                            text-slate-900
                          "
                      >
                        {task.title}
                      </h2>

                      <p
                        className="
                            mt-1
                            max-w-xl
                            truncate
                            font-mono
                            text-[9px]
                            text-slate-400
                          "
                      >
                        Task ID: {task.id}
                      </p>
                    </div>

                    {/* BUDGET */}
                    <div
                      className="
                          shrink-0
                          rounded-2xl
                          border
                          border-emerald-100
                          bg-emerald-50/60
                          px-4
                          py-3
                          xl:text-right
                        "
                    >
                      <p
                        className="
                            text-[9px]
                            font-bold
                            tracking-wide
                            text-emerald-600
                            uppercase
                          "
                      >
                        Budget
                      </p>

                      <p
                        className="
                            mt-1
                            text-base
                            font-black
                            text-emerald-700
                          "
                      >
                        Rp {Number(task.budget).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* METADATA */}
                  <div
                    className="
                        mt-5
                        grid
                        gap-3
                        rounded-2xl
                        border
                        border-slate-100
                        bg-slate-50
                        p-4
                        sm:grid-cols-3
                      "
                  >
                    <div
                      className="
                          flex
                          items-start
                          gap-2.5
                        "
                    >
                      <UserRound
                        className="
                            mt-0.5
                            h-4
                            w-4
                            shrink-0
                            text-indigo-500
                          "
                        strokeWidth={2}
                      />

                      <div>
                        <p
                          className="
                              text-[9px]
                              font-bold
                              text-slate-400
                              uppercase
                            "
                        >
                          Owner
                        </p>

                        <p
                          className="
                              mt-0.5
                              text-xs
                              font-bold
                              text-slate-700
                            "
                        >
                          {task.users?.full_name || "Tidak tersedia"}
                        </p>
                      </div>
                    </div>

                    <div
                      className="
                          flex
                          items-start
                          gap-2.5
                        "
                    >
                      <Banknote
                        className="
                            mt-0.5
                            h-4
                            w-4
                            shrink-0
                            text-emerald-500
                          "
                        strokeWidth={2}
                      />

                      <div>
                        <p
                          className="
                              text-[9px]
                              font-bold
                              text-slate-400
                              uppercase
                            "
                        >
                          Nilai Task
                        </p>

                        <p
                          className="
                              mt-0.5
                              text-xs
                              font-bold
                              text-slate-700
                            "
                        >
                          Rp {Number(task.budget).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>

                    <div
                      className="
                          flex
                          items-start
                          gap-2.5
                        "
                    >
                      <CalendarDays
                        className="
                            mt-0.5
                            h-4
                            w-4
                            shrink-0
                            text-slate-400
                          "
                        strokeWidth={2}
                      />

                      <div>
                        <p
                          className="
                              text-[9px]
                              font-bold
                              text-slate-400
                              uppercase
                            "
                        >
                          Dibuat
                        </p>

                        <p
                          className="
                              mt-0.5
                              text-xs
                              font-bold
                              text-slate-700
                            "
                        >
                          {new Date(task.created_at).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ACTION */}
                  <div
                    className="
                        mt-4
                        flex
                        flex-wrap
                        items-center
                        gap-2
                        border-t
                        border-slate-100
                        pt-4
                      "
                  >
                    <Link
                      href={`/tasks/${task.id}`}
                      className="
                          inline-flex
                          h-10
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-indigo-600
                          px-4
                          text-xs
                          font-bold
                          text-white
                          shadow-[0_6px_18px_rgba(79,70,229,0.14)]
                          transition
                          hover:bg-indigo-700
                          active:scale-[0.98]
                        "
                    >
                      <FolderOpen className="h-4 w-4" strokeWidth={2} />
                      Lihat Detail
                    </Link>

                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => {
                        void handleDeleteTask(task.id, task.title);
                      }}
                      className="
                          inline-flex
                          h-10
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          border-red-200
                          bg-red-50
                          px-4
                          text-xs
                          font-bold
                          text-red-600
                          transition
                          hover:bg-red-100
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                    >
                      {deleting ? (
                        <>
                          <LoaderCircle
                            className="
                                h-4
                                w-4
                                animate-spin
                              "
                            strokeWidth={2}
                          />
                          Menghapus...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" strokeWidth={2} />
                          Hapus Task
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {!loading && filteredTasks.length > 0 && (
          <div
            className="
              mt-7
              flex
              items-center
              justify-center
              gap-3
            "
          >
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              aria-label="Halaman sebelumnya"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-600
                disabled:opacity-40
              "
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div
              className="
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-xs
                font-bold
                text-slate-600
              "
            >
              Halaman {currentPage} dari {totalPages || 1}
            </div>

            <button
              type="button"
              disabled={currentPage >= totalPages || totalPages === 0}
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              aria-label="Halaman berikutnya"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-600
                disabled:opacity-40
              "
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}