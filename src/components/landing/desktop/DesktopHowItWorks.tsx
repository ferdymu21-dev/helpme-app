import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MessagesSquare,
  UserRoundCheck,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Buat Task",
    description:
      "Jelaskan bantuan yang kamu butuhkan, tentukan lokasi, jadwal, dan budget sesuai kebutuhan.",
    detail: "Cepat dibuat, detail tetap fleksibel",
  },
  {
    number: "02",
    icon: UserRoundCheck,
    title: "Pilih Helper",
    description:
      "Helper dapat melamar task kamu. Lihat profil, reputasi, lalu komunikasikan detail melalui chat.",
    detail: "Pilih berdasarkan kebutuhanmu",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Task Selesai",
    description:
      "Pantau proses hingga task selesai, konfirmasi hasil pekerjaan, lalu berikan rating dan review.",
    detail: "Reputasi dibangun secara transparan",
  },
];

export default function DesktopHowItWorks() {
  return (
    <section
      id="cara-kerja"
      className="
        bg-slate-50
        px-8
        py-24
      "
    >
      <div className="mx-auto max-w-7xl">
        {/* =========================
            HEADER
        ========================= */}
        <div
          className="
            mx-auto
            max-w-2xl
            text-center
          "
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-indigo-100
              bg-indigo-50
              px-4
              py-2
              text-xs
              font-bold
              text-indigo-700
            "
          >
            <MessagesSquare
              className="h-4 w-4"
              strokeWidth={2}
            />

            Cara Kerja
          </div>

          <h2
            className="
              mt-5
              text-4xl
              font-black
              tracking-[-0.03em]
              text-slate-950
            "
          >
            Dari butuh bantuan sampai{" "}
            <span className="text-indigo-600">
              task selesai
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-xl
              text-base
              leading-7
              text-slate-500
            "
          >
            HelpMe membuat proses mencari bantuan
            menjadi lebih sederhana, terstruktur, dan
            mudah dipantau.
          </p>
        </div>

        {/* =========================
            STEPS
        ========================= */}
        <div
          className="
            relative
            mt-14
            grid
            grid-cols-3
            gap-5
          "
        >
          {steps.map(
            (
              {
                number,
                icon: Icon,
                title,
                description,
                detail,
              },
              index,
            ) => (
              <div
                key={number}
                className="relative"
              >
                {/* CONNECTOR */}
                {index !==
                  steps.length - 1 && (
                  <div
                    className="
                      absolute
                      left-[calc(100%-8px)]
                      top-14
                      z-20
                      flex
                      w-9
                      items-center
                      justify-center
                    "
                  >
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-slate-200
                        bg-white
                        text-slate-400
                        shadow-sm
                      "
                    >
                      <ArrowRight
                        className="h-4 w-4"
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                )}

                {/* CARD */}
                <div
                  className="
                    h-full
                    rounded-[30px]
                    border
                    border-slate-200
                    bg-white
                    p-7
                    shadow-[0_15px_40px_rgba(15,23,42,0.04)]
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-indigo-200
                    hover:shadow-[0_24px_55px_rgba(15,23,42,0.08)]
                  "
                >
                  {/* TOP */}
                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    "
                  >
                    <div
                      className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-indigo-50
                        text-indigo-600
                      "
                    >
                      <Icon
                        className="h-7 w-7"
                        strokeWidth={1.9}
                      />
                    </div>

                    <span
                      className="
                        text-sm
                        font-black
                        tracking-widest
                        text-slate-300
                      "
                    >
                      {number}
                    </span>
                  </div>

                  {/* CONTENT */}
                  <h3
                    className="
                      mt-7
                      text-xl
                      font-black
                      text-slate-900
                    "
                  >
                    {title}
                  </h3>

                  <p
                    className="
                      mt-3
                      text-sm
                      leading-7
                      text-slate-500
                    "
                  >
                    {description}
                  </p>

                  {/* DETAIL */}
                  <div
                    className="
                      mt-6
                      flex
                      items-center
                      gap-2
                      border-t
                      border-slate-100
                      pt-5
                    "
                  >
                    <CheckCircle2
                      className="
                        h-4
                        w-4
                        shrink-0
                        text-emerald-500
                      "
                      strokeWidth={2}
                    />

                    <span
                      className="
                        text-xs
                        font-semibold
                        text-slate-500
                      "
                    >
                      {detail}
                    </span>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}