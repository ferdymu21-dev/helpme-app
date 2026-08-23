"use client";

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { useEffect, useState } from "react";

interface Stats {
    totalUsers: number;
    verifiedUsers: number;
    suspendedUsers: number;
    bannedUsers: number;

    totalTasks: number;
    openTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    cancelledTasks: number;
    removedTasks: number;

    totalReports: number;
    pendingReports: number;
    reviewedReports: number;
    resolvedReports: number;
    rejectedReports: number;
}

interface GrowthPoint {
    day: string;
    users?: number;
    tasks?: number;
    reports?: number;
}

interface CategoryStat {
    name: string;
    total: number;
}

interface HelperStat {
    id: string;
    full_name: string;
    total_tasks: number;
}

interface ReportedUserStat {
    id: string;
    name: string;
    total: number;
}

interface AnalyticsResponse {
    stats: Stats;
    userChartData: GrowthPoint[];
    taskChartData: GrowthPoint[];
    reportChartData: GrowthPoint[];
    topCategories: CategoryStat[];
    topHelpers: HelperStat[];
    topReportedUsers: ReportedUserStat[];
}

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(
        null
    );

    const [data, setData] =
        useState<AnalyticsResponse | null>(
            null
        );

    useEffect(() => {
        loadAnalytics();
    }, []);

    async function loadAnalytics() {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                "/api/admin/analytics",
                {
                    method: "GET",
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Gagal mengambil data analytics."
                );
            }

            const result =
                (await response.json()) as AnalyticsResponse;

            setData(result);
        } catch (error) {
            console.error(
                "Analytics error:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan."
            );
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <main className="p-8">
                <div
                    className="
                        rounded-3xl
                        bg-white
                        p-8
                        shadow-sm
                    "
                >
                    <p className="text-slate-500">
                        Loading analytics...
                    </p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="p-8">
                <div
                    className="
                        rounded-3xl
                        border
                        border-red-200
                        bg-red-50
                        p-8
                    "
                >
                    <h1
                        className="
                            text-xl
                            font-black
                            text-red-700
                        "
                    >
                        Gagal memuat analytics
                    </h1>

                    <p
                        className="
                            mt-2
                            text-sm
                            text-red-600
                        "
                    >
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={loadAnalytics}
                        className="
                            mt-5
                            rounded-xl
                            bg-red-600
                            px-5
                            py-3
                            text-sm
                            font-bold
                            text-white
                            transition
                            hover:bg-red-700
                        "
                    >
                        Coba Lagi
                    </button>
                </div>
            </main>
        );
    }

    if (!data) {
        return (
            <main className="p-8">
                <p className="text-slate-500">
                    Tidak ada data analytics.
                </p>
            </main>
        );
    }

    const {
        stats,
        userChartData,
        taskChartData,
        reportChartData,
        topCategories,
        topHelpers,
        topReportedUsers,
    } = data;

    return (
        <main className="p-8">

            {/* HEADER */}

            <div>
                <h1
                    className="
                        text-3xl
                        font-black
                        text-slate-900
                    "
                >
                    Admin Analytics
                </h1>

                <p
                    className="
                        mt-2
                        text-slate-500
                    "
                >
                    Statistik platform HelpMe
                </p>
            </div>

            {/* USERS */}

            <h2
                className="
                    mt-10
                    mb-4
                    text-xl
                    font-black
                    text-slate-900
                "
            >
                Users
            </h2>

            <div
                className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    lg:grid-cols-4
                "
            >
                <AnalyticsCard
                    title="Total Users"
                    value={
                        stats.totalUsers
                    }
                />

                <AnalyticsCard
                    title="Verified"
                    value={
                        stats.verifiedUsers
                    }
                    color="emerald"
                />

                <AnalyticsCard
                    title="Suspended"
                    value={
                        stats.suspendedUsers
                    }
                    color="amber"
                />

                <AnalyticsCard
                    title="Banned"
                    value={
                        stats.bannedUsers
                    }
                    color="red"
                />
            </div>

            {/* TASKS */}

            <h2
                className="
                    mt-10
                    mb-4
                    text-xl
                    font-black
                    text-slate-900
                "
            >
                Tasks
            </h2>

            <div
                className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    lg:grid-cols-3
                "
            >
                <AnalyticsCard
                    title="Total Tasks"
                    value={
                        stats.totalTasks
                    }
                />

                <AnalyticsCard
                    title="Open"
                    value={
                        stats.openTasks
                    }
                    color="blue"
                />

                <AnalyticsCard
                    title="In Progress"
                    value={
                        stats.inProgressTasks
                    }
                    color="amber"
                />

                <AnalyticsCard
                    title="Completed"
                    value={
                        stats.completedTasks
                    }
                    color="emerald"
                />

                <AnalyticsCard
                    title="Cancelled"
                    value={
                        stats.cancelledTasks
                    }
                    color="red"
                />

                <AnalyticsCard
                    title="Removed"
                    value={
                        stats.removedTasks
                    }
                    color="red"
                />
            </div>

            {/* REPORTS */}

            <h2
                className="
                    mt-10
                    mb-4
                    text-xl
                    font-black
                    text-slate-900
                "
            >
                Reports
            </h2>

            <div
                className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    lg:grid-cols-5
                "
            >
                <AnalyticsCard
                    title="Total Reports"
                    value={
                        stats.totalReports
                    }
                />

                <AnalyticsCard
                    title="Pending"
                    value={
                        stats.pendingReports
                    }
                    color="amber"
                />

                <AnalyticsCard
                    title="Reviewed"
                    value={
                        stats.reviewedReports
                    }
                    color="blue"
                />

                <AnalyticsCard
                    title="Resolved"
                    value={
                        stats.resolvedReports
                    }
                    color="emerald"
                />

                <AnalyticsCard
                    title="Rejected"
                    value={
                        stats.rejectedReports
                    }
                    color="red"
                />
            </div>

            {/* CHARTS */}

            <AnalyticsChart
                title="User Growth"
                data={userChartData}
                dataKey="users"
            />

            <AnalyticsChart
                title="Task Growth"
                data={taskChartData}
                dataKey="tasks"
            />

            <AnalyticsChart
                title="Report Growth"
                data={reportChartData}
                dataKey="reports"
            />

            {/* TOP CATEGORIES */}

            <AnalyticsList
                title="Top Categories"
            >
                {topCategories.length ===
                0 ? (
                    <EmptyState />
                ) : (
                    topCategories.map(
                        (category) => (
                            <div
                                key={
                                    category.name
                                }
                                className="
                                    flex
                                    items-center
                                    justify-between
                                "
                            >
                                <span
                                    className="
                                        font-medium
                                        text-slate-700
                                    "
                                >
                                    {
                                        category.name
                                    }
                                </span>

                                <span
                                    className="
                                        rounded-full
                                        bg-blue-100
                                        px-3
                                        py-1
                                        text-xs
                                        font-bold
                                        text-blue-700
                                    "
                                >
                                    {
                                        category.total
                                    }
                                </span>
                            </div>
                        )
                    )
                )}
            </AnalyticsList>

            {/* TOP HELPERS */}

            <AnalyticsList
                title="Top Active Helpers"
            >
                {topHelpers.length ===
                0 ? (
                    <EmptyState />
                ) : (
                    topHelpers.map(
                        (
                            helper,
                            index
                        ) => (
                            <div
                                key={
                                    helper.id
                                }
                                className="
                                    flex
                                    items-center
                                    justify-between
                                "
                            >
                                <p
                                    className="
                                        font-semibold
                                        text-slate-700
                                    "
                                >
                                    #
                                    {index + 1}{" "}
                                    {
                                        helper.full_name
                                    }
                                </p>

                                <span
                                    className="
                                        rounded-full
                                        bg-emerald-100
                                        px-3
                                        py-1
                                        text-xs
                                        font-bold
                                        text-emerald-700
                                    "
                                >
                                    {
                                        helper.total_tasks
                                    }{" "}
                                    Task
                                </span>
                            </div>
                        )
                    )
                )}
            </AnalyticsList>

            {/* TOP REPORTED USERS */}

            <AnalyticsList
                title="Top Reported Users"
            >
                {topReportedUsers.length ===
                0 ? (
                    <EmptyState />
                ) : (
                    topReportedUsers.map(
                        (
                            user,
                            index
                        ) => (
                            <div
                                key={
                                    user.id
                                }
                                className="
                                    flex
                                    items-center
                                    justify-between
                                "
                            >
                                <p
                                    className="
                                        font-semibold
                                        text-slate-700
                                    "
                                >
                                    #
                                    {index + 1}{" "}
                                    {user.name}
                                </p>

                                <span
                                    className="
                                        rounded-full
                                        bg-red-100
                                        px-3
                                        py-1
                                        text-xs
                                        font-bold
                                        text-red-700
                                    "
                                >
                                    {user.total}{" "}
                                    Report
                                </span>
                            </div>
                        )
                    )
                )}
            </AnalyticsList>
        </main>
    );
}

