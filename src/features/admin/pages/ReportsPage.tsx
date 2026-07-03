"use client";

import {
    useEffect,
    useState,
} from "react";

import Link
    from "next/link";

import { supabase }
    from "@/lib/supabase/client";

interface Report {

    id: string;

    reason: string;

    description: string | null;

    status: string;

    created_at: string;

    admin_notes: string | null;

}

export default function ReportsPage() {
    function getStatusColor(
        status: string
    ) {

        switch (status) {

            case "PENDING":

                return `
                bg-amber-100
                text-amber-700
            `;

            case "REVIEWED":

                return `
                bg-blue-100
                text-blue-700
            `;

            case "RESOLVED":

                return `
                bg-emerald-100
                text-emerald-700
            `;

            default:

                return `
                bg-slate-100
                text-slate-700
            `;

        }

    }

    const [
        reports,
        setReports,
    ] = useState<Report[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        selectedReport,
        setSelectedReport,
    ] = useState<Report | null>(
        null
    );

    const [
        adminNotes,
        setAdminNotes,
    ] = useState("");

    const [
        processing,
        setProcessing,
    ] = useState(false);

    async function loadReports() {

        try {

            setLoading(true);

            const {
                data,
                error,
            } = await supabase
                .from("reports")
                .select("*")

                .in(
                    "status",
                    [
                        "PENDING",
                        "REVIEWED",
                    ]
                )

                .order(
                    "created_at",
                    {
                        ascending: false,
                    }
                );

            if (error) {

                console.error(error);

                return;

            }

            setReports(
                data || []
            );

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    }

    async function reviewReport() {

        if (!selectedReport)
            return;

        try {

            setProcessing(true);

            const {
                error,
            } = await supabase
                .from("reports")
                .update({

                    status:
                        "REVIEWED",

                    reviewed_at:
                        new Date()
                            .toISOString(),

                    admin_notes:
                        adminNotes,

                })
                .eq(
                    "id",
                    selectedReport.id
                );

            if (error) {

                console.error(
                    error
                );

                return;

            }

            alert(
                "Report berhasil direview"
            );

            await loadReports();

            setSelectedReport(
                null
            );

        } catch (error) {

            console.error(error);

        } finally {

            setProcessing(false);

        }

    }

    async function resolveReport() {

        if (!selectedReport)
            return;

        try {

            setProcessing(true);

            const {
                error,
            } = await supabase
                .from("reports")
                .update({

                    status:
                        "RESOLVED",

                    reviewed_at:
                        new Date()
                            .toISOString(),

                    admin_notes:
                        adminNotes,

                })
                .eq(
                    "id",
                    selectedReport.id
                );

            if (error) {

                console.error(
                    error
                );

                return;

            }

            alert(
                "Report berhasil diselesaikan"
            );

            await loadReports();

            setSelectedReport(
                null
            );

        } catch (error) {

            console.error(error);

        } finally {

            setProcessing(false);

        }

    }

    useEffect(() => {

        loadReports();

    }, []);

    return (

        <main className="p-8">

            <h1
                className="
                text-3xl
                font-black
            "
            >
                Reports
            </h1>

            {loading && (

                <p className="mt-6">
                    Loading...
                </p>

            )}

            <div
                className="
                mt-8
                space-y-4
            "
            >

                {reports.map(
                    (report) => (

                        <div
                            key={report.id}
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
                                items-center
                                justify-between
                            "
                            >

                                <h2
                                    className="
                                    font-bold
                                "
                                >
                                    {
                                        report.reason
                                    }
                                </h2>

                                <span
                                    className={`
    rounded-full
    px-3
    py-1
    text-xs
    ${getStatusColor(
                                        report.status
                                    )}
`}
                                >
                                    {
                                        report.status
                                    }
                                </span>

                            </div>

                            <p
                                className="
                                mt-3
                                text-sm
                                text-slate-500
                            "
                            >
                                {
                                    report.description ||
                                    "-"
                                }
                            </p>

                            <p
                                className="
                                mt-3
                                text-xs
                                text-slate-400
                            "
                            >
                                {
                                    new Date(
                                        report.created_at
                                    ).toLocaleString()
                                }
                            </p>

                            <div className="mt-4">

                                <Link
                                    href={`/admin/reports/${report.id}`}
                                    className="
            inline-flex
            rounded-xl
            bg-indigo-600
            px-4
            py-2
            text-sm
            font-semibold
            text-white
        "
                                >
                                    Tinjau
                                </Link>

                            </div>

                            <button
                                onClick={() => {

                                    setSelectedReport(
                                        report
                                    );

                                    setAdminNotes(
                                        report.admin_notes || ""
                                    );

                                }}
                                className="
        mt-4
        rounded-xl
        bg-slate-100
        px-4
        py-2
        text-sm
        font-semibold
    "
                            >
                                Detail Report
                            </button>

                        </div>

                    )
                )}

            </div>

            {selectedReport && (

                <div
                    className="
        fixed
        inset-0
        z-50
        bg-black/50
        p-4
        overflow-y-auto
    "
                >

                    <div
                        className="
            mx-auto
            mt-10
            max-w-2xl
            rounded-3xl
            bg-white
            p-6
        "
                    >

                        <div
                            className="
                flex
                items-center
                justify-between
            "
                        >

                            <h2
                                className="
                    text-xl
                    font-black
                "
                            >
                                Detail Report
                            </h2>

                            <button
                                onClick={() =>
                                    setSelectedReport(
                                        null
                                    )
                                }
                            >
                                ✕
                            </button>

                        </div>

                        <div className="mt-6">

                            <p>
                                <strong>
                                    Reason:
                                </strong>
                            </p>

                            <p>
                                {
                                    selectedReport.reason
                                }
                            </p>

                        </div>

                        <div className="mt-6">

                            <p>
                                <strong>
                                    Description:
                                </strong>
                            </p>

                            <p>
                                {
                                    selectedReport.description ||
                                    "-"
                                }
                            </p>

                        </div>

                        <div className="mt-6">

                            <p>
                                <strong>
                                    Status:
                                </strong>
                            </p>

                            <p>
                                {
                                    selectedReport.status
                                }
                            </p>

                        </div>

                        <div className="mt-6">

                            <p
                                className="
                    mb-2
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
                                className="
                    h-32
                    w-full
                    rounded-2xl
                    border
                    p-4
                "
                            />

                        </div>

                        <div
                            className="
                mt-6
                flex
                gap-4
            "
                        >

                            <button
                                disabled={
                                    processing
                                }
                                onClick={
                                    reviewReport
                                }
                                className="
                    flex-1
                    rounded-2xl
                    bg-amber-500
                    py-4
                    font-bold
                    text-white
                "
                            >
                                Review
                            </button>

                            <button
                                disabled={
                                    processing
                                }
                                onClick={
                                    resolveReport
                                }
                                className="
                    flex-1
                    rounded-2xl
                    bg-emerald-600
                    py-4
                    font-bold
                    text-white
                "
                            >
                                Resolve
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </main>

    );

}