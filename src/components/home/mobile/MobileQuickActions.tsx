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
            min-w-24
            h-24
            flex
            flex-col
            justify-between
            rounded-2xl
            border
            bg-linear-to-br
            from-indigo-600
            to-violet-600
            p-2.5
            text-white
            shadow-xs
            shadow-slate-600/15
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
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-white/20
              text-sm
              font-bold
            "
          >
            +
          </div>

          {/* CONTENT */}
          <div className="mt-3">

            <h3
              className="
                text-xs
                font-bold
              "
            >
              Butuh bantuan
            </h3>

            <p
              className="
                mt-1
                text-[10px]
                font-white
                leading-3
                text-indigo-100
              "
            >
              Temukan helper terbaik di sekitarmu.
            </p>

          </div>

        </Link>

        {/* MY TASK */}
        <Link
          href="/my-tasks"
          className="
            min-w-24
            h-24
            flex
            flex-col
            justify-between
            rounded-2xl
            border
            border-slate-200
            bg-linear-to-br
            from-amber-100
            to-amber-200
            p-2.5
            shadow-xs
            shadow-slate-600/15
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
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-amber-100
              text-sm
              font-bold
            "
          >
            📋
          </div>

          {/* CONTENT */}
          <div className="mt-3">

            <h3
              className="
                text-xs
                font-bold
              text-slate-900
              "
            >
              Task Saya
            </h3>

            <p
              className="
                mt-1
                text-[10px]
                font-bold
                leading-3
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