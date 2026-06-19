"use client";

import {
  useEffect,
  useState,
} from "react";

export default function DesktopAdsBanner() {

  const ads = [

    {
      title:
        "Laundry Express Diskon 50%",

      description:
        "Gratis antar jemput area Surabaya dan Sidoarjo.",

      image:
        "/ads/laundry.jpg",

      buttonText:
        "Lihat Promo",

      link:
        "https://instagram.com/laundry",
    },

    {
      title:
        "Cuci Sepatu Premium",

      description:
        "Diskon khusus pengguna HelpMe minggu ini.",

      image:
        "/ads/shoes.jpg",

      buttonText:
        "Order Sekarang",

      link:
        "https://wa.me/628123456789",
    },

    {
      title:
        "Butuh Kurir Cepat?",

      description:
        "Pasang task dan helper datang dalam hitungan menit.",

      image:
        "/ads/kurir.jpg",

      buttonText:
        "Cari Helper",

      link:
        "/create-task",
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
            (prev + 1) % ads.length
        );

      }, 30000);

    return () =>
      clearInterval(interval);

  }, []);

  const activeAds =
    ads[activeIndex];

  function handleOpenAds() {

    window.open(
      activeAds.link,
      "_blank"
    );
  }

  return (

    <section className="px-8 pt-8">

      <div
        className="
          relative
          h-55
          overflow-hidden
          rounded-4xl
          bg-slate-900
          shadow-xl
        "
      >

        {/* IMAGE */}
        <img
          src={activeAds.image}
          alt={activeAds.title}
          className="
            absolute
            right-0
            top-0
            h-full
            w-[45%]
            object-cover
          "
        />

        {/* OVERLAY */}
        <div
          className="
            absolute
            inset-0
            bg-linear-to-r
            from-black
            via-black/80
            to-transparent
          "
        />

        {/* CONTENT */}
        <div
          className="
            relative
            flex
            h-full
            flex-col
            justify-between
            p-8
            text-white
          "
        >

          <div>

            {/* BADGE */}
            <div
              className="
                inline-flex
                rounded-full
                bg-white/20
                px-3
                py-1
                text-xs
                font-bold
              "
            >
              SPONSORED
            </div>

            {/* TITLE */}
            <h2
              className="
                mt-5
                max-w-xl
                text-3xl
                font-black
                leading-tight
              "
            >
              {activeAds.title}
            </h2>

            {/* DESCRIPTION */}
            <p
              className="
                mt-4
                max-w-lg
                text-sm
                leading-7
                text-slate-200
              "
            >
              {activeAds.description}
            </p>

          </div>

          {/* BOTTOM */}
          <div className="flex items-center justify-between">

            {/* DOTS */}
            <div className="flex gap-2">

              {ads.map((_, index) => (

                <div
                  key={index}
                  className={`
                    h-2
                    rounded-full
                    transition-all

                    ${activeIndex === index
                      ? "w-8 bg-white"
                      : "w-2 bg-white/40"
                    }
                  `}
                />

              ))}

            </div>

            {/* BUTTON */}
            <button
              onClick={handleOpenAds}

              className="
                rounded-2xl
                bg-white
                px-6
                py-3
                text-sm
                font-bold
                text-slate-900
                transition
                hover:scale-[1.02]
              "
            >
              {activeAds.buttonText}
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}