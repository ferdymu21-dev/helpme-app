"use client";

export default function IntroSection() {
  return (
    <section className="px-4 pb-4 pt-5 sm:px-6 sm:pt-8">
      <div
        className="
          overflow-hidden
          rounded-[28px]
          bg-linear-to-br
          from-indigo-600
          via-indigo-600
          to-violet-600
          p-6
          text-white
          shadow-[0_20px_50px_rgba(79,70,229,0.20)]
          sm:p-8
        "
      >
        <span
          className="
            inline-flex
            rounded-full
            bg-white/15
            px-2
            py-1.5
            text-[10px]
            font-semibold
            ring-1
            ring-white/20
          "
        >
          ✨ Task baru
        </span>

        <h2
          className="
            mt-3
            max-w-md
            text-xl
            font-bold
            tracking-tight
            sm:text-3xl
          "
        >
          Perlu bantuan apa hari ini?
        </h2>

        <p
          className="
            mt-2
            max-w-lg
            text-[13px]
            leading-5
            text-indigo-100
          "
        >
          Ceritakan kebutuhanmu dengan jelas.
          HelpMe akan membantu menghubungkanmu
          dengan helper yang tepat.
        </p>
      </div>
    </section>
  );
}