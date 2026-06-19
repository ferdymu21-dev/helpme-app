"use client";

import {
    useEffect,
    useState,
} from "react";

import { supabase }
    from "@/lib/supabase/client";

interface User {

    id: string;

    full_name: string;

    email: string | null;

    role: string;

    verification_status: string;

    rating: number;

    avatar_url: string | null;

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
                    avatar_url
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

            setUsers(data || []);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    }

    const filteredUsers =
        users.filter((user) =>
            user.full_name
                ?.toLowerCase()
                .includes(
                    search.toLowerCase()
                )
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

                {filteredUsers.map(
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
                                            rounded-full
                                            bg-amber-100
                                            px-3
                                            py-1
                                            text-xs
                                        "
                                        >
                                            ⭐ {user.rating}
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                    )
                )}

            </div>

        </main>

    );

}