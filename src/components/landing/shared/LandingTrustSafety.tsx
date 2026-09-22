import {
  BadgeCheck,
  Flag,
  MessageCircle,
  ReceiptText,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

interface TrustFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  label: string;
}

const trustFeatures: TrustFeature[] = [
  {
    icon: BadgeCheck,
    title: "Profil & Verifikasi",
    description:
      "Proses verifikasi membantu memberikan konteks identitas yang lebih jelas sebelum pengguna berinteraksi.",
    label: "Identitas",
  },
  {
    icon: MessageCircle,
    title: "Chat dalam Platform",
    description:
      "Komunikasi kebutuhan, detail pekerjaan, dan perubahan dapat dilakukan melalui HelpMe.",
    label: "Komunikasi",
  },
  {
    icon: ReceiptText,
    title: "Kesepakatan Lebih Jelas",
    description:
      "Detail pekerjaan dapat dibahas dan disepakati bersama sebelum bantuan mulai dikerjakan.",
    label: "Kesepakatan",
  },
  {
    icon: Flag,
    title: "Laporan & Moderasi",
    description:
      "Pengguna dapat melaporkan masalah atau aktivitas yang memerlukan peninjauan lebih lanjut.",
    label: "Pelaporan",
  },
];

interface LandingTrustSafetyProps {
  sectionId: string;
}

