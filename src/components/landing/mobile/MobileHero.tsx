import Link from "next/link";

import Image from "next/image";

export default function MobileHero() {
  return (
    <section className="px-5 pt-6">

      {/* BADGE */}
      <div
        className="
          inline-flex
          rounded-full
          bg-indigo-100
          px-4
          py-2
          text-sm
          font-semibold
          text-indigo-700
        "
      >
        Bantuan kecil bisa berarti besar
      </div>

      {/* TITLE */}
      <h1
        className="
          mt-5
          text-2xl
          font-black
          leading-tight
          tracking-tight
          text-slate-900
        "
      >
        Buat{" "}

        <span className="text-indigo-600">
          task
        </span>

        , terima lamaran,
        lalu pilih{" "}

        <span className="text-amber-500">
          helper
        </span>{" "}

        terbaik.
      </h1>

      {/* SUBTITLE */}
      <p
        className="
          mt-5
          text-base
          leading-8
          text-slate-500
        "
      >
        HelpMe membantu kamu
        menemukan helper terpercaya
        di sekitar untuk kebutuhan
        harian.
      </p>

      {/* CTA */}
      <div className="mt-8 grid grid-cols-2 gap-4">

        <Link
          href="/register"
          className="
            flex
            h-12
            items-center
            justify-center
            rounded-2xl
            bg-linear-to-br
            from-indigo-600
            to-violet-600
            text-sm
            font-bold
            text-white
            shadow-lg
            shadow-indigo-600/20
          "
        >
          Buat Task
        </Link>

        <Link
          href="/register"
          className="
            flex
            h-12
            items-center
            justify-center
            rounded-2xl
            bg-linear-to-br
            from-amber-500
            to-amber-400
            text-sm
            font-bold
            text-black
            shadow-lg
            shadow-amber-500/20
          "
        >
          Jadi Helper
        </Link>

      </div>

      {/* HERO IMAGE */}
      <div className="mt-12">

        <Image
          src="/hero-image.png"
          alt="HelpMe Illustration"
          width={1200}
          height={1200}
          className="
            h-auto
            w-full
          "
          priority
        />

     </div>

     {/* FLOATING STATS */}
     <div className="-mt-2 px-2">

       <div className="
           grid
           grid-cols-3
           rounded-[28px]
           border
         border-slate-100
         bg-white
           p-5
           shadow-[0_20px_50px_rgba(15,23,42,0.08)]
         "
        >

        {/* USERS */}
        <div className="text-center">

        <h3
          className="
           text-base
           font-black
         text-indigo-600
          "
        >
          10K+
        </h3>

      <p
        className="
          mt-1
          text-xs
          leading-5
          text-slate-500
        "
      >
        Pengguna aktif
      </p>

    </div>

    {/* RATING */}
    <div className="text-center">

      <h3
        className="
          text-base
          font-black
          text-amber-500
        "
      >
        4.9★
      </h3>

      <p
        className="
          mt-1
          text-xs
          leading-5
          text-slate-500
        "
      >
        Rating Pengguna
      </p>

    </div>

    {/* CHAT */}
    <div className="text-center">

      <h3
        className="
          text-base
          font-black
          text-emerald-600
        "
      >
        24/7
      </h3>

      <p
        className="
          mt-1
          text-xs
          leading-5
          text-slate-500
        "
      >
        Realtime chat
      </p>

    </div>

  </div>

</div>

    </section>
  );
}