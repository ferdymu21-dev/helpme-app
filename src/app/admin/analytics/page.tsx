"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import {
    useEffect,
    useState,
} from "react";

import {
    supabase,
} from "@/lib/supabase/client";

export default function AnalyticsPage() {

    const [loading, setLoading] =
        useState(true);

    const [stats, setStats] =
        useState<any>(null);

    const [
        chartData,
        setChartData,
    ] = useState<any[]>([]);

    const [
        taskChartData,
        setTaskChartData,
    ] = useState<any[]>([]);

    const [
        reportChartData,
        setReportChartData,
    ] = useState<any[]>([]);

    const [
        topCategories,
        setTopCategories,
    ] = useState<any[]>([]);

    const [
        topHelpers,
        setTopHelpers,
    ] = useState<any[]>([]);

    const [
        topReportedUsers,
        setTopReportedUsers,
    ] = useState<any[]>([]);

    const [
        recentActivities,
        setRecentActivities,
    ] = useState<any[]>([]);

    useEffect(() => {

        loadAnalytics();

    }, []);

    async function loadAnalytics() {

        try {

            setLoading(true);

            /*
             USERS
            */

            const {
                data: usersData,
            } = await supabase
                .from("users")
                .select("created_at");

            const {
                data: tasksData,
            } = await supabase
                .from("tasks")
                .select(`
                   created_at,
                   category
                `);

            const {
    data: completedTasksData,
} = await supabase
    .from("tasks")
    .select(`
        selected_helper_id,
        users!tasks_selected_helper_id_fkey (
            id,
            full_name
        )
    `)
    .eq(
        "status",
        "COMPLETED"
    );

            const {
                data: reportsData,
            } = await supabase
                .from("reports")
                .select("created_at");

            const {
                data: reportedUsersData,
            } = await supabase
                .from("reports")
                .select(`
        reported_user_id,
        reported_user:users!reports_reported_user_id_fkey (
            full_name
        )
    `);

            const {
                count: totalUsers,
            } = await supabase
                .from("users")
                .select("*", {
                    count: "exact",
                    head: true,
                });

            const {
                count: bannedUsers,
            } = await supabase
                .from("users")
                .select("*", {
                    count: "exact",
                    head: true,
                })
                .eq(
                    "is_banned",
                    true
                );

            const {
                count: suspendedUsers,
            } = await supabase
                .from("users")
                .select("*", {
                    count: "exact",
                    head: true,
                })
                .not(
                    "suspended_until",
                    "is",
                    null
                );

            const {
                count: verifiedUsers,
            } = await supabase
                .from("users")
                .select("*", {
                    count: "exact",
                    head: true,
                })
                .eq(
                    "verification_status",
                    "VERIFIED"
                );

            /*
             TASKS
            */

            const {
                count: totalTasks,
            } = await supabase
                .from("tasks")
                .select("*", {
                    count: "exact",
                    head: true,
                });

            const {
                count: openTasks,
            } = await supabase
                .from("tasks")
                .select("*", {
                    count: "exact",
                    head: true,
                })
                .eq(
                    "status",
                    "OPEN"
                );

            const {
                count: completedTasks,
            } = await supabase
                .from("tasks")
                .select("*", {
                    count: "exact",
                    head: true,
                })
                .eq(
                    "status",
                    "COMPLETED"
                );

            /*
             REPORTS
            */

            const {
                count: totalReports,
            } = await supabase
                .from("reports")
                .select("*", {
                    count: "exact",
                    head: true,
                });

            const {
                count: pendingReports,
            } = await supabase
                .from("reports")
                .select("*", {
                    count: "exact",
                    head: true,
                })
                .eq(
                    "status",
                    "PENDING"
                );

            const last7Days = [];

            for (
                let i = 6;
                i >= 0;
                i--
            ) {

                const date =
                    new Date();

                date.setDate(
                    date.getDate() - i
                );

                const day =
                    date
                        .toISOString()
                        .split("T")[0];

                const count =

                    usersData?.filter(
                        (user) =>

                            user.created_at
                                ?.startsWith(day)
                    ).length || 0;

                last7Days.push({

                    day:
                        day.slice(5),

                    users:
                        count,

                });

            }

            setChartData(
                last7Days
            );

            const taskGrowth = [];

            for (
                let i = 6;
                i >= 0;
                i--
            ) {

                const date =
                    new Date();

                date.setDate(
                    date.getDate() - i
                );

                const day =
                    date
                        .toISOString()
                        .split("T")[0];

                const count =

                    tasksData?.filter(
                        (task) =>

                            task.created_at
                                ?.startsWith(day)
                    ).length || 0;

                taskGrowth.push({

                    day:
                        day.slice(5),

                    tasks:
                        count,

                });

            }

            const reportGrowth = [];

            for (
                let i = 6;
                i >= 0;
                i--
            ) {

                const date =
                    new Date();

                date.setDate(
                    date.getDate() - i
                );

                const day =
                    date
                        .toISOString()
                        .split("T")[0];

                const count =

                    reportsData?.filter(
                        (report) =>

                            report.created_at
                                ?.startsWith(day)
                    ).length || 0;

                reportGrowth.push({

                    day:
                        day.slice(5),

                    reports:
                        count,

                });

            }

            setReportChartData(
                reportGrowth
            );

            setTaskChartData(
                taskGrowth
            );

            const categoryMap:
                Record<
                    string,
                    number
                > = {};

            tasksData?.forEach(
                (task) => {

                    const category =
                        task.category ||
                        "OTHER";

                    categoryMap[
                        category
                    ] =
                        (
                            categoryMap[
                            category
                            ] || 0
                        ) + 1;
                }
            );

            const sortedCategories =

                Object.entries(
                    categoryMap
                )

                    .map(
                        ([name, total]) => ({
                            name,
                            total,
                        })
                    )

                    .sort(
                        (a, b) =>
                            b.total -
                            a.total
                    )

                    .slice(0, 5);

            setTopCategories(
                sortedCategories
            );

            const helperMap:
    Record<string, any> = {};

completedTasksData?.forEach(
    (task: any) => {

        const helperId =
            task.selected_helper_id;

        if (!helperId) {
            return;
        }

        if (!helperMap[helperId]) {

            helperMap[helperId] = {

                id: helperId,

                full_name:
                    task.users
                        ?.full_name ||
                    "Unknown",

                total_tasks: 0,

            };

        }

        helperMap[
            helperId
        ].total_tasks++;

    }
);

const topHelpersData =

    Object.values(
        helperMap
    )

        .sort(
            (a: any, b: any) =>
                b.total_tasks -
                a.total_tasks
        )

        .slice(0, 5);

setTopHelpers(
    topHelpersData
);

            const reportMap:
                Record<string, any> = {};

            reportedUsersData?.forEach(
                (report: any) => {

                    const userId =
                        report.reported_user_id;

                    if (!reportMap[userId]) {

                        reportMap[userId] = {

                            name:
                                report.reported_user
                                    ?.full_name ||
                                "Unknown",

                            total: 0,

                        };

                    }

                    reportMap[userId].total++;

                }
            );

            const topReported =

                Object.values(
                    reportMap
                )

                    .sort(
                        (a: any, b: any) =>
                            b.total - a.total
                    )

                    .slice(0, 5);

            setTopReportedUsers(
                topReported
            );

            setStats({

                totalUsers,
                bannedUsers,
                suspendedUsers,
                verifiedUsers,

                totalTasks,
                openTasks,
                completedTasks,

                totalReports,
                pendingReports,

            });

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    }

    if (loading) {

        return (
            <main className="p-8">
                Loading...
            </main>
        );

    }

    return (

        <main className="p-8">

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

            {/* USERS */}

            <h2
                className="
                mt-10
                mb-4
                text-xl
                font-black
            "
            >
                Users
            </h2>

            <div
                className="
                grid
                grid-cols-4
                gap-4
            "
            >

                <AnalyticsCard
                    title="Total Users"
                    value={stats?.totalUsers}
                />

                <AnalyticsCard
                    title="Verified"
                    value={stats?.verifiedUsers}
                    color="emerald"
                />

                <AnalyticsCard
                    title="Suspended"
                    value={stats?.suspendedUsers}
                    color="amber"
                />

                <AnalyticsCard
                    title="Banned"
                    value={stats?.bannedUsers}
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
            "
            >
                Tasks
            </h2>

            <div
                className="
                grid
                grid-cols-3
                gap-4
            "
            >

                <AnalyticsCard
                    title="Total Tasks"
                    value={stats?.totalTasks}
                />

                <AnalyticsCard
                    title="Open"
                    value={stats?.openTasks}
                    color="blue"
                />

                <AnalyticsCard
                    title="Completed"
                    value={stats?.completedTasks}
                    color="emerald"
                />

            </div>

            {/* REPORTS */}

            <h2
                className="
                mt-10
                mb-4
                text-xl
                font-black
            "
            >
                Reports
            </h2>

            <div
                className="
                grid
                grid-cols-2
                gap-4
            "
            >

                <AnalyticsCard
                    title="Total Reports"
                    value={stats?.totalReports}
                />

                <AnalyticsCard
                    title="Pending"
                    value={stats?.pendingReports}
                    color="amber"
                />

            </div>

            <h2
                className="
        mt-10
        mb-4
        text-xl
        font-black
    "
            >
                User Growth
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
                        data={chartData}
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
                            dataKey="users"
                            stroke="#2563eb"
                            strokeWidth={3}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

            <h2
                className="
        mt-10
        mb-4
        text-xl
        font-black
    "
            >
                Task Growth
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
                        data={taskChartData}
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
                            dataKey="tasks"
                            stroke="#16a34a"
                            strokeWidth={3}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

            <h2
                className="
        mt-10
        mb-4
        text-xl
        font-black
    "
            >
                Report Growth
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
                        data={reportChartData}
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
                            dataKey="reports"
                            stroke="#dc2626"
                            strokeWidth={3}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

            <h2
                className="
        mt-10
        mb-4
        text-xl
        font-black
    "
            >
                Top Categories
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

                    {topCategories.map(
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

                                <span>
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
                    )}

                </div>

            </div>

            <h2
                className="
        mt-10
        mb-4
        text-xl
        font-black
    "
            >
                Top Active Helpers
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

                    {(topHelpers || []).map(
                        (helper, index) => (

                            <div
                                key={helper.id}
                                className="
                        flex
                        items-center
                        justify-between
                    "
                            >

                                <div>

                                    <p
                                        className="
                                font-semibold
                            "
                                    >
                                        #{index + 1}
                                        {" "}
                                        {helper.full_name}
                                    </p>

                                </div>

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
                                    {helper.total_tasks || 0}
                                    {" "}
                                    Task
                                </span>

                            </div>

                        )
                    )}

                </div>

            </div>

            <h2
                className="
        mt-10
        mb-4
        text-xl
        font-black
    "
            >
                Top Reported Users
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

                    {(topReportedUsers || []).map(
                        (user, index) => (

                            <div
                                key={index}
                                className="
                        flex
                        items-center
                        justify-between
                    "
                            >

                                <p>
                                    #{index + 1}
                                    {" "}
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
                                    {user.total}
                                    {" "}
                                    Report
                                </span>

                            </div>

                        )
                    )}

                </div>

            </div>

        </main>

    );

}

function AnalyticsCard({

    title,
    value,
    color = "slate",

}: {

    title: string;

    value: number | null;

    color?: string;

}) {

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

                    ${color === "emerald"
                        ? "text-emerald-600"
                        : color === "amber"
                            ? "text-amber-600"
                            : color === "red"
                                ? "text-red-600"
                                : color === "blue"
                                    ? "text-blue-600"
                                    : "text-slate-900"
                    }
                `}
            >
                {value ?? 0}
            </h3>

        </div>

    );

}