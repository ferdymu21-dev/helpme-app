"use client";

import {
    useEffect,
    useState,
} from "react";

export default function MobilePromoBanner() {

    const tips = [

        {
            title:
                "Gunakan lokasi detail agar helper lebih cepat menemukanmu",

            description:
                "Lokasi yang jelas membantu helper datang lebih cepat dan mengurangi cancel task.",
        },

        {
            title:
                "Tambahkan foto task agar helper lebih mudah memahami kebutuhanmu",

            description:
                "Foto membantu helper mengetahui kondisi task sebelum menerima pekerjaan.",
        },

        {
            title:
                "Gunakan budget yang jelas agar task lebih cepat diterima",

            description:
                "Helper lebih tertarik pada task dengan estimasi budget yang transparan.",
        },

        {
            title:
                "Balas chat helper lebih cepat untuk mempercepat proses bantuan",

            description:
                "Komunikasi cepat membantu task selesai lebih efisien.",
        },
    ];

    const [
        activeIndex,
        setActiveIndex,
    ] = useState(0);

    useEffect(() => {

        const interval =
            setInterval(() => {

                setActiveIndex(
                    (prev) =>
                        (prev + 1) % tips.length
                );

            }, 30000);

        return () =>
            clearInterval(interval);

    }, []);

    const activeTip =
        tips[activeIndex];

    return (

        <section className="px-6 mt-2">

            <div
                className="
                h-45
          overflow-hidden
          rounded-3xl
          bg-linear-to-br
          from-indigo-600
          via-violet-600
          to-fuchsia-500
          flex
          flex-col
          justify-between
          p-4
          text-white
          shadow-lg
          shadow-indigo-500/10
        "
            >
            <div>
                {/* TOP */}
                <div
                    className="
            inline-flex
            rounded-full
            bg-white/20
            px-3
            py-1
            text-[10px]
            font-bold
            tracking-wide
          "
                >
                    ⚡ Tips HelpMe
                </div>

                {/* TITLE */}
                <h3
                    className="
            mt-2
            text-[17px]
            font-black
            leading-5
            transition-all
            duration-500
          "
                >
                    {activeTip.title}
                </h3>

                {/* DESCRIPTION */}
                <p
                    className="
                      mt-2
                      text-xs
                      leading-4
                    text-indigo-100
                      transition-all
                      duration-500
                    "
                >
                    {activeTip.description}
                </p>

            </div>
            
                <div className="mt-3 flex gap-2">

                    {tips.map((_, index) => (

                        <div
                            key={index}
                            className={`
                              h-2
                              rounded-full
                              transition-all

                            ${activeIndex === index
                                    ? "w-6 bg-white"
                                    : "w-2 bg-white/40"
                                }
                         `}
                        />

                    ))}

                </div>

            </div>

        </section>
    );
}