"use client";

import {
    useEffect,
    useState,
} from "react";

import { supabase }
    from "@/lib/supabase/client";

import {
    suspendUser,
    banUser,
} from "@/features/admin/services/user-moderation.service";

interface User {

    id: string;

    full_name: string;

    email: string | null;

    role: string;

    verification_status: string;

    rating: number;

    avatar_url: string | null;

    is_banned?: boolean;

    suspended_until?: string | null;

}

export default function UserManagementPage() {

    const [
        users,
        setUsers,
    ] = useState<User[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        filter,
        setFilter,
    ] = useState<
        "ALL" |
        "ACTIVE" |
        "SUSPENDED" |
        "BANNED"
    >("ALL");

    const [
        totalUsers,
        setTotalUsers,
    ] = useState(0);

    const [
        activeUsers,
        setActiveUsers,
    ] = useState(0);

    const [
        suspendedUsers,
        setSuspendedUsers,
    ] = useState(0);

    const [
        bannedUsers,
        setBannedUsers,
    ] = useState(0);

    const [
        currentPage,
        setCurrentPage,
    ] = useState(1);

    const ITEMS_PER_PAGE = 20;

    useEffect(() => {

        loadUsers();

    }, []);

    async function loadUsers() {

        try {

            setLoading(true);

            const {
                data,
                error,
            } = await supabase
                .from("users")
                .select(`
                    id,
                    full_name,
                    email,
                    role,
                    verification_status,
                    rating,
                    avatar_url,
                    is_banned,
                    suspended_until
                `)
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

            const allUsers =
                data || [];

            setUsers(allUsers);

            setTotalUsers(
                allUsers.length
            );

            setBannedUsers(

                allUsers.filter(
                    (user) =>
                        user.is_banned
                ).length

            );

            setSuspendedUsers(

                allUsers.filter(
                    (user) =>
                        !user.is_banned &&
                        user.suspended_until
                ).length

            );

            setActiveUsers(

                allUsers.filter(
                    (user) =>
                        !user.is_banned &&
                        !user.suspended_until
                ).length

            );

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    }

    async function unsuspendUser(
        userId: string
    ) {

        const { error } =
            await supabase
                .from("users")
                .update({
                    suspended_until: null,
                })
                .eq("id", userId);

        if (error) {
            throw error;
        }

        await loadUsers();
    }

    async function unbanUser(
        userId: string
    ) {

        const { error } =
            await supabase
                .from("users")
                .update({
                    is_banned: false,
                })
                .eq("id", userId);

        if (error) {
            throw error;
        }

        await loadUsers();
    }

    const filteredUsers =
    users.filter((user) => {

        const matchSearch =

            user.full_name
                ?.toLowerCase()
                .includes(
                    search.toLowerCase()
                );

            if (!matchSearch) {
                return false;
            }

            if (
                filter === "ACTIVE"
            ) {

                return (
                    !user.is_banned &&
                    !user.suspended_until
                );

            }

            if (
                filter === "SUSPENDED"
            ) {

                return (
                    !user.is_banned &&
                    !!user.suspended_until
                );

            }

            if (
                filter === "BANNED"
            ) {

                return (
                    !!user.is_banned
                );

            }

            return true;

        });

    const totalPages = Math.ceil(
        filteredUsers.length /
        ITEMS_PER_PAGE
    );

    const paginatedUsers =
        filteredUsers.slice(

            (currentPage - 1)
            * ITEMS_PER_PAGE,

            currentPage
            * ITEMS_PER_PAGE

        );

    return (

        <main className="p-8">

            <h1
                className="
                text-3xl
                font-black
                text-slate-900
            "
            >
                User Management
            </h1>

            <div
                className="
        mt-8
        grid
        grid-cols-4
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
                    <p className="text-sm text-slate-500">
                        Total User
                    </p>

                    <h2
                        className="
                mt-2
                text-3xl
                font-black
            "
                    >
                        {totalUsers}
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
                    <p className="text-sm text-slate-500">
                        Active
                    </p>

                    <h2
                        className="
                mt-2
                text-3xl
                font-black
                text-emerald-600
            "
                    >
                        {activeUsers}
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
                    <p className="text-sm text-slate-500">
                        Suspended
                    </p>

                    <h2
                        className="
                mt-2
                text-3xl
                font-black
                text-amber-600
            "
                    >
                        {suspendedUsers}
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
                    <p className="text-sm text-slate-500">
                        Banned
                    </p>

                    <h2
                        className="
                mt-2
                text-3xl
                font-black
                text-red-600
            "
                    >
                        {bannedUsers}
                    </h2>
                </div>

            </div>

            <input
                type="text"
                placeholder="Cari user..."
                value={search}
                onChange={(e) =>
                    setSearch(
                        e.target.value
                    )
                }
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
        gap-3
        flex-wrap
    "
            >

                <button

                    onClick={() =>
                        setFilter("ALL")
                    }

                    className={`
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold

            ${filter === "ALL"
                            ? "bg-slate-900 text-white"
                            : "bg-white"
                        }
        `}
                >
                    All
                </button>

                <button

                    onClick={() =>
                        setFilter("ACTIVE")
                    }

                    className={`
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold

            ${filter === "ACTIVE"
                            ? "bg-emerald-600 text-white"
                            : "bg-white"
                        }
        `}
                >
                    Active
                </button>

                <button

                    onClick={() =>
                        setFilter("SUSPENDED")
                    }

                    className={`
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold

            ${filter === "SUSPENDED"
                            ? "bg-amber-500 text-white"
                            : "bg-white"
                        }
        `}
                >
                    Suspended
                </button>

                <button

                    onClick={() =>
                        setFilter("BANNED")
                    }

                    className={`
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold

            ${filter === "BANNED"
                            ? "bg-red-600 text-white"
                            : "bg-white"
                        }
        `}
                >
                    Banned
                </button>

            </div>

            {loading && (

                <p className="mt-6">
                    Loading...
                </p>

            )}

            <p
                className="
        mt-6
        text-sm
        text-slate-500
    "
            >
                Menampilkan
                {" "}
                {paginatedUsers.length}
                {" "}
                user
            </p>

            <div
                className="
                mt-8
                space-y-4
            "
            >

                {paginatedUsers.map(
                    (user) => (

                        <div
                            key={user.id}
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
                                gap-4
                            "
                            >

                                <img
                                    src={
                                        user.avatar_url ||
                                        "/avatar.png"
                                    }
                                    alt=""
                                    className="
                                    h-14
                                    w-14
                                    rounded-full
                                    object-cover
                                "
                                />

                                <div>

                                    <p
                                        className="
                                        font-bold
                                    "
                                    >
                                        {user.full_name}
                                    </p>

                                    <p
                                        className="
                                        text-sm
                                        text-slate-500
                                    "
                                    >
                                        {user.email}
                                    </p>

                                    <div
                                        className="
                                        mt-2
                                        flex
                                        gap-2
                                        flex-wrap
                                    "
                                    >

                                        <span
                                            className="
                                            rounded-full
                                            bg-slate-100
                                            px-3
                                            py-1
                                            text-xs
                                        "
                                        >
                                            {user.role}
                                        </span>

                                        <span
                                            className="
                                            rounded-full
                                            bg-emerald-100
                                            px-3
                                            py-1
                                            text-xs
                                        "
                                        >
                                            {
                                                user.verification_status
                                            }
                                        </span>

                                        <span
                                            className="
                                            rounded-xl
                                            bg-amber-100
                                            px-2
                                            py-1
                                            text-xs
                                        "
                                        >
                                            ⭐ {user.rating}
                                        </span>

                                        {
                                            user.is_banned ? (

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
                                                    BANNED
                                                </span>

                                            ) : user.suspended_until ? (

                                                <span
                                                    className="
                rounded-full
                bg-amber-100
                px-3
                py-1
                text-xs
                font-bold
                text-amber-700
            "
                                                >
                                                    SUSPENDED
                                                </span>

                                            ) : (

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
                                                    ACTIVE
                                                </span>

                                            )
                                        }

                                    </div>

                                    {/* ADMIN ACTIONS */}
                                    <div
                                        className="
        mt-4
        flex
        flex-wrap
        gap-2
    "
                                    >

                                        {
                                            !user.is_banned &&
                                            !user.suspended_until && (

                                                <>
                                                    <button

                                                        onClick={async () => {

                                                            const confirmAction =
                                                                window.confirm(
                                                                    `Suspend ${user.full_name} selama 3 hari?`
                                                                );

                                                            if (!confirmAction) {
                                                                return;
                                                            }

                                                            try {

                                                                await suspendUser(

                                                                    user.id,

                                                                    3,

                                                                    "Admin Manual Action"

                                                                );

                                                                alert(
                                                                    "User berhasil disuspend 3 hari"
                                                                );

                                                                await loadUsers();

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
        px-3
        py-2
        text-xs
        font-semibold
        text-white
    "
                                                    >
                                                        Suspend 3 Hari
                                                    </button>

                                                    <button

                                                        onClick={async () => {

                                                            const confirmAction =
                                                                window.confirm(
                                                                    `Suspend ${user.full_name} selama 7 hari?`
                                                                );

                                                            if (!confirmAction) {
                                                                return;
                                                            }

                                                            try {

                                                                await suspendUser(

                                                                    user.id,

                                                                    7,

                                                                    "Admin Manual Action"

                                                                );

                                                                alert(
                                                                    "User berhasil disuspend 7 hari"
                                                                );

                                                                await loadUsers();

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
        px-3
        py-2
        text-xs
        font-semibold
        text-white
    "
                                                    >
                                                        Suspend 7 Hari
                                                    </button>

                                                    <button

                                                        onClick={async () => {

                                                            const confirmAction =
                                                                window.confirm(
                                                                    `Ban permanen ${user.full_name}?`
                                                                );

                                                            if (!confirmAction) {
                                                                return;
                                                            }

                                                            try {

                                                                await banUser(
                                                                    user.id
                                                                );

                                                                alert(
                                                                    "User berhasil dibanned"
                                                                );

                                                                await loadUsers();

                                                            } catch (error) {

                                                                console.error(error);

                                                                alert(
                                                                    "Gagal ban user"
                                                                );

                                                            }

                                                        }}

                                                        className="
        rounded-xl
        bg-red-600
        px-3
        py-2
        text-xs
        font-semibold
        text-white
    "
                                                    >
                                                        Ban
                                                    </button>
                                                </>
                                            )
                                        }

                                    </div>

                                </div>

                            </div>

                        </div>

                    )
                )}

            </div>

            <div
                className="
        mt-8
        flex
        items-center
        justify-center
        gap-2
    "
            >

                <button

                    disabled={
                        currentPage === 1
                    }

                    onClick={() =>
                        setCurrentPage(
                            currentPage - 1
                        )
                    }

                    className="
            rounded-xl
            border
            px-4
            py-2
            disabled:opacity-50
        "
                >
                    ← Prev
                </button>

                <span
                    className="
            px-4
            py-2
            text-sm
            font-semibold
        "
                >
                    Page
                    {" "}
                    {currentPage}
                    {" "}
                    /
                    {" "}
                    {totalPages || 1}
                </span>

                <button

                    disabled={
                        currentPage ===
                        totalPages
                    }

                    onClick={() =>
                        setCurrentPage(
                            currentPage + 1
                        )
                    }

                    className="
            rounded-xl
            border
            px-4
            py-2
            disabled:opacity-50
        "
                >
                    Next →
                </button>

            </div>

        </main>

    );

}