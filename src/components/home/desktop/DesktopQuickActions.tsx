import Link from "next/link";

export default function QuickActions() {
  return (
    <section className="px-6 pt-6">

      <div className="mx-auto max-w-300">

        <div className="grid gap-4 md:grid-cols-2">

          {/* CREATE TASK */}
          <Link
            href="/tasks/create"
            className="
              group
              overflow-hidden
              rounded-[28px]
              bg-linear-to-br
              from-indigo-600
              to-violet-600
              p-5
              text-white
              shadow-[0_20px_50px_rgba(79,70,229,0.25)]
              transition
              hover:scale-[1.01]
            "
          >

            {/* ICON */}
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-white/20
                text-3xl
              "
            >
              +
            </div>

            {/* CONTENT */}
            <div className="mt-7">

              <h3 className="text-xl font-bold">
                Buat Task
              </h3>

              <p
                className="
                  mt-3
                  max-w-sm
                  text-indigo-100
                "
              >
                Buat task baru dan
                temukan helper terbaik
                di sekitarmu.
              </p>

            </div>

          </Link>

          {/* MY TASK */}
          <Link
            href="/my-tasks"
            className="
              overflow-hidden
              rounded-[28px]
              border
              border-slate-200
              bg-white
              p-5
              shadow-[0_10px_30px_rgba(15,23,42,0.05)]
              transition
            hover:border-indigo-200
            "
          >

            {/* ICON */}
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-amber-100
                text-3xl
              "
            >
              📋
            </div>

            {/* CONTENT */}
            <div className="mt-7">

              <h3 className="text-xl font-bold text-slate-900">
                Task Saya
              </h3>

              <p
                className="
                  mt-3
                  max-w-sm
                  text-slate-500
                "
              >
                Kelola task,
                lihat pelamar,
                dan pilih helper.
              </p>

            </div>

          </Link>

        </div>

      </div>

    </section>
  );
}