import Image from "next/image";

export default function MobileHomeHeader() {
  return (
    <header
      className="
        sticky
        top-0
        z-30
        border-b
        border-slate-200
        bg-white/80
        backdrop-blur
      "
    >

      <div
        className="
          mx-auto
          flex
          h-18
          max-w-300
          items-center
          justify-between
          px-6
        "
      >

        {/* LEFT */}
        <Image
          src="/logo.svg"
          alt="HelpMe Logo"
          width={120}
          height={120}
          className="h-auto w-30"
          priority
        />

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* NOTIFICATION */}
          <button
            className="
              relative
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-200
              bg-white
              text-lg
              transition
              hover:bg-slate-50
            "
          >
            🔔

            <span
              className="
                absolute
                right-2
                top-2
                h-2
                w-2
                rounded-full
                bg-red-500
              "
            />

          </button>

          {/* PROFILE */}
          <button
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-indigo-100
              text-sm
              font-bold
              text-indigo-700
            "
          >
            F
          </button>

        </div>

      </div>

    </header>
  );
}