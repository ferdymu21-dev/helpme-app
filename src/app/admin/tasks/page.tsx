"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import { getTaskCategoryLabel } from "@/features/tasks/constants/task-categories";

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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [totalTasks, setTotalTasks] = useState(0);
  const [openTasks, setOpenTasks] = useState(0);
  const [acceptedTasks, setAcceptedTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [cancelledTasks, setCancelledTasks] = useState(0);

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

      setOpenTasks(
        allTasks.filter((task) => task.status === "OPEN").length,
      );

      setAcceptedTasks(
        allTasks.filter((task) => task.status === "ACCEPTED").length,
      );

      setCompletedTasks(
        allTasks.filter((task) => task.status === "COMPLETED").length,
      );

      setCancelledTasks(
        allTasks.filter((task) => task.status === "CANCELLED").length,
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
    const confirmDelete = window.confirm(`Hapus task "${title}" ?`);

    if (!confirmDelete) {
      return;
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) {
        throw error;
      }

      alert("Task berhasil dihapus");

      await loadTasks();
    } catch (error) {
      console.error(error);

      alert("Gagal menghapus task");
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());

    if (!matchSearch) {
      return false;
    }

    if (filter !== "ALL") {
      return task.status === filter;
    }

    return true;
  });

  const totalPages = Math.ceil(
    filteredTasks.length / ITEMS_PER_PAGE,
  );

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <main className="p-8">
      <h1
        className="
          text-3xl
          font-black
        "
      >
        Task Management
      </h1>

      <p
        className="
          mt-2
          text-slate-500
        "
      >
        Sistem moderasi task HelpMe
      </p>

      <div
        className="
          mt-8
          grid
          grid-cols-5
          gap-4
        "
      >
        <div
          className="
            rounded-3xl
            bg-white
            p-5
            shadow-sm
          "
        >
          <p className="text-sm text-slate-500">Total Task</p>

          <h2
            className="
              mt-2
              text-3xl
              font-black
            "
          >
            {totalTasks}
          </h2>
        </div>

        <div
          className="
            rounded-3xl
            bg-white
            p-5
            shadow-sm
          "
        >
          <p className="text-sm text-slate-500">Open</p>

          <h2
            className="
              mt-2
              text-3xl
              font-black
              text-blue-600
            "
          >
            {openTasks}
          </h2>
        </div>

        <div
          className="
            rounded-3xl
            bg-white
            p-5
            shadow-sm
          "
        >
          <p className="text-sm text-slate-500">Accepted</p>

          <h2
            className="
              mt-2
              text-3xl
              font-black
              text-amber-600
            "
          >
            {acceptedTasks}
          </h2>
        </div>

        <div
          className="
            rounded-3xl
            bg-white
            p-5
            shadow-sm
          "
        >
          <p className="text-sm text-slate-500">Completed</p>

          <h2
            className="
              mt-2
              text-3xl
              font-black
              text-emerald-600
            "
          >
            {completedTasks}
          </h2>
        </div>

        <div
          className="
            rounded-3xl
            bg-white
            p-5
            shadow-sm
          "
        >
          <p className="text-sm text-slate-500">Cancelled</p>

          <h2
            className="
              mt-2
              text-3xl
              font-black
              text-red-600
            "
          >
            {cancelledTasks}
          </h2>
        </div>
      </div>

      <input
        type="text"
        placeholder="Cari task..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="
          mt-6
          w-full
          rounded-2xl
          border
          p-4
        "
      />

      <div
        className="
          mt-4
          flex
          flex-wrap
          gap-3
        "
      >
        <button
          onClick={() => setFilter("ALL")}
          className={`
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold
            ${
              filter === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-white"
            }
          `}
        >
          ALL
        </button>

        <button
          onClick={() => setFilter("OPEN")}
          className={`
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold
            ${
              filter === "OPEN"
                ? "bg-blue-600 text-white"
                : "bg-white"
            }
          `}
        >
          OPEN
        </button>

        <button
          onClick={() => setFilter("ACCEPTED")}
          className={`
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold
            ${
              filter === "ACCEPTED"
                ? "bg-amber-500 text-white"
                : "bg-white"
            }
          `}
        >
          ACCEPTED
        </button>

        <button
          onClick={() => setFilter("COMPLETED")}
          className={`
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold
            ${
              filter === "COMPLETED"
                ? "bg-emerald-600 text-white"
                : "bg-white"
            }
          `}
        >
          COMPLETED
        </button>

        <button
          onClick={() => setFilter("CANCELLED")}
          className={`
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold
            ${
              filter === "CANCELLED"
                ? "bg-red-600 text-white"
                : "bg-white"
            }
          `}
        >
          CANCELLED
        </button>
      </div>

      {loading && <p className="mt-6">Loading...</p>}

      <p
        className="
          mt-6
          text-sm
          text-slate-500
        "
      >
        Menampilkan {paginatedTasks.length} dari{" "}
        {filteredTasks.length} task
      </p>

      <div
        className="
          mt-6
          space-y-4
        "
      >
        {paginatedTasks.map((task) => (
          <div
            key={task.id}
            className="
              rounded-3xl
              bg-white
              p-6
              shadow-sm
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
              "
            >
              <div>
                <h2
                  className="
                    text-lg
                    font-bold
                  "
                >
                  {task.title}
                </h2>

                <p
                  className="mt-1 text-sm text-slate-500">
                  {getTaskCategoryLabel(task.category)}
                </p>
              </div>

              <span
                className="
                  rounded-full
                  bg-slate-100
                  px-3
                  py-1
                  text-xs
                  font-semibold
                "
              >
                {task.status}
              </span>
            </div>

            <div
              className="
                mt-4
                flex
                flex-wrap
                gap-3
                text-sm
                text-slate-600
              "
            >
              <span>
                💰 Rp {task.budget.toLocaleString("id-ID")}
              </span>

              <span>
                👤 {task.users?.full_name || "-"}
              </span>
            </div>

            <div
              className="
                mt-4
                flex
                gap-3
              "
            >
              <Link
  href={`/tasks/${task.id}`}
  className="
    rounded-xl
    bg-blue-600
    px-4
    py-2
    text-sm
    font-semibold
    text-white
    transition
    hover:bg-blue-700
  "
>
  Detail
</Link>

              <button
                onClick={() =>
                  handleDeleteTask(task.id, task.title)
                }
                className="
                  rounded-xl
                  bg-red-600
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-white
                "
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        className="
          mt-8
          flex
          items-center
          justify-center
          gap-3
        "
      >
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="
            rounded-xl
            border
            bg-white
            px-4
            py-2
            disabled:opacity-40
          "
        >
          ← Prev
        </button>

        <div
          className="
            rounded-xl
            bg-white
            px-4
            py-2
            font-semibold
          "
        >
          Page {currentPage} / {totalPages || 1}
        </div>

        <button
          disabled={
            currentPage === totalPages || totalPages === 0
          }
          onClick={() => setCurrentPage(currentPage + 1)}
          className="
            rounded-xl
            border
            bg-white
            px-4
            py-2
            disabled:opacity-40
          "
        >
          Next →
        </button>
      </div>
    </main>
  );
}