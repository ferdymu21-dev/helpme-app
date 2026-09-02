import {
  CalendarDays,
  ChevronRight,
} from "lucide-react";

import {
  getTaskStatusBadgeClass,
  getTaskStatusLabel,
} from "@/features/tasks/utils/task-status";

import { getTaskCategoryLabel } from "@/features/tasks/constants/task-categories";

import type { HistoryTask } from "@/features/tasks/types/history";

interface Props {
  tasks: HistoryTask[];
  loading: boolean;
  activeTab: "OWNER" | "HELPER";
  setActiveTab: (value: "OWNER" | "HELPER") => void;
  router: {
    push: (href: string) => void;
  };
}

export default function DesktopHistoryView({
  tasks,
  loading,
  activeTab,
  setActiveTab,
  router,
}: Props) {
  return (
    <main
      className="
        hidden
        lg:block
        min-h-screen
        bg-slate-50
        p-10
      "
    >
      <div
        className="
          mx-auto
          max-w-5xl
        "
      >
        {/* HEADER */}
        <h1
          className="
            text-3xl
            font-black
            tracking-tight
            text-slate-900
          "
        >
          Riwayat Task
        </h1>

        <p
          className="
            mt-2
            text-slate-500
          "
        >
          Semua task yang pernah dibuat atau dikerjakan.
        </p>

        {/* TABS */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => setActiveTab("OWNER")}
            className={`
              rounded-2xl
              px-5
              py-3
              font-semibold
              transition

              ${
                activeTab === "OWNER"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200"
              }
            `}
          >
            Task Saya
          </button>

          <button
            onClick={() => setActiveTab("HELPER")}
            className={`
              rounded-2xl
              px-5
              py-3
              font-semibold
              transition

              ${
                activeTab === "HELPER"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200"
              }
            `}
          >
            Bantuan Saya
          </button>
        </div>

        {/* LOADING */}
        {loading && <div className="mt-10">Memuat riwayat...</div>}

        {/* EMPTY */}
        {!loading && tasks.length === 0 && (
          <div
            className="
                mt-8
                rounded-4xl
                border
                border-dashed
                border-slate-200
                bg-white
                p-12
                text-center
              "
          >
            <h2
              className="
                  text-lg
                  font-bold
                  text-slate-900
                "
            >
              Belum ada riwayat
            </h2>

            <p
              className="
                  mt-2
                  text-slate-500
                "
            >
              Riwayat task akan muncul di sini.
            </p>
          </div>
        )}

        {/* =========================
    LIST
========================= */}
<div className="mt-8 grid gap-4">
  {!loading &&
    tasks.map((task) => (
      <button
        key={task.id}
        type="button"
        onClick={() =>
          router.push(
            `/tasks/${task.id}`,
          )
        }
        className="
          group
          w-full
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-6
          text-left
          shadow-sm
          transition-all
          duration-200
          hover:border-slate-300
          hover:shadow-md
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            justify-between
            gap-8
          "
        >
          {/* =========================
              LEFT CONTENT
          ========================= */}
          <div className="min-w-0 flex-1">
            {/* CATEGORY + URGENT + STATUS */}
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              {/* CATEGORY */}
              <span
                className="
                  inline-flex
                  max-w-60
                  truncate
                  rounded-full
                  bg-indigo-50
                  px-3
                  py-1
                  text-[11px]
                  font-semibold
                  text-indigo-600
                "
              >
                {getTaskCategoryLabel(task.category)}
              </span>

              {/* URGENT */}
              {task.is_urgent && (
                <span
                  className="
                    shrink-0
                    rounded-full
                    bg-red-100
                    px-3
                    py-1
                    text-[11px]
                    font-bold
                    text-red-600
                  "
                >
                  🔥 Mendesak
                </span>
              )}

              {/* STATUS */}
              <span
                className={`
                  shrink-0
                  rounded-full
                  px-3
                  py-1
                  text-[11px]
                  font-semibold
                  ${getTaskStatusBadgeClass(
                    task.status,
                  )}
                `}
              >
                {getTaskStatusLabel(
                  task.status,
                )}
              </span>
            </div>

            {/* TITLE */}
            <h2
              className="
                mt-3
                line-clamp-2
                text-lg
                font-black
                leading-6
                tracking-tight
                text-slate-900
              "
            >
              {task.title}
            </h2>

            {/* CREATED DATE */}
            <div
              className="
                mt-3
                flex
                items-center
                gap-2
                text-xs
                text-slate-500
              "
            >
              <CalendarDays
                className="
                  h-4
                  w-4
                  shrink-0
                  text-slate-400
                "
              />

              <span>
                Dibuat{" "}
                {new Date(
                  task.created_at,
                ).toLocaleDateString(
                  "id-ID",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  },
                )}
              </span>
            </div>
          </div>

          {/* =========================
              RIGHT CONTENT
          ========================= */}
          <div
            className="
              flex
              shrink-0
              items-center
              gap-6
            "
          >
            {/* PRICE */}
            <div className="text-right">

              {task.budget !== null ? (
                <p
                  className="
                    mt-1
                    whitespace-nowrap
                    text-xl
                    font-black
                    tracking-tight
                    text-amber-500
                  "
                >
                  Rp
                  {task.budget.toLocaleString(
                    "id-ID",
                  )}
                </p>
              ) : (
                <p
                  className="
                    mt-1
                    whitespace-nowrap
                    text-sm
                    font-medium
                    text-slate-400
                  "
                >
                  Tidak tersedia
                </p>
              )}
            </div>

            {/* DETAIL */}
            <div
              className="
                flex
                items-center
                gap-1
                text-sm
                font-semibold
                text-slate-400
                transition
                group-hover:text-indigo-600
              "
            >
              <span>
                Detail
              </span>

              <ChevronRight
                className="
                  h-5
                  w-5
                  transition-transform
                  group-hover:translate-x-0.5
                "
                strokeWidth={2}
              />
            </div>
          </div>
        </div>
      </button>
    ))}
</div>
      </div>
    </main>
  );
}