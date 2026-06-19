"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import { supabase }
    from "@/lib/supabase/client";

export default function AdminGuard({
    children,
}: {
    children: React.ReactNode;
}) {

    const router =
        useRouter();

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        allowed,
        setAllowed,
    ] = useState(false);

    useEffect(() => {

        async function checkAdmin() {

            const {
                data: { user },
            } =
                await supabase.auth.getUser();

            if (!user) {

                router.replace("/login");

                setLoading(false);

                return;
            }

            const {
                data,
                error,
            } = await supabase
                .from("users")
                .select("role")
                .eq("id", user.id)
                .single();

            if (
                error ||
                data?.role !== "ADMIN"
            ) {

                router.replace("/");

                setLoading(false);

                return;
            }

            setAllowed(true);

            setLoading(false);

        }

        checkAdmin();

    }, [router]);

    if (loading) {

        return (

            <main
                className="
                min-h-screen
                flex
                items-center
                justify-center
            "
            >
                <p>
                    Memeriksa akses...
                </p>
            </main>

        );

    }

    if (!allowed) {

        return null;

    }

    return children;

}