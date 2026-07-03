"use client";

import {
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    supabase,
} from "@/lib/supabase/client";

export default function AdminLoginPage() {

    const router =
        useRouter();

    const [
        email,
        setEmail,
    ] = useState("");

    const [
        password,
        setPassword,
    ] = useState("");

    const [
        loading,
        setLoading,
    ] = useState(false);

    async function handleLogin() {

        try {

            setLoading(true);

            const {
                error,
            } = await supabase
                .auth
                .signInWithPassword({

                    email,
                    password,

                });

            if (error) {

                alert(error.message);

                return;

            }

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {

                alert(
                    "User tidak ditemukan"
                );

                return;

            }

            const {
                data,
                error: roleError,
            } = await supabase
                .from("users")
                .select("role")
                .eq("id", user.id)
                .maybeSingle();

            if (
                roleError ||
                data?.role !== "ADMIN"
            ) {

                await supabase
                    .auth
                    .signOut();

                alert(
                    "Akses ditolak. Hanya admin yang dapat masuk."
                );

                return;

            }

            router.push("/admin");

        } catch (error) {

            console.error(error);

            alert(
                "Login gagal"
            );

        } finally {

            setLoading(false);

        }

    }

    return (

        <main
            className="
                flex
                min-h-screen
                items-center
                justify-center
                bg-slate-100
            "
        >

            <div
                className="
                    w-full
                    max-w-md
                    rounded-3xl
                    bg-white
                    p-8
                    shadow-lg
                "
            >

                <h1
                    className="
                        text-center
                        text-3xl
                        font-black
                    "
                >
                    Admin Portal
                </h1>

                <p
                    className="
                        mt-2
                        text-center
                        text-slate-500
                    "
                >
                    HelpMe Administration
                </p>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(
                            e.target.value
                        )
                    }
                    className="
                        mt-6
                        w-full
                        rounded-xl
                        border
                        p-3
                    "
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(
                            e.target.value
                        )
                    }
                    className="
                        mt-4
                        w-full
                        rounded-xl
                        border
                        p-3
                    "
                />

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="
                        mt-6
                        w-full
                        rounded-xl
                        bg-slate-900
                        py-3
                        font-semibold
                        text-white
                    "
                >
                    {
                        loading
                            ? "Loading..."
                            : "Login"
                    }
                </button>

            </div>

        </main>

    );

}