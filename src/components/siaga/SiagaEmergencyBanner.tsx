
import Image from "next/image";
import Link from "next/link";

const destination = "/siaga/emergency/new";

const ariaLabel =
  "Minta Bantuan Orang Sekitar. Buka formulir bantuan darurat HelpMe Siaga.";

export default function SiagaEmergencyBanner() {
  return (
    <Link
      href={destination}
      aria-label={ariaLabel}
      className="
        group relative isolate flex min-h-0 w-full items-center gap-2 overflow-hidden rounded-[22px] border border-rose-200
        bg-linear-to-br from-rose-50 via-white to-rose-100 px-3.5 py-3.5 shadow-[0_8px_24px_rgba(225,20,68,0.10)]
        outline-none transition-shadow duration-200 hover:shadow-[0_12px_28px_rgba(225,20,68,0.16)] focus-visible:ring-4 focus-visible:ring-rose-300 focus-visible:ring-offset-2 sm:min-h-40 sm:gap-3 sm:px-5 sm:py-4 md:min-h-44 md:gap-5 md:rounded-[26px] md:px-6 md:py-5 lg:min-h-49 lg:px-7 lg:py-6
      "
    >
      {/* Dekorasi latar responsif */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute -right-8 -top-10
          h-32 w-32 rounded-full bg-rose-200/50 blur-2xl
          md:-right-12 md:-top-14 md:h-48 md:w-48
        "
      />

      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute -bottom-20 right-16
          h-32 w-32 rounded-full border-18
          border-rose-100/70
          md:-bottom-28 md:right-28 md:h-48 md:w-48
          md:border-24
        "
      />

      {/* Konten teks: selalu dirender oleh browser */}
      <span className="relative z-10 flex min-w-0 flex-1 flex-col items-start">
        <span
          className="
            inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white/90 px-1.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-rose-700 sm:text-[9px] md:px-3 md:py-1.5 md:text-xs"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-rose-600"
          />
          Bantuan darurat
        </span>

        <span
          className="mt-1 block text-[14px] font-bold leading-[1.2] tracking-tight text-slate-900 sm:text-base md:mt-2.5 md:text-xl lg:text-2xl"
        >
          Minta Bantuan Orang Sekitar
        </span>

        <span
          className="
            mt-1.5 block max-w-xl text-[11px]
            leading-[1.45] text-slate-600
            sm:text-xs md:mt-2 md:text-sm
            lg:text-base
          "
        >
          Cari pertolongan dari pengguna HelpMe di sekitar
          lokasi Anda.
        </span>

        <span
          className="
            mt-2.5 inline-flex items-center gap-1.5
            text-[11px] font-bold text-rose-700
            sm:text-xs md:mt-3 md:text-sm
          "
        >
          Minta bantuan

          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="
              h-4 w-4 transition-transform duration-200
              group-hover:translate-x-1 md:h-5 md:w-5
            "
          >
            <path
              d="M4 10h11m-5-5 5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>

      {/* Ilustrasi yang sama untuk semua ukuran layar */}
      <span
        aria-hidden="true"
        className="
          relative z-10 mr-0.5 block
          h-18 w-24 shrink-0
          sm:h-21 sm:w-28
          md:h-28 md:w-42
          lg:h-32 lg:w-48
        "
      >
        <Image
          src="/images/helpme_siaga_mobile_illustration.webp"
          alt=""
          fill
          sizes="
            (max-width: 639px) 96px,
            (max-width: 767px) 112px,
            (max-width: 1023px) 168px,
            192px
          "
          priority
          className="
            object-contain transition-transform duration-200
            group-hover:scale-[1.04]
          "
        />
      </span>
    </Link>
  );
}