import {
  BadgeCheck,
  Flag,
  ReceiptText,
  ShieldCheck,
  Star,
} from "lucide-react";

const securityFeatures = [
  {
    icon: BadgeCheck,
    title: "Verifikasi Identitas",
    description:
      "Pengguna dapat mengajukan verifikasi identitas untuk membangun profil yang lebih terpercaya.",
  },
  {
    icon: Star,
    title: "Rating & Review",
    description:
      "Reputasi dibangun melalui rating dan review setelah task selesai.",
  },
  {
    icon: Flag,
    title: "Laporan & Moderasi",
    description:
      "Aktivitas yang bermasalah dapat dilaporkan dan ditinjau melalui sistem moderasi HelpMe.",
  },
  {
    icon: ReceiptText,
    title: "Transaksi Tercatat",
    description:
      "Status transaksi pembayaran tercatat di sistem sehingga lebih mudah dipantau.",
  },
];

export default function DesktopSecuritySection() {
  return (
    <section
      id="keamanan"
      className="
        bg-slate-50
        px-8
        py-24
      "
    >
      <div className="mx-auto max-w-7xl">
        <div
          className="
            overflow-hidden
            rounded-[40px]
            border
            border-indigo-100
            bg-white
            shadow-[0_24px_70px_rgba(15,23,42,0.06)]
          "
        >
          <div
            className="
              grid
              grid-cols-[0.9fr_1.1fr]
            "
          >
            {/* =========================
                LEFT
            ========================= */}
            <div
              className="
                relative
                overflow-hidden
                bg-linear-to-br
                from-indigo-600
                via-indigo-600
                to-violet-600
                p-12
                text-white
              "
            >
              {/* DECORATION */}
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-20
                  -top-20
                  h-64
                  w-64
                  rounded-full
                  bg-white/10
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-24
                  -left-20
                  h-72
                  w-72
                  rounded-full
                  bg-violet-300/10
                "
              />

              <div className="relative">
                {/* ICON */}
                <div
                  className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-white/15
                    ring-1
                    ring-white/20
                  "
                >
                  <ShieldCheck
                    className="h-8 w-8"
                    strokeWidth={1.9}
                  />
                </div>

                {/* LABEL */}
                <p
                  className="
                    mt-8
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-indigo-100
                  "
                >
                  Keamanan HelpMe
                </p>

                {/* TITLE */}
                <h2
                  className="
                    mt-3
                    max-w-md
                    text-4xl
                    font-black
                    leading-tight
                    tracking-[-0.035em]
                  "
                >
                  Kepercayaan dibangun dari setiap interaksi.
                </h2>

                {/* DESCRIPTION */}
                <p
                  className="
                    mt-5
                    max-w-md
                    text-sm
                    leading-7
                    text-indigo-100
                  "
                >
                  HelpMe menyediakan fitur yang membantu
                  pengguna mengenali reputasi, berkomunikasi,
                  melaporkan masalah, dan memantau aktivitas
                  penting dalam satu platform.
                </p>

                {/* NOTE */}
                <div
                  className="
                    mt-9
                    flex
                    items-start
                    gap-3
                    rounded-2xl
                    border
                    border-white/15
                    bg-white/10
                    p-4
                  "
                >
                  <ShieldCheck
                    className="
                      mt-0.5
                      h-5
                      w-5
                      shrink-0
                      text-emerald-300
                    "
                    strokeWidth={2}
                  />

                  <p
                    className="
                      text-xs
                      leading-5
                      text-indigo-50
                    "
                  >
                    Tetap periksa profil, detail task, dan
                    komunikasi sebelum memilih atau menerima
                    bantuan.
                  </p>
                </div>
              </div>
            </div>

            {/* =========================
                RIGHT
            ========================= */}
            <div className="p-10">
              <div
                className="
                  grid
                  grid-cols-2
                  gap-4
                "
              >
                {securityFeatures.map(
                  ({
                    icon: Icon,
                    title,
                    description,
                  }) => (
                    <div
                      key={title}
                      className="
                        rounded-[26px]
                        border
                        border-slate-200
                        bg-white
                        p-6
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:border-indigo-200
                        hover:shadow-[0_18px_40px_rgba(15,23,42,0.06)]
                      "
                    >
                      <div
                        className="
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-2xl
                          bg-indigo-50
                          text-indigo-600
                        "
                      >
                        <Icon
                          className="h-6 w-6"
                          strokeWidth={1.9}
                        />
                      </div>

                      <h3
                        className="
                          mt-5
                          text-base
                          font-black
                          text-slate-900
                        "
                      >
                        {title}
                      </h3>

                      <p
                        className="
                          mt-2
                          text-xs
                          leading-6
                          text-slate-500
                        "
                      >
                        {description}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}