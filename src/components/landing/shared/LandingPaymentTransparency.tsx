import {
  Banknote,
  CalendarClock,
  Check,
  Handshake,
  Landmark,
  ShieldCheck,
} from "lucide-react";

interface LandingPaymentTransparencyProps {
  sectionId: string;
}

const agreementItems = [
  {
    icon: Banknote,
    title: "Nominal",
    description:
      "Besaran pembayaran ditentukan dan disepakati bersama.",
  },
  {
    icon: Landmark,
    title: "Metode",
    description:
      "Pilih metode pembayaran yang disepakati kedua pihak.",
  },
  {
    icon: CalendarClock,
    title: "Waktu",
    description:
      "Tentukan kapan pembayaran dilakukan sesuai kesepakatan.",
  },
];

export default function LandingPaymentTransparency({
  sectionId,
}: LandingPaymentTransparencyProps) {
  return (
    <section
      id={sectionId}
      className="
        scroll-mt-20
        bg-slate-50/70
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
            relative
            overflow-hidden
            rounded-[28px]
            border
            border-slate-200
            bg-white
            shadow-[0_20px_60px_rgba(15,23,42,0.06)]
            lg:rounded-[36px]
          "
        >
          {/* DECORATION */}
          <div
            aria-hidden="true"
            className="
              absolute
              -right-16
              -top-16
              h-52
              w-52
              rounded-full
              bg-indigo-100/60
              blur-3xl
            "
          />

          <div
            aria-hidden="true"
            className="
              absolute
              -bottom-24
              left-1/3
              h-48
              w-48
              rounded-full
              bg-violet-100/50
              blur-3xl
            "
          />

          <div
            className="
              relative
              grid
              lg:grid-cols-[0.95fr_1.05fr]
            "
          >
            {/* LEFT */}
            <div
              className="
                border-b
                border-slate-100
                p-5
                sm:p-6
                lg:border-b-0
                lg:border-r
                lg:p-10
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
                  px-3
                  py-1.5
                "
              >
                <Handshake
                  aria-hidden="true"
                  className="
                    h-3.5
                    w-3.5
                    text-indigo-600
                  "
                  strokeWidth={2}
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
                  Pembayaran transparan
                </span>
              </div>

              <h2
                className="
                  mt-5
                  max-w-xl
                  text-2xl
                  font-black
                  leading-[1.15]
                  tracking-[-0.04em]
                  text-slate-950
                  sm:text-3xl
                  lg:text-[40px]
                "
              >
                Pembayaran berdasarkan
                kesepakatan bersama
              </h2>

              <p
                className="
                  mt-4
                  max-w-lg
                  text-sm
                  leading-6
                  text-slate-500
                  lg:text-base
                  lg:leading-7
                "
              >
                Kamu dan penyedia jasa menentukan
                nominal, metode, serta waktu
                pembayaran sesuai kebutuhan dan
                kesepakatan pekerjaan.
              </p>

              <div
                className="
                  mt-7
                  space-y-3
                "
              >
                {[
                  "Tidak ada nominal yang ditentukan sepihak oleh HelpMe",
                  "Detail pembayaran dapat dibahas sebelum pekerjaan dimulai",
                  "Kesepakatan dibuat jelas antara pengguna dan penyedia jasa",
                ].map((item) => (
                  <div
                    key={item}
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >
                    <span
                      className="
                        mt-0.5
                        flex
                        h-5
                        w-5
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-indigo-50
                        text-indigo-600
                      "
                    >
                      <Check
                        aria-hidden="true"
                        className="h-3 w-3"
                        strokeWidth={2.5}
                      />
                    </span>

                    <p
                      className="
                        text-xs
                        leading-5
                        text-slate-600
                        lg:text-sm
                      "
                    >
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div
              className="
                bg-slate-50/50
                p-5
                sm:p-6
                lg:p-10
              "
            >
              <div
                className="
                  grid
                  grid-cols-3
                  gap-2
                  sm:gap-3
                "
              >
                {agreementItems.map(
                  ({
                    icon: Icon,
                    title,
                    description,
                  }) => (
                    <article
                      key={title}
                      className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-3
                        shadow-sm
                        lg:p-4
                      "
                    >
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          bg-indigo-50
                          text-indigo-600
                        "
                      >
                        <Icon
                          aria-hidden="true"
                          className="h-4 w-4"
                          strokeWidth={2}
                        />
                      </div>

                      <h3
                        className="
                          mt-3
                          text-xs
                          font-black
                          text-slate-900
                          lg:text-sm
                        "
                      >
                        {title}
                      </h3>

                      <p
                        className="
                          mt-1.5
                          hidden
                          text-xs
                          leading-5
                          text-slate-500
                          sm:block
                        "
                      >
                        {description}
                      </p>
                    </article>
                  ),
                )}
              </div>

              {/* DISCLOSURE */}
              <div
                className="
                  mt-4
                  overflow-hidden
                  rounded-2xl
                  border
                  border-indigo-100
                  bg-indigo-50/70
                  p-4
                  lg:mt-5
                  lg:rounded-3xl
                  lg:p-5
                "
              >
                <div
                  className="
                    flex
                    items-start
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
                      bg-white
                      text-indigo-600
                      shadow-sm
                    "
                  >
                    <ShieldCheck
                      aria-hidden="true"
                      className="h-5 w-5"
                      strokeWidth={2}
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
                      Perlu diketahui
                    </p>

                    <p
                      className="
                        mt-1.5
                        text-xs
                        leading-5
                        text-slate-600
                        lg:text-sm
                        lg:leading-6
                      "
                    >
                      HelpMe saat ini tidak
                      menyimpan atau menahan dana
                      transaksi (escrow).
                      Pembayaran dilakukan langsung
                      antara pengguna dan penyedia
                      jasa berdasarkan kesepakatan
                      bersama.
                    </p>
                  </div>
                </div>
              </div>

              <p
                className="
                  mt-4
                  text-[10px]
                  leading-5
                  text-slate-400
                  lg:text-xs
                "
              >
                Pastikan detail pekerjaan dan
                pembayaran telah dipahami kedua
                pihak sebelum bantuan dimulai.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}