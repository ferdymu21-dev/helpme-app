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

export default function ResetPasswordPage() {

    const router =
        useRouter();

    const [
        password,
        setPassword,
    ] = useState("");

    const [
        confirmPassword,
        setConfirmPassword,
    ] = useState("");

    const [
        loading,
        setLoading,
    ] = useState(false);

    async function handleResetPassword() {

        if (
            password !==
            confirmPassword
        ) {

            alert(
                "Konfirmasi password tidak cocok"
            );

            return;

        }

        if (
            password.length < 6
        ) {

            alert(
                "Password minimal 6 karakter"
            );

            return;

        }

        try {

            setLoading(true);

            const {
                error,
            } = await supabase.auth.updateUser({

                password,

            });

            if (error) {

                alert(error.message);

                return;

            }

            alert(
                "Password berhasil diperbarui"
            );

            router.push("/login");

        } catch (error) {

            console.error(error);

            alert(
                "Gagal reset password"
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
                    Reset Password
                </h1>

                <p
                    className="
                        mt-2
                        text-center
                        text-slate-500
                    "
                >
                    Masukkan password baru
                </p>

                <input
                    type="password"
                    placeholder="Password Baru"
                    value={password}
                    onChange={(e) =>
                        setPassword(
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
                    placeholder="Konfirmasi Password"
                    value={confirmPassword}
                    onChange={(e) =>
                        setConfirmPassword(
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
                    onClick={
                        handleResetPassword
                    }
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
                            ? "Menyimpan..."
                            : "Simpan Password Baru"
                    }
                </button>

            </div>

        </main>

    );

}