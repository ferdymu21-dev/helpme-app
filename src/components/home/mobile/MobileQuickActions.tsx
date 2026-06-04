import Link from "next/link";

export default function MobileQuickActions() {
  return (
    <section className="px-6 pt-5">

      <div
        className="
          flex
          gap-3
          overflow-x-auto
          pb-2
        "
      >

        {/* CREATE TASK */}
        <Link
          href="/tasks/create"
          className="
            min-w-38.75
            h-37.5
            flex
            flex-col
            justify-between
            rounded-2xl
            bg-linear-to-br
            from-indigo-600
            to-violet-600
            p-4
            text-white
            shadow-lg
            shadow-indigo-600/15
            transition-all
            duration-200
            active:scale-[0.98]
            hover:-translate-y-1
          "
        >

          {/* ICON */}
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-white/20
              text-xl
              font-bold
            "
          >
            +
          </div>

          {/* CONTENT */}
          <div className="mt-3">

            <h3
              className="
                text-base
                font-bold
              "
            >
              Buat Task
            </h3>

            <p
              className="
                mt-2
                text-xs
                font-bold
                leading-5
                text-indigo-100
              "
            >
              Temukan helper 
              terbaik di sekitarmu.
            </p>

          </div>

        </Link>

        {/* MY TASK */}
        <Link
          href="/my-tasks"
          className="
            min-w-38.75
            h-37.5
            flex
            flex-col
            justify-between
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-4
            shadow-lg
            shadow-slate-200/15
            transition-all
            duration-200
            active:scale-[0.98]
            hover:-translate-y-1
          "
        >

          {/* ICON */}
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-amber-100
              text-xl
            "
          >
            📋
          </div>

          {/* CONTENT */}
          <div className="mt-3">

            <h3
              className="
                text-base
                font-bold
              text-slate-900
              "
            >
              Task Saya
            </h3>

            <p
              className="
                mt-2
                text-xs
                font-bold
                leading-5
                text-slate-500
              "
            >
              Kelola task dan
              lihat pelamar.
            </p>

          </div>

        </Link>

      </div>

    </section>
  );
}