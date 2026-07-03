"use client";

import {
    suspendUser,
    banUser,
} from "@/features/admin/services/user-moderation.service";

import {
    removeTask,
} from "@/features/admin/services/task-moderation.service";

import { useEffect, useState }
    from "react";

import { useParams }
    from "next/navigation";

import { supabase }
    from "@/lib/supabase/client";

import {
    updateReportStatus,
} from "@/features/admin/services/report-admin.service";

export default function ReportDetailPage() {

    const params =
        useParams();

    const [
        report,
        setReport,
    ] = useState<any>(null);

    const [
        adminNotes,
        setAdminNotes,
    ] = useState("");

    const [
        loading,
        setLoading,
    ] = useState(true);

    async function loadReport() {

        try {

            setLoading(true);

            const {
                data,
                error,
            } = await supabase
                .from("reports")
                .select(`
        *,
        reporter:users!reports_reporter_id_fkey (
            id,
            full_name,
            verification_status
        ),
        reported_user:users!reports_reported_user_id_fkey (
            id,
            full_name,
            verification_status
        ),
        task:tasks (
            id,
            title,
            status,
            budget
        )
    `)
                .eq(
                    "id",
                    params.id
                )
                .single();

            if (error) {

                console.error(error);

                return;

            }

            setReport(data);

            setAdminNotes(
                data.admin_notes || ""
            );

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        loadReport();

    }, []);

    async function handleUpdateStatus(

        status:
            | "REVIEWED"
            | "RESOLVED"
            | "REJECTED"

    ) {

        if (!report) {
            return;
        }

        try {

            await updateReportStatus(

                report.id,

                status,

                adminNotes

            );

            alert(
                "Status berhasil diperbarui"
            );

            await loadReport();

        } catch (error) {

            console.error(error);

            alert(
                "Gagal memperbarui report"
            );

        }
    }

    if (loading) {

        return (

            <main className="p-8">

                Loading...

            </main>

        );

    }

    if (!report) {

        return (

            <main className="p-8">

                Report tidak ditemukan

            </main>

        );

    }

    return (

        <main className="p-8">

            <h1
                className="
                    text-3xl
                    font-black
                "
            >
                Report Detail
            </h1>

            <div
                className="
                    mt-8
                    rounded-3xl
                    bg-white
                    p-6
                    shadow-sm
                "
            >

                <div className="space-y-6">

                    <div>

                        <p
                            className="
            text-xs
            text-slate-500
        "
                        >
                            Pelapor
                        </p>

                        <div
                            className="
            flex
            items-center
            gap-2
        "
                        >

                            <p
                                className="
                font-semibold
            "
                            >
                                {
                                    report.reporter
                                        ?.full_name
                                }
                            </p>

                            {
                                report.reporter
                                    ?.verification_status ===
                                "VERIFIED" && (

                                    <span
                                        className="
                        rounded-full
                        bg-emerald-100
                        px-2
                        py-1
                        text-[10px]
                        font-bold
                        text-emerald-700
                    "
                                    >
                                        ✓ Verified
                                    </span>

                                )
                            }

                        </div>

                    </div>

                    <div>

                        <p
                            className="
                                text-xs
                                text-slate-500
                            "
                        >
                            Report ID
                        </p>

                        <p
                            className="
                                font-semibold
                            "
                        >
                            {report.id}
                        </p>

                    </div>

                    <div>

                        <p
                            className="
            text-xs
            text-slate-500
        "
                        >
                            Dilaporkan
                        </p>

                        <div
                            className="
            flex
            items-center
            gap-2
        "
                        >

                            <p
                                className="
                font-semibold
            "
                            >
                                {
                                    report.reported_user
                                        ?.full_name
                                }
                            </p>

                            {
                                report.reported_user
                                    ?.verification_status ===
                                "VERIFIED" && (

                                    <span
                                        className="
                        rounded-full
                        bg-emerald-100
                        px-2
                        py-1
                        text-[10px]
                        font-bold
                        text-emerald-700
                    "
                                    >
                                        ✓ Verified
                                    </span>

                                )
                            }

                        </div>

                    </div>

                    <div>

                        <p
                            className="
            text-xs
            text-slate-500
        "
                        >
                            Task
                        </p>

                        <p
                            className="
            font-semibold
        "
                        >
                            {
                                report.task?.title ||
                                "-"
                            }
                        </p>

                    </div>

                    <div>

                        <p
                            className="
                                text-xs
                                text-slate-500
                            "
                        >
                            Reason
                        </p>

                        <p
                            className="
                                font-semibold
                            "
                        >
                            {report.reason}
                        </p>

                    </div>

                    <div>

                        <p
                            className="
                                text-xs
                                text-slate-500
                            "
                        >
                            Description
                        </p>

                        <p>
                            {
                                report.description ||
                                "-"
                            }
                        </p>

                    </div>

                    <div>

                        <p
                            className="
            text-xs
            text-slate-500
        "
                        >
                            Status
                        </p>

                        <span
                            className="
            inline-flex
            rounded-full
            bg-amber-100
            px-3
            py-1
            text-xs
            font-bold
            text-amber-700
        "
                        >
                            {report.status}
                        </span>

                    </div>

                    <div>

                        <p
                            className="
                                text-xs
                                text-slate-500
                            "
                        >
                            Dibuat
                        </p>

                        <p>
                            {
                                new Date(
                                    report.created_at
                                ).toLocaleString()
                            }
                        </p>

                    </div>

                    <div className="mt-8">

                        <p
                            className="
            mb-2
            text-sm
            font-semibold
        "
                        >
                            Admin Notes
                        </p>

                        <textarea

                            value={
                                adminNotes
                            }

                            onChange={(e) =>
                                setAdminNotes(
                                    e.target.value
                                )
                            }

                            placeholder="
Catatan admin mengenai hasil investigasi laporan...
"

                            className="
        h-32
        w-full
        rounded-2xl
        border
        p-4
    "
                        />

                        <div
                            className="
        mt-6
        rounded-2xl
        border
        border-slate-200
        p-5
    "
                        >

                            <h3
                                className="
            mb-4
            font-bold
        "
                            >
                                Report Actions
                            </h3>

                            <div className="flex flex-wrap gap-3">

                                <button
                                    onClick={() =>
                                        handleUpdateStatus(
                                            "REVIEWED"
                                        )
                                    }
                                    className="
                rounded-xl
                bg-amber-500
                px-5
                py-3
                font-semibold
                text-white
            "
                                >
                                    Review
                                </button>

                                <button
                                    onClick={() =>
                                        handleUpdateStatus(
                                            "RESOLVED"
                                        )
                                    }
                                    className="
                rounded-xl
                bg-emerald-600
                px-5
                py-3
                font-semibold
                text-white
            "
                                >
                                    Resolve
                                </button>

                                <button
                                    onClick={() =>
                                        handleUpdateStatus(
                                            "REJECTED"
                                        )
                                    }
                                    className="
                rounded-xl
                bg-red-600
                px-5
                py-3
                font-semibold
                text-white
            "
                                >
                                    Reject
                                </button>

                            </div>

                        </div>

                        {
                            report.task?.id && (

                                <div className="mb-8">

                                    <h2
                                        className="
                    mb-3
                    text-lg
                    font-black
                "
                                    >
                                        Task Moderation
                                    </h2>

                                    <button

                                        onClick={async () => {

                                            const confirmAction =
                                                window.confirm(
                                                    "Hapus task ini dari platform?"
                                                );

                                            if (!confirmAction) {
                                                return;
                                            }

                                            try {

                                                await removeTask(
                                                    report.task.id
                                                );

                                                alert(
                                                    "Task berhasil dihapus"
                                                );

                                                await loadReport();

                                            } catch (error) {

                                                console.error(error);

                                                alert(
                                                    "Gagal menghapus task"
                                                );

                                            }

                                        }}

                                        className="
                    rounded-xl
                    bg-red-600
                    px-5
                    py-3
                    font-semibold
                    text-white
                "
                                    >
                                        Hapus Task
                                    </button>

                                </div>

                            )
                        }

                        <div
                            className="
        mt-6
        rounded-2xl
        border
        border-red-200
        bg-red-50
        p-5
    "
                        >

                            <h2
                                className="
        text-lg
        font-black
        text-red-700
    "
                            >
                                User Moderation
                            </h2>

                            <p
                                className="
        mt-2
        mb-4
        text-sm
        text-red-600
    "
                            >
                                Tindakan ini akan mempengaruhi akun user.
                            </p>

                            <div className="flex flex-wrap gap-3">

                                <button

                                    onClick={async () => {

                                        if (
                                            !report.reported_user?.id
                                        ) return;

                                        const confirmAction =
                                            window.confirm(
                                                "Suspend user 3 hari?"
                                            );

                                        if (!confirmAction) {
                                            return;
                                        }

                                        try {

                                            await suspendUser(

                                                report.reported_user.id,

                                                3,

                                                report.reason

                                            );

                                            alert(
                                                "User berhasil disuspend 3 hari"
                                            );

                                        } catch (error) {

                                            console.error(error);

                                            alert(
                                                "Gagal suspend user"
                                            );

                                        }

                                    }}

                                    className="
                rounded-xl
                bg-amber-500
                px-4
                py-3
                font-semibold
                text-white
            "
                                >
                                    Suspend 3 Hari
                                </button>

                                <button

                                    onClick={async () => {

                                        if (
                                            !report.reported_user?.id
                                        ) return;

                                        const confirmAction =
                                            window.confirm(
                                                "Suspend user 7 hari?"
                                            );

                                        if (!confirmAction) {
                                            return;
                                        }

                                        try {

                                            await suspendUser(

                                                report.reported_user.id,

                                                7,

                                                report.reason

                                            );

                                            alert(
                                                "User berhasil disuspend 7 hari"
                                            );

                                        } catch (error) {

                                            console.error(error);

                                            alert(
                                                "Gagal suspend user"
                                            );

                                        }

                                    }}

                                    className="
                rounded-xl
                bg-red-500
                px-4
                py-3
                font-semibold
                text-white
            "
                                >
                                    Suspend 7 Hari
                                </button>

                                <button

                                    onClick={async () => {

                                        if (
                                            !report.reported_user?.id
                                        ) return;

                                        const confirmAction =
                                            window.confirm(
                                                "Suspend user 30 hari?"
                                            );

                                        if (!confirmAction) {
                                            return;
                                        }

                                        try {

                                            await suspendUser(

                                                report.reported_user.id,

                                                30,

                                                report.reason

                                            );

                                            alert(
                                                "User berhasil disuspend 30 hari"
                                            );

                                        } catch (error) {

                                            console.error(error);

                                            alert(
                                                "Gagal suspend user"
                                            );

                                        }

                                    }}

                                    className="
        rounded-xl
        bg-red-600
        px-4
        py-3
        font-semibold
        text-white
    "
                                >
                                    Suspend 30 Hari
                                </button>

                                <button

                                    onClick={async () => {

                                        if (
                                            !report.reported_user?.id
                                        ) return;

                                        const confirmAction =
                                            window.confirm(
                                                "Ban user permanen?"
                                            );

                                        if (!confirmAction) {
                                            return;
                                        }

                                        try {

                                            await banUser(
                                                report.reported_user.id
                                            );

                                            alert(
                                                "User berhasil dibanned"
                                            );

                                        } catch (error) {

                                            console.error(error);

                                            alert(
                                                "Gagal ban user"
                                            );

                                        }

                                    }}

                                    className="
                rounded-xl
                bg-black
                px-4
                py-3
                font-semibold
                text-white
            "
                                >
                                    Ban Permanen
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </main>

    );

}