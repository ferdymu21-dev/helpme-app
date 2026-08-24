import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  FileText,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Package,
  ShieldCheck,
  ShoppingBag,
  Star,
  UserRound,
} from "lucide-react";

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: "User Terverifikasi",
    description: "Identitas lebih terpercaya",
  },
  {
    icon: MessageCircle,
    title: "Chat Real-time",
    description: "Komunikasi langsung",
  },
  {
    icon: LockKeyhole,
    title: "Pembayaran Aman",
    description: "Transaksi lebih terkontrol",
  },
  {
    icon: Star,
    title: "Rating & Review",
    description: "Bangun reputasi pengguna",
  },
  {
    icon: MapPin,
    title: "Berbasis Lokasi",
    description: "Temukan bantuan terdekat",
  },
];

export default function HeroSection() {
  return (
    <section
      className="
        relative
        overflow-hidden
        border-b
        border-slate-100
        bg-white
      "
    >
      {/* BACKGROUND */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-20
          h-125
          w-125
          rounded-full
          bg-indigo-100/60
          blur-3xl
        "
      />

      <div
        className="
          relative
          mx-auto
          max-w-7xl
          px-8
          pb-12
          pt-16
        "
      >
        {/* HERO */}
        <div
          className="
            grid
            min-h-140
            grid-cols-[0.92fr_1.08fr]
            items-center
            gap-16
          "
        >
          {/* =========================
              LEFT
          ========================= */}
          <div className="relative z-10">
            {/* BADGE */}
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
              <MapPin
                className="h-4 w-4"
                strokeWidth={2.2}
              />

              Platform bantuan harian di sekitarmu
            </div>

            {/* TITLE */}
            <h1
              className="
                mt-7
                max-w-2xl
                text-5xl
                font-black
                leading-[1.08]
                tracking-[-0.04em]
                text-slate-950
                xl:text-6xl
              "
            >
              Butuh bantuan untuk task harian? Temukan{" "}
              <span
                className="
                  bg-linear-to-r
                  from-indigo-600
                  to-violet-600
                  bg-clip-text
                  text-transparent
                "
              >
                Helper terpercaya
              </span>{" "}
              dalam hitungan menit.
            </h1>

            {/* DESCRIPTION */}
            <p
              className="
                mt-6
                max-w-xl
                text-base
                leading-8
                text-slate-500
                xl:text-lg
              "
            >
              Buat task untuk kebutuhan seperti antre,
              titip beli, ambil dokumen, bantuan kampus,
              pindahan ringan, atau keperluan harian
              lainnya. Temukan helper di sekitar dengan
              lebih mudah.
            </p>

            {/* CTA */}
            <div
              className="
                mt-8
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <Link
                href="/register"
                className="
                  inline-flex
                  h-13
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-indigo-600
                  px-7
                  text-sm
                  font-bold
                  text-white
                  shadow-[0_16px_35px_rgba(79,70,229,0.25)]
                  transition
                  hover:-translate-y-0.5
                  hover:bg-indigo-700
                "
              >
                Buat Task Sekarang

                <ArrowRight
                  className="h-4 w-4"
                  strokeWidth={2.2}
                />
              </Link>

              <Link
                href="/register"
                className="
                  inline-flex
                  h-13
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-7
                  text-sm
                  font-bold
                  text-slate-700
                  shadow-sm
                  transition
                  hover:border-indigo-200
                  hover:bg-indigo-50
                  hover:text-indigo-700
                "
              >
                <UserRound
                  className="h-4 w-4"
                  strokeWidth={2}
                />

                Jadi Helper
              </Link>
            </div>

            {/* SMALL TRUST MESSAGE */}
            <div
              className="
                mt-7
                flex
                items-center
                gap-3
                text-sm
                text-slate-500
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-50
                  text-emerald-600
                "
              >
                <ShieldCheck
                  className="h-5 w-5"
                  strokeWidth={2}
                />
              </div>

              <p>
                Dibangun untuk transaksi, komunikasi, dan
                reputasi pengguna yang lebih terpercaya.
              </p>
            </div>
          </div>

          {/* =========================
              RIGHT PRODUCT VISUAL
          ========================= */}
          <div
            className="
              relative
              min-h-130
            "
          >
            {/* DECORATIVE AREA */}
            <div
              className="
                absolute
                inset-8
                rounded-[48px]
                bg-linear-to-br
                from-indigo-50
                via-violet-50/70
                to-white
              "
            />

            {/* LOCATION PIN */}
            <div
              className="
                absolute
                left-10
                top-8
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-indigo-600
                text-white
                shadow-xl
                shadow-indigo-600/25
              "
            >
              <MapPin
                className="h-7 w-7"
                strokeWidth={2.2}
              />
            </div>

            {/* TASK LIST */}
            <div
              className="
                absolute
                left-10
                top-28
                z-10
                w-[58%]
                rounded-[28px]
                border
                border-slate-200/80
                bg-white
                p-5
                shadow-[0_24px_70px_rgba(15,23,42,0.10)]
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      font-black
                      text-slate-900
                    "
                  >
                    Task di Sekitarmu
                  </p>

                  <p
                    className="
                      mt-1
                      text-[11px]
                      text-slate-400
                    "
                  >
                    Temukan task terdekat
                  </p>
                </div>

                <MapPin
                  className="
                    h-5
                    w-5
                    text-indigo-500
                  "
                />
              </div>

              <div className="mt-4 space-y-2.5">
                {/* ITEM */}
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-slate-100
                    bg-slate-50/70
                    p-3
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
                      rounded-xl
                      bg-blue-100
                      text-blue-600
                    "
                  >
                    <FileText
                      className="h-5 w-5"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="
                        truncate
                        text-xs
                        font-bold
                        text-slate-800
                      "
                    >
                      Antar Dokumen
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[10px]
                        text-slate-400
                      "
                    >
                      Bantuan pengantaran
                    </p>
                  </div>

                  <p
                    className="
                      shrink-0
                      text-xs
                      font-black
                      text-emerald-600
                    "
                  >
                    Rp25K
                  </p>
                </div>

                {/* ITEM */}
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-slate-100
                    bg-slate-50/70
                    p-3
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
                      rounded-xl
                      bg-emerald-100
                      text-emerald-600
                    "
                  >
                    <ShoppingBag
                      className="h-5 w-5"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="
                        truncate
                        text-xs
                        font-bold
                        text-slate-800
                      "
                    >
                      Titip Beli
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[10px]
                        text-slate-400
                      "
                    >
                      Belanja kebutuhan
                    </p>
                  </div>

                  <p
                    className="
                      shrink-0
                      text-xs
                      font-black
                      text-emerald-600
                    "
                  >
                    Rp20K
                  </p>
                </div>

                {/* ITEM */}
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-slate-100
                    bg-slate-50/70
                    p-3
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
                      rounded-xl
                      bg-amber-100
                      text-amber-600
                    "
                  >
                    <Package
                      className="h-5 w-5"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="
                        truncate
                        text-xs
                        font-bold
                        text-slate-800
                      "
                    >
                      Ambil Barang
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[10px]
                        text-slate-400
                      "
                    >
                      Pengambilan ringan
                    </p>
                  </div>

                  <p
                    className="
                      shrink-0
                      text-xs
                      font-black
                      text-emerald-600
                    "
                  >
                    Rp30K
                  </p>
                </div>
              </div>
            </div>

            {/* HELPER CARD */}
            <div
              className="
                absolute
                right-2
                top-20
                z-20
                w-[42%]
                rounded-[26px]
                border
                border-slate-200/80
                bg-white
                p-5
                shadow-[0_24px_70px_rgba(15,23,42,0.12)]
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
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-indigo-100
                    text-indigo-600
                  "
                >
                  <UserRound
                    className="h-6 w-6"
                  />
                </div>

                <div className="min-w-0">
                  <div
                    className="
                      flex
                      items-center
                      gap-1
                    "
                  >
                    <p
                      className="
                        truncate
                        text-xs
                        font-black
                        text-slate-900
                      "
                    >
                      Helper
                    </p>

                    <CheckCircle2
                      className="
                        h-4
                        w-4
                        shrink-0
                        text-indigo-600
                      "
                    />
                  </div>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      text-slate-400
                    "
                  >
                    Profil terverifikasi
                  </p>
                </div>
              </div>

              <div
                className="
                  mt-4
                  flex
                  items-center
                  gap-1.5
                  rounded-xl
                  bg-emerald-50
                  px-3
                  py-2
                  text-[10px]
                  font-bold
                  text-emerald-700
                "
              >
                <ShieldCheck
                  className="h-4 w-4"
                />

                Identitas terverifikasi
              </div>

              <button
                type="button"
                className="
                  mt-4
                  h-10
                  w-full
                  rounded-xl
                  bg-indigo-600
                  text-xs
                  font-bold
                  text-white
                "
              >
                Pilih Helper
              </button>
            </div>

            {/* CHAT CARD */}
            <div
              className="
                absolute
                bottom-14
                left-2
                z-20
                w-[43%]
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-4
                shadow-[0_18px_50px_rgba(15,23,42,0.10)]
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <MessageCircle
                  className="
                    h-4
                    w-4
                    text-indigo-600
                  "
                />

                <p
                  className="
                    text-[11px]
                    font-black
                    text-slate-800
                  "
                >
                  Chat Real-time
                </p>
              </div>

              <div
                className="
                  mt-3
                  rounded-2xl
                  bg-slate-50
                  p-3
                "
              >
                <p
                  className="
                    text-[10px]
                    leading-4
                    text-slate-500
                  "
                >
                  Komunikasikan detail task langsung
                  dengan helper.
                </p>
              </div>
            </div>

            {/* PAYMENT CARD */}
            <div
              className="
                absolute
                bottom-6
                right-8
                z-20
                w-[41%]
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-4
                shadow-[0_18px_50px_rgba(15,23,42,0.10)]
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <div>
                  <p
                    className="
                      text-[11px]
                      font-black
                      text-slate-800
                    "
                  >
                    Pembayaran
                  </p>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      leading-4
                      text-slate-400
                    "
                  >
                    Status transaksi tercatat
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-50
                    text-emerald-600
                  "
                >
                  <LockKeyhole
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            TRUST FEATURES
        ========================= */}
        <div
          className="
            grid
            grid-cols-5
            overflow-hidden
            rounded-[28px]
            border
            border-slate-200
            bg-white
            shadow-[0_15px_45px_rgba(15,23,42,0.05)]
          "
        >
          {trustFeatures.map(
            ({
              icon: Icon,
              title,
              description,
            }) => (
              <div
                key={title}
                className="
                  flex
                  min-w-0
                  items-center
                  gap-3
                  border-r
                  border-slate-100
                  px-4
                  py-5
                  last:border-r-0
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

                <div className="min-w-0">
                  <p
                    className="
                      truncate
                      text-xs
                      font-black
                      text-slate-800
                    "
                  >
                    {title}
                  </p>

                  <p
                    className="
                      mt-1
                      truncate
                      text-[10px]
                      text-slate-400
                    "
                  >
                    {description}
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}