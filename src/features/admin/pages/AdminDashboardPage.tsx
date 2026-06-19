"use client";

import Link from "next/link";

export default function AdminDashboardPage() {

    return (

        <main className="p-8">

            <div>

                <h1
                    className="
                    text-3xl
                    font-black
                    text-slate-900
                "
                >
                    Admin Dashboard
                </h1>

                <p
                    className="
                    mt-2
                    text-slate-500
                "
                >
                    Kelola seluruh aktivitas HelpMe
                </p>

            </div>

            <div
                className="
                mt-8
                grid
                gap-6
                md:grid-cols-2
            "
            >

                <Link
                    href="/admin/verification"
                    className="
                    rounded-3xl
                    bg-white
                    p-6
                    shadow-sm
                    transition
                    hover:shadow-md
                "
                >
                    <p className="text-4xl">
                        📄
                    </p>

                    <h2
                        className="
                        mt-4
                        text-lg
                        font-bold
                    "
                    >
                        Verification Requests
                    </h2>

                    <p
                        className="
                        mt-2
                        text-sm
                        text-slate-500
                    "
                    >
                        Kelola verifikasi akun
                    </p>
                </Link>

                <Link
                    href="/admin/users"
                    className="
                    rounded-3xl
                    bg-white
                    p-6
                    shadow-sm
                    transition
                    hover:shadow-md
                "
                >
                    <p className="text-4xl">
                        👥
                    </p>

                    <h2
                        className="
                        mt-4
                        text-lg
                        font-bold
                    "
                    >
                        Users
                    </h2>

                    <p
                        className="
                        mt-2
                        text-sm
                        text-slate-500
                    "
                    >
                        Kelola seluruh pengguna
                    </p>
                </Link>

                <Link
                    href="/admin/tasks"
                    className="
                    rounded-3xl
                    bg-white
                    p-6
                    shadow-sm
                    transition
                    hover:shadow-md
                "
                >
                    <p className="text-4xl">
                        📋
                    </p>

                    <h2
                        className="
                        mt-4
                        text-lg
                        font-bold
                    "
                    >
                        Tasks
                    </h2>

                    <p
                        className="
                        mt-2
                        text-sm
                        text-slate-500
                    "
                    >
                        Kelola seluruh task
                    </p>
                </Link>

                <Link
                    href="/admin/reports"
                    className="
                    rounded-3xl
                    bg-white
                    p-6
                    shadow-sm
                    transition
                    hover:shadow-md
                "
                >
                    <p className="text-4xl">
                        🚩
                    </p>

                    <h2
                        className="
                        mt-4
                        text-lg
                        font-bold
                    "
                    >
                        Reports
                    </h2>

                    <p
                        className="
                        mt-2
                        text-sm
                        text-slate-500
                    "
                    >
                        Kelola laporan user
                    </p>
                </Link>

            </div>

        </main>

    );

}