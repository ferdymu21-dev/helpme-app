"use client";

interface Props {

  badges: {

    label: string;

    icon: string;

    className: string;

  }[];

}

export default function DesktopBadgeCard({

  badges,

}: Props) {

  return (

    <section
      className="
        relative
        overflow-hidden
        rounded-[36px]
        bg-linear-to-br
        from-white
        via-white
        to-indigo-50
        p-8
        shadow-[0_12px_40px_rgba(15,23,42,.06)]
      "
    >

      {/* BACKGROUND */}

      <div
        className="
          absolute
          -bottom-20
          -right-20
          h-72
          w-72
          rounded-full
          bg-indigo-100/40
        "
      />

      <div
        className="
          absolute
          right-10
          top-10
          text-6xl
          opacity-20
        "
      >

        🏅

      </div>

      {/* CONTENT */}

      <div
        className="
          relative
          flex
          items-center
          justify-between
          gap-10
        "
      >

        {/* LEFT */}

        <div className="max-w-xl">

          <h2
            className="
              text-3xl
              font-black
              tracking-tight
              text-slate-900
            "
          >

            Reputation Badge

          </h2>

          <p
            className="
              mt-3
              text-slate-500
              leading-8
            "
          >

            Badge diperoleh berdasarkan performa,
            rating, konsistensi serta reputasi
            sebagai helper.

          </p>

          <div
            className="
              mt-8
              flex
              flex-wrap
              gap-3
            "
          >

            {(badges || []).map(

              (badge, index) => (

                <div

                  key={index}

                  className={`
                    rounded-full
                    px-5
                    py-3
                    text-sm
                    font-bold
                    shadow-sm

                    ${badge.className}
                  `}

                >

                  {badge.icon}

                  {" "}

                  {badge.label}

                </div>

              )

            )}

          </div>

        </div>

        {/* RIGHT */}

        <div
          className="
            hidden
            lg:flex
            flex-col
            items-center
            justify-center
            text-center
          "
        >

          <div
            className="
              flex
              h-44
              w-44
              items-center
              justify-center
              rounded-full
              bg-linear-to-br
              from-indigo-500
              to-violet-500
              text-7xl
              shadow-xl
            "
          >

            🏆

          </div>

          <p
            className="
              mt-5
              text-sm
              font-semibold
              text-slate-500
            "
          >

            Reputation Level

          </p>

        </div>

      </div>

    </section>

  );

}