"use client";

import {
    useState,
} from "react";

import {
    supabase,
} from "@/lib/supabase/client";

export default function ForgotPasswordPage() {

    const [
        email,
        setEmail,
    ] = useState("");

    const [
        loading,
        setLoading,
    ] = useState(false);

    async function handleReset() {

        try {

            setLoading(true);

            const {
                error,
            } = await supabase.auth.resetPasswordForEmail(

                email,

                {
                    redirectTo:
                        "http://localhost:3000/reset-password",
                }

            );

            if (error) {

                alert(error.message);

                return;

            }

            alert(
                "Link reset password telah dikirim ke email Anda."
            );

        } catch (error) {

            console.error(error);

            alert(
                "Gagal mengirim email reset."
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
                        text-3xl
                        font-black
                        text-center
                    "
                >
                    Lupa Kata Sandi
                </h1>

                <p
                    className="
                        mt-2
                        text-center
                        text-slate-500
                    "
                >
                    Masukkan email akun Anda
                </p>

                <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                        setEmail(
                            e.target.value
                        )
                    }
                    placeholder="Email"
                    className="
                        mt-6
                        w-full
                        rounded-xl
                        border
                        p-3
                    "
                />

                <button
                    onClick={handleReset}
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
                            ? "Mengirim..."
                            : "Kirim Link Reset"
                    }
                </button>

            </div>

        </main>

    );

}