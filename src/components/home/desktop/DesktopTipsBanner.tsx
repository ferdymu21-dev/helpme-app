"use client";

import { useEffect, useState } from "react";

const TIPS = [
  {
    title: "Gunakan lokasi detail agar helper lebih cepat menemukanmu",
    description:
      "Lokasi yang jelas membantu helper datang lebih cepat dan mengurangi cancel task.",
    emoji: "📍",
  },
  {
    title: "Tambahkan foto task agar helper lebih mudah memahami kebutuhanmu",
    description:
      "Foto membantu helper mengetahui kondisi task sebelum menerima pekerjaan.",
    emoji: "📸",
  },
  {
    title: "Gunakan budget yang jelas agar task lebih cepat diterima",
    description:
      "Helper lebih tertarik pada task dengan estimasi budget yang transparan.",
    emoji: "💰",
  },
  {
    title: "Balas chat helper lebih cepat untuk mempercepat proses bantuan",
    description: "Komunikasi cepat membantu task selesai lebih efisien.",
    emoji: "💬",
  },
];

export default function DesktopTipsBanner() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TIPS.length);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const activeTip = TIPS[activeIndex];

  return (
    <section className="px-8 pt-8">
      <div
        className="
          h-55
          overflow-hidden
          rounded-3xl
          bg-linear-to-br
          from-indigo-600
          via-violet-600
          to-fuchsia-500
          shadow-xl
          shadow-indigo-500/10
        "
      >
        <div
          className="
            flex
            h-full
            items-center
            justify-between
            p-8
          "
        >
          {/* LEFT */}
          <div className="max-w-2xl">
            {/* BADGE */}
            <div
              className="
                inline-flex
                rounded-full
                bg-white/20
                px-7
                py-2
                text-xs
                font-bold
                tracking-wide
                text-white
              "
            >
              💡 Tips HelpMe
            </div>

            {/* TITLE */}
            <h2
              className="
                mt-5
                text-2xl
                font-black
                leading-tight
                tracking-tight
                text-white
                transition-all
                duration-500
              "
            >
              {activeTip.title}
            </h2>

            {/* DESCRIPTION */}
            <p
              className="
                mt-4
                max-w-xl
                text-sm
                leading-7
                text-indigo-100
                transition-all
                duration-500
              "
            >
              {activeTip.description}
            </p>

            {/* DOTS */}
            <div className="mt-6 flex gap-2">
              {TIPS.map((_, index) => (
                <div
                  key={index}
                  className={`
                    h-2
                    rounded-full
                    transition-all
                    ${
                      activeIndex === index
                        ? "w-8 bg-white"
                        : "w-2 bg-white/40"
                    }
                  `}
                />
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div
            className="
              text-8xl
              drop-shadow-xl
            "
          >
            {activeTip.emoji}
          </div>
        </div>
      </div>
    </section>
  );
}