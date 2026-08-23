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

        {/* LIST */}
        <div className="mt-8 grid gap-4">
          {!loading &&
            tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => router.push(`/tasks/${task.id}`)}
                className="
                  flex
                  items-center
                  justify-between
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  p-6
                  text-left
                  shadow-sm
                  transition

                  hover:border-indigo-300
                  hover:shadow-md
                "
              >
                <div>
                  <h2
                    className="
                      text-lg
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

                <div
                  className="
                    flex
                    items-center
                    gap-5
                  "
                >
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

                  <div
                    className={`
                      rounded-full
                      px-4
                      py-2
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

                  <span
                    className="
                      text-xl
                      text-slate-400
                    "
                  >
                    →
                  </span>
                </div>
              </button>
            ))}
        </div>
      </div>
    </main>
  );
}