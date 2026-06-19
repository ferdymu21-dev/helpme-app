"use client";

import { supabase }
    from "@/lib/supabase/client";

import Link from "next/link";

interface Props {
    task: any;

    applications: any[];

    currentUserId: string;

    hasApplied: boolean;

    applying: boolean;

    accepting: boolean;

    handleApplyTask: () => void;

    handleAcceptHelper: (
        helperId: string
    ) => void;

    handleCompleteTask: () => void;

    handleCancelTask: () => void;
}

export default function DesktopTaskDetailView({
    task,

    applications,

    currentUserId,

    hasApplied,

    applying,

    accepting,

    handleApplyTask,

    handleAcceptHelper,

    handleCompleteTask,

    handleCancelTask,
}: Props) {

    const isOwner =
        task.user_id ===
        currentUserId;

    const isSelectedHelper =

        task.selected_helper_id ===
        currentUserId;

    const alreadyApplied =

        applications.some(
            (app) =>

                app.helper_id ===
                currentUserId
        );

    const canAccessChat =


        task.selected_helper_id ===
        currentUserId ||

        task.user_id ===
        currentUserId;

    async function getConversationByTask(
        taskId: string
    ) {

        const {
            data,
            error,
        } = await supabase
            .from("conversations")
            .select("*")
            .eq("task_id", taskId)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return data;
    }

    return (

        <main className="hidden min-h-screen bg-slate-50 pb-32 lg:block">

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
                                {
                                    task.status === "OPEN"
                                        ? "Terbuka"
                                        : task.status === "ACCEPTED"
                                            ? "Sedang Dibantu"
                                            : task.status === "COMPLETED"
                                                ? "Selesai"
                                                : task.status === "CANCELLED"
                                                    ? "Dibatalkan"
                                                    : task.status === "EXPIRED"
                                                        ? "Kadaluarsa"
                                                        : task.status
                                }
                            </div>

                        </div>

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

                        {task.is_urgent && (

                            <div
                                className="
      mt-5
      inline-flex
      rounded-full
      bg-red-500/20
      px-4
      py-2
      text-sm
      font-bold
      text-red-100
    "
                            >
                                🔥 Mendesak
                            </div>

                        )}

                        {task.scheduled_at && (

                            <div
                                className="
      mt-6
      flex
      items-center
      gap-4
      text-sm
      text-indigo-100
    "
                            >

                                <span>
                                    📅 {

                                        new Date(
                                            task.scheduled_at
                                        ).toLocaleDateString(
                                            "id-ID",
                                            {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            }
                                        )

                                    }
                                </span>

                                <span>
                                    •
                                </span>

                                <span>
                                    🕒 {

                                        new Date(
                                            task.scheduled_at
                                        ).toLocaleTimeString(
                                            "id-ID",
                                            {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }
                                        )

                                    }
                                </span>

                            </div>

                        )}

                        <div className="mt-8">

                            <p className="text-indigo-100">
                                Budget
                            </p>

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

                            <p className="text-sm text-slate-500">
                                Lokasi
                            </p>

                            <h3
                                className="
                                  mt-2
                                  font-semibold
                                  break-all
                                text-slate-900
                                "
                            >
                                📍 {

                                    task.location_type ===
                                        "SEARCH"

                                        ? (
                                            task.location_name ||
                                            "Lokasi tidak tersedia"
                                        )

                                        : (
                                            task.manual_address ||
                                            "Alamat tidak tersedia"
                                        )
                                }
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

                            <p className="text-sm text-slate-500">
                                Jadwal
                            </p>

                            <h3
                                className="
                  mt-2
                  font-semibold
                  text-slate-900
                "
                            >
                                {task.scheduled_at

                                    ? new Date(
                                        task.scheduled_at
                                    ).toLocaleString(
                                        "id-ID"
                                    )

                                    : "-"
                                }
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

                            <p className="text-sm text-slate-500">
                                Status
                            </p>

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

                {/* OWNER */}
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
                          gap-4
                          items-center
                          rounded-[28px]
                         
                        border-slate-200
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
      object-cover
      border
      border-slate-200
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

                                {
                                    task.users?.full_name
                                        ?.charAt(0)
                                        ?.toUpperCase()
                                }

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

                            {task.users?.verification_status ===
                                "VERIFIED" ? (

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

                                <span className="
                                            text-[11px]
                                          "
                                >
                                    ⏳ Belum Terverifikasi
                                </span>

                            )}

                        </div>

                    </Link>

                </div>

                {/* APPLICANTS */}
                {isOwner &&
                    applications.length > 0 && (

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

                                <p className="mt-2 text-slate-500">
                                    Pilih helper terbaik
                                </p>

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
                                        <Link
                                            href={`/users/${application.helper?.id}`}
                                            className="
                        flex
                        items-center
                        gap-4
                      "
                                        >

                                            {/* AVATAR */}
                                            {application.helper?.avatar_url ? (

                                                <img
                                                    src={application.helper.avatar_url}
                                                    alt="Helper"
                                                    className="
      h-14
      w-14
      rounded-full
      object-cover
      border
      border-slate-200
    "
                                                />

                                            ) : (

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
                                                    {application.helper?.full_name
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "U"}
                                                </div>

                                            )}

                                            {/* INFO */}
                                            <div>

                                                <h3
                                                    className="
                          text-lg
                          font-bold
                          text-slate-900
                        "
                                                >
                                                    {application.helper?.full_name ||
                                                        "Unknown User"}
                                                </h3>

                                                <div
                                                    className="
                          mt-1
                          flex
                          items-center
                          gap-2
                        "
                                                >

                                                    <p className="text-sm text-slate-500">
                                                        ⭐ {
                                                            application.reputation?.averageRating ||
                                                            "0.0"
                                                        }
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
                                                        {
                                                            application.reputation
                                                                ?.totalReviews || 0
                                                        }
                                                        {" "}reviews
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
                                                    🏆 {
                                                        application.reputation
                                                            ?.completedTasks || 0
                                                    }
                                                    {" "}task selesai
                                                </p>

                                            </div>

                                        </Link>

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

            {/* OWNER ACTIONS */}
            {
                isOwner &&
                (
                    task?.status === "OPEN" ||
                    task?.status === "ACCEPTED"
                ) && (

                    <div className="mt-6 flex gap-3">

                        {/* Hanya saat ACCEPTED */}
                        {
                            task?.status ===
                            "ACCEPTED" && (

                                <button
                                    onClick={handleCompleteTask}
                                    className="
              flex
              h-14
              flex-1
              items-center
              justify-center
              rounded-2xl
              bg-emerald-500
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-emerald-600
            "
                                >
                                    Tandai Selesai
                                </button>

                            )
                        }

                        {/* OPEN & ACCEPTED */}
                        <button
                            onClick={handleCancelTask}
                            className="
          flex
          h-14
          flex-1
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

                )
            }

            {/* CHAT BUTTON */}
            {
                task?.status === "ACCEPTED" &&
                canAccessChat && (

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
                )
            }

            {/* STICKY APPLY BUTTON */}
            {
                !isOwner &&
                !isSelectedHelper &&
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

                            <button
                                onClick={handleApplyTask}
                                disabled={
                                    applying ||
                                    alreadyApplied
                                }
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
                )
            }

            {/* TASK CLOSED INFO */}

            {
                !isOwner &&
                !isSelectedHelper &&
                task.status === "ACCEPTED" && (

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

                )
            }

        </main >
    );
}