function AnalyticsCard({
    title,
    value,
    color = "slate",
}: {
    title: string;
    value: number;
    color?:
        | "slate"
        | "emerald"
        | "amber"
        | "red"
        | "blue";
}) {
    const colorClass =
        color === "emerald"
            ? "text-emerald-600"
            : color === "amber"
              ? "text-amber-600"
              : color === "red"
                ? "text-red-600"
                : color === "blue"
                  ? "text-blue-600"
                  : "text-slate-900";

    return (
        <div
            className="
                rounded-3xl
                bg-white
                p-6
                shadow-sm
            "
        >
            <p
                className="
                    text-sm
                    text-slate-500
                "
            >
                {title}
            </p>

            <h3
                className={`
                    mt-3
                    text-4xl
                    font-black
                    ${colorClass}
                `}
            >
                {value}
            </h3>
        </div>
    );
}

function AnalyticsChart({
    title,
    data,
    dataKey,
}: {
    title: string;
    data: GrowthPoint[];
    dataKey:
        | "users"
        | "tasks"
        | "reports";
}) {
    return (
        <>
            <h2
                className="
                    mt-10
                    mb-4
                    text-xl
                    font-black
                    text-slate-900
                "
            >
                {title}
            </h2>

            <div
                className="
                    h-87.5
                    rounded-3xl
                    bg-white
                    p-6
                    shadow-sm
                "
            >
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <LineChart
                        data={data}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            dataKey="day"
                        />

                        <YAxis />

                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey={
                                dataKey
                            }
                            stroke="#2563eb"
                            strokeWidth={3}
                            dot={{
                                r: 4,
                            }}
                            activeDot={{
                                r: 6,
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </>
    );
}

function AnalyticsList({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <>
            <h2
                className="
                    mt-10
                    mb-4
                    text-xl
                    font-black
                    text-slate-900
                "
            >
                {title}
            </h2>

            <div
                className="
                    rounded-3xl
                    bg-white
                    p-6
                    shadow-sm
                "
            >
                <div className="space-y-3">
                    {children}
                </div>
            </div>
        </>
    );
}

function EmptyState() {
    return (
        <p
            className="
                text-sm
                text-slate-500
            "
        >
            Belum ada data.
        </p>
    );
}