export default function LandingTrustSafety({
  sectionId,
}: LandingTrustSafetyProps) {
  return (
    <section
      id={sectionId}
      className="
        scroll-mt-20
        overflow-hidden
        bg-white
        px-4
        py-7
        sm:px-5
        lg:px-8
        lg:py-20
      "
    >
      <div className="mx-auto max-w-7xl">
        <div
          className="
            grid
            gap-4
            lg:grid-cols-[0.82fr_1.18fr]
            lg:gap-5
          "
        >
          {/* PRIMARY TRUST PANEL */}
          <div
            className="
              relative
              overflow-hidden
              rounded-[28px]
              bg-indigo-50
              p-5
              sm:p-6
              lg:rounded-4xl
              lg:p-8
            "
          >
            <div
              aria-hidden="true"
              className="
                absolute
                -right-16
                -top-16
                h-52
                w-52
                rounded-full
                border
                border-indigo-200/60
              "
            />

            <div
              aria-hidden="true"
              className="
                absolute
                -right-5
                top-4
                h-32
                w-32
                rounded-full
                border
                border-indigo-200/40
              "
            />

            <div className="relative">
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-indigo-200
                  bg-white/80
                  px-3
                  py-1.5
                "
              >
                <ShieldCheck
                  aria-hidden="true"
                  className="
                    h-3.5
                    w-3.5
                    text-indigo-600
                  "
                  strokeWidth={2.2}
                />

                <span
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.13em]
                    text-indigo-700
                  "
                >
                  Trust & Safety
                </span>
              </div>

              <h2
                className="
                  mt-5
                  max-w-lg
                  text-2xl
                  font-black
                  leading-[1.13]
                  tracking-[-0.04em]
                  text-slate-950
                  sm:text-3xl
                  lg:text-[40px]
                "
              >
                Interaksi yang lebih jelas
                sejak awal
              </h2>

              <p
                className="
                  mt-4
                  max-w-md
                  text-sm
                  leading-6
                  text-slate-600
                  lg:text-base
                  lg:leading-7
                "
              >
                HelpMe menyediakan fitur untuk
                membantu pengguna mengenali,
                berkomunikasi, dan menyepakati
                pekerjaan dengan informasi yang
                lebih terstruktur.
              </p>

              {/* VISUAL */}
              <div
                className="
                  relative
                  mt-8
                  overflow-hidden
                  rounded-3xl
                  border
                  border-indigo-100
                  bg-white
                  p-4
                  shadow-[0_18px_50px_rgba(79,70,229,0.08)]
                  lg:mt-10
                  lg:p-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-indigo-600
                      text-white
                    "
                  >
                    <ShieldCheck
                      aria-hidden="true"
                      className="h-5 w-5"
                      strokeWidth={2.2}
                    />
                  </div>

                  <div>
                    <p
                      className="
                        text-sm
                        font-black
                        text-slate-900
                      "
                    >
                      Dibangun dengan lapisan
                      kepercayaan
                    </p>

                    <p
                      className="
                        mt-1
                        text-[11px]
                        leading-5
                        text-slate-500
                      "
                    >
                      Identitas, komunikasi,
                      kesepakatan, dan pelaporan.
                    </p>
                  </div>
                </div>

                <div
                  className="
                    mt-4
                    grid
                    grid-cols-2
                    gap-2
                  "
                >
                  {[
                    "Profil",
                    "Chat",
                    "Kesepakatan",
                    "Laporan",
                  ].map((item) => (
                    <div
                      key={item}
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-slate-50
                        px-3
                        py-2.5
                      "
                    >
                      <span
                        className="
                          h-1.5
                          w-1.5
                          shrink-0
                          rounded-full
                          bg-indigo-500
                        "
                      />

                      <span
                        className="
                          text-[10px]
                          font-bold
                          text-slate-600
                        "
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FEATURE BENTO */}
          <div
            className="
              grid
              grid-cols-2
              gap-3
              lg:gap-4
            "
          >
            {trustFeatures.map(
              ({
                icon: Icon,
                title,
                description,
                label,
              }) => (
                <article
                  key={title}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-4
                    transition
                    duration-300
                    hover:-translate-y-1
                    hover:border-indigo-200
                    hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)]
                    sm:p-5
                    lg:rounded-[28px]
                    lg:p-6
                  "
                >
                  <div
                    aria-hidden="true"
                    className="
                      absolute
                      -right-8
                      -top-8
                      h-24
                      w-24
                      rounded-full
                      bg-indigo-50
                      opacity-0
                      transition
                      duration-300
                      group-hover:opacity-100
                    "
                  />

                  <div className="relative">
                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                    >
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-indigo-50
                          text-indigo-600
                          transition
                          duration-300
                          group-hover:bg-indigo-600
                          group-hover:text-white
                          sm:h-11
                          sm:w-11
                        "
                      >
                        <Icon
                          aria-hidden="true"
                          className="h-5 w-5"
                          strokeWidth={2}
                        />
                      </div>

                      <span
                        className="
                          hidden
                          rounded-lg
                          bg-slate-50
                          px-2
                          py-1
                          text-[8px]
                          font-black
                          uppercase
                          tracking-[0.08em]
                          text-slate-400
                          sm:inline-flex
                        "
                      >
                        {label}
                      </span>
                    </div>

                    <h3
                      className="
                        mt-4
                        text-sm
                        font-black
                        leading-5
                        tracking-[-0.02em]
                        text-slate-900
                        sm:text-base
                        lg:text-lg
                      "
                    >
                      {title}
                    </h3>

                    <p
                      className="
                        mt-2
                        text-[10px]
                        leading-5
                        text-slate-500
                        sm:text-xs
                        lg:text-sm
                        lg:leading-6
                      "
                    >
                      {description}
                    </p>
                  </div>
                </article>
              ),
            )}
          </div>
        </div>

        {/* RESPONSIBLE USE NOTE */}
        <div
          className="
            mt-4
            rounded-2xl
            border
            border-slate-200
            bg-slate-50/70
            px-4
            py-3.5
            lg:mt-5
            lg:px-5
          "
        >
          <p
            className="
              text-center
              text-[10px]
              leading-5
              text-slate-500
              sm:text-xs
            "
          >
            Tetap periksa detail profil,
            komunikasikan kebutuhan dengan jelas,
            dan gunakan fitur laporan jika kamu
            menemukan aktivitas yang perlu ditinjau.
          </p>
        </div>
      </div>
    </section>
  );
}