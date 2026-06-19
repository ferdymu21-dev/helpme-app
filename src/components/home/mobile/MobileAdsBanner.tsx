"use client";

export default function MobileAdsBanner() {

  const ads = {
    title:
      "Laundry Express Diskon 50%",

    description:
      "Cuci cepat, wangi tahan lama, gratis antar jemput area Surabaya.",

    image:
      "/ads/laundry-banner.jpg",

    buttonText:
      "Lihat Promo",

    link:
      "https://instagram.com/laundryexpress",
  };

  function handleOpenAds() {

    window.open(
      ads.link,
      "_blank"
    );
  }

  return (

    <section className="mt-2 px-6">

      <div
        className="
          relative
          h-45
          overflow-hidden
          rounded-3xl
          bg-slate-900
          shadow-lg
        "
      >

        {/* IMAGE */}
        <img
          src={ads.image}
          alt={ads.title}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
        />

        {/* OVERLAY */}
        <div
          className="
            absolute
            inset-0
            bg-black/45
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
            p-4
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
                text-[10px]
                font-bold
                tracking-wide
              "
            >
              SPONSORED
            </div>

            {/* TITLE */}
            <h3
              className="
                mt-3
                text-lg
                font-black
                leading-6
              "
            >
              {ads.title}
            </h3>

            {/* DESCRIPTION */}
            <p
              className="
                mt-2
                text-xs
                leading-5
                text-slate-200
              "
            >
              {ads.description}
            </p>

          </div>

          {/* BUTTON */}
          <button
            onClick={handleOpenAds}

            className="
              w-fit
              rounded-2xl
              bg-white
              px-4
              py-2
              text-xs
              font-bold
              text-slate-900
              active:scale-[0.98]
            "
          >
            {ads.buttonText}
          </button>

        </div>

      </div>

    </section>
  );
}