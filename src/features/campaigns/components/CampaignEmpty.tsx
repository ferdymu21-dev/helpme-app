"use client";

export default function CampaignEmpty() {

    return (

        <div
            className="
                rounded-3xl
                border
                border-dashed
                border-slate-300
                bg-white
                py-20
                text-center
            "
        >

            <div
                className="
                    text-6xl
                "
            >
                📢
            </div>

            <h2
                className="
                    mt-6
                    text-xl
                    font-bold
                    text-slate-900
                "
            >
                Belum ada Campaign
            </h2>

            <p
                className="
                    mt-3
                    text-slate-500
                "
            >
                Buat campaign pertama untuk mulai
                mengirim notifikasi kepada pengguna.
            </p>

        </div>

    );

}