"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import Link from "next/link";

import { supabase } from "@/lib/supabase/client";

import {
  getConversationByTask,
} from "@/features/tasks/services/task.service";

import {
  acceptHelper,
  applyTask,
  getTaskApplications,
  getTaskById,
} from "@/features/tasks/services/task.service";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  address: string;
  status: string;
  created_at: string;
  user_id: string;
  selected_helper_id: string | null;
}

interface Applicant {
  id: string;
  helper_id: string;
  status: string;

  users: {
    id: string;
    full_name: string;
    rating: number;
  };
}

export default function TaskDetailPage() {
  const params = useParams();

  const [task, setTask] = useState<Task | null>(null);

  const [loading, setLoading] = useState(true);

  const [applying, setApplying] = useState(false);

  const [accepting, setAccepting] = useState(false);

  const [applications, setApplications] = useState<Applicant[]>([]);

  const [currentUserId, setCurrentUserId] = useState("");

  const [hasApplied, setHasApplied] = useState(false);

  async function loadCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUserId(user?.id || "");
  }

  async function loadTask() {
    const data = await getTaskById(params.id as string);

    setTask(data);
  }

  async function loadApplications() {
    const data = await getTaskApplications(params.id as string);

    setApplications(data || []);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const alreadyApplied = data?.some(
      (application) => application.helper_id === user.id,
    );

    setHasApplied(!!alreadyApplied);
  }

  useEffect(() => {
    async function init() {
      try {
        await loadCurrentUser();
        await loadTask();
        await loadApplications();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [params.id]);

  async function handleApplyTask() {
    try {
      setApplying(true);

      await applyTask(params.id as string);

      alert("Berhasil melamar task");

      await loadApplications();
    } catch (error: any) {
      if (
        error.message === "Kamu sudah melamar task ini" ||
        error.message === "Tidak bisa melamar task sendiri" ||
        error.message === "Task sudah tidak tersedia"
      ) {
        alert(error.message);

        return;
      }

      console.error(error);

      alert("Terjadi kesalahan");
    } finally {
      setApplying(false);
    }
  }

  async function handleAcceptHelper(helperId: string) {
    if (!task) return;

    try {
      setAccepting(true);

      await acceptHelper(task.id, helperId);

      alert("Helper berhasil diterima");

      await loadTask();
      await loadApplications();
    } catch (error) {
      console.error(error);

      alert("Gagal menerima helper");
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return <div className="p-6">Memuat task...</div>;
  }

  if (!task) {
    return <div className="p-6">Task tidak ditemukan</div>;
  }

  const isOwner = currentUserId === task.user_id;

  const alreadyApplied = hasApplied;

  return (
    <main className="min-h-screen bg-slate-50 pb-32">
      {/* CONTAINER */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* HERO */}
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
          {/* TOP */}
          <div
            className="
              bg-linear-to-br
              from-indigo-600
              to-violet-600
              p-8
              text-white
            "
          >
            {/* CATEGORY + STATUS */}
            <div className="flex items-center justify-between">
              <div
                className="
                  rounded-full
                  bg-white/20
                  px-4
                  py-2
                  text-sm
                  font-semibold
                "
              >
                {task.category}
              </div>

              <div
                className="
                  rounded-full
                  bg-white/20
                  px-4
                  py-2
                  text-sm
                  font-semibold
                "
              >
                {task.status}
              </div>
            </div>

            {/* TITLE */}
            <h1
              className="
                mt-8
                max-w-3xl
                text-4xl
                font-bold
                leading-tight
                tracking-tight
              "
            >
              {task.title}
            </h1>

            {/* BUDGET */}
            <div className="mt-8">
              <p className="text-indigo-100">Budget</p>

              <h2
                className="
                  mt-2
                  text-5xl
                  font-bold
                  tracking-tight
                "
              >
                Rp
                {task.budget.toLocaleString("id-ID")}
              </h2>
            </div>
          </div>

          {/* INFO */}
          <div className="grid gap-6 p-8 md:grid-cols-3">
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
                  font-semibold
                  text-slate-900
                "
              >
                📍 {task.address}
              </h3>
            </div>

            <div
              className="
                rounded-3xl
                border
              border-slate-200
              bg-slate-50
                p-5
              "
            >
              <p className="text-sm text-slate-500">Dibuat</p>

              <h3
                className="
                  mt-2
                  font-semibold
                  text-slate-900
                "
              >
                {new Date(task.created_at).toLocaleDateString("id-ID")}
              </h3>
            </div>

            <div
              className="
                rounded-3xl
                border
                border-slate-200
                bg-slate-50
                p-5
              "
            >
              <p className="text-sm text-slate-500">Status</p>

              <h3
                className="
                  mt-2
                  font-semibold
                  text-emerald-600
                "
              >
                {task.status}
              </h3>
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
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
              text-slate-900
            "
          >
            Deskripsi Task
          </h2>

          <p
            className="
              mt-5
              leading-8
              text-slate-600
            "
          >
            {task.description}
          </p>
        </div>

        {/* APPLICANTS */}
        {isOwner && applications.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
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
            </div>

            <div className="mt-6 grid gap-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="
                        flex
                        items-center
                        justify-between
                        rounded-[28px]
                        border
                        border-slate-200
                        bg-white
                        p-6
                        shadow-[0_10px_30px_rgba(15,23,42,0.05)]
                      "
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-4">
                    {/* AVATAR */}
                    <div
                      className="
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-full
                            bg-indigo-100
                            text-lg
                            font-bold
                            text-indigo-700
                          "
                    >
                      {application.users?.full_name?.charAt(0) || "U"}
                    </div>

                    {/* INFO */}
                    <div>
                      <h3
                        className="
                          text-lg
                          font-bold
                        text-slate-900
                        "
                      >
                        {application.users?.full_name || "Unknown User"}
                      </h3>

                      <p className="mt-1 text-slate-500">
                        ⭐ {application.users?.rating}
                      </p>
                    </div>
                  </div>

                  {/* BUTTON */}
                  {task?.status === "OPEN" && (
                  <button
                    onClick={() => 
                      handleAcceptHelper(
                        application.helper_id
                      )
                    }
                    disabled={accepting}
                    className="
                          rounded-2xl
                          bg-indigo-600
                          px-5
                          py-3
                          text-sm
                          font-semibold
                          text-white
                          transition
                          hover:bg-indigo-700
                          disabled:opacity-50
                        "
                  >
                    Terima Helper
                  </button>
                )}
                
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CHAT BUTTON */}
      {task?.status === "ACCEPTED" && (
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

      <button

         onClick={async () => {
           if (!task) return;

           try {
             const conversation =
               await getConversationByTask(
                 task.id
               );

             if (!conversation) return;

             window.location.href =
               `/messages/${conversation.id}`;
            } catch (error) {
              console.error(error);
            }
         }}
         
        className="
          flex
          h-14
          w-full
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
  )}

  {/* STICKY ACTION */}
  {!isOwner && task.status === "OPEN" && (
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

         <button
           onClick={handleApplyTask}
           disabled={applying || alreadyApplied}
           className="
             flex
             h-14
             w-full
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
           disabled:bg-slate-300
            "
          >
            {alreadyApplied
              ? "Anda sudah melamar task ini"
              : applying
              ? "Memproses..."
              : "Apply Task"}
          </button>

        </div>

      </div>
    )}
  </main>
 );
}