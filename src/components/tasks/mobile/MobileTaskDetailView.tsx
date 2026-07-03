"use client";

import { supabase }
    from "@/lib/supabase/client";

import Link from "next/link";

import Image from "next/image";

import { useState }
    from "react";

import ReportTaskModal
    from "@/features/reports/components/ReportTaskModal";

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

export default function MobileTaskDetailView({

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

    const [
        showReportModal,
        setShowReportModal,
    ] = useState(false);

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

    const canAccessChat =

        task.user_id ===
        currentUserId ||

        task.selected_helper_id ===
        currentUserId;

    const isSelectedHelper =

        task.selected_helper_id ===
        currentUserId;

    return (

        <main className="min-h-screen bg-slate-50 pb-32 lg:hidden">

            <div className="px-5 py-6">

                {/* HERO */}
                <div
                    className="
        relative
        overflow-hidden
    "
                >

                    {/* TOP */}
                    <div className="flex items-center justify-between">

                        {/* CATEGORY */}
                        <div
                            className="
                rounded-full
              bg-black/10
                px-2
                py-1.5
                text-[10px]
                font-bold
              text-black/80
                backdrop-blur
            "
                        >
                            {task.category}
                        </div>

                        {task.is_urgent && (

                            <div
                                className="
                                  inline-flex
                                  rounded-full
                                bg-red-500/20
                                  px-2
                                  py-1.5
                                  text-[10px]
                                  font-bold
                                  text-red-400
                                  backdrop-blur
                                "
                            >
                                🔥 MENDESAK
                            </div>

                        )}

                        {/* STATUS */}
                        <div
                            className="
                rounded-full
                bg-emerald-400/20
                px-2
                py-1.5
                text-[10px]
                font-bold
                text-emerald-500
                backdrop-blur
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

                    {/* TITLE */}
                    <h1
                        className="
                        ml-1
            mt-6
            text-[20px]
            font-black
            text-black/80
            leading-tight
            tracking-tight
        "
                    >
                        {task.title}
                    </h1>

                    {/* LOCATION */}
                    <div
                        className="
            mt-3
            flex
            items-start
            gap-1
            text-[10px]
            text-black/80
        "
                    >

                        <span className="mt-1">
                            <Image
                                src="/icons/detail-task/lokasi.svg"
                                alt="Lokasi"
                                width={14}
                                height={14}
                            />

                        </span>

                        <p
                            className="
                leading-4
                wrap-break-word
            "
                        >

                            {
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

                        </p>

                    </div>

                    {/* BUDGET */}
                    <div
                        className="
                          mt-3
                          rounded-xl
                          bg-black/5
                          p-3
                          backdrop-blur
        "
                    >

                        <p
                            className="
                              text-[13px]
                            text-black/80
            "
                        >
                            Budget
                        </p>

                        <h2
                            className="
                              mt-1
                              flex
                              items-center
                              gap-2
                              text-xl
                              font-black
                              tracking-tight
                            text-emerald-600
                            "
                        >
                            <img
                                src="/icons/detail-task/budget.svg"
                                alt="Budget"
                                className="h-8 w-8 shrink-0"
                            />

                            <span>
                            Rp {task.budget.toLocaleString("id-ID")}
                            </span>
                        </h2>

                    </div>

                    {task.scheduled_at && (
                        <div
                            className="
                          mt-2
                          p-1
                        "
                        >

                            <p
                                className="
                              text-[13px]
                            text-black/80
                            "
                            >
                                Pelaksanaan
                            </p>

                            <h2
                                className="
      mt-3
      flex
      items-center
      gap-3
      text-xs
      text-black/80
    "
                            >
                                <span className="flex items-center gap-1">

                                    <Image
                                        src="/icons/detail-task/tanggal.svg"
                                        alt="Tanggal"
                                        width={14}
                                        height={14}
                                    />

                                    {new Date(
                                        task.scheduled_at
                                    ).toLocaleDateString(
                                        "id-ID",
                                        {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        }
                                    )}

                                </span>

                                <span className="flex items-center gap-1">

                                    <Image
                                        src="/icons/detail-task/jam.svg"
                                        alt="Jam"
                                        width={14}
                                        height={14}
                                    />

                                    {new Date(
                                        task.scheduled_at
                                    ).toLocaleTimeString(
                                        "id-ID",
                                        {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )}

                                </span>

                            </h2>

                        </div>

                    )}

                </div>

                {/* DESCRIPTION */}
                <div className="mt-3 border-t border-slate-200 pt-5">

                    <p
                        className="
                          ml-1
                          text-[13px]
                          
                          text-black/80
            "
                    >
                        Detail Tugas
                    </p>

                    <p
                        className="
                          ml-1
                          text-sm
              mt-2
              leading-5
              text-slate-700
            "
                    >
                        {task.description}
                    </p>

                </div>

                <div className="mt-6 -mx-5 h-3 bg-slate-100">
                </div>

                {/* OWNER */}
                <div className="mt-6">

                    <h2
                        className="
                        ml-1
                          text-[13px]
                          font-black/80
                          
                        "
                    >
                        Diposting oleh
                    </h2>

                    <Link
                        href={`/users/${task.users?.id}`}
                        className="
                          mt-1
                          flex
                          gap-3
                          p-3
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
                                            text-[10px]
                                          "
                                >
                                    ⏳ Belum Terverifikasi
                                </span>

                            )}

                        </div>

                    </Link>

                </div>

                {/* APPLICANTS */}

                <div className="mt-1 border-t border-slate-200 pt-3">
                </div>

                {
                    task.user_id ===
                    currentUserId && (

                        <div className="mt-1">

                            <h2
                                className="
                                  ml-1
                                  text-[13px]
                                  font-black/80
                                "
                            >
                                Pelamar
                            </h2>

                            <div className="mt-3 space-y-4">

                                {applications.length === 0 && (

                                    <div
                                        className="
              rounded-3xl
              bg-white
              p-6
              text-center
              text-sm
              text-slate-500
            "
                                    >
                                        Belum ada pelamar
                                    </div>

                                )}

                                {applications.map((app) => (

                                    <div
                                        key={app.id}
                                        className="
            rounded-3xl
            bg-white
            p-5
            shadow-sm
        "
                                    >

                                        <div className="flex items-center justify-between">

                                            {/* LEFT */}
                                            <div className="flex items-center gap-4">

                                                {/* AVATAR */}
                                                <Link
                                                    href={`/users/${app.helper?.id}`}
                                                >

                                                    {app.helper?.avatar_url ? (

                                                        <img
                                                            src={app.helper.avatar_url}
                                                            alt="Helper"
                                                            className="
        h-12
        w-12
        rounded-full
        object-cover
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
        text-sm
        font-black
        text-indigo-700
      "
                                                        >
                                                            {
                                                                app.helper?.full_name
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase()
                                                            }
                                                        </div>

                                                    )}

                                                </Link>

                                                {/* INFO */}
                                                <div>

                                                    <Link
                                                        href={`/users/${app.helper?.id}`}
                                                        className="
            font-bold
            text-slate-900
        "
                                                    >
                                                        {app.helper?.full_name}
                                                    </Link>

                                                    <p
                                                        className="
            mt-1
            text-[10px]
            text-slate-500
        "
                                                    >
                                                        ⭐ {
                                                            app.reputation
                                                                ?.averageRating ||
                                                            "0.0"
                                                        }

                                                        {" • "}

                                                        {
                                                            app.reputation
                                                                ?.totalReviews ||
                                                            0
                                                        } reviews
                                                    </p>

                                                    <p
                                                        className="
            mt-1
            text-xs
            text-indigo-600
        "
                                                    >
                                                        🏆 {
                                                            app.reputation
                                                                ?.completedTasks ||
                                                            0
                                                        } task selesai
                                                    </p>

                                                </div>

                                            </div>

                                            {/* BUTTON */}
                                            {
                                                task.status ===
                                                "OPEN" && (

                                                    <button
                                                        onClick={() =>
                                                            handleAcceptHelper(
                                                                app.helper_id
                                                            )
                                                        }
                                                        disabled={accepting}
                                                        className="
                            rounded-2xl
                            bg-indigo-600
                            px-4
                            py-2
                            text-xs
                            font-bold
                            text-white
                        "
                                                    >
                                                        Pilih
                                                    </button>
                                                )}

                                        </div>

                                    </div>
                                ))}

                            </div>

                        </div>
                    )}

            </div>

            {/* BOTTOM ACTION */}

            {/* OPEN TASK */}
            {
                task.status === "OPEN" &&
                task.user_id !== currentUserId && (

                    <div
                        className="
                fixed
                bottom-0
                left-0
                right-0
                border-t
                border-slate-200
                bg-white
                p-5
            "
                    >

                        {
                            hasApplied ? (

                                <div
                                    className="
                            flex
                            h-14
                            w-full
                            items-center
                            justify-center
                            rounded-2xl
                            bg-emerald-100
                            text-sm
                            font-bold
                            text-emerald-700
                        "
                                >
                                    ✅ Kamu sudah melamar task ini
                                </div>

                            ) : (

                                <div className="flex gap-3">

                                    <button
                                        onClick={() =>
                                            setShowReportModal(
                                                true
                                            )
                                        }
                                        className="
            flex
            h-14
            items-center
            justify-center
            rounded-xl
            bg-red-600
            border
            border-red-300
            px-1
            text-[10px]
            font-bold
            text-black
        "
                                    >
                                        Report
                                    </button>

                                    <button
                                        onClick={handleApplyTask}
                                        disabled={applying}
                                        className="
            flex
            h-14
            flex-1
            items-center
            justify-center
            rounded-2xl
            bg-indigo-600
            text-sm
            font-bold
            text-white
        "
                                    >
                                        {
                                            applying
                                                ? "Melamar..."
                                                : "Lamar Task"
                                        }
                                    </button>

                                </div>

                            )
                        }

                    </div>
                )}


            {/* OWNER ACTIONS */}
            {
                task.user_id === currentUserId &&
                (
                    task.status === "OPEN" ||
                    task.status === "ACCEPTED"
                ) && (

                    <div
                        className="
        fixed
        bottom-0
        left-0
        right-0
        border-t
        border-slate-200
        bg-white
        p-5
      "
                    >

                        <div className="space-y-3">

                            {
                                task.status === "ACCEPTED" && (

                                    <button
                                        onClick={async () => {

                                            const conversation =
                                                await getConversationByTask(
                                                    task.id
                                                );

                                            if (!conversation) {
                                                return;
                                            }

                                            window.location.href =
                                                `/messages/${conversation.id}`;
                                        }}
                                        className="
          flex
          h-14
          w-full
          items-center
          justify-center
          rounded-2xl
          border
          border-slate-400
          bg-white
          text-sm
          font-bold
          text-emerald-600
        "
                                    >
                                        Chat
                                    </button>

                                )
                            }

                            <div className="flex gap-3">

                                {
                                    task.status === "ACCEPTED" && (

                                        <button
                                            onClick={handleCompleteTask}
                                            className="
            flex
            h-14
            flex-1
            items-center
            justify-center
            rounded-2xl
            bg-emerald-600
            text-sm
            font-bold
            text-white
          "
                                        >
                                            Selesaikan
                                        </button>

                                    )
                                }

                                <button
                                    onClick={handleCancelTask}
                                    className="
        flex
        h-14
        flex-1
        items-center
        justify-center
        rounded-2xl
        bg-red-600
        text-sm
        font-bold
        text-white
      "
                                >
                                    Batalkan
                                </button>

                            </div>

                        </div>

                    </div>

                )
            }

            {/* CHAT ACCESS */}
            {
                task.status === "ACCEPTED" &&
                isSelectedHelper && (

                    <div
                        className="
        fixed
        bottom-0
        left-0
        right-0
        border-t
        border-slate-200
        bg-white
        p-5
      "
                    >

                        <button
                            onClick={async () => {

                                const conversation =
                                    await getConversationByTask(
                                        task.id
                                    );

                                if (!conversation) {
                                    return;
                                }

                                window.location.href =
                                    `/messages/${conversation.id}`;
                            }}
                            className="
          flex
          h-14
          w-full
          items-center
          justify-center
          rounded-2xl
          border
          bg-emerald-600
          text-sm
          font-bold
          text-white
        "
                        >
                            Chat
                        </button>

                    </div>

                )
            }

            <ReportTaskModal

                open={
                    showReportModal
                }

                onClose={() =>
                    setShowReportModal(
                        false
                    )
                }

                taskId={
                    task.id
                }

                taskOwnerId={
                    task.user_id
                }

            />

        </main>
    );
}