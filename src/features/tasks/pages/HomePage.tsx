"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

import { useAuthStore } from "@/store/auth.store";

import AppShell from "@/components/layout/AppShell";

import { getTasks } from "../services/task.service";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  address: string;
  status: string;
  created_at: string;
}

export default function HomePage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [loadingTasks, setLoadingTasks] =
    useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const data = await getTasks();

      setTasks(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTasks(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace("/login");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome to HelpMe 👋
          </h1>

          <p className="mt-2 text-slate-600">
            Marketplace bantuan harian berbasis lokasi
          </p>
        </div>

        {/* USER CARD */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">
            Login Berhasil 🎉
          </h2>

          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium">
                Email:
              </span>{" "}
              {user?.email ?? "No Email"}
            </p>

            <p>
              <span className="font-medium">
                User ID:
              </span>{" "}
              {user?.id ?? "No ID"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="mt-6 rounded-xl bg-red-500 px-4 py-3 text-white transition hover:opacity-90"
          >
            Logout
          </button>
        </div>

        {/* QUICK ACTIONS */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <button
            onClick={() =>
              router.push("/create-task")
            }
            className="rounded-2xl bg-indigo-600 p-5 text-left text-white shadow-sm transition hover:opacity-90"
          >
            <h3 className="text-lg font-semibold">
              Buat Bantuan
            </h3>

            <p className="mt-2 text-sm text-indigo-100">
              Posting task bantuan harian
            </p>
          </button>

          <button
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-indigo-300"
          >
            <h3 className="text-lg font-semibold text-slate-800">
              Cari Task
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Temukan pekerjaan receh terdekat
            </p>
          </button>
        </div>


        {/* TASK FEED */}
        <div className="mt-10">
          <h2 className="mb-4 text-2xl font-bold">
            Task Terbaru
          </h2>

          {loadingTasks ? (
            <div className="rounded-2xl bg-white p-6">
              Memuat task...
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-2xl bg-white p-6">
              Belum ada task.
            </div>
          ) : (
            <div className="space-y-4">
              
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() =>
                    router.push(`/tasks/${task.id}`)
                  }
                  className="
                    cursor-pointer
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-sm
                    transition
                    hover:border-indigo-400
                    hover:shadow-md
                  "
                >

                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {task.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {task.category}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      {task.status}
                    </span>
                  </div>

                  <p className="mt-3 text-slate-600">
                    {task.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>
                      💰 Rp
                      {task.budget?.toLocaleString(
                        "id-ID"
                      )}
                    </span>

                    <span>
                      📍 {task.address}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}