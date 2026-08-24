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
      "Profil dapat melalui proses verifikasi identitas.",
  },
  {
    icon: Star,
    title: "Rating & Review",
    description:
      "Lihat reputasi berdasarkan pengalaman pengguna.",
  },
  {
    icon: Flag,
    title: "Laporan & Moderasi",
    description:
      "Laporkan aktivitas yang perlu ditinjau.",
  },
  {
    icon: ReceiptText,
    title: "Transaksi Tercatat",
    description:
      "Status pembayaran dapat dipantau melalui sistem.",
  },
];

export default function MobileSecuritySection() {
  return (
    <section
      id="keamanan-mobile"
      className="
        bg-slate-50
        px-5
        py-12
      "
    >
      {/* HEADER */}
      <div>
        <div
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            bg-indigo-100
            px-3
            py-2
            text-[10px]
            font-black
            text-indigo-700
          "
        >
          <ShieldCheck
            className="h-4 w-4"
          />

          Keamanan HelpMe
        </div>

        <h2
          className="
            mt-4
            text-2xl
            font-black
            leading-tight
            tracking-[-0.03em]
            text-slate-950
          "
        >
          Bangun kepercayaan dalam{" "}
          <span className="text-indigo-600">
            setiap interaksi
          </span>
        </h2>

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-slate-500
          "
        >
          Fitur HelpMe membantu pengguna mengenali
          reputasi, melaporkan masalah, dan memantau
          aktivitas penting.
        </p>
      </div>

      {/* FEATURES */}
      <div
        className="
          mt-7
          grid
          grid-cols-2
          gap-3
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
                rounded-[22px]
                border
                border-slate-200
                bg-white
                p-4
                shadow-[0_8px_24px_rgba(15,23,42,0.035)]
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-indigo-50
                  text-indigo-600
                "
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={2}
                />
              </div>

              <h3
                className="
                  mt-4
                  text-xs
                  font-black
                  text-slate-900
                "
              >
                {title}
              </h3>

              <p
                className="
                  mt-1.5
                  text-[10px]
                  leading-5
                  text-slate-500
                "
              >
                {description}
              </p>
            </div>
          ),
        )}
      </div>

      {/* REMINDER */}
      <div
        className="
          mt-4
          flex
          items-start
          gap-3
          rounded-[20px]
          border
          border-indigo-100
          bg-indigo-50
          p-4
        "
      >
        <ShieldCheck
          className="
            mt-0.5
            h-5
            w-5
            shrink-0
            text-indigo-600
          "
        />

        <p
          className="
            text-[10px]
            leading-5
            text-indigo-700
          "
        >
          Selalu periksa profil, detail task, dan
          komunikasi sebelum memilih atau menerima
          bantuan.
        </p>
      </div>
    </section>
  );
}