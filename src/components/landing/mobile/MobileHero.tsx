import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  FileText,
  LockKeyhole,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Star,
  UserRound,
} from "lucide-react";

export default function MobileHero() {
  return (
    <section
      className="
        overflow-hidden
        border-b
        border-slate-100
        bg-white
        px-5
        pb-8
        pt-7
      "
    >
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
          px-3
          py-2
          text-[11px]
          font-bold
          text-indigo-700
        "
      >
        <MapPin
          className="h-3.5 w-3.5"
        />

        Bantuan harian di sekitarmu
      </div>

      {/* TITLE */}
      <h1
        className="
          mt-5
          text-[30px]
          font-black
          leading-[1.12]
          tracking-[-0.035em]
          text-slate-950
        "
      >
        Butuh bantuan untuk task harian? Temukan{" "}
        <span className="text-indigo-600">
          Helper terpercaya
        </span>{" "}
        dalam hitungan menit.
      </h1>

      {/* DESCRIPTION */}
      <p
        className="
          mt-5
          text-sm
          leading-6
          text-slate-500
        "
      >
        Buat task seperti antre, titip beli,
        ambil dokumen, bantuan kampus,
        pindahan ringan, dan kebutuhan harian
        lainnya.
      </p>

      {/* CTA */}
      <div className="mt-7 grid gap-2.5">
        <Link
          href="/register"
          className="
            flex
            h-12
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-indigo-600
            px-5
            text-sm
            font-bold
            text-white
            shadow-lg
            shadow-indigo-600/20
            transition
            active:scale-[0.99]
          "
        >
          Buat Task Sekarang

          <ArrowRight
            className="h-4 w-4"
          />
        </Link>

        <Link
          href="/register"
          className="
            flex
            h-12
            items-center
            justify-center
            gap-2
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-5
            text-sm
            font-bold
            text-slate-700
            transition
            active:scale-[0.99]
          "
        >
          <UserRound
            className="
              h-4
              w-4
              text-emerald-600
            "
          />

          Jadi Helper
        </Link>
      </div>

      {/* TRUST */}
      <div
        className="
          mt-5
          grid
          grid-cols-3
          divide-x
          divide-slate-100
          rounded-2xl
          border
          border-slate-100
          bg-slate-50/70
          py-3
        "
      >
        <div
          className="
            flex
            items-center
            justify-center
            gap-1.5
            px-2
          "
        >
          <ShieldCheck
            className="
              h-4
              w-4
              shrink-0
              text-indigo-600
            "
          />

          <span
            className="
              text-[9px]
              font-bold
              text-slate-600
            "
          >
            Verifikasi
          </span>
        </div>

        <div
          className="
            flex
            items-center
            justify-center
            gap-1.5
            px-2
          "
        >
          <LockKeyhole
            className="
              h-4
              w-4
              shrink-0
              text-emerald-600
            "
          />

          <span
            className="
              text-[9px]
              font-bold
              text-slate-600
            "
          >
            Transaksi
          </span>
        </div>

        <div
          className="
            flex
            items-center
            justify-center
            gap-1.5
            px-2
          "
        >
          <Star
            className="
              h-4
              w-4
              shrink-0
              text-amber-500
            "
          />

          <span
            className="
              text-[9px]
              font-bold
              text-slate-600
            "
          >
            Review
          </span>
        </div>
      </div>

      {/* =========================
          PRODUCT VISUAL
      ========================= */}
      <div
        className="
          relative
          mt-8
          overflow-hidden
          rounded-4xl
          border
          border-indigo-100
          bg-linear-to-br
          from-indigo-50
          via-violet-50/60
          to-white
          p-4
          pb-6
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
                text-xs
                font-black
                text-slate-900
              "
            >
              Task di Sekitarmu
            </p>

            <p
              className="
                mt-1
                text-[9px]
                text-slate-400
              "
            >
              Temukan task terdekat
            </p>
          </div>

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-indigo-600
              text-white
              shadow-md
              shadow-indigo-600/20
            "
          >
            <MapPin
              className="h-4 w-4"
            />
          </div>
        </div>

        {/* TASKS */}
        <div className="mt-4 space-y-2">
          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-white
              bg-white
              p-3
              shadow-sm
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-100
                text-blue-600
              "
            >
              <FileText
                className="h-4 w-4"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="
                  truncate
                  text-[11px]
                  font-bold
                  text-slate-800
                "
              >
                Antar Dokumen
              </p>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  text-slate-400
                "
              >
                Bantuan pengantaran
              </p>
            </div>

            <p
              className="
                text-[10px]
                font-black
                text-emerald-600
              "
            >
              Rp25K
            </p>
          </div>

          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-white
              bg-white
              p-3
              shadow-sm
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-emerald-100
                text-emerald-600
              "
            >
              <ShoppingBag
                className="h-4 w-4"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="
                  truncate
                  text-[11px]
                  font-bold
                  text-slate-800
                "
              >
                Titip Beli
              </p>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  text-slate-400
                "
              >
                Belanja kebutuhan
              </p>
            </div>

            <p
              className="
                text-[10px]
                font-black
                text-emerald-600
              "
            >
              Rp20K
            </p>
          </div>
        </div>

        {/* HELPER */}
        <div
          className="
            mt-3
            rounded-2xl
            border
            border-white
            bg-white
            p-3
            shadow-sm
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
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-indigo-100
                text-indigo-600
              "
            >
              <UserRound
                className="h-5 w-5"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div
                className="
                  flex
                  items-center
                  gap-1
                "
              >
                <p
                  className="
                    text-[11px]
                    font-black
                    text-slate-800
                  "
                >
                  Helper
                </p>

                <CheckCircle2
                  className="
                    h-3.5
                    w-3.5
                    text-indigo-600
                  "
                />
              </div>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  text-slate-400
                "
              >
                Profil terverifikasi
              </p>
            </div>

            <ShieldCheck
              className="
                h-5
                w-5
                text-emerald-600
              "
            />
          </div>
        </div>

        {/* SMALL FEATURES */}
        <div
          className="
            mt-3
            grid
            grid-cols-2
            gap-2
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-white/80
              px-3
              py-2.5
            "
          >
            <MessageCircle
              className="
                h-4
                w-4
                text-indigo-600
              "
            />

            <span
              className="
                text-[9px]
                font-bold
                text-slate-600
              "
            >
              Chat Real-time
            </span>
          </div>

          <div
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-white/80
              px-3
              py-2.5
            "
          >
            <LockKeyhole
              className="
                h-4
                w-4
                text-emerald-600
              "
            />

            <span
              className="
                text-[9px]
                font-bold
                text-slate-600
              "
            >
              Pembayaran
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}