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

export default function MobileHistoryView({
  tasks,
  loading,
  activeTab,
  setActiveTab,
  router,
}: Props) {
  return (
    <main
      className="
        p-6
        lg:hidden
      "
    >
      {/* HEADER */}
      <h1
        className="
          text-xl
          font-black
        "
      >
        Riwayat Task
      </h1>

      {/* TABS */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => setActiveTab("OWNER")}
          className={`
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold
            transition

            ${
              activeTab === "OWNER"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600"
            }
          `}
        >
          Task Saya
        </button>

        <button
          onClick={() => setActiveTab("HELPER")}
          className={`
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold
            transition

            ${
              activeTab === "HELPER"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600"
            }
          `}
        >
          Bantuan Saya
        </button>
      </div>

      {/* LIST */}
      <div className="mt-6">
        {loading && <p>Memuat...</p>}

        {!loading && tasks.length === 0 && (
          <div
            className="
                rounded-3xl
                border
                border-dashed
                border-slate-200
                bg-white
                p-8
                text-center
              "
          >
            <p className="text-slate-500">Belum ada riwayat</p>
          </div>
        )}

        {!loading &&
          tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => router.push(`/tasks/${task.id}`)}
              className="
                mb-4
                w-full
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-5
                text-left
                shadow-sm
                transition

                hover:border-indigo-300
                hover:shadow-md
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2
                    className="
                      text-base
                      font-bold
                      text-slate-900
                    "
                  >
                    {task.title}
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-500
                    "
                  >
                    {task.category}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="
                      text-lg
                      text-slate-400
                    "
                  >
                    →
                  </span>

                  <div
                    className={`
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-bold

                      ${
                        task.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700"
                          : task.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }
                    `}
                  >
                    {task.status === "COMPLETED"
                      ? "Selesai"
                      : task.status === "CANCELLED"
                        ? "Dibatalkan"
                        : "Kadaluarsa"}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p
                  className="
                    text-lg
                    font-black
                    text-indigo-600
                  "
                >
                  Rp
                  {task.budget?.toLocaleString("id-ID")}
                </p>
              </div>
            </button>
          ))}
      </div>
    </main>
  );
}