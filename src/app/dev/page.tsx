"use client";

import {
    useState,
} from "react";

import SupportModal
    from "@/features/payments/components/SupportModal";

import {
    useDonationFlow,
} from "@/features/payments/hooks/useDonationFlow";

export default function DevPage() {

    const [
        open,
        setOpen,
    ] = useState(false);

    const donation = useDonationFlow();

    return (

        <main className="p-10">

            <h1
                className="
                    mb-8
                    text-3xl
                    font-bold
                "
            >
                Payment Sandbox
            </h1>

            <div className="space-y-6">

                <button
                    onClick={() => setOpen(true)}
                    className="
                        rounded-xl
                        bg-indigo-600
                        px-6
                        py-3
                        text-white
                    "
                >
                    Buka Support Modal
                </button>

            </div>

            <SupportModal
                donation={donation}
                open={open}
                onClose={() => setOpen(false)}
            />

        </main>

    );

}