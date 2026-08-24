import {
  CheckCircle2,
  ClipboardList,
  UserRoundCheck,
} from "lucide-react";

const steps = [
  {
    number: "1",
    icon: ClipboardList,
    title: "Buat Task",
    description:
      "Jelaskan bantuan yang kamu butuhkan, lokasi, dan budget.",
  },
  {
    number: "2",
    icon: UserRoundCheck,
    title: "Pilih Helper",
    description:
      "Lihat pelamar, profil, reputasi, lalu pilih helper yang cocok.",
  },
  {
    number: "3",
    icon: CheckCircle2,
    title: "Task Selesai",
    description:
      "Pantau proses, konfirmasi pekerjaan, lalu beri rating dan review.",
  },
];

export default function MobileHowItWorks() {
  return (
    <section
      id="cara-kerja-mobile"
      className="
        bg-slate-50
        px-5
        py-12
      "
    >
      {/* =========================
          HEADER
      ========================= */}
      <div>
        <span
          className="
            text-[11px]
            font-black
            uppercase
            tracking-[0.18em]
            text-indigo-600
          "
        >
          Cara Kerja
        </span>

        <h2
          className="
            mt-2
            max-w-xs
            text-2xl
            font-black
            leading-tight
            tracking-[-0.03em]
            text-slate-950
          "
        >
          Dapatkan bantuan dalam{" "}
          <span className="text-indigo-600">
            3 langkah sederhana
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
          Dari membuat task hingga selesai,
          semua proses dapat dilakukan langsung
          melalui HelpMe.
        </p>
      </div>

      {/* =========================
          STEPS
      ========================= */}
      <div className="mt-7 space-y-3">
        {steps.map(
          ({
            number,
            icon: Icon,
            title,
            description,
          }) => (
            <div
              key={number}
              className="
                flex
                gap-4
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-4
                shadow-[0_10px_30px_rgba(15,23,42,0.04)]
              "
            >
              {/* ICON */}
              <div
                className="
                  relative
                  shrink-0
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
                    strokeWidth={2}
                  />
                </div>

                <div
                  className="
                    absolute
                    -right-1
                    -top-1
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-indigo-600
                    text-[9px]
                    font-black
                    text-white
                    ring-2
                    ring-white
                  "
                >
                  {number}
                </div>
              </div>

              {/* CONTENT */}
              <div className="min-w-0">
                <h3
                  className="
                    text-sm
                    font-black
                    text-slate-900
                  "
                >
                  {title}
                </h3>

                <p
                  className="
                    mt-1.5
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  {description}
                </p>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}