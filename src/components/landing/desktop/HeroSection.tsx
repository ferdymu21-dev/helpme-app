import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="px-6 pb-24 pt-20">
      <div className="mx-auto max-w-300">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          
          {/* LEFT */}
          <div>
            <h1 className="mt-6 max-w-2xl text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
              <span className="text-slate-900">
                Bantuan kecil
              </span>

              <br />

              <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Bisa berarti besar
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-500">
              Temukan helper terdekat untuk berbagai kebutuhan
              harian Anda. Cepat, mudah, dan terpercaya.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="
                  flex
                  h-12
                  items-center
                  justify-center
                  rounded-[14px]
                  bg-indigo-600
                  px-7
                  text-sm
                  font-semibold
                  text-white
                  shadow-[0_10px_40px_rgba(79,70,229,0.25)]
                  transition
                  hover:bg-indigo-700
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
                  rounded-[14px]
                  border
                  border-slate-200
                  bg-white
                  px-7
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-slate-50
                "
              >
                Jadi Helper
              </Link>
            </div>

            {/* STATS */}

            <h2 className="mt-16 text-xl font-bold">
              <span className="text-slate-900">
                Cara Kerja
              </span>{" "}
              <span className="text-indigo-600">
                Help
              </span>
              <span className="text-amber-500">
                Me
              </span>
            </h2>

            <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
 
              <div className="min-w-55 rounded-2x1 border border-slate-200 bg-white p-5">
                <div className="text-base font-bold text-slate-900">
                  Buat task
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Jelaskan kebutuhan anda dengan detail dan tentukan lokasi serta budget.
                </p>
              </div>

               <div className="min-w-55 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-base font-bold text-slate-900">
                  Helper melamar
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Helper terdekat akan melihat task anda dan mengajukan penawaran.
                </p>
               </div>

               <div className="min-w-55 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-base font-bold text-slate-900">
                  Pilih helper
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Helper terdekat akan melihat task anda dan mengajukan penawaran.
                </p>
               </div>

              <div className="min-w-55 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-base font-bold text-slate-900">
                  Task dikerjakan
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Task
                </p>
              </div>

              <div className="min-w-55 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-base font-bold text-slate-900">
                  Selesai & beri rating
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Rating
                </p>
              </div>

            </div>
          </div>


          {/* RIGHT */}
          <div className="relative">
            <div className="absolute inset-0 rounded-[40px] bg-linear-to-br from-indigo-100 via-white to-white" />

            <div
              className="
                relative
                rounded-4xl
                border
                border-slate-200
                bg-white/90
                p-8
                shadow-[0_20px_60px_rgba(15,23,42,0.08)]
                backdrop-blur
              "
            >
              {/* TASK */}
              <div className="rounded-3xl bg-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">
                      Ambil Dokumen
                    </h3>

                    <p className="mt-2 text-indigo-100">
                      Budget Rp25.000
                    </p>
                  </div>

                  <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                    Aktif
                  </div>
                </div>
              </div>

              {/* FLOW */}
              <div className="my-5 flex justify-center">
                <div className="h-8 w-0.5 bg-slate-200" />
              </div>

              {/* APPLICANTS */}
              <div className="rounded-[20px] border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      5 Helper Melamar
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Pilih helper terbaik
                    </p>
                  </div>

                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                    NEW
                  </div>
                </div>
              </div>

              {/* HELPER */}
              <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      Ahmad
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      ⭐ 4.9 • 120 task selesai
                    </p>
                  </div>

                  <button
                    className="
                      rounded-xl
                      bg-indigo-600
                      px-4
                      py-2
                      text-sm
                      font-semibold
                      text-white
                    "
                  >
                    Pilih
                  </button>
                </div>
              </div>

              {/* STATUS */}
              <div className="mt-6 rounded-[20px] bg-emerald-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-emerald-700">
                      Task Selesai 🎉
                    </p>

                    <p className="mt-1 text-sm text-emerald-600">
                      Jangan lupa beri rating.
                    </p>
                  </div>

                  <div className="text-2xl">
                    ⭐
